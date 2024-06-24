import { exec } from 'child_process';
import { readFileSync, unlinkSync, writeFileSync } from 'fs';
import { promisify } from 'util';
import { WaveFile } from 'wavefile';
const execAsync = promisify(exec);

function convertMuLawFileToBase64(filePath: string): string {
  // Read the MuLaw-encoded file into a buffer
  const muLawBuffer = readFileSync(filePath);

  // Convert the MuLaw buffer to base64
  const base64Bytes = muLawBuffer.toString('base64');

  return base64Bytes;
}

async function convertOpusArrayBufferToMuLaw(audioContentArrayBuffer: ArrayBuffer): Promise<string | undefined> {
  // Write the ArrayBuffer to a temporary Opus file
  const tempOpusPath = 'temp.audio';
  writeFileSync(tempOpusPath, Buffer.from(audioContentArrayBuffer));

  // Decode Opus to a 16-bit linear PCM WAV file with ffmpeg
  const tempWavPath = 'temp.wav';
  try {
    await execAsync(`ffmpeg -i ${tempOpusPath} -acodec pcm_s16le -ar 8000 -ac 1 ${tempWavPath}`);

    const wavBuffer = readFileSync(tempWavPath);
    const wav = new WaveFile(wavBuffer);
    wav.toBitDepth('8');
    wav.toMuLaw();

    // Write it to a file if you want
    // Used to pre-record intro and save it to intro.ulaw
    //fs.writeFileSync("intro.ulaw", Buffer.from(wav.data.samples));

    const payload = Buffer.from(wav.getSamples()).toString('base64');
    return payload;
  } catch (error) {
    console.error(`Error during conversion: ${error}`);
  } finally {
    // Clean up the temporary files
    unlinkSync(tempOpusPath);
    unlinkSync(tempWavPath);
  }
}

export { convertMuLawFileToBase64, convertOpusArrayBufferToMuLaw };
