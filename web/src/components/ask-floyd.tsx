import React, { useState, useEffect, useRef } from "react";
import io, { Socket } from "socket.io-client";
import { Button } from "@/components/ui/button";
import styles from "./ask-floyd.module.css";
import dotStyles from "@/components/step/Step.module.css";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { RocketIcon } from "@radix-ui/react-icons";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useSession } from "@/providers/SessionContext";
import { useSelectedRequestId } from "@/hooks/useRequest";
import { Id } from "../../convex/_generated/dataModel";

export default function AskFloyd() {
  const [socketResponse, setSocketResponse] = useState<string>("");
  const [transcriptionResponse, setTranscriptionResponse] =
    useState<string>("");
  const [callTranscriptionResponse, setCallTranscriptionResponse] =
    useState<string>("");
  const [heartbeat, setHeartbeat] = useState<string>("");
  const [volume, setVolume] = useState<number>(0);
  const [audioContextState, setAudioContextState] =
    useState<string>("suspended");
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [requestResponse, setRequestResponse] = useState<string>("");

  const socket = useRef<Socket | null>(null);
  const serverSocket = useRef<Socket | null>(null);
  const audioContext = useRef<AudioContext | null>(null);

  const requests = useQuery(api.requests.get);
  const { session, sessionName, clearSession } = useSession();
  const [selectedId, setSelectedId] = useSelectedRequestId();

  useEffect(() => {
    const initAudioContext = async () => {
      audioContext.current = new AudioContext();
      await audioContext.current.audioWorklet.addModule(
        "worklets/BasicProcessor.js"
      );
      audioContext.current.suspend();
      audioContext.current.onstatechange = () => {
        console.log("audioCtx.state: ", audioContext.current?.state);
        setAudioContextState(audioContext.current?.state || "suspended");
      };
    };
    initAudioContext();

    const socketInitializer = async () => {
      await fetch("/api/transcription");
      socket.current = io();

      socket.current.on("connect", () => {
        console.log("connected");
      });

      socket.current.on("update-input", (msg: string) => {
        setSocketResponse(msg);
        console.log(msg);
      });

      socket.current.on("transcription-response", (msg: string) => {
        console.log("transcription-response", msg);
        setTranscriptionResponse(msg);
      });

      socket.current.on("transcription-response-final", async (msg: string) => {
        if (audioContext.current) {
          await audioContext.current.suspend();
        }
        console.log("transcription-response-final", msg);
        setTranscriptionResponse(msg);

        const response = await fetch(
          "https://decisive-lion-406.convex.site/request",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              requestMsg: msg,
              sessionId: session ? session : "",
              sessionName: sessionName ? sessionName : "",
            }),
          }
        );

        console.log(response);

        const responseData = await response.json();
        console.log("response", responseData);
        setRequestResponse(JSON.stringify(responseData));
        setSelectedId(responseData.requestId as Id<"requests">);
      });
    };
    socketInitializer();
  }, []);

  const reset = () => {
    setIsProcessing(false);
    setTranscriptionResponse("");
  };

  const startOrStopAudio = async (context: AudioContext) => {
    reset();

    if (context.state === "running") {
      await context.suspend();
      return;
    }

    const mediaStream = await navigator.mediaDevices.getUserMedia({
      audio: true,
    });
    const micNode = context.createMediaStreamSource(mediaStream);
    const basicProcessorNode = new AudioWorkletNode(context, "basic-processor");
    basicProcessorNode.port.onmessage = ({ data }: MessageEvent) => {
      if (data.audio && context.state === "running") {
        socket.current?.emit("stream", {
          audio: data.audio,
        });
      }
    };

    basicProcessorNode.connect(context.destination);
    micNode.connect(basicProcessorNode);

    context.resume();
  };

  return (
    <Alert>
      <RocketIcon className="h-4 w-4" />
      <AlertTitle>Make a request</AlertTitle>
      <AlertDescription>
        <div className="flex-col">
          <div className="">
            Please accept the request for microphone access to proceed.
          </div>
          <Button
            className="mt-4"
            disabled={isProcessing}
            onClick={() => startOrStopAudio(audioContext.current!)}
          >
            {audioContextState === "running"
              ? "Floyd is listening... "
              : "Ask Floyd"}
            {audioContextState === "running" && (
              <div
                className={`w-2 h-2 ml-2 bg-green-400 ${dotStyles.dot}`}
              ></div>
            )}
          </Button>
          <Button onClick={reset} variant="secondary" className="ml-2">
            Reset
          </Button>

          <Button
            onClick={() => {
              clearSession();
              reset();
            }}
            variant="secondary"
            className="ml-2 hidden"
          >
            Clear session
          </Button>

          <div
            className={`${
              isProcessing ? "text-slate-900" : "text-blue-500"
            } pt-4 pb-4 bg-slate-100 mt-4 rounded-sm p-4`}
          >
            <span className={styles.blinky}>{transcriptionResponse}</span>
          </div>
          <Alert className="mt-4">
            <AlertTitle>Here's what Floyd has to say:</AlertTitle>
            <AlertDescription>
              <p>I'm on it! Keep an eye out for updates.</p>
              <pre>{requestResponse}</pre>
            </AlertDescription>
          </Alert>
        </div>
      </AlertDescription>
    </Alert>
  );
}
