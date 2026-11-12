# JARVIS — Android-friendly daily assistant

This is an installable Progressive Web App (PWA) prototype inspired by the **workspace/profile and voice-trigger concept** in the supplied Workspace Launcher repository. The original repository is a Windows 10/11 Python/PowerShell desktop utility, not an Android app, so this project is a mobile-first adaptation rather than a direct Android port.

## Included
- Minimal black interface with JARVIS-style assistant layout
- Text chat UI and browser speech input / spoken replies
- Local task list and notes stored in this browser on this device
- Offline app shell via service worker
- Optional AI backend URL setting

## Install on a Samsung phone
1. Host this folder on an HTTPS website (or run it from a local development server).
2. Open the site in Chrome on your phone.
3. Open Chrome's menu and choose **Add to Home screen** or **Install app**.
4. Launch JARVIS from the home screen.

A static file opened directly from Downloads may not support installation or offline features. HTTPS hosting is recommended.

## Enable full AI chat
The app can send `{ "message": "..." }` as JSON to a backend endpoint configured in Settings. The endpoint should return `{ "reply": "..." }`.
Use a trusted backend that keeps provider API credentials on the server. Do not put secret API keys in `app.js`, HTML, or the phone-side settings.

## Current prototype limitations
- Full generative AI is not connected until a secure backend URL is configured.
- Voice recognition availability depends on Chrome / Android speech services and microphone permission.
- This is an installable web app, not a signed native APK.
- Tasks and notes are stored locally in the browser and do not sync across devices.

## Original project
https://github.com/MateuszMlynekHub/launcher

The original project's Windows-specific app launching, monitor placement, PowerShell scripts, and Windows tray integration do not transfer directly to Android. The mobile adaptation keeps the everyday-assistant direction and voice-first interaction concept.
