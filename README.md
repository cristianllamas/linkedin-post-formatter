# LinkedIn Post Formatter

A client-only formatter for Cristian's LinkedIn posts. It runs as a static site, uses no backend, and stores only the latest post in the browser's `localStorage`.

## Features

- Unicode-compatible bold, italic and strikethrough conversion
- Underline support (visual/Unicode combining underline)
- Bullet and numbered lists
- Emoji picker with search
- LinkedIn-style live preview
- Character and line counts
- Clipboard copy
- Automatic restore of the latest post

## Run locally

Open `index.html` directly, or serve the folder with any static server:

```bash
python3 -m http.server 8080
```

## GitHub Pages

Publish the repository root from the default branch in **Settings → Pages → Deploy from a branch**. No build step is required.
