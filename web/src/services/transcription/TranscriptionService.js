const EventEmitter = require("events");
const Speech = require("@google-cloud/speech");
const speech = new Speech.SpeechClient();

class TranscriptionService extends EventEmitter {
  constructor() {
    super();
    this.stream = null;
    this.streamCreatedAt = null;
  }

  send(payload) {
    console.log("TranscriptionService.send", payload);
    this.getStream().write(payload); // <Buffer 00 db 01..
  }

  close() {
    if (this.stream) {
      this.stream.destroy();
    }
  }

  newStreamRequired() {
    if (!this.stream) {
      return true;
    } else {
      const now = new Date();
      const timeSinceStreamCreated = now - this.streamCreatedAt;
      return timeSinceStreamCreated / 1000 > 60;
    }
  }

  getStream() {
    if (this.newStreamRequired()) {
      if (this.stream) {
        this.stream.destroy();
      }

      var request = {
        config: {
          encoding: "OGG_OPUS",
          sampleRateHertz: 16000,
          languageCode: "en-US",
          enableAutomaticPunctuation: true,
          model: "command_and_search",
          useEnhanced: true,
        },
        interimResults: true,
      };

      this.streamCreatedAt = new Date();
      this.stream = speech
        .streamingRecognize(request)
        .on("error", (error) => {
          console.error(error);
          //console.timeEnd(chalk.gray("Transcription"));
        })
        .on("data", (data) => {
          console.log("SERVER data: ", data);
          const result = data.results[0];
          if (result === undefined || result.alternatives[0] === undefined) {
            return;
          }
          if (result.isFinal) {
            //console.timeEnd(chalk.gray("Transcription"));
            this.emit("transcription", result.alternatives[0].transcript);
          }
        });
    }

    return this.stream;
  }
}

module.exports = TranscriptionService;
