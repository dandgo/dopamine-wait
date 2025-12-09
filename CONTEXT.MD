# Project Context: DopamineWait

## 1. Project Overview
**DopamineWait** is a specialized CLI utility designed to optimize the developer's reward cycle during long AI inference times.
* **Goal:** Automatically open short-form entertainment (TikTok/Instagram Reels) when the user submits a prompt to "Claude Code" and immediately close it when the inference completes.
* **Mechanism:** It leverages **Claude Code Native Hooks** to trigger external Node.js scripts that control a headless/headed browser instance.

## 2. Architecture & Design Decisions

### Current Architecture: Event-Driven (Hooks)
We moved away from a "Wrapper/Proxy" architecture (using `node-pty`) in favor of a cleaner, native approach using Claude Code's lifecycle events.

**Workflow:**
1.  **Trigger (Start):** Claude Code detects `UserPromptSubmit`.
2.  **Action:** Executes `node dopamine.js start` (detached process).
3.  **Process:** * Launches Playwright (Chromium) with a persistent context (to save logins).
    * Opens designated URLs.
    * Writes its own PID to a temp file (`os.tmpdir()/dopamine_browser.pid`).
    * Waits indefinitely for a kill signal.
4.  **Trigger (Stop):** Claude Code detects `Stop` (End of turn).
5.  **Action:** Executes `node dopamine.js stop`.
6.  **Cleanup:** Reads PID from temp file -> Sends `SIGKILL` -> Browser closes -> Deletes temp file.

### Tech Stack
* **Runtime:** Node.js
* **Browser Automation:** Playwright (Chromium engine)
* **Integration:** Claude Code CLI (`~/.claude/settings.json`)
* **OS Interaction:** `fs` for PID management, `os` for temp paths.

## 3. Critical Implementation Details

### The "Detach" Requirement
The `start` command inside Claude's `settings.json` **MUST** be configured with `"detach": true`.
* *Reason:* If not detached, Claude will wait for the browser script to finish (close) before it even begins processing the prompt, defeating the purpose of the app.

### Persistence Strategy
* We use `chromium.launchPersistentContext` pointing to `.dopamine-profile`.
* *Why:* To ensure the user only logs into TikTok/Instagram once. Subsequent runs reuse the session cookies.

### PID Management
Since Playwright browser processes are children of the Node script:
1.  We store the **Node process PID**, not the browser PID.
2.  Killing the Node parent process (`SIGKILL`) effectively terminates the browser context immediately.

## 4. File Structure
```text
/dopamine-wait
├── dopamine.js        # Main controller (handles start/stop logic)
├── package.json       # Dependencies (playwright)
├── .gitignore         # Ignores node_modules and .dopamine-profile
└── README.md          # User instructions