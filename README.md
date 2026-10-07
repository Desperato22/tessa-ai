# Tessa AI Production Lab

Tessa AI is a clean-room script-to-assets workspace for AI film production. It uses official provider APIs only.

## Included in the MVP

- Claude structured extraction: characters, locations, props, continuity notes, and a percentage-based shot plan.
- Stable asset IDs referenced by each shot.
- GPT-Image-2 reference generation through OpenAI.
- Optional Seedream reference generation through Volcengine Ark, including up to ten selected reference frames.
- Browser-local automatic keyframe extraction using luminance difference and minimum shot spacing.
- Responsive production workspace for editing prompts and continuity locks.

## Local setup

Requirements: Node.js 22.13 or newer.

```powershell
Copy-Item .env.example .env.local
npm install
npm run dev
```

Then add at least:

```dotenv
ANTHROPIC_API_KEY=...
OPENAI_API_KEY=...
```

Optional ByteDance image generation:

```dotenv
ARK_API_KEY=...
ARK_IMAGE_MODEL=doubao-seedream-5-0-260128
```

Open the local URL printed by the development server.

## Deploy on Vercel

1. Import the public GitHub repository into Vercel.
2. Keep the detected framework as Next.js and use the default build command.
3. Add the provider variables from `.env.example` in **Project Settings → Environment Variables**.
4. Deploy, then attach `tessa22.cc` under **Settings → Domains**.

When adding the Vercel DNS records at Spaceship, keep the existing Zoho MX and TXT records. They are required for `founder@tessa22.cc` and do not conflict with the web records.

## Provider routes

- `POST /api/analyze-script` calls the Claude Messages API with `output_config.format` JSON schema.
- `POST /api/generate-asset` calls either OpenAI `v1/images/generations` or Volcengine Ark `api/v3/images/generations`.

API keys are read on the server and are never exposed to the client.

## Public repository safety

`.env.local`, generated output, and local tool state are ignored. Never commit provider keys, exported browser sessions, cookies, or customer media.

## License note

This repository does not include code from BigBanana AI Director. That project is licensed CC BY-NC-SA 4.0 and is unsuitable as the source of a commercial startup without separate permission.
