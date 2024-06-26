import { ComponentProps } from "react";

import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useSelectedRequestId } from "@/hooks/useRequest";
import { Doc } from "../../convex/_generated/dataModel";

interface RequestListProps {
  items: Doc<"requests">[];
}

export function RequestList({ items }: RequestListProps) {
  const [selectedId, setSelectedId] = useSelectedRequestId();

  return (
    <ScrollArea className="h-full">
      <div className="flex flex-col gap-2 p-4 pt-0 pb-36">
        {items?.map((item) => (
          <button
            key={item._id}
            className={cn(
              "flex flex-col items-start gap-2 rounded-lg border p-3 text-left text-sm transition-all hover:bg-accent",
              selectedId === item._id && "bg-muted"
            )}
            onClick={() => setSelectedId(item._id)}
          >
            <div className="flex w-full flex-col gap-1">
              <div className="flex items-center">
                <div className="flex items-center gap-2">
                  <div className="font-semibold">{item.requestMsg}</div>
                  {!(item.status === "complete") && (
                    <span className="flex h-2 w-2 rounded-full bg-blue-600" />
                  )}
                </div>
                <div
                  className={cn(
                    "ml-auto text-xs",
                    selectedId === item._id
                      ? "text-foreground"
                      : "text-muted-foreground"
                  )}
                >
                  {/* {formatDistanceToNow(new Date(item?.date), {
                    addSuffix: true,
                  })} */}
                </div>
              </div>
              <div className="text-xs font-medium">{item.description}</div>
            </div>
            <div className="line-clamp-2 text-xs text-muted-foreground">
              {item?.details?.substring(0, 300)}
            </div>
            <div className="flex items-center gap-2">
              <Badge
                key={item.status}
                variant={getBadgeVariantFromLabel(item.status)}
              >
                {item.status}
              </Badge>
            </div>
          </button>
        ))}
      </div>
    </ScrollArea>
  );
}

function getBadgeVariantFromLabel(
  label: string
): ComponentProps<typeof Badge>["variant"] {
  if (["complete"].includes(label.toLowerCase())) {
    return "default";
  }

  if (["active"].includes(label.toLowerCase())) {
    return "outline";
  }

  if (["needs_action"].includes(label.toLowerCase())) {
    return "destructive";
  }

  // pending, scheduled, etc...
  return "secondary";
}
