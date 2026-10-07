# Product scope

> updated 2026-10-07 · v0.1.0

## User problem

AI filmmakers repeatedly rebuild the same character, location, and prop descriptions across shots. Long prompts then drift because they mix identity, blocking, camera, lighting, and continuity in one paragraph.

## MVP promise

Tessa AI turns source material into stable assets and shot references:

1. Claude extracts characters, locations, props, visual direction, and a percentage-based shot plan.
2. Every shot references stable asset IDs instead of copying descriptions.
3. OpenAI GPT Image or ByteDance Seedream creates visual references through server-side API routes.
4. Browser-local scene detection extracts keyframes without uploading the source video.

## Commercial boundary

The application is a clean-room implementation. No source from BigBanana AI Director is included because its CC BY-NC-SA license prohibits commercial use. No Dola cookies, browser profiles, or session automation are part of this product.
