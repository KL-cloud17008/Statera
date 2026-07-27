import type { Metadata, Viewport } from "next";
import { Fraunces, Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { AppSettingsProvider } from "@/components/settings/AppSettingsProvider";
import { ThemeProvider } from "@/components/layout/ThemeProvider";
import { ServiceWorkerRegistration } from "@/components/pwa/ServiceWorkerRegistration";
import { Toaster } from "@/components/ui/sonner";

// Page titles only — one editorial voice per screen.
const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  display: "swap",
});

// Every other piece of UI text.
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Athanor",
  description: "A private performance ledger for training, movement, recovery, and bodyweight.",
  manifest: "/manifest.json",
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
    ],
    apple: "/icons/apple-touch-icon.png",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Athanor",
  },
};

export const viewport: Viewport = {
  // Matches --obsidian-900 in tokens.css (the chrome frames the canvas).
  themeColor: "#0b0f14",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`light ${fraunces.variable} ${inter.variable} ${jetbrainsMono.variable}`}
    >
      <head>
        <meta name="color-scheme" content="light" />
        <meta name="darkreader-lock" />
      </head>
      <body className="antialiased">
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
