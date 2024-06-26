import gray from 'chalk';
import yellow from 'chalk';
import { ChatCompletionMessageParam } from 'openai/resources/index.js';

import { convertMuLawFileToBase64 } from '../audio.js';
import { sendToOpenAI, speak } from '../openai.js';
import TranscriptionService from '../transcription.js';
import { query } from 'convex/_generated/server.js';
import { api } from 'convex/_generated/api.js';
import { ConvexClient } from 'convex/browser';
import { Id } from 'convex/_generated/dataModel.js';

interface MetaData {
  streamSid: string;
}

interface Message {
  event: string;
  media?: {
    track: string;
    payload: Buffer;
  };
  start?: MetaData;
}

class MediaStreamHandler {
  private metaData: MetaData | null;
  private trackHandlers: { [key: string]: TranscriptionService };
  private connection: any;
  private messages: ChatCompletionMessageParam[];
  private hasIntroducted: boolean;
  private requestId: Id<'requests'>;
  private priorContext: string | undefined;
  private client: ConvexClient;

  constructor(connection: any, requestId: string) {
    console.log('Creating MediaStreamHandler');
    this.metaData = null;
    this.trackHandlers = {};
    this.connection = connection;
    this.requestId = requestId as Id<'requests'>;
    this.messages = [];
    this.connection.on('message', this.processMessage.bind(this));
    this.connection.on('close', this.close.bind(this));
    this.hasIntroducted = false;
    this.priorContext = undefined;
    this.client = new ConvexClient(process.env.CONVEX_URL || '');
  }

  async processMessage(message: string) {
    const data: Message = JSON.parse(message);
    if (data.event === 'start') {
      this.metaData = data.start || null;
    }
    if (data.event !== 'media') {
      return;
    }

    const track = data.media?.track;
    if (track && this.trackHandlers[track] === undefined) {
      const service = new TranscriptionService();
      service.on('transcription', async (transcription: string) => {
        console.log(yellow.bold.underline(`CALLEE`), gray(new Date().toISOString()));
        console.log(yellow(`${transcription}`));

        this.client.mutation(api.requests.addToTranscript, {
          requestId: this.requestId,
          transcriptEntry: `Callee: ${transcription}`,
        });

        //this.clientSocket.emit('call-transcription', { speaker: 'CALLEE', message: transcription });

        // Play the pre-recorded intro message to buy some time
        if (!this.hasIntroducted) {
          this.hasIntroducted = true;
          this.introduceYourself();
        }
        await this.respondToCallee(transcription);
      });
      this.trackHandlers[track] = service;
    }

    if (track && data.media?.payload) {
      await this.trackHandlers[track].send(data.media.payload);
    }
  }

  async introduceYourself() {
    const introBytes = convertMuLawFileToBase64('intro.ulaw');
    await this.streamAudioToCallee(introBytes);
  }

  async respondToCallee(transcription: string) {
    if (!this.priorContext) {
      const contextForRequest = await this.client.query(api.requests.getRequestById, {
        requestId: this.requestId,
      });
      this.priorContext = contextForRequest?.context;
    }
    const response = await sendToOpenAI(this.messages, transcription, this.priorContext);
    if (!response) return;
    this.messages.push({
      role: 'user',
      content: transcription,
    });
    this.messages.push({
      role: 'assistant',
      content: response,
    });
    await this.streamAudioToCallee(await speak(response));
    this.client.mutation(api.requests.addToTranscript, {
      requestId: this.requestId,
      transcriptEntry: `Floyd: ${response}`,
    });
  }

  async streamAudioToCallee(payload: string | null) {
    if (!payload) return;
    console.time(gray('Stream audio to callee'));

    // Decode each message and store the bytes in an array
    const streamSid = this.metaData?.streamSid;

    const message = {
      event: 'media',
      streamSid,
      media: {
        payload,
      },
    };
    const messageJSON = JSON.stringify(message);
    this.connection.send(messageJSON);
    console.timeEnd(gray('Stream audio to callee'));
  }

  close() {
    this.hasIntroducted = false;
    console.log('');
    console.log(gray('Media WS: closed'));
    this.client.mutation(api.requests.updateRequestStatus, {
      requestId: this.requestId,
      status: 'complete',
    });
    for (const track of Object.keys(this.trackHandlers)) {
      console.log(gray(`Closing ${track} handler`));
      this.trackHandlers[track].close();
    }
  }
}

export default MediaStreamHandler;
