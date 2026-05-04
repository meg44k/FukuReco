import type { Metadata, Viewport } from "next";
import "./globals.css";
import { LIFFProvider } from "../providers/liff-providers";
import { AppRouterCacheProvider } from '@mui/material-nextjs/v15-appRouter';

export const metadata: Metadata = {
  title: "フクレコ",
  icons: {
    icon: "/favicon.ico",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1.0,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body>
        <AppRouterCacheProvider>
          <LIFFProvider>{children}</LIFFProvider>
        </AppRouterCacheProvider>
      </body>
    </html>
  );
}

