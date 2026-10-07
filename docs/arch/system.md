# System design

> updated 2026-10-08 · v0.1.0

## Data flow

```text
script/file
  -> /api/analyze-script
  -> Claude structured output
  -> ProductionPlan
       -> stable asset registry
       -> percentage-based shot plan

asset.visualPrompt
  -> /api/generate-asset
  -> OpenAI Images or Volcengine Ark
  -> asset.imageUrl

local video
  -> HTMLVideoElement + Canvas
  -> low-resolution luminance difference
  -> ranked scene-change candidates
  -> selected full-resolution JPEG keyframes
```

## Security boundary

Provider keys exist only in server environment variables. The browser never receives them. Video analysis runs locally; only user-selected reference frames are sent when the ByteDance provider is selected.

## Future persistence

The MVP keeps the active project in React state. A later authenticated release can persist projects in Postgres and generated files in object storage without changing the provider routes.
