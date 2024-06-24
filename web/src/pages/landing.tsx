import React from "react";
import SparklesCore from "@/components/particles";
import { cn } from "@/utils/cn";
import { BorderButton } from "@/components/border-button";
import BackgroundBeams from "@/components/particles/skate-lines";

export default function Landing() {
  return (
    <div className="">
      <BackgroundBeams className="" />
      <section>
        <div
          className={cn(
            `flex flex-col justify-center items-center text-grey-700 m-36`
          )}
        >
          <h1 className={cn(`text-8xl font-bold`)}>Lessons</h1>
          <h2 className="text-2xl">Invoicing for modern coaches</h2>
          <div className="mt-12">
            <BorderButton
              borderRadius="8px"
              className="bg-white dark:bg-slate-900 text-black dark:text-white border-neutral-200 dark:border-slate-800"
            >
              <div className="font-bold">Start here</div>
            </BorderButton>
          </div>
        </div>
      </section>
    </div>
  );
}
