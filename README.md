# DROP

A fast, cross-platform note-taking app with voice recording and AI transcription.

## Features

- **Quick Capture**: Instantly save text, links, images, and files
- **Voice Recording**: Record voice memos with OpenAI Whisper transcription
- **Cross-Platform**: Mac (Electron) + iOS (Flutter)
- **Cloud Sync**: Real-time sync via Supabase
- **MCP Server**: Claude integration for AI-powered note management

## Apps

| Platform | Technology | Location |
|----------|------------|----------|
| Desktop (Mac) | Electron + React + TypeScript | `apps/desktop` |
| Mobile (iOS) | Flutter + Dart | `apps/mobile` |
| MCP Server | Node.js + TypeScript | `packages/mcp-server` |

## Quick Start

### Prerequisites

- Node.js 20+
- pnpm 8+
- Flutter 3.38+ (for mobile)
- Xcode 15+ (for iOS)

### Setup

```bash
# Clone repository
git clone https://github.com/intelli-bruce/drop.git
cd drop

# Copy environment files
cp .env.example .env.local

# Install dependencies
pnpm install

# Start desktop app (local Supabase)
make electron-dev-local
```

### Environment Variables

Copy `.env.example` to `.env.local` and fill in the required values:

```bash
# Supabase (local)
SUPABASE_URL_LOCAL=http://127.0.0.1:57321
SUPABASE_ANON_KEY_LOCAL=<your-local-anon-key>

# Supabase (production)
SUPABASE_URL_REMOTE=<your-supabase-url>
SUPABASE_ANON_KEY_REMOTE=<your-supabase-anon-key>

# Google OAuth (for iOS login)
GOOGLE_WEB_CLIENT_ID=<your-web-client-id>
GOOGLE_IOS_CLIENT_ID=<your-ios-client-id>
```

## Development

### Desktop (Electron)

```bash
# Development
make electron-dev-local    # Local Supabase
make electron-dev-remote   # Remote Supabase

# Build
make electron-build-local
make electron-build-remote
```

### Mobile (Flutter)

```bash
# Setup
make flutter-setup

# Development
make flutter-dev           # Local Supabase
make flutter-dev-remote    # Remote Supabase

# Build
make flutter-build         # iOS Simulator
make flutter-build-ipa     # TestFlight
```

### MCP Server

```bash
cd packages/mcp-server
cp .env.example .env
# Fill in SUPABASE_URL and SUPABASE_ANON_KEY
pnpm build
pnpm start
```

## Project Structure

```
drop/
├── apps/
│   ├── desktop/          # Electron + React app
│   └── mobile/           # Flutter iOS app
├── packages/
│   ├── mcp-server/       # MCP server for Claude
│   └── shared/           # Shared types and utilities
├── supabase/
│   └── migrations/       # Database migrations
└── docs/                 # Documentation
```

## Documentation

- [Deployment Guide](docs/DEPLOYMENT.md)
- [Supabase Workflow](docs/SUPABASE_WORKFLOW.md)

## License

[MIT](LICENSE)
