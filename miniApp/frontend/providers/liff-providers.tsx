"use client";

import { Liff } from "@line/liff";
import { createContext, useContext, useEffect, useState, useRef } from "react";

interface LIFFContextValue {
  liff: Liff | null;
  isLoading: boolean;
  liffError: string | null;
}

const LIFFContext = createContext<LIFFContextValue>({
  liff: null,
  isLoading: true,
  liffError: null,
});

function LIFFProvider({ children }: { children: React.ReactNode }) {
  const [liffObject, setLiffObject] = useState<Liff | null>(null);
  const [liffError, setLiffError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const isInitializing = useRef(false);

  useEffect(() => {
    if (isInitializing.current || liffObject) return;
    isInitializing.current = true;

    let isMounted = true;
    const timeoutId = setTimeout(() => {
      if (isMounted && isLoading) {
        console.warn("LIFF init timed out. Proceeding as guest.");
        setIsLoading(false);
      }
    }, 10000); // 10秒でタイムアウト

    import("@line/liff")
      .then((liff) => liff.default)
      .then((liff) => {
        console.log("LIFF init starting... URL:", window.location.href);
        liff
          .init({ liffId: process.env.NEXT_PUBLIC_LIFF_ID! })
          .then(() => {
            if (!isMounted) return;
            console.log("LIFF init succeeded! Logged in:", liff.isLoggedIn());
            setLiffObject(liff);

            // ログインリダイレクト処理の判定
            const urlParams = new URLSearchParams(window.location.search);
            const isProcessingCallback = urlParams.has("liff.state") || urlParams.has("code");

            if (!liff.isLoggedIn()) {
              if (isProcessingCallback) {
                console.log("LIFF is currently processing login callback. Waiting...");
              } else {
                console.log("Not logged in. Initiating liff.login()...");
                liff.login();
              }
            }
          })
          .catch((error: Error) => {
            if (!isMounted) return;
            console.error("LIFF init failed:", error);
            setLiffError(error.toString());
          })
          .finally(() => {
            if (isMounted) {
              clearTimeout(timeoutId);
              setIsLoading(false);
            }
          });
      });

    return () => {
      isMounted = false;
      clearTimeout(timeoutId);
    };
  }, []);

  const value: LIFFContextValue = {
    liff: liffObject,
    isLoading,
    liffError: liffError,
  };
  return <LIFFContext.Provider value={value}>{children}</LIFFContext.Provider>;
}

function useLIFF(): LIFFContextValue {
  const liff = useContext(LIFFContext);
  if (!liff) {
    throw new Error("useLIFF must be used within a LIFFProvider");
  }
  return liff;
}

export { LIFFProvider, useLIFF };
