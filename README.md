# DopamineWait

**DopamineWait** is a specialized CLI utility designed to optimize the developer's reward cycle during long AI inference times. It automatically launches short-form entertainment (TikTok/Instagram Reels) when you submit a prompt to Claude Code and closes it immediately when the inference completes.

## Features

*   **Automated Browser Control**: Launches a persistent browser context to keep you logged in.
*   **Claude Code Integration**: Designed to work with Claude Code's native lifecycle hooks (`UserPromptSubmit` and `Stop`).
*   **Zero-Friction**: Runs in the background (detached), keeping your terminal free.

## Installation

1.  Clone this repository:
    ```bash
    git clone https://github.com/dandgo/dopamine-wait.git
    cd dopamine-wait
    ```

2.  Install dependencies:
    ```bash
    npm install
    npx playwright install chromium
    ```

## Usage

### 1. Configure Claude Code

Add the following to your `~/.claude/settings.json` (or wherever your Claude Code configuration lives):

```json
{
  "hooks": {
    "UserPromptSubmit": [
      {
        "matcher": "",
        "hooks": [
          {
            "type": "command",
            "command": "node /path/to/dopamine-wait/dopamine.js start",
            "detach": true
          }
        ]
      }
    ],
    "Stop": [
      {
        "matcher": "",
        "hooks": [
          {
            "type": "command",
            "command": "node /path/to/dopamine-wait/dopamine.js stop"
          }
        ]
      }
    ]
  }
}
```

**Note**: Replace `/path/to/dopamine-wait/` with the absolute path to where you cloned this repository.
**Important**: `"detach": true` is critical for the start command to prevent blocking Claude Code.

### 2. First Run (Login)

Run the start command manually once to log in to your preferred services (TikTok, Instagram, etc.):

```bash
node dopamine.js start
```

The browser will open. Log in to your accounts. The session will be saved in the `.dopamine-profile` directory.
When finished, you can stop it with:

```bash
node dopamine.js stop
```

## Structure

*   `dopamine.js`: Main controller script.
*   `.dopamine-profile`: Directory storing your browser profile (cookies, local storage).

## License

ISC
