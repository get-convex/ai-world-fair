// Download the helper library from https://www.twilio.com/docs/node/install
// Find your Account SID and Auth Token at twilio.com/console
// and set the environment variables. See http://twil.io/secure
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;

const client = require("twilio")(accountSid, authToken);

import OpenAI from "openai";
import textToSpeech from "@google-cloud/text-to-speech";
import speech from "@google-cloud/speech";

const openai = new OpenAI();
const TTSclient = new textToSpeech.TextToSpeechClient();
const speechClient = new speech.SpeechClient();

let _audioStream;

const makeCall = async (toNumber) => {
  // Create a stream for Google Speech-to-Text
  const recognizeStream = speechClient
    .streamingRecognize({
      config: {
        encoding: "LINEAR16",
        sampleRateHertz: 16000,
        languageCode: "en-US",
      },
    })
    .on("data", async (data) => {
      console.log("Got transcription data: ", data);
      try {
        const stream = await openai.chat.completions.create({
          model: "gpt-4",
          messages: [
            {
              role: "user",
              content: 'Say "Hello, I think the thing might be working."',
            },
          ],
          stream: true,
        });

        let response = "";
        for await (const part of stream) {
          response += part.choices[0]?.delta?.content || "";
        }
        const audioContent = await speak(response);
        // Stream audio back to Twilio call
        if (_audioStream) {
          _audioStream.write(audioContent);
        }
      } catch (error) {
        // Consider adjusting the error handling logic for your use case
        if (error.response) {
          console.error(error.response.status, error.response.data);
          res.status(error.response.status).json(error.response.data);
        } else {
          console.error(`Error with OpenAI API request: ${error.message}`);
          res.status(500).json({
            error: {
              message: "An error occurred during your request.",
            },
          });
        }
      }
    });

  const call = await client.calls.create({
    record: true,
    statusCallback: "https://really-first-goat.ngrok-free.app/v1/dev/twiml",
    statusCallbackEvent: ["initiated", "ringing", "answered", "completed"],
    statusCallbackMethod: "POST",
    to: `+${toNumber}`,
    from: "+16476958664",
    twiml: `<Response>
         <Connect>
             <Stream url="wss://really-first-goat.ngrok-free.app/" />
         </Connect>
      </Response>`,
  });

  console.log("MADE A CALL: ", call.sid);

  // // Listen for audio from Twilio call
  // call.on("media", (media) => {
  //   console.log("got media callback");
  //   recognizeStream.write(media.payload);
  // });

  // // Write audio to the Twilio call
  // call.on("audioStream", async (audioStream) => {
  //   _audioStream = audioStream;
  // });

  // // Listen for call end
  // call.on("end", () => {
  //   // End the audio streams and clean up
  //   _audioStream = null;
  //   recognizeStream.end();
  // });

  const speak = async (text) => {
    const audioContent = await openai.audio.speech.create({
      model: "tts-1",
      voice: "alloy",
      input: text,
    });
    return audioContent;
  };

  // const googleSpeak = async (text) => {
  //   console.log("speaking: ", text);
  //   // Construct the request
  //   const request = {
  //     input: { text: text },
  //     // Select the language and SSML voice gender (optional)
  //     voice: { languageCode: "en-US", name: "en-US-Wavenet-I" },
  //     // select the type of audio encoding
  //     audioConfig: { audioEncoding: "MP3" },
  //   };

  //   const [response] = await TTSclient.synthesizeSpeech(request);
  //   return response.audioContent;
  // };
};

export default makeCall;
