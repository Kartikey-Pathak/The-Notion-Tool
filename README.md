# Notion Workspace Clone

A minimalist, high-performance Notion-inspired productivity application built with **Next.js (App Router)**, **React**, **Tailwind CSS**, and **MongoDB**.

This project provides a full-featured workspace environment: a nested sidebar page tree, a block-based rich text editor with slash commands and color styling, multi-view databases (Table, Board, List, Gallery), live search, templates, trash restoration, and debounced autosaving directly to a user-provided MongoDB database.

---

## Table of Contents

1. [Features](#features)
2. [Prerequisites & Getting Started](#prerequisites--getting-started)
3. [How Database Storage & Security Works](#how-database-storage--security-works)
4. [Complete Directory & File Reference](#complete-directory--file-reference)
5. [Core Architectural Flows](#core-architectural-flows)
   - [A. Connection & Initial Seeding Flow](#a-connection--initial-seeding-flow)
   - [B. Page Hierarchy & Tree Navigation Flow](#b-page-hierarchy--tree-navigation-flow)
   - [C. Block Editor & Autosave Pipeline](#c-block-editor--autosave-pipeline)
   - [D. Databases & Multi-View Rendering](#d-databases--multi-view-rendering)
   - [E. Soft Deletion & Trash Restoration](#e-soft-deletion--trash-restoration)
6. [Data Schema Reference (MongoDB Collections)](#data-schema-reference-mongodb-collections)
7. [Keyboard Shortcuts](#keyboard-shortcuts)
8. [Guide for New Developers: How to Extend](#guide-for-new-developers-how-to-extend)

---

## Features

- **Zero-Account Database Ownership**: Connect your own MongoDB Atlas cluster or local MongoDB instance (`mongodb://127.0.0.1:27017`). Credentials remain strictly server-side.
- **Collapsible Sidebar**: Hierarchical page tree with infinite subpage nesting, expand/collapse arrows, favorites, home, inbox status, templates, and trash.
- **Block-Based Document Editor**:
  - 16 block types: Paragraph, Heading 1, 2, 3, Bullet list, Numbered list, To-do checkbox, Toggle block, Quote, Callout box, Divider, Code snippet (with syntax languages & 1-click copy), Image by URL, Web Bookmark, Simple Table, and Sub-page links.
  - Slash command menu (`/`) with keyword filtering.
  - Text & background color palette for blocks.
  - 6-dot drag handles with duplicate, delete, reorder, and turn-into options.
- **Multi-View Databases**:
  - Views: Table (spreadsheet with inline cell editing), Board (Kanban grouped by select/status), List (compact view), and Gallery (card grid).
  - 10 Property types: Title, Text, Number, Select, Multi-select, Status, Date, Checkbox, URL, Email.
  - Side-peek modal to inspect records and write extended notes.
- **Search & Command Palette**: Press `Ctrl+K` to search across all page titles and block text contents.
- **Trash & Recovery**: Soft deletion preserves parent-child relationships and allows 1-click restoration or permanent deletion.
- **Built-in Templates**: Instant page generation for Meeting Notes, Daily Journal, Weekly Planning, Study Notes, and Simple Task Lists.
- **Authentic Notion Dark Theme**: Custom dark color palette (`#191919`, `#202020`, `#2f2f2f`), minimal borders, and tailored dark scrollbars.

---

## Prerequisites & Getting Started

### 1. Requirements
- **Node.js**: v18.18.0 or newer
- **MongoDB**: Either a local MongoDB instance running on port 27017, or a free cloud cluster from [MongoDB Atlas](https://www.mongodb.com/atlas).

### 2. Install Dependencies
```bash
npm install
```

### 3. Start the Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 4. Connect Your Database
When you first open the app, you will see the connection screen:
- **Local MongoDB**: Click **"Use Local MongoDB"** (populates `mongodb://127.0.0.1:27017`) and click **"Connect & Enter Workspace"**.
- **MongoDB Atlas**: Paste your Atlas connection string (e.g., `mongodb+srv://<username>:<password>@cluster0.mongodb.net`), set the database name (`notion_workspace`), and connect.

---

## How Database Storage & Security Works

A MongoDB connection string contains sensitive credentials. This application follows a strict **zero-leakage** security model:

1. **Client Isolation**: The browser client **never** receives the connection string, passwords, or raw queries. API responses return only sanitized status (`{ isConnected: true, host: "cluster0...", dbName: "notion_workspace" }`).
2. **Server-Side File Storage**: Submitted connection strings are written exclusively to `.notion-config.json` on the server filesystem.
3. **Git Protection**: `.notion-config.json` and `.env*` are explicitly added to `.gitignore`. They cannot be pushed to version control.
4. **Environment Variable Override**: You can bypass the UI setup by adding `MONGODB_URI` and `MONGODB_DB_NAME` to `.env.local`.

---

## Complete Directory & File Reference

Here is what every file and folder in the project does:

```
my-app/
├── .gitignore                          # Excludes node_modules, build output, .env*, and .notion-config.json
├── jsconfig.json                       # Sets up path alias: '@/*' points to './src/*'
├── next.config.mjs                     # Next.js build configuration
├── package.json                        # Dependencies (next, react, react-dom, mongodb, lucide-react)
└── src/
    ├── app/
    │   ├── globals.css                 # Global CSS variables for dark theme, scrollbars, and selection
    │   ├── layout.js                   # Root HTML structure, Geist fonts, metadata, and dark class
    │   ├── page.js                     # Root page component that mounts WorkspaceLayout
    │   └── api/                        # Next.js Route Handlers (Server-Side Endpoints)
    │       ├── connection/
    │       │   └── route.js            # GET: check DB status; POST: test & save URI; DELETE: disconnect
    │       ├── workspace/
    │       │   └── route.js            # GET: workspace stats; PATCH: update name/icon; DELETE: wipe & reset
    │       ├── pages/
    │       │   ├── route.js            # GET: fetch all active pages; POST: create new page or database page
    │       │   └── [id]/
    │       │       ├── route.js        # GET: fetch page & blocks; PATCH: autosave page; DELETE: soft delete
    │       │       ├── duplicate/
    │       │       │   └── route.js    # POST: duplicate page and clone all internal blocks with new IDs
    │       │       ├── permanent/
    │       │       │   └── route.js    # DELETE: permanently delete page and its child pages from MongoDB
    │       │       └── restore/
    │       │           └── route.js    # POST: restore page and descendants from trash
    │       ├── databases/
    │       │   └── [id]/
    │       │       ├── route.js        # GET: database schema & views; PATCH: update columns or views
    │       │       └── records/
    │       │           ├── route.js    # GET: fetch records; POST: create a new record
    │       │           └── [recordId]/
    │       │               └── route.js# PATCH: update cell values; DELETE: remove single record
    │       ├── search/
    │       │   └── route.js            # GET: query regex across page titles, descriptions, and block text
    │       ├── templates/
    │       │   └── route.js            # GET: list templates; POST: create ready-to-use page from template
    │       └── trash/
    │           └── route.js            # GET: list trashed pages; DELETE: empty entire trash
    ├── components/
    │   ├── common/
    │   │   └── ConfirmDialog.jsx       # Modal dialog for confirming destructive actions (delete, reset)
    │   ├── connection/
    │   │   └── ConnectionSetup.jsx     # Onboarding view displayed when no MongoDB connection is configured
    │   ├── workspace/
    │   │   ├── WorkspaceLayout.jsx     # Root controller: manages active page, sidebar state, and dialogs
    │   │   ├── Sidebar.jsx             # Left sidebar navigation (favorites, page tree, trash, connection)
    │   │   ├── PageTreeItem.jsx        # Recursive page item supporting nested subpages, chevrons, and context menus
    │   │   └── WorkspaceHeader.jsx     # Top bar: sidebar toggle, breadcrumbs, favorite star, and page menu
    │   ├── editor/
    │   │   ├── PageEditor.jsx          # Document canvas: cover image, emoji picker, title, and autosave loop
    │   │   ├── BlockRenderer.jsx       # Renders all 16 block types, hover drag handles, and color palette
    │   │   └── SlashCommandMenu.jsx    # Popover menu triggered by typing '/' to insert blocks
    │   ├── database/
    │   │   ├── DatabaseView.jsx        # Master database wrapper: view switcher tabs, search, filter, and sort
    │   │   ├── DatabaseTable.jsx       # Spreadsheet table view with inline cell editing
    │   │   ├── DatabaseBoard.jsx       # Kanban board view grouped by Status or Select properties
    │   │   ├── DatabaseList.jsx        # Minimalist compact list view
    │   │   ├── DatabaseGallery.jsx     # Card preview grid view
    │   │   ├── RecordModal.jsx         # Side-peek modal to view/edit all properties and extended notes
    │   │   └── PropertyEditor.jsx      # Modal to add new custom database properties (Number, Date, Status, etc.)
    │   └── dialogs/
    │       ├── SearchDialog.jsx        # Command palette (Ctrl+K) with live search and recent pages
    │       ├── SettingsDialog.jsx      # Workspace settings: name, appearance, connection health, and reset
    │       ├── TrashDialog.jsx         # Trash modal to inspect, restore, or permanently remove deleted pages
    │       └── TemplatePicker.jsx      # Template selector with preview of blocks and 1-click instantiation
    └── lib/
        ├── mongodb.js                  # MongoClient connection manager, configuration loader, and seed data
        └── templates.js                # Built-in productivity templates (Meeting Notes, Journal, Planning, etc.)
```

---

## Core Architectural Flows

### A. Connection & Initial Seeding Flow
1. **User Enters URI**: On opening the app without an existing connection, [`WorkspaceLayout.jsx`](file:///d:/THE_NOTION/my-app/src/components/workspace/WorkspaceLayout.jsx) renders [`ConnectionSetup.jsx`](file:///d:/THE_NOTION/my-app/src/components/connection/ConnectionSetup.jsx).
2. **Ping Test**: The client sends a `POST /api/connection`. The server calls `testConnection()` in [`src/lib/mongodb.js`](file:///d:/THE_NOTION/my-app/src/lib/mongodb.js) to execute `db.command({ ping: 1 })`.
3. **Local Config Storage**: If the ping succeeds, `saveConfig()` stores the URI in `.notion-config.json`.
4. **Automatic Seeding**: `initializeWorkspace()` checks if the database is empty. If empty, it creates indexes and seeds:
   - Default workspace record (`workspaces` collection).
   - "Welcome to your Workspace" page with starter guide blocks.
   - "Quick Notes" subpage demonstrating page hierarchy.
   - "Tasks & Projects" database with 4 views and starter records.
5. **App Entry**: The browser receives `{ success: true }` and loads the workspace immediately.

### B. Page Hierarchy & Tree Navigation Flow
- Pages are stored in the `pages` collection.
- Hierarchy is maintained using the `parentId` field:
  - Root pages have `parentId: null`.
  - Nested pages have `parentId: "page_parent_id"`.
- [`Sidebar.jsx`](file:///d:/THE_NOTION/my-app/src/components/workspace/Sidebar.jsx) filters root pages and renders [`PageTreeItem.jsx`](file:///d:/THE_NOTION/my-app/src/components/workspace/PageTreeItem.jsx).
- If a page has children (`allPages.filter(p => p.parentId === page.id)`), `PageTreeItem` renders an expand chevron and recursively mounts itself with incremented padding (`level + 1`).
- Deleting a parent page soft-deletes all its descendant pages recursively to prevent orphaned documents.

### C. Block Editor & Autosave Pipeline
1. **Block Representation**: Each document contains an ordered array of block objects in `page.blocks`:
   ```json
   {
     "id": "b_12345",
     "type": "paragraph",
     "content": "Hello world",
     "properties": { "textColor": "blue", "bgColor": "yellow_bg" }
   }
   ```
2. **Zero-Lag Typing**: Typing in an input or textarea updates React local state immediately.
3. **Debounced Autosave**:
   - [`PageEditor.jsx`](file:///d:/THE_NOTION/my-app/src/components/editor/PageEditor.jsx) uses a `saveTimerRef` ref.
   - Every keystroke calls `triggerAutoSave()`, clearing the previous timer with `clearTimeout` and setting a new 600ms countdown.
   - When the user pauses typing for 600ms, a `PATCH /api/pages/[id]` request is sent.
   - The status pill in the bottom-right toggles between `Saving...` and `Saved`.
4. **Slash Commands**: Typing `/` inside any text block records the cursor position and opens [`SlashCommandMenu.jsx`](file:///d:/THE_NOTION/my-app/src/components/editor/SlashCommandMenu.jsx). Selecting a block type converts the active block using `turnBlockInto(index, newType)`.

### D. Databases & Multi-View Rendering
- When a page has `isDatabase: true`, it references a database ID (`databaseId`).
- The database schema is stored in the `databases` collection:
  - `schema`: Array of properties (`{ id, name, type, options }`).
  - `views`: Array of view configurations (`{ id, name, type: 'table'|'board'|'list'|'gallery' }`).
- Records are stored as separate documents in `database_records`:
  ```json
  {
    "id": "rec_001",
    "databaseId": "db_tasks",
    "properties": {
      "prop_title": "Fix bug",
      "prop_status": "In Progress",
      "prop_priority": "High"
    }
  }
  ```
- [`DatabaseView.jsx`](file:///d:/THE_NOTION/my-app/src/components/database/DatabaseView.jsx) renders the active view:
  - **Table**: Inline text inputs, tag dropdowns, and checkboxes.
  - **Board**: Columns grouped by a `select` or `status` property; moving cards updates the grouping property value.
  - **List & Gallery**: Cards with metadata previews.
- Clicking any record opens [`RecordModal.jsx`](file:///d:/THE_NOTION/my-app/src/components/database/RecordModal.jsx) where all properties and long-form notes can be edited.

### E. Soft Deletion & Trash Restoration
- Pages are deleted using soft deletion: `DELETE /api/pages/[id]` sets `{ isTrash: true, trashedAt: new Date() }`.
- Descendants are collected recursively and marked as trash simultaneously.
- Soft-deleted pages disappear from the sidebar tree and search results.
- Opening [`TrashDialog.jsx`](file:///d:/THE_NOTION/my-app/src/components/dialogs/TrashDialog.jsx) queries `/api/trash` to display all deleted items.
- Restoring a page clears `isTrash: false` on the page and its children.
- Permanent deletion drops the page, all descendants, and associated database records from MongoDB.

---

## Data Schema Reference (MongoDB Collections)

### 1. `workspaces`
```json
{
  "id": "ws_default",
  "name": "Personal Workspace",
  "icon": "N",
  "createdAt": "2026-10-18T10:00:00.000Z",
  "updatedAt": "2026-10-18T10:00:00.000Z"
}
```

### 2. `pages`
```json
{
  "id": "page_welcome",
  "workspaceId": "ws_default",
  "parentId": null,
  "title": "Welcome to your Workspace",
  "icon": "👋",
  "cover": "https://images.unsplash.com/...",
  "description": "Getting started notes",
  "isFavorite": false,
  "isTrash": false,
  "trashedAt": null,
  "isDatabase": false,
  "databaseId": null,
  "order": 0,
  "blocks": [
    {
      "id": "b_1",
      "type": "heading1",
      "content": "Getting Started",
      "properties": {}
    }
  ],
  "createdAt": "2026-10-18T10:00:00.000Z",
  "updatedAt": "2026-10-18T10:00:00.000Z"
}
```

### 3. `databases`
```json
{
  "id": "db_tasks",
  "workspaceId": "ws_default",
  "pageId": "page_tasks_db",
  "title": "Tasks & Projects",
  "schema": [
    { "id": "prop_title", "name": "Task", "type": "title" },
    { "id": "prop_status", "name": "Status", "type": "status", "options": [
      { "id": "opt_1", "name": "Not Started", "color": "gray" },
      { "id": "opt_2", "name": "In Progress", "color": "blue" },
      { "id": "opt_3", "name": "Done", "color": "green" }
    ]}
  ],
  "views": [
    { "id": "view_table", "name": "Table", "type": "table" },
    { "id": "view_board", "name": "Board", "type": "board", "groupBy": "prop_status" }
  ],
  "defaultViewId": "view_table"
}
```

### 4. `database_records`
```json
{
  "id": "rec_001",
  "databaseId": "db_tasks",
  "properties": {
    "prop_title": "Write documentation",
    "prop_status": "In Progress"
  },
  "createdAt": "2026-10-18T10:00:00.000Z",
  "updatedAt": "2026-10-18T10:00:00.000Z"
}
```

---

## Keyboard Shortcuts

| Shortcut | Action |
|---|---|
| `Ctrl + K` or `Cmd + K` | Open the Search and Command Palette dialog |
| `Ctrl + \` or `Cmd + \` | Toggle the Left Sidebar (Open / Close) |
| `/` (at block start) | Open the Slash Command menu to insert blocks |
| `Enter` (in text block) | Create and jump to a new block below |
| `Backspace` (on empty block) | Convert block to paragraph or remove block |
| `Escape` | Close any active modal (Search, Settings, Trash, Templates, Menus) |

---

## Guide for New Developers: How to Extend

### 1. How to Add a New Block Type
1. Open [`src/components/editor/SlashCommandMenu.jsx`](file:///d:/THE_NOTION/my-app/src/components/editor/SlashCommandMenu.jsx).
2. Add an entry to the `COMMAND_ITEMS` array:
   ```javascript
   { 
     id: 'video', 
     title: 'Video', 
     desc: 'Embed a video link.', 
     icon: Video, 
     keywords: ['video', 'embed', 'media'] 
   }
   ```
3. Open [`src/components/editor/BlockRenderer.jsx`](file:///d:/THE_NOTION/my-app/src/components/editor/BlockRenderer.jsx).
4. Inside the `renderBlockContent` switch/conditional block, add the JSX for your new block:
   ```jsx
   {block.type === 'video' && (
     <div className="my-2 p-2 rounded bg-[#202020] border border-[#2f2f2f]">
       <input
         type="text"
         value={block.properties?.url || ''}
         onChange={(e) => updateBlock(index, { properties: { ...block.properties, url: e.target.value } })}
         placeholder="Paste video URL..."
         className="w-full bg-transparent text-xs text-[#ebebeb] focus:outline-none"
       />
     </div>
   )}
   ```
5. The block will automatically participate in autosaving and persistence.

### 2. How to Add a New Template
1. Open [`src/lib/templates.js`](file:///d:/THE_NOTION/my-app/src/lib/templates.js).
2. Append a new template object to the `TEMPLATES` array with an ID, title, emoji icon, category, and an array of starter blocks.
3. The new template will appear in [`TemplatePicker.jsx`](file:///d:/THE_NOTION/my-app/src/components/dialogs/TemplatePicker.jsx) automatically.

### 3. How to Add a New Database Property Type
1. Open [`src/components/database/PropertyEditor.jsx`](file:///d:/THE_NOTION/my-app/src/components/database/PropertyEditor.jsx).
2. Add your property type to `PROPERTY_TYPES` (e.g., `{ id: 'phone', name: 'Phone', icon: Phone }`).
3. Open [`src/components/database/DatabaseTable.jsx`](file:///d:/THE_NOTION/my-app/src/components/database/DatabaseTable.jsx) and [`RecordModal.jsx`](file:///d:/THE_NOTION/my-app/src/components/database/RecordModal.jsx).
4. Add the corresponding input rendering inside the property switch cases.

---

## Build & Production Deployment

To create an optimized production build:
```bash
npm run build
npm run start
```
All routes are verified to compile statically and dynamically with 0 TypeScript/ESLint errors.
