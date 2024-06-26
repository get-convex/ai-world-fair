import "@/styles/globals.css";
import { GoogleOAuthProvider } from "@react-oauth/google";
import type { AppProps } from "next/app";
import { SessionProvider } from "@/providers/SessionContext";

import { ConvexProvider, ConvexReactClient } from "convex/react";

const convex = new ConvexReactClient(process.env.NEXT_PUBLIC_CONVEX_URL);

export default function App({ Component, pageProps }: AppProps) {
  return (
    <GoogleOAuthProvider
      clientId={process.env.NEXT_PUBLIC_GOOGLE_OAUTH_CLIENT_ID as string}
    >
      <SessionProvider>
        <ConvexProvider client={convex}>
          <Component {...pageProps} />
        </ConvexProvider>
      </SessionProvider>
    </GoogleOAuthProvider>
  );
}
