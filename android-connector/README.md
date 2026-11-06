# Athanor Steps

Personal Android companion for **Samsung Health → Health Connect → Athanor**.
Install the signed APK at `https://stateraone.vercel.app/steps/connect`, allow
steps and background reading, and enter the website's one-time pairing code.
Only Samsung Health aggregates are read. No Google Fit API, email credentials,
Health Connect writes, or other health data are used.

## Build

Use JDK 17, Gradle 8.11.1, Android SDK platform 36 and build tools 35.0.0.
Set `ANDROID_SDK_ROOT`, then run from this directory:

```sh
gradle --no-daemon assembleRelease testReleaseUnitTest lintRelease
```

The release build is minified, not debuggable, and initially unsigned. To publish
an update, increment `versionCode`, build, then use the **same private signing
key** from the private signing backup. Never commit that key or its password.

```sh
zipalign -p -f 4 app/build/outputs/apk/release/app-release-unsigned.apk aligned.apk
apksigner sign --ks "$ATHANOR_SIGNING_KEY" --ks-key-alias athanor \
  --ks-pass env:ATHANOR_SIGNING_PASSWORD --key-pass env:ATHANOR_SIGNING_PASSWORD \
  --v4-signing-enabled false --out ../public/downloads/athanor-steps.apk aligned.apk
apksigner verify --verbose --print-certs ../public/downloads/athanor-steps.apk
```

Update the APK SHA-256 sidecar after signing. Do not publish `aligned.apk`, keys,
Gradle caches or build output. The signed download is an intentional product asset.

## Behavior and operational limits

- Uses Health Connect's `StepsRecord.COUNT_TOTAL` aggregation, filtered to
  `com.sec.android.app.shealth`. Missing data is skipped, not fabricated as zero.
- Requests read steps and, when available, background reading. WorkManager runs
  approximately hourly on a connected network; Android battery restrictions and
  Health Connect/Samsung publication delays can defer uploads. A manual sync is
  available in the app.
- Daily boundaries use the account time zone. A mismatch with the phone requires
  explicit confirmation; changing the account time zone requires re-pairing.
- Starts on pairing day and catches up at most seven calendar days. It does not
  migrate old Leap Fitness backups. Manual entries/corrections take priority.
- The 60-bit random code expires after ten minutes and is single-use. Pairing
  exchanges it for a 256-bit steps-only device token, encrypted by Android
  Keystore. Server storage contains only hashes. Disconnect revokes that token.
- HTTPS origin is fixed to production. No arbitrary upload destination, telemetry,
  certificate bypass or token logging. App backup is disabled.
- Android 9+ is supported, subject to Health Connect and background-read feature
  availability. Actual Samsung device installation/permissions must be verified
  on the phone; automated unit tests do not replace that check.

## Server storage

The additive migration in `prisma/migrations/20261106_step_sync` creates two
RLS-protected tables with no public access policies. Authenticated pairing setup
can provision those same tables for existing deployments that do not run Prisma
migrations automatically. Public device endpoints never provision schema.
Prisma's server database role must own the tables or otherwise have the required
server-only access. No existing user records are rewritten.

Pairing and all step edits lock the existing user row. Uploaded totals replace
the previous aggregate for that day. Provenance prevents an upload from undoing
a manual correction, including deletion. Clearing or restoring account data
revokes the device before replacing data.
