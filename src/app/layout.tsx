import type { Metadata, Viewport } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { AppSettingsProvider } from "@/components/settings/AppSettingsProvider";
import { ThemeProvider } from "@/components/layout/ThemeProvider";
import { ServiceWorkerRegistration } from "@/components/pwa/ServiceWorkerRegistration";
import { Toaster } from "@/components/ui/sonner";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans-base",
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const jetBrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono-base",
  weight: ["400", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "ATHANOR",
  description: "Personal fitness tracking PWA",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "ATHANOR",
  },
};

export const viewport: Viewport = {
  themeColor: "#080d16",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} ${jetBrainsMono.variable} antialiased`}>
        <ThemeProvider>
          <AppSettingsProvider>
            <ServiceWorkerRegistration />
            {children}
            <Toaster />
          </AppSettingsProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
