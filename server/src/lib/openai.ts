'use strict';
import dotenv from 'dotenv';
dotenv.config();

import chalk from 'chalk';
import OpenAI from 'openai';

import { convertOpusArrayBufferToMuLaw } from './audio';
import floydRequestPrompt from './prompts/floydRequestPrompt';
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const { gray, green } = chalk;

const speak = async (text: string): Promise<string | null> => {
  console.time(gray('Speech generation'));
  console.log('');
  console.log(green.bold.underline('FLOYD'));
  console.log(green(text));
  //this.clientSocket.emit('call-transcription', { speaker: 'FLOYD', message: text });
  const audioContent = await openai.audio.speech.create({
    model: 'tts-1',
    response_format: 'opus', //Opus (/ogg) is an efficient audio codec suited for streaming with low latency
    voice: 'nova',
    speed: 1.1,
    input: text,
  });
  const audioContentArrayBuffer = await audioContent.arrayBuffer();
  const payload = await convertOpusArrayBufferToMuLaw(audioContentArrayBuffer);
  console.timeEnd(gray('Speech generation'));
  return payload || null;
};

const sendToOpenAI = async (previousMessages: any[], text: string): Promise<string | null> => {
  const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'short', day: 'numeric' };
  const today = new Date().toLocaleDateString('en-US', options);
  try {
    console.time(gray('Response from GPT4'));
    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: floydRequestPrompt(text, previousMessages, today),
    });
    return response.choices[0]?.message?.content || "Sorry, I'll have to call you back.";
  } catch (error: any) {
    if (error.response) {
      console.error(error.response.status, error.response.data);
    } else {
      console.error(`Error with OpenAI API request: ${error.message}`);
    }
  } finally {
    console.timeEnd(gray('Response from GPT4'));
  }

  // TODO: Throw error instead of return null
  return null;
};

export { sendToOpenAI, speak };
