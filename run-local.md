# Running AI Suggestions Locally

## Setup Instructions

### 1. Install Backend Dependencies
```bash
npm install --prefix . --package-lock-only express cors node-fetch nodemon
```

### 2. Start Backend Server (Terminal 1)
```bash
node server.js
```
This starts the API proxy on http://localhost:3001

### 3. Start Frontend (Terminal 2)
```bash
npm run dev
```
This starts the React app on http://localhost:5173

### 4. Update Frontend API Calls
The React app needs to point to localhost:3001 instead of the Cloudflare Worker.

## How It Works
- **Frontend**: React app with AI suggestions UI
- **Backend**: Express server proxies API calls to OpenAI/Claude/Gemini
- **No CORS Issues**: Backend handles all external API calls
- **Secure**: API keys only sent to your local backend

## Benefits
✅ Full AI functionality locally
✅ No deployment needed for testing
✅ Same UI as production
✅ Real API calls to all 3 providers
