import type { Metadata, Viewport } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { AppSettingsProvider } from "@/components/settings/AppSettingsProvider";
import { ThemeProvider } from "@/components/layout/ThemeProvider";
import { ServiceWorkerRegistration } from "@/components/pwa/ServiceWorkerRegistration";
import { Toaster } from "@/components/ui/sonner";

// One sans family for the whole product; mono is reserved for tabular figures.
// Both are open substitutes for the licensed faces in the reference systems.
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
  // Matches --surface-canvas in tokens.css.
  themeColor: "#f7f7f8",
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
      className={`light ${inter.variable} ${jetbrainsMono.variable}`}
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
