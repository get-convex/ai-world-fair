import OpenAI from "openai";
import textToSpeech from "@google-cloud/text-to-speech";
const fs = require("fs");
const util = require("util");

const openai = new OpenAI();
const client = new textToSpeech.TextToSpeechClient();

const handler = async (req, res) => {
  const animal = "hampster";

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
    return await speak(res, response);
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
};

const speak = async (res, text) => {
  // Construct the request
  const request = {
    input: { text: text },
    // Select the language and SSML voice gender (optional)
    voice: { languageCode: "en-US", name: "en-US-Wavenet-I" },
    // select the type of audio encoding
    audioConfig: { audioEncoding: "MP3" },
  };

  // Performs the text-to-speech request
  const [response] = await client.synthesizeSpeech(request);
  // Write the binary audio content to a local file
  const writeFile = util.promisify(fs.writeFile);
  await writeFile("output.mp3", response.audioContent, "binary");
  console.log("Audio content written to file: output.mp3");

  var stat = fs.statSync("output.mp3");

  res.writeHead(200, {
    "Content-Type": "audio/mpeg",
    "Content-Length": stat.size,
  });

  const readStream = fs.createReadStream("output.mp3");

  await new Promise(function (resolve) {
    readStream.pipe(res);
    readStream.on("end", resolve);
  });
};

export default handler;
