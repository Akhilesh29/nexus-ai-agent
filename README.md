# NEXUS - Neural Execution & Unified Automation System

AI-powered task automation agent with a CLI and a Web UI.
Built with TypeScript + Node.js + Google Gemini API.

---

## Prerequisites

| Requirement     | Version       | Check                  |
|-----------------|---------------|------------------------|
| Node.js         | v18 or higher | node --version         |
| npm             | v8 or higher  | npm --version          |
| Gemini API Key | -           | aistudio.google.com  |

---

## Step-by-Step Setup

### Step 1 - Install dependencies

    npm install

### Step 2 - Set your Gemini API key

Mac / Linux:

    export GEMINI_API_KEY=your-gemini-key-here

Windows (Command Prompt):

    set GEMINI_API_KEY=your-gemini-key-here

Windows (PowerShell):

    $env:GEMINI_API_KEY = "your-gemini-key-here"

Get your key at: https://aistudio.google.com/app/apikey

### Step 3 - Build TypeScript

    npm run build

A dist/ folder will be created. No errors = you are ready.

---

## Running NEXUS

### Option A - Web UI (recommended)

    npm start

Open browser at: http://localhost:3000

Type a task and hit EXECUTE (or press Enter).

### Option B - CLI

    npm run cli

Interactive terminal prompt appears. Type "exit" or "quit" to close.

---

## Built-in Tools

| Tool             | What it does                                    |
|------------------|-------------------------------------------------|
| calculator       | Safe math expressions                           |
| text_transform   | uppercase, lowercase, reverse, word_count, etc  |
| list_manager     | Create, add, remove, sort, deduplicate lists    |
| data_formatter   | Output as Markdown table, CSV, or JSON          |
| datetime_info    | Current date, time, day of week, timestamp      |

---

## Example Tasks

- Calculate (2 ** 10) + 500 - 24
- Word count: "The quick brown fox jumps over the lazy dog"
- Create list "groceries", add milk, eggs, bread, eggs, milk — deduplicate and sort
- Format [{name:'Alice',score:92},{name:'Bob',score:85}] as markdown table
- What day of the week is it today?

---

## Troubleshooting

| Problem                    | Fix                                  |
|----------------------------|--------------------------------------|
| Cannot find module         | Run: npm run build                   |
| AuthenticationError        | Check GEMINI_API_KEY is set          |
| Port 3000 already in use   | Run: PORT=4000 npm start             |
| node: command not found    | Install from https://nodejs.org      |

---

## Deploy (Render backend + Vercel frontend)

### Backend on Render

1. Deploy this folder (`nexus-agent`) as a Web Service.
2. Render settings:
   - Build Command: `npm install && npm run build`
   - Start Command: `npm start`
3. Add environment variables:
   - `GEMINI_API_KEY` = your key
   - `GEMINI_MODEL` = `gemini-2.5-flash` (optional)
   - `FRONTEND_ORIGIN` = your Vercel URL (for CORS), for example `https://your-app.vercel.app`
4. Test backend health:
   - `https://your-backend.onrender.com/health`

### Frontend on Vercel

1. Deploy the same project folder with Vercel.
2. After deployment, open your Vercel app once with query param:
   - `https://your-app.vercel.app/?api=https://your-backend.onrender.com`
3. The frontend stores this backend URL in `localStorage` and uses it for `/api/run`.

# NEXUS - Neural Execution & Unified Automation System

AI-powered task automation agent with a CLI and a Web UI.
Built with TypeScript + Node.js + Google Gemini API.

---

## Prerequisites

| Requirement     | Version       | Check                  |
|-----------------|---------------|------------------------|
| Node.js         | v18 or higher | node --version         |
| npm             | v8 or higher  | npm --version          |
| Gemini API Key | -           | aistudio.google.com  |

---

## Step-by-Step Setup

### Step 1 - Install dependencies

    npm install

### Step 2 - Set your Gemini API key

Mac / Linux:

    export GEMINI_API_KEY=your-gemini-key-here

Windows (Command Prompt):

    set GEMINI_API_KEY=your-gemini-key-here

Windows (PowerShell):

    $env:GEMINI_API_KEY = "your-gemini-key-here"

Get your key at: https://aistudio.google.com/app/apikey

### Step 3 - Build TypeScript

    npm run build

A dist/ folder will be created. No errors = you are ready.

---

## Running NEXUS

### Option A - Web UI (recommended)

    npm start

Open browser at: http://localhost:3000

Type a task and hit EXECUTE (or press Enter).

### Option B - CLI

    npm run cli

Interactive terminal prompt appears. Type "exit" or "quit" to close.

---

## Built-in Tools

| Tool             | What it does                                    |
|------------------|-------------------------------------------------|
| calculator       | Safe math expressions                           |
| text_transform   | uppercase, lowercase, reverse, word_count, etc  |
| list_manager     | Create, add, remove, sort, deduplicate lists    |
| data_formatter   | Output as Markdown table, CSV, or JSON          |
| datetime_info    | Current date, time, day of week, timestamp      |

---

## Example Tasks

- Calculate (2 ** 10) + 500 - 24
- Word count: "The quick brown fox jumps over the lazy dog"
- Create list "groceries", add milk, eggs, bread, eggs, milk — deduplicate and sort
- Format [{name:'Alice',score:92},{name:'Bob',score:85}] as markdown table
- What day of the week is it today?

---

## Troubleshooting

| Problem                    | Fix                                  |
|----------------------------|--------------------------------------|
| Cannot find module         | Run: npm run build                   |
| AuthenticationError        | Check GEMINI_API_KEY is set          |
| Port 3000 already in use   | Run: PORT=4000 npm start             |
| node: command not found    | Install from https://nodejs.org      |

---

## Deploy (Render backend + Vercel frontend)

### Backend on Render

1. Deploy this folder (`nexus-agent`) as a Web Service.
2. Render settings:
   - Build Command: `npm install && npm run build`
   - Start Command: `npm start`
3. Add environment variables:
   - `GEMINI_API_KEY` = your key
   - `GEMINI_MODEL` = `gemini-2.5-flash` (optional)
   - `FRONTEND_ORIGIN` = your Vercel URL (for CORS), for example `https://your-app.vercel.app`
4. Test backend health:
   - `https://your-backend.onrender.com/health`

### Frontend on Vercel

1. Deploy the same project folder with Vercel.
2. After deployment, open your Vercel app once with query param:
   - `https://your-app.vercel.app/?api=https://your-backend.onrender.com`
3. The frontend stores this backend URL in `localStorage` and uses it for `/api/run`.
