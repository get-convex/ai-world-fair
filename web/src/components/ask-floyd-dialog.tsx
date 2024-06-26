import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import AskFloyd from "./ask-floyd";

export function AskFloydDialog() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="default">Make a request</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[825px] bg-white">
        <DialogHeader>
          <DialogTitle>Put Floyd to work</DialogTitle>
          <DialogDescription>
            Like any good personal assistant, Floyd will go to great lengths to
            fulfill your requests, including making phone calls on your behalf
            and booking events on your calendar.
          </DialogDescription>
        </DialogHeader>
        <AskFloyd />
      </DialogContent>
    </Dialog>
  );
}
