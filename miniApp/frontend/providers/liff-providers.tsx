"use client";

import { Liff } from "@line/liff";
import { createContext, useContext, useEffect, useState, useRef, ReactNode } from "react";

interface LIFFContextValue {
  liff: Liff | null;
  isLoading: boolean;
  liffError: string | null;
}

const LIFFContext = createContext<LIFFContextValue | undefined>(undefined);

export function LIFFProvider({ children }: { children: ReactNode }) {
  const [liffObject, setLiffObject] = useState<Liff | null>(null);
  const [liffError, setLiffError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const isInitializing = useRef(false);

  useEffect(() => {
    if (isInitializing.current || liffObject) return;
    isInitializing.current = true;

    let isMounted = true;
    const timeoutId = setTimeout(() => {
      if (isMounted && isLoading) setIsLoading(false);
    }, 10000);

    const initLiff = async () => {
      try {
        const { default: liff } = await import("@line/liff");
        await liff.init({ liffId: process.env.NEXT_PUBLIC_LIFF_ID! });

        if (!isMounted) return;

        // 1. 現在のURL情報を取得
        const currentUrl = new URL(window.location.href);
        const isCallback = currentUrl.searchParams.has("code") || currentUrl.searchParams.has("liff.state");

        // 2. ログイン判定
        if (!liff.isLoggedIn()) {
          // コールバック中（?code=...）でなければ、今いるURLを戻り先に指定してログイン
          if (!isCallback) {
            liff.login({ redirectUri: window.location.href });
            return;
          }
          // コールバック中ならSDKの処理が終わるまで待つ（何もしない）
        } else {
          // ログイン済みならSDKをセット
          setLiffObject(liff);

          // 3. 「特定のページのみ」自動遷移させたい場合の処理
          // ログイン後、もしトップページにいるなら /map へ移動
          if (window.location.pathname === "/") {
            window.location.replace("/map");
            return;
          }
        }
      } catch (error) {
        if (isMounted) {
          setLiffError(error instanceof Error ? error.message : "Init failed");
        }
      } finally {
        if (isMounted) {
          clearTimeout(timeoutId);
          setIsLoading(false);
        }
      }
    };

    initLiff();

    return () => {
      isMounted = false;
      clearTimeout(timeoutId);
    };
  }, []);

  return (
    <LIFFContext.Provider value={{ liff: liffObject, isLoading, liffError }}>
      {children}
    </LIFFContext.Provider>
  );
}

export function useLIFF() {
  const context = useContext(LIFFContext);
  if (context === undefined) {
    throw new Error("useLIFF must be used within a LIFFProvider");
  }
  return context;
}
