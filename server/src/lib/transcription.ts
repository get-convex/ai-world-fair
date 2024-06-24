// Removed the unused TranscriptionServiceEvents interface

import { protos, SpeechClient } from '@google-cloud/speech';
import EventEmitter from 'events';
import Pumpify from 'pumpify';
const speech = new SpeechClient();

class TranscriptionService extends EventEmitter {
  private stream: Pumpify | undefined;
  private streamCreatedAt: Date | undefined;

  constructor() {
    super();
    this.stream = undefined;
    this.streamCreatedAt = undefined;
  }

  send(payload: Buffer): void {
    this.getStream()?.write(payload);
  }

  close(): void {
    this.stream?.destroy();
  }

  private newStreamRequired(): boolean {
    if (!this.stream) {
      return true;
    } else {
      const now = new Date();
      const timeSinceStreamCreated = now.getTime() - (this.streamCreatedAt?.getTime() || 0);
      return timeSinceStreamCreated / 1000 > 60;
    }
  }

  private getStream(): Pumpify | undefined {
    if (this.newStreamRequired()) {
      if (this.stream) {
        this.stream.destroy();
      }

      const request: protos.google.cloud.speech.v1p1beta1.IStreamingRecognitionConfig = {
        config: {
          encoding: protos.google.cloud.speech.v1p1beta1.RecognitionConfig.AudioEncoding.MULAW,
          sampleRateHertz: 8000,
          languageCode: 'en-US',
          enableAutomaticPunctuation: true,
          model: 'phone_call',
          useEnhanced: true,
        },
        interimResults: true,
      };

      this.streamCreatedAt = new Date();
      this.stream = speech
        .streamingRecognize(request)
        .on('error', (error: Error) => {
          console.error(error);
          //console.timeEnd(chalk.gray("Transcription"));
        })
        .on('data', (data: protos.google.cloud.speech.v1.StreamingRecognizeResponse) => {
          //console.log(data);
          const result = data.results?.[0];
          if (result === undefined || result.alternatives?.[0] === undefined) {
            return;
          }
          if (result.isFinal) {
            //console.timeEnd(chalk.gray("Transcription"));
            this.emit('transcription', result.alternatives[0].transcript);
          }
        });
    }

    return this.stream;
  }
}

export default TranscriptionService;
