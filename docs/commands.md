# EX Auto — Commands Cheat Sheet

Everything you need to run, build, and troubleshoot the mobile app. Run all
commands from the project root unless noted:

```bash
cd /Users/larry-noble/Desktop/dev/react-native/ex_auto
```

---

## 0. One-time environment setup

The Android build needs **JDK 17** (not 24) and the **Android SDK** on the PATH.
Add these to `~/.zshrc` so every new terminal has them:

```bash
export JAVA_HOME=$(/usr/libexec/java_home -v 17)
export ANDROID_HOME=$HOME/Library/Android/sdk
export PATH=$PATH:$ANDROID_HOME/platform-tools:$ANDROID_HOME/emulator
```

Then reload: `source ~/.zshrc`

Install JDK 17 if you don't have it:

```bash
brew install --cask zulu@17
java -version          # must show 17.x
```

Android SDK comes from **Android Studio** (SDK Manager → install Platform-Tools,
an SDK Platform, and Build-Tools).

Install project dependencies (after cloning or pulling changes):

```bash
npm install
```

---

## 1. Develop with live reload (the day-to-day command)

This builds + installs the dev app on a running emulator, starts Metro, and hot
-reloads your JS edits. **Use this, not `npm run start`, to develop.**

```bash
# one time only — adds the development client:
npx expo install expo-dev-client

# start the emulator first (Android Studio → Device Manager → ▶), then:
npx expo run:android
```

Leave it running. Edit anything in `src/…` → it updates on the emulator live.

Later sessions (no native changes): just start Metro and open the app:

```bash
npx expo start
# press  a   → opens the app on Android and connects to Metro
```

> ⚠️ `npm run start` alone defaults to **Expo Go**, which cannot run this app
> (it uses native modules). Always use `expo run:android` / a development build.

iOS simulator:

```bash
npx expo run:ios --device      # pick a simulator from the list
```

---

## 2. Build the APK to give to the client / supervisor

A **release** APK bundles the JS inside, so it runs standalone (no Metro, no dev
server). This is the file you share.

```bash
export JAVA_HOME=$(/usr/libexec/java_home -v 17)

# only if you changed app.json / icons / plugins since last build:
npx expo prebuild -p android

cd android
./gradlew assembleRelease        # wait for BUILD SUCCESSFUL (~3–8 min)
cd ..
```

The APK is at:

```
android/app/build/outputs/apk/release/app-release.apk
```

Reveal it in Finder to send it:

```bash
open android/app/build/outputs/apk/release/
```

Share `app-release.apk` (rename to `ex-auto.apk` if you like) via Drive / email /
WhatsApp. On the client's Android: download → tap → allow "Install unknown apps"
→ install → open **EX Auto**.

> The client must reach your backend from their phone — use a **public https URL**
> at the login screen (not `127.0.0.1` / `10.0.2.2` / a LAN IP).
> This APK is signed with a debug/test key — fine for testing, not the Play Store.

---

## 3. Install an APK manually onto an emulator/device

```bash
adb devices                                                   # confirm it's connected
adb install -r android/app/build/outputs/apk/release/app-release.apk

# if the icon/name didn't update, uninstall first:
adb uninstall com.exauto.app
adb install android/app/build/outputs/apk/release/app-release.apk
```

---

## 4. Verify the code (types + bundle)

```bash
npx tsc --noEmit -p tsconfig.json          # type-check (expect 0 errors in src/)
npx expo export --platform ios --output-dir /tmp/exauto-check --no-minify   # bundling sanity check
```

---

## 5. Regenerate the app icon & splash

The icon/splash PNGs live in `assets/images/` and are drawn by a Pillow script.
To change the logo, edit the script and re-run, then rebuild (section 2).

```bash
python3 -m venv /tmp/iconenv
/tmp/iconenv/bin/pip install Pillow
/tmp/iconenv/bin/python scripts/make_icons.py    # (script that draws icon.png, splash-icon.png, etc.)
```

Icon/splash are configured in `app.json` (`icon`, `android.adaptiveIcon`,
`expo-splash-screen` plugin). Changing them requires a rebuild:

```bash
npx expo prebuild --clean -p android
cd android && ./gradlew assembleRelease && cd ..
```

---

## 6. Backend / login

- The app talks **only** to the live Frappe backend (no mock data).
- The **Site URL** is entered on the login screen and saved on the device; it
  becomes the API base for every call.
- Auth: `POST <site>/api/method/ex_auto.api.auth.login` with `{ usr, pwd }`
  returns the user's `api_key`/`api_secret`; the app stores them and sends
  `Authorization: token <key>:<secret>` on every request.
- Default fallback site URL lives in `src/services/config.ts` (`DEFAULT_API_BASE`).

---

## 7. Troubleshooting (exact errors we hit)

| Symptom | Cause | Fix |
|---|---|---|
| `SDK location not found … ANDROID_HOME` | SDK env not set | `export ANDROID_HOME=$HOME/Library/Android/sdk` (section 0), or create `android/local.properties` with `sdk.dir=$HOME/Library/Android/sdk` |
| `A restricted method in java.lang.System has been called` (CMake configure fails) | Using **JDK 24** | Use **JDK 17**: `export JAVA_HOME=$(/usr/libexec/java_home -v 17)` |
| Stuck on **blue** Expo splash | Dev build with no Metro / Expo Go mode | Run `npx expo run:android` (dev build), or build the **release** APK (section 2) |
| **Black** screen after splash | reanimated layout animations not running on Android | Already fixed (entrance animations removed from splash/landing/toast) |
| `npm run start` → `a` opens Expo Go / nothing | `expo start` defaults to Expo Go | Install `expo-dev-client` + use `expo run:android` (section 1) |
| iOS: `Unable to find a destination…` / `iOS 26.5 not installed` | stale/missing simulator | `npx expo run:ios --device` and pick an available simulator |
| Emulator can't reach Metro (LAN IP) | wrong host | `adb reverse tcp:8081 tcp:8081`, or just use the release APK |
| Screen crashes on a live response (`… .map is not a function`) | backend returned a non-array | Already guarded (`Array.isArray` + detail normalizers) |

---

## 8. (Optional) Cloud build with EAS — no local toolchain

If you don't want to build locally, EAS builds in the cloud (`eas.json` has a
`preview` = APK profile):

```bash
npx eas-cli login
npx eas-cli build --platform android --profile preview
```
You get a download link + QR for the APK when it finishes.
