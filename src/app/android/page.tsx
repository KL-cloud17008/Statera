import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { PageTitle, Row, Rows, Section } from "@/components/ui/ledger";
import { ANDROID_DOWNLOAD, ANDROID_STEP_CONNECTION } from "@/lib/android-app";

export const metadata: Metadata = {
  title: "Athanor for Android",
  description: "Install Athanor on Android for training, mobility, steps, weight and your existing history.",
};

export default function AndroidPage() {
  return <main className="mx-auto min-h-dvh max-w-4xl px-5 py-8 sm:px-8 sm:py-12">
    <Link href="/" className="mb-8 inline-block text-label text-secondary">Athanor · Training ledger</Link>
    <PageTitle title="Athanor for Android" lead="Your complete training ledger, on your phone." />
    <Section title="Install or update">
      <p className="max-w-2xl text-secondary">Training, Mobility, Flexibility &amp; Balance, Steps, Weight and Settings use the same account and records as the website.</p>
      <div className="mt-5 flex flex-wrap gap-3">
        <Button asChild variant="primary"><a href={ANDROID_DOWNLOAD} download="athanor.apk">Download Athanor · Android</a></Button>
        <Button asChild variant="secondary"><Link href="/">Open website</Link></Button>
      </div>
      <p className="mt-3 text-caption text-tertiary">Version 1.1.1 · Android 9 or later · Personal APK installation</p>
      <ol className="mt-6 list-decimal space-y-3 pl-5 text-secondary">
        <li>Download the APK on your Android phone.</li>
        <li>Open the download and allow your browser to install it when Android asks.</li>
        <li>Open <strong className="font-medium text-primary">Athanor</strong> and sign in to your existing account if needed.</li>
      </ol>
      <p className="mt-5 border-l-2 border-accent pl-4 text-caption text-secondary">Already installed Athanor or Athanor Steps? Install this update over it. Version 1.1.1 fixes an Android startup error. Keep the existing app installed so its step pairing stays on your phone.</p>
    </Section>
    <Section title="Inside the app">
      <Rows columns="minmax(0,1fr)">
        <Row columns="minmax(0,1fr)"><div><h3 className="font-medium">The complete ledger</h3><p className="mt-1 text-caption text-secondary">Log workouts, enter weight, check your history and follow your mobility routines. The Dashboard keeps today’s training and mobility in focus.</p></div></Row>
        <Row columns="minmax(0,1fr)"><div><h3 className="font-medium">Quick access</h3><p className="mt-1 text-caption text-secondary">Press and hold the app icon for Training, Weight or Step connection. All other pages are in the app’s menu.</p></div></Row>
        <Row columns="minmax(0,1fr)"><div><h3 className="font-medium">Connected to your website</h3><p className="mt-1 text-caption text-secondary">The app opens the current Athanor website in a verified browser activity. Keep Chrome updated. An internet connection is needed to load pages and save records.</p></div></Row>
      </Rows>
    </Section>
    <Section title="Samsung Health steps" id="steps">
      <p className="max-w-2xl text-secondary">The same app includes the Health Connect step connection. In Athanor, open Steps → Automatic sync, create a pairing code, then open the native connection screen to allow steps and enter the code.</p>
      <div className="mt-4 flex flex-wrap gap-3">
        <Button asChild variant="secondary"><a href={ANDROID_STEP_CONNECTION}>Open step connection</a></Button>
        <Button asChild variant="secondary"><Link href="/steps/connect">Pairing page</Link></Button>
      </div>
      <p className="mt-3 text-caption text-tertiary">The connection button works on Android after installation. Background uploads depend on permissions, internet access and Android’s battery scheduling.</p>
    </Section>
  </main>;
}
