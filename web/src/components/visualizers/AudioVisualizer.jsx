import React, { useState } from "react";
import { LiveAudioVisualizer } from "react-audio-visualize";

export function Visualizer() {
  const [mediaRecorder, setMediaRecorder] = useState();

  // set media recorder somewhere in code

  return (
    <div>
      {mediaRecorder && (
        <LiveAudioVisualizer
          mediaRecorder={mediaRecorder}
          width={1000}
          height={150}
        />
      )}
    </div>
  );
}
