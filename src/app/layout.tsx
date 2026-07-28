import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { CSPostHogProvider } from "./providers";
import "./globals.css";

const poppins = Poppins({
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
  variable: "--font-poppins",
  display: "swap",
});

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export const metadata: Metadata = {
  title: "Anuvada News - Balanced news coverage, powered by AI",
  description: "AI-powered news analysis, sentiment tracking, and political framing breakdown across global news sources.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en" className={poppins.variable}>
        <head>
          <link rel="icon" href="/favicon.ico" sizes="any" />
        </head>
        <body className={poppins.className}>
          <CSPostHogProvider>
            {children}
          </CSPostHogProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}

