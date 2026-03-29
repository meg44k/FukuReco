import type { Metadata, Viewport } from "next";
import "./globals.css";
import { LIFFProvider } from "../providers/liff-providers";
import MenuBar from "../components/atoms/menuBar/MenuBar"
import styles from "./page.module.css";
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
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <AppRouterCacheProvider>
          <LIFFProvider>{children}</LIFFProvider>
          <div className={styles.menuBar}>
            <MenuBar/>
          </div>
        </AppRouterCacheProvider>
      </body>
    </html>
  );
}

