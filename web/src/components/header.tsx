import React from "react";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useSession } from "@/providers/SessionContext";
import { AskFloydDialog } from "./ask-floyd-dialog";

const Header = ({ className }) => {
  const { sessionName, sessionAvatar } = useSession();

  return (
    <header
      className={cn(
        "w-full flex items-center justify-between p-4 px-12 bg-gray-800",
        className
      )}
    >
      <div className="flex items-center">
        <img src="convex-logo.svg" alt="Logo" className="h-8 w-auto" />
      </div>
      <AskFloydDialog />
      <div className="flex items-center space-x-4 text-white">
        <div>{sessionName}</div>
        <Avatar className="w-6 h-6">
          <AvatarImage src={sessionAvatar} className="" alt="Avatar" />
          <AvatarFallback>TR</AvatarFallback>
        </Avatar>
      </div>
    </header>
  );
};

export default Header;
