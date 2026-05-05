import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";

export const metadata: Metadata = {
  title: "酒店升房情报"
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="zh-CN">
      <body>
        <span className="sr-only">酒店升房情报</span>
        {children}
      </body>
    </html>
  );
}
