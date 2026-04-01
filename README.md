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

