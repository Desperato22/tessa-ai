# Public GitHub launch

Status: completed 2026-10-08

## Goal

Publish a reviewable Tessa AI codebase without provider secrets or unrelated source-kit infrastructure.

## Completed

- Switched development and production scripts to standard Next.js commands for Vercel.
- Reduced runtime dependencies to the packages used by the application.
- Excluded generated output, credentials, local state, and unused starter modules from Git.
- Added deployment, DNS, and repository-safety guidance.
- Added GitHub CI for lint and production build verification.
