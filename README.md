# Reading Practice App

A desktop application for language learning, featuring document management, translation practice, and vocabulary building.

## Features

### Document Management
- Create, edit, and delete documents
- Dual-pane editor for source text and translation
- Real-time editing with change detection
- Search and filter documents
- Study time tracking

### Vocabulary System
- Add words directly from text selection
- Multiple meanings and examples per word
- Context-aware vocabulary storage
- Language-based filtering

### Editor Features
- Line numbers
- Word wrap toggle
- Resizable panes
- Syntax highlighting

### User Interface
- Light/Dark mode theme
- Responsive layout
- Toast notifications
- Modal confirmations

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Alt + Z` | Toggle word wrap in editors |
| `Ctrl + S` / `Cmd + S` | Save current document |

## Technology Stack

- **Framework**: Tauri 2.0
- **Frontend**: React + TypeScript
- **Database**: SQLite
- **Build Tool**: Vite

## Recommended IDE Setup

- [VS Code](https://code.visualstudio.com/) + [Tauri](https://marketplace.visualstudio.com/items?itemName=tauri-apps.tauri-vscode) + [rust-analyzer](https://marketplace.visualstudio.com/items?itemName=rust-lang.rust-analyzer)

## Getting Started

### Prerequisites
- Node.js (v18 or higher)
- Rust (latest stable version)

### Installation

```bash
# Install dependencies
npm install

# Run in development mode
npm run tauri dev

# Build for production
npm run tauri build
```

## Project Structure

```
reading-practice-app/
├── src/                    # Frontend source code
│   ├── components/         # React components
│   │   ├── common/        # Shared components
│   │   ├── editor/        # Text editor components
│   │   ├── iconbar/       # Icon navigation bar
│   │   ├── layout/        # Layout components
│   │   ├── modals/        # Modal dialogs
│   │   ├── sidebar/       # Sidebar components
│   │   └── vocabulary/    # Vocabulary components
│   ├── hooks/             # Custom React hooks
│   ├── styles/            # Global styles
│   ├── types/             # TypeScript type definitions
│   └── utils/             # Utility functions
├── src-tauri/             # Rust backend
│   ├── migrations/        # Database migrations
│   └── src/               # Rust source code
└── README.md
```

## Features in Detail

### Document Editor
- Split-pane view for source and translation text
- Automatic save detection with change indicators
- Resizable columns for customizable workspace
- Line-by-line editing with number display

### Study Timer
- Track study time per document
- Start/pause/stop functionality
- Accumulated time statistics
- Visual timer display

### Vocabulary Management
- Context menu for quick word addition
- Multiple meanings support
- Example sentences with document linking
- Language-specific organization

### Statistics Dashboard
- Total documents count
- Vocabulary words count
- Total study time
- Per-document statistics

## Database Schema

The application uses SQLite with the following main tables:
- `documents` - Document metadata and settings
- `document_contents` - Document text content
- `vocabulary` - Vocabulary terms
- `vocabulary_meanings` - Word meanings
- `vocabulary_examples` - Example sentences
- `study_sessions` - Study time tracking

## License

This project is private and not licensed for public use.
