class BasicProcessor extends AudioWorkletProcessor {
  process(inputs) {
    const input = inputs[0];
    const leftChannel = input[0]; // Assuming mono input

    if (leftChannel) {
      // Downsample the buffer. Implement `downsampleBuffer` accordingly.
      const downsampledBuffer = downsampleBuffer(leftChannel, 44100, 16000);
      // Send the downsampled buffer to the main thread
      this.port.postMessage({ audio: downsampledBuffer });
    }

    return true;
  }
}

/**
 * Downsamples a given audio buffer from sampleRate to outSampleRate.
 * @param {Array} buffer The audio buffer to downsample.
 * @param {number} sampleRate The original sample rate.
 * @param {number} outSampleRate The new sample rate.
 * @return {Array} The downsampled audio buffer.
 */
function downsampleBuffer(buffer, sampleRate, outSampleRate) {
  if (outSampleRate === sampleRate) {
    return buffer;
  }
  if (outSampleRate > sampleRate) {
    throw new Error(
      "Downsampling rate show be smaller than original sample rate"
    );
  }
  const sampleRateRatio = sampleRate / outSampleRate;
  const newLength = Math.round(buffer.length / sampleRateRatio);
  const result = new Int16Array(newLength);
  let offsetResult = 0;
  let offsetBuffer = 0;
  while (offsetResult < result.length) {
    const nextOffsetBuffer = Math.round((offsetResult + 1) * sampleRateRatio);
    let accum = 0;
    let count = 0;
    for (let i = offsetBuffer; i < nextOffsetBuffer && i < buffer.length; i++) {
      accum += buffer[i];
      count++;
    }

    result[offsetResult] = Math.min(1, accum / count) * 0x7fff;
    offsetResult++;
    offsetBuffer = nextOffsetBuffer;
  }
  return result.buffer;
}

registerProcessor("basic-processor", BasicProcessor);
