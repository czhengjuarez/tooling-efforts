# Cloudflare Agent Setup Guide

## Overview

This application now uses **Cloudflare Agents** and **Workers AI** to provide AI-powered tool recommendations without requiring users to input their own API keys. The agent evaluates tools based on impact and effort, automatically placing them in the appropriate quadrants.

## Architecture

```
┌─────────────────┐
│  React Frontend │
│   (Vite + React)│
└────────┬────────┘
         │
         ▼
┌─────────────────────────────────┐
│   Cloudflare Worker             │
│   (worker.js)                   │
│   - HTTP API endpoints          │
│   - WebSocket support           │
└────────┬────────────────────────┘
         │
         ▼
┌─────────────────────────────────┐
│   ToolEvaluationAgent           │
│   (Durable Object)              │
│   - Tool suggestion generation  │
│   - Impact & effort analysis    │
│   - SQL state persistence       │
│   - WebSocket real-time updates │
└────────┬────────────────────────┘
         │
         ▼
┌─────────────────────────────────┐
│   Workers AI                    │
│   (@cf/meta/llama-3.1-8b)      │
│   - LLM inference               │
│   - No API keys needed          │
└─────────────────────────────────┘
```

## Key Features

### 1. **No API Keys Required**
- Uses Cloudflare Workers AI (included with Workers paid plan)
- Users simply describe what tools they need
- Agent handles all AI interactions

### 2. **Intelligent Evaluation**
- **Impact Analysis**: How much value will this tool provide?
- **Effort Analysis**: How much time/cost/complexity to implement?
- **Automatic Quadrant Placement**:
  - **Q1 (Quick Wins)**: High Impact, Low Effort
  - **Q2 (Major Projects)**: High Impact, High Effort
  - **Q3 (Fill-ins)**: Low Impact, Low Effort
  - **Q4 (Time Wasters)**: Low Impact, High Effort

### 3. **Persistent State**
- Agent uses Durable Objects with SQL
- Stores evaluation history
- Can retrieve past recommendations

### 4. **Real-time Updates** (Optional)
- WebSocket support for streaming results
- Progress updates during evaluation
- Live tool suggestions as they're generated

## Local Development

### Prerequisites
- Node.js 18+
- npm or yarn
- Cloudflare account (for deployment)

### Running Locally

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Start the backend server** (Terminal 1):
   ```bash
   node server.js
   ```
   This runs on `http://localhost:3001` and simulates the agent behavior.

3. **Start the frontend** (Terminal 2):
   ```bash
   npm run dev
   ```
   This runs on `http://localhost:5173`

4. **Open in browser**:
   Navigate to `http://localhost:5173`

### Local vs Production

**Local Development**:
- Uses `server.js` to simulate agent behavior
- Provides contextual tool suggestions based on keywords
- No actual AI calls (faster for development)

**Production (Cloudflare)**:
- Uses actual Cloudflare Workers AI
- Real LLM-powered tool suggestions
- Impact/effort analysis via AI
- Persistent state in Durable Objects

## Deployment to Cloudflare

### 1. Prerequisites
- Cloudflare account with Workers paid plan ($5/month)
- Wrangler CLI installed: `npm install -g wrangler`

### 2. Login to Cloudflare
```bash
wrangler login
```

### 3. Update Configuration
Edit `wrangler.toml` and update the worker name if needed:
```toml
name = "audit-tool"  # Change to your preferred name
```

### 4. Deploy
```bash
wrangler deploy
```

This will:
- Deploy the Worker to Cloudflare's edge network
- Create the Durable Object for the agent
- Set up Workers AI binding
- Provide you with a URL like: `https://audit-tool.YOUR-SUBDOMAIN.workers.dev`

### 5. Update Frontend
Update `src/components/AIToolsSectionV2.jsx` with your Worker URL:
```javascript
const getApiEndpoint = () => {
  if (import.meta.env.PROD) {
    return 'https://audit-tool.YOUR-SUBDOMAIN.workers.dev/api/evaluate';
  }
  return 'http://localhost:3001/api/evaluate';
};
```

