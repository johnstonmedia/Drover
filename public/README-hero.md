# Hero video

`ScrollHero` plays `/public/hero.mp4` and scrubs it on scroll.

## To add the cinematic video

1. Install the Higgsfield MCP (in your terminal), then restart Claude Code:

   ```
   claude mcp add --transport http higgsfield https://mcp.higgsfield.ai/mcp
   ```

2. Re-run the hero prompt. The generated 16:9, 8s, 1080p video should be saved
   here as `public/hero.mp4`.

3. (Optional) Add a `public/hero-poster.jpg` still frame — it shows while the
   video loads and as a fallback.

Until a real video is present, the hero shows the poster/dark background with
the overlay copy. Everything else works.
