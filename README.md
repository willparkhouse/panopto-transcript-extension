# Panopto Transcript Downloader (with Timestamps)

A tiny Chrome extension that exports a Panopto lecture transcript as a plain-text file **with timestamps preserved**, e.g.:

```
[0:39] Alexander Krull: Crazy.
[1:30] Alexander Krull: Okay, good. So, thank you for that, Sarah.
[2:23] Alexander Krull: Welcome to Neurocomputation. This is the first session of the semester.
```

Panopto's built-in download button strips timestamps and only gives you a wall of text, which is useless for anything that needs to point back to a specific moment in the video.

## Why this exists — Cramkit context

This extension is a data-collection tool for [Cramkit](https://github.com/willparkhouse), my revision platform. The goal is to build a retrieval layer (RAG) over **every lecture transcript**, where each chunk is tagged with:

1. The lecture it came from
2. The **timestamp** within that lecture
3. The Panopto link for that lecture

Once that's in place, when a student is chatting with the Cramkit AI about a topic — say, "explain backprop the way the lecturer did" — the AI can retrieve the relevant transcript chunk and reply with something like:

> "Your lecturer covered this around 24:17 in *Neurocomputation — Lecture 3*. [Jump to that moment ↗](https://…/Viewer.aspx?id=…&start=1457)"

That citation-with-deep-link behaviour only works if we ingest transcripts **with timestamps intact**, which Panopto's own export does not give us. Hence this extension: it's the ingestion shim that turns each Panopto lecture into a timestamped `.txt` file ready to be chunked, embedded, and stored alongside its source URL.

## Install

1. Clone or download this repo.
2. Open `chrome://extensions` and enable **Developer mode**.
3. Click **Load unpacked** and select this folder.

## Use

1. Open a Panopto lecture in Chrome.
2. Click the **Transcript** tab so the entries render in the side panel.
3. Click the extension's toolbar icon. A `.txt` file (named after the page title) will download.

## How it works

`background.js` injects a content script into all frames on the active tab (Panopto's viewer is usually iframed), finds `#transcriptTabPane`, walks each `li.index-event`, pairs the visible `.event-time` with the caption text in `.event-text`, and writes one `[mm:ss] text` line per entry to a Blob download.

No network calls, no permissions beyond `scripting`, `activeTab`, and `downloads`.

## Limitations

- Only captures transcript entries currently in the DOM. Panopto renders the full list when the Transcript tab is open, so this is normally fine — but if you ever see virtualized scrolling, scroll the transcript to the bottom before clicking the icon.
- Output is plain text in `[m:ss]` / `[mm:ss]` format (whatever Panopto displays). SRT/VTT export would be a small change if Cramkit's ingestion pipeline ever wants it.
