import { atom, useAtom } from "jotai";
import { atomWithDefault } from "jotai/utils";
import { Doc } from "../../convex/_generated/dataModel";

// Atom to hold the requests array
const requestsAtom = atom<Doc<"requests">[]>([]);

// Derived atom for the selected request ID with a default value
const selectedRequestIdAtom = atomWithDefault((get) => {
  const requests = get(requestsAtom);
  return requests?.[0]?._id ?? null;
});

export function useRequests() {
  return useAtom(requestsAtom);
}

export function useSelectedRequestId() {
  return useAtom(selectedRequestIdAtom);
}
