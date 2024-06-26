"use client";

import * as React from "react";
import {
  CalendarCheck2,
  Heart,
  Inbox,
  MailCheckIcon,
  MessageCircleQuestion,
  Search,
  Smartphone,
  StarIcon,
  TriangleAlert,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AccountSwitcher } from "@/components/account-switcher";
import { RequestDisplay } from "@/components/request-display";
import { RequestList } from "@/components/request-list";
import { Nav } from "@/components/nav";
import { useSelectedRequestId } from "@/hooks/useRequest";
import { Doc } from "../../convex/_generated/dataModel";

interface RequestsProps {
  accounts: {
    label: string;
    email: string;
    icon: React.ReactNode;
  }[];
  requests: Doc<"requests">[];
  defaultLayout: number[] | undefined;
  defaultCollapsed?: boolean;
  navCollapsedSize: number;
}

export function Dashboard({
  accounts,
  requests,
  defaultLayout = [265, 440, 655],
  defaultCollapsed = false,
  navCollapsedSize,
}: RequestsProps) {
  const [isCollapsed, setIsCollapsed] = React.useState(defaultCollapsed);
  const [selectedId, setSelectedId] = useSelectedRequestId();

  return (
    <TooltipProvider delayDuration={0}>
      <ResizablePanelGroup
        direction="horizontal"
        onLayout={(sizes: number[]) => {
          localStorage.setItem(
            "react-resizable-panels:layout",
            JSON.stringify(sizes)
          );
        }}
        className="h-full items-stretch"
      >
        <ResizablePanel
          defaultSize={defaultLayout[0]}
          collapsedSize={navCollapsedSize}
          collapsible={true}
          minSize={15}
          maxSize={20}
          onCollapse={() => {
            setIsCollapsed(true);
            localStorage.setItem(
              "react-resizable-panels:collapsed",
              JSON.stringify(true)
            );
          }}
          onExpand={() => {
            setIsCollapsed(false);
            localStorage.setItem(
              "react-resizable-panels:collapsed",
              JSON.stringify(false)
            );
          }}
          className={cn(
            isCollapsed &&
              "min-w-[50px] transition-all duration-300 ease-in-out"
          )}
        >
          {/* <div
            className={cn(
              "flex h-[52px] items-center justify-center",
              isCollapsed ? "h-[52px]" : "px-2"
            )}
          >
            <AccountSwitcher isCollapsed={isCollapsed} accounts={accounts} />
          </div>
          <Separator /> */}

          <Nav
            isCollapsed={isCollapsed}
            links={[
              {
                title: "Requests",
                label: "43",
                icon: Inbox,
                variant: "default",
              },
              {
                title: "Needs action",
                label: "1",
                icon: TriangleAlert,
                variant: "ghost",
              },
              {
                title: "Your information",
                label: "",
                icon: Smartphone,
                variant: "ghost",
              },
              {
                title: "Feedback",
                label: "",
                icon: Heart,
                variant: "ghost",
              },
            ]}
          />
          <Separator />
          <Nav
            isCollapsed={isCollapsed}
            links={[
              {
                title: "Connect your calendar",
                label: "",
                icon: CalendarCheck2,
                variant: "ghost",
              },
              {
                title: "Connect your email",
                label: "",
                icon: MailCheckIcon,
                variant: "ghost",
              },
              {
                title: "Preferred vendors",
                label: "8",
                icon: StarIcon,
                variant: "ghost",
              },
              {
                title: "21 Questions",
                icon: MessageCircleQuestion,
                variant: "ghost",
              },
            ]}
          />
        </ResizablePanel>
        <ResizableHandle withHandle />
        <ResizablePanel
          defaultSize={defaultLayout[1]}
          minSize={30}
          className=""
        >
          <Tabs defaultValue="all" className="h-full">
            <div className="flex items-center px-4 py-2">
              <h1 className="text-xl font-bold">Requests</h1>
              <TabsList className="ml-auto">
                <TabsTrigger
                  value="all"
                  className="text-zinc-600 dark:text-zinc-200"
                >
                  All requests
                </TabsTrigger>
                <TabsTrigger
                  value="incomplete"
                  className="text-zinc-600 dark:text-zinc-200"
                >
                  Incomplete
                </TabsTrigger>
              </TabsList>
            </div>
            <Separator />
            <div className="bg-background/95 p-4 backdrop-blur supports-[backdrop-filter]:bg-background/60">
              <form>
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input placeholder="Search" className="pl-8" />
                </div>
              </form>
            </div>
            <TabsContent value="all" className="m-0 h-full">
              <RequestList items={requests} />
            </TabsContent>
            <TabsContent value="incomplete" className="m-0 h-full">
              <RequestList
                items={
                  requests
                    ? requests.filter((item) => item.status !== "complete")
                    : []
                }
              />
            </TabsContent>
          </Tabs>
        </ResizablePanel>
        <ResizableHandle withHandle />
        <ResizablePanel defaultSize={defaultLayout[2]}>
          <RequestDisplay
            request={requests?.find((item) => item._id === selectedId) || null}
          />
        </ResizablePanel>
      </ResizablePanelGroup>
    </TooltipProvider>
  );
}