### 6. Build and Deploy Frontend
```bash
npm run build
wrangler pages deploy dist
```

## API Endpoints

### POST `/api/evaluate`
Evaluate tools based on user request.

**Request**:
```json
{
  "request": "I need tools for marketing automation and social media"
}
```

**Response**:
```json
{
  "tools": [
    {
      "name": "HubSpot",
      "description": "All-in-one marketing platform",
      "benefit": "Centralized marketing automation",
      "impact": 9,
      "effort": 7,
      "quadrant": "q2",
      "reasoning": "High impact but requires significant setup"
    }
  ]
}
```

### GET `/api/history`
Get past evaluations (up to 10 most recent).

**Response**:
```json
{
  "history": [
    {
      "id": 1,
      "request": "marketing tools",
      "tools": "[...]",
      "timestamp": 1696284000000
    }
  ]
}
```

### WebSocket `/ws`
Real-time communication with the agent.

**Send**:
```json
{
  "type": "evaluate",
  "request": "I need development tools"
}
```

**Receive**:
```json
{
  "type": "status",
  "message": "Generating tool suggestions..."
}
```

```json
{
  "type": "result",
  "tools": [...]
}
```

## Agent Customization

### Modify Evaluation Criteria
Edit `src/agent/ToolEvaluationAgent.js`:

```javascript
determineQuadrant(impact, effort) {
  // Adjust thresholds
  const highImpact = impact >= 6;  // Change from 6 to your preference
  const highEffort = effort >= 6;  // Change from 6 to your preference
  
  // Your custom logic here
}
```

### Change AI Model
Edit `src/agent/ToolEvaluationAgent.js`:

```javascript
const response = await this.env.AI.run('@cf/meta/llama-3.1-8b-instruct', {
  // Change to another model:
  // '@cf/meta/llama-3.1-70b-instruct' (more powerful)
  // '@cf/mistral/mistral-7b-instruct-v0.1'
  // See: https://developers.cloudflare.com/workers-ai/models/
```

### Add Custom Tool Categories
Edit `getFallbackTools()` method to add more categories.

## Cost Estimation

### Cloudflare Workers (Paid Plan - $5/month)
- 10 million requests/month included
- Workers AI: 10,000 neurons/day free
- Durable Objects: 1 million requests/month included

### Typical Usage
- Each evaluation: ~2-3 AI calls
- Average cost per evaluation: ~$0.001
- 1,000 evaluations/month: ~$1

**Total estimated cost**: $5-6/month for moderate usage

## Troubleshooting

### "Agent not found" error
- Ensure Durable Objects binding is configured in `wrangler.toml`
- Run migrations: `wrangler migrations apply`

### Workers AI errors
- Check you're on a Workers paid plan
- Verify AI binding in `wrangler.toml`
- Check daily neuron quota

### Local development not working
- Ensure `server.js` is running on port 3001
- Check CORS settings
- Verify frontend is pointing to `localhost:3001`

## Next Steps

1. **Add Authentication**: Protect the API with Cloudflare Access
2. **Add Rate Limiting**: Prevent abuse with Workers Rate Limiting
3. **Enhance UI**: Add tool details, comparison features
4. **Export Results**: Add PDF/CSV export functionality
5. **Team Collaboration**: Multi-user support with shared boards

## Resources

- [Cloudflare Agents Documentation](https://developers.cloudflare.com/agents/)
- [Workers AI Documentation](https://developers.cloudflare.com/workers-ai/)
- [Durable Objects Documentation](https://developers.cloudflare.com/durable-objects/)
- [Wrangler CLI Documentation](https://developers.cloudflare.com/workers/wrangler/)

## Support

For issues or questions:
1. Check the [Cloudflare Community](https://community.cloudflare.com/)
2. Review [Workers AI Models](https://developers.cloudflare.com/workers-ai/models/)
3. Open an issue in this repository
