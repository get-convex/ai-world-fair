import React, { useState, useEffect, useRef } from "react";
import io from "Socket.IO-client";
import Image from "next/image";
import { Sidebar } from "@/components/sidebar";
import { Step } from "@/components/step";
import { Button } from "@/components/ui/button";
import styles from "./index.module.css";
import dotStyles from "@/components/step/Step.module.css";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { RocketIcon } from "@radix-ui/react-icons";

export default function Home() {
  const [socketResponse, setSocketResponse] = useState("");
  const [transcriptionResponse, setTranscriptionResponse] = useState("");
  const [callTranscriptionResponse, setCallTranscriptionResponse] =
    useState("");
  const [heartbeat, setHeartbeat] = useState("");
  const [volume, setVolume] = useState(0);
  const [audioContextState, setAudioContextState] = useState("suspended");
  const [isProcessing, setIsProcessing] = useState(false);
  const [date, setDate] = useState(new Date());
  const [requestResponse, setRequestResponse] = useState("");

  const [step1, setStep1] = useState("pending");
  const [step2, setStep2] = useState("pending");
  const [step3, setStep3] = useState("pending");
  const [step4, setStep4] = useState("pending");

  const socket = useRef();
  const serverSocket = useRef();
  const audioContext = useRef();

  useEffect(() => {
    const initAudioContext = async () => {
      audioContext.current = new AudioContext();
      await audioContext.current.audioWorklet.addModule(
        "worklets/BasicProcessor.js"
      );
      audioContext.current.suspend();
      audioContext.current.onstatechange = () => {
        console.log("audioCtx.state: ", audioContext.current.state);
        setAudioContextState(audioContext.current.state);
      };
    };
    initAudioContext();

    const serverSocketInitializer = async () => {
      serverSocket.current = io("http://localhost:8081");
      serverSocket.current.on("connect", () => {
        console.log("connected");
      });
      serverSocket.current.on("heartbeat", (msg) => {
        setHeartbeat("Heartbeat: " + msg.message);
      });
      serverSocket.current.on("call-transcription", (msg) => {
        //const message = JSON.stringify(msg);
        console.log("call-transcription", msg);
        setCallTranscriptionResponse(msg.speaker + ": " + msg.message);
      });
    };
    //serverSocketInitializer();

    const socketInitializer = async () => {
      await fetch("/api/transcription");
      socket.current = io();

      socket.current.on("connect", () => {
        console.log("connected");
      });

      socket.current.on("update-input", (msg) => {
        setSocketResponse(msg);
        console.log(msg);
      });

      socket.current.on("transcription-response", (msg) => {
        console.log("transcription-response", msg);
        setTranscriptionResponse(msg);
      });

      socket.current.on("transcription-response-final", async (msg) => {
        if (audioContext.current) {
          await audioContext.current.suspend();
        }
        console.log("transcription-response-final", msg);
        setTranscriptionResponse(msg);
        beginProcessingRequest();
      });
    };
    socketInitializer();
  }, []);

  const sendRequest = async () => {
    const response = await fetch("http://localhost:8081/v1/dev/request", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        request: "Book a car service for the 2014 Nissan Altima",
      }),
    });
    const data = await response.json();
    console.log(data);
    setRequestResponse(JSON.stringify(data));
  };

  const reset = () => {
    setStep1("pending");
    setStep2("pending");
    setStep3("pending");
    setStep4("pending");
    setIsProcessing(false);
    setTranscriptionResponse("");
  };

  const beginProcessingRequest = async () => {
    setIsProcessing(true);
    setStep1("pending");
    setStep2("pending");
    setStep3("pending");
    setStep4("pending");
    setTimeout(() => {
      setStep1("active");
    }, 500);

    setTimeout(() => {
      setStep1("complete");
      setStep2("active");
    }, 3500);

    setTimeout(() => {
      setStep1("complete");
      setStep2("complete");
      setStep3("active");
    }, 6500);

    setTimeout(() => {
      setStep1("complete");
      setStep2("complete");
      setStep3("complete");
      setStep4("active");
    }, 9500);

    setTimeout(() => {
      setStep1("complete");
      setStep2("complete");
      setStep3("complete");
      setStep4("complete");
      setIsProcessing(false);
    }, 13000);
  };

  const startOrStopAudio = async (context) => {
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
    basicProcessorNode.port.onmessage = ({ data }) => {
      if (data.audio && context.state === "running") {
        socket.current.emit("stream", {
          audio: data.audio,
        });
      }
    };

    basicProcessorNode.connect(context.destination);
    micNode.connect(basicProcessorNode);

    context.resume();
  };

  return (
    <>
      <div className="md:hidden">
        <Image
          src="/examples/music-light.png"
          width={1280}
          height={1114}
          alt="Music"
          className="block dark:hidden"
        />
        <Image
          src="/examples/music-dark.png"
          width={1280}
          height={1114}
          alt="Music"
          className="hidden dark:block"
        />
      </div>
      <div className="hidden md:block">
        <div className="font-bold text-red-700">
          {socketResponse && socketResponse}
        </div>
        <div className="border-t">
          <div className="bg-background">
            <div className="grid lg:grid-cols-12">
              <ScrollArea className="h-screen col-span-3">
                <Sidebar className="hidden lg:block border-r" />
              </ScrollArea>
              <div className="col-span-8">
                <div className="h-full pl-8 py-6">
                  <div defaultValue="connected" className="h-full space-y-6">
                    <div className="border-none p-0 outline-none">
                      <div className="flex items-center justify-between">
                        <div className="space-y-1 grow">
                          <div className="">
                            <div className="flex w-full">
                              <div className="flex-column grow">
                                <div className="flex-column grow">
                                  <div className="mt-10 mb-6 scroll-m-20 pb-2 first:mt-0">
                                    <Alert>
                                      <RocketIcon className="h-4 w-4" />
                                      <AlertTitle>
                                        Floyd works for you.
                                      </AlertTitle>
                                      <AlertDescription>
                                        <div className="flex-col">
                                          <div>
                                            Like any good personal assistant,
                                            Floyd will go to great lengths to
                                            fulfill your requests, including
                                            making phone calls on your behalf.
                                          </div>
                                          <Button
                                            className="mt-4"
                                            disabled={isProcessing}
                                            onClick={() =>
                                              startOrStopAudio(
                                                audioContext.current
                                              )
                                            }
                                          >
                                            {audioContextState === "running"
                                              ? "Floyd is listening... "
                                              : "Ask Floyd"}
                                            {audioContextState ===
                                              "running" && (
                                              <div
                                                className={`w-2 h-2 ml-2 bg-green-400 ${dotStyles.dot}`}
                                              ></div>
                                            )}
                                          </Button>
                                          <Button
                                            onClick={reset}
                                            variant="secondary"
                                            className="ml-2"
                                          >
                                            Reset
                                          </Button>

                                          <Button
                                            onClick={sendRequest}
                                            variant="secondary"
                                            className="ml-2"
                                          >
                                            DEBUG: Send Request
                                          </Button>

                                          <Alert className="mt-4">
                                            <AlertTitle>Response</AlertTitle>
                                            <AlertDescription>
                                              <pre>{requestResponse}</pre>
                                            </AlertDescription>
                                          </Alert>

                                          <div
                                            className={`${
                                              isProcessing
                                                ? "text-slate-900"
                                                : "text-blue-500"
                                            } pt-4 pb-4 bg-slate-100 mt-4 rounded-sm p-4`}
                                          >
                                            <span className={styles.blinky}>
                                              {transcriptionResponse}
                                            </span>
                                          </div>
                                        </div>
                                      </AlertDescription>
                                    </Alert>
                                  </div>
                                  <Step
                                    title="Step 1"
                                    description={"Interpreting request"}
                                    details={
                                      "Book a car service for the 2014 Nissan Altima"
                                    }
                                    subdetails={
                                      'You asked: "Book a car service for the 2014 Nissan Altima"'
                                    }
                                    status={step1}
                                  />
                                  <Step
                                    title="Step 2"
                                    description={"Gathering context"}
                                    details={
                                      "Last used auto shop is Brock Road Garage"
                                    }
                                    subdetails={
                                      "A receipt from Brock Road Garage was found in your email inbox"
                                    }
                                    status={step2}
                                  />
                                  <Step
                                    title="Step 3"
                                    description={"Getting contact information"}
                                    details={"Phone number is 1-519-822-3771"}
                                    subdetails={
                                      "The receipt contained contact information for the auto shop"
                                    }
                                    status={step3}
                                  />
                                  <Step
                                    title="Step 4"
                                    description={"Making the call"}
                                    details={"Calling Brock Road Garage"}
                                    subdetails={
                                      "The call recording will be available after the call is completed."
                                    }
                                    status={step4}
                                    badge={true}
                                  />
                                  <div className="mt-6 space-y-1">
                                    <h2 className="text-2xl font-semibold tracking-tight">
                                      Call Transcript
                                    </h2>
                                    <p className="text-sm text-muted-foreground">
                                      {callTranscriptionResponse}
                                    </p>
                                    <p className="text-sm text-muted-foreground">
                                      {heartbeat}
                                    </p>
                                  </div>
                                </div>
                                {/* {blob && (
                                  <AudioVisualizer
                                    blob={blob}
                                    width={500}
                                    height={75}
                                    barWidth={1}
                                    gap={0}
                                    barColor={"#f76565"}
                                  />
                                )}

                                {blob && (
                                  <AudioVisualizer
                                    blob={blob}
                                    width={500}
                                    height={75}
                                    barWidth={3}
                                    gap={2}
                                    barColor={"lightblue"}
                                  />
                                )} */}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      {/* <Separator className="my-4" />
                      <div className="mt-6 space-y-1">
                        <h2 className="text-2xl font-semibold tracking-tight">
                          Suggestions for you
                        </h2>
                        <p className="text-sm text-muted-foreground">
                          Have Floyd help kickstart your day with these
                          suggestions
                        </p>
                      </div>
                      <Separator className="my-4" />
                      <div className="relative">
                        <ScrollArea>
                          <div className="flex space-x-4 pb-4">
                            {listenNowAlbums.map((album) => (
                              <AlbumArtwork
                                key={album.name}
                                album={album}
                                className="w-[250px]"
                                aspectRatio="portrait"
                                width={250}
                                height={330}
                              />
                            ))}
                          </div>
                          <ScrollBar orientation="horizontal" />
                        </ScrollArea>
                      </div> */}
                      {/* <div className="mt-6 space-y-1">
                        <h2 className="text-2xl font-semibold tracking-tight">
                          Made for You
                        </h2>
                        <p className="text-sm text-muted-foreground">
                          Your personal playlists. Updated daily.
                        </p>
                      </div>
                      <Separator className="my-4" />
                      <div className="relative">
                        <ScrollArea>
                          <div className="flex space-x-4 pb-4">
                            {madeForYouAlbums.map((album) => (
                              <AlbumArtwork
                                key={album.name}
                                album={album}
                                className="w-[150px]"
                                aspectRatio="square"
                                width={150}
                                height={150}
                              />
                            ))}
                          </div>
                          <ScrollBar orientation="horizontal" />
                        </ScrollArea>
                      </div>
                      <div className="h-full flex-col border-none p-0 data-[state=active]:flex">
                        <div className="flex items-center justify-between">
                          <div className="space-y-1">
                            <h2 className="text-2xl font-semibold tracking-tight">
                              New Episodes
                            </h2>
                            <p className="text-sm text-muted-foreground">
                              Your favorite podcasts. Updated daily.
                            </p>
                          </div>
                        </div>
                        <Separator className="my-4" />
                        <PodcastEmptyPlaceholder />
                      </div> */}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
