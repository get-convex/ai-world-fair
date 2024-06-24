import TranscriptionService from "@/services/transcription/TranscriptionService";
import { Server } from "Socket.IO";

const Speech = require("@google-cloud/speech");
const speechClient = new Speech.SpeechClient();

let recognizeStream = null;

const SocketHandler = (req, res) => {
  console.log("SocketHandler");
  if (res.socket.server.io) {
    console.log("Socket is already running");
  } else {
    console.log("Socket is initializing");
    const io = new Server(res.socket.server);
    res.socket.server.io = io;

    const service = new TranscriptionService();
    service.on("transcription", async (transcription) => {
      console.log("GOT transcription", transcription);
      socket.broadcast.emit("transcription-response", transcription);
    });

    io.on("connection", (socket) => {
      socket.on("stream", async (data) => {
        const audioData = data.audio;
        await transcribe(audioData, socket);
      });
    });
  }

  res.end();
};

async function transcribe(data, socket, isFile = false) {
  if (!recognizeStream) {
    console.debug("Initiating new Google Cloud Speech client...");
    let waitingForMoreData = false;
    // Create new stream to the Google Speech client
    recognizeStream = speechClient
      .streamingRecognize({
        config: {
          encoding: "LINEAR16",
          sampleRateHertz: 16000,
          languageCode: "en-US",
          enableAutomaticPunctuation: true,
          model: "phone_call",
          useEnhanced: true,
          speechContexts: [
            {
              phrases: [
                "Floyd",
                "Hi Floyd",
                "Hey Floyd",
                "Floyd, can you",
                "Floyd, please",
              ],
            },
          ],
        },
        interimResults: true,
      })
      .on("error", (error) => {
        console.debug("!!!!!ERRORRR!!!!!!");
        console.debug(error);
        if (error.code === 11) {
          recognizeStream.destroy();
          recognizeStream = null;
          return;
        }
        socket.emit("error");
        recognizeStream.destroy();
        recognizeStream = null;
        console.error(
          `Received error from Google Cloud Speech client: ${error.message}`
        );
      })
      .on("data", async (data) => {
        const result = data.results[0];
        if (result === undefined || result.alternatives[0] === undefined) {
          return;
        }
        if (result.isFinal) {
          const transcription = result.alternatives[0].transcript;
          console.debug(`Transcription: ${transcription}`);
          //socket.broadcast.emit("transcription-response", transcription);
          socket.emit("transcription-response-final", transcription);
          // Restart stream
          waitingForMoreData = true;
          setTimeout(() => {
            if (waitingForMoreData === true) {
              // User was silent for too long - restart stream
              if (recognizeStream) recognizeStream.destroy();
              recognizeStream = null;
            }
          }, 300);
          return;
        } else {
          socket.emit(
            "transcription-response",
            result.alternatives[0].transcript
          );
        }
        waitingForMoreData = false;
      });

    // setTimeout(() => {
    //   if (recognizeStream) recognizeStream.destroy();
    //   recognizeStream = null;
    // }, 3000);
  }

  // eslint-disable-next-line security/detect-non-literal-fs-filename
  if (recognizeStream) {
    recognizeStream.write(data);
  } else {
    console.debug("No stream to write to");
  }
}

export default SocketHandler;
