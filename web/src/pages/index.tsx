"use client";

import { Dashboard } from "@/components/dashboard";
import { accounts } from "@/data/mail";
import { useEffect, useState } from "react";
import { api } from "../../convex/_generated/api";
import { useQuery } from "convex/react";
import { useRequests } from "@/hooks/useRequest";
import Header from "@/components/header";

export default function Home() {
  const [requests, setRequests] = useRequests();
  const [defaultLayout, setDefaultLayout] = useState<number[] | undefined>(
    undefined
  );
  const [defaultCollapsed, setDefaultCollapsed] = useState<boolean | undefined>(
    undefined
  );

  useEffect(() => {
    const savedLayout = localStorage.getItem("react-resizable-panels:layout");
    setDefaultLayout(savedLayout ? JSON.parse(savedLayout) : undefined);
    const savedCollapsed = localStorage.getItem(
      "react-resizable-panels:collapsed"
    );
    setDefaultCollapsed(
      savedCollapsed ? JSON.parse(savedCollapsed) : undefined
    );
  }, []);

  const fetchedRequests = useQuery(api.requests.get);

  useEffect(() => {
    setRequests(fetchedRequests);
  }, [fetchedRequests, setRequests]);

  return (
    <div className="flex-col md:flex h-full max-h-screen">
      <Header className="" />
      <Dashboard
        accounts={accounts}
        requests={requests}
        defaultLayout={defaultLayout}
        defaultCollapsed={defaultCollapsed}
        navCollapsedSize={4}
      />
    </div>
  );
}
