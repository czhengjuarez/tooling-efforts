# AI Tool Adoption Evaluator 🤖

An intelligent tool adoption platform powered by **Cloudflare Agents** and **Workers AI** that evaluates AI tools based on impact and effort, automatically placing them in a decision-making quadrant matrix.

## ✨ Key Features

- 🎯 **No API Keys Required** - Uses Cloudflare Workers AI (no user setup needed!)
- 📊 **Impact & Effort Analysis** - Intelligent evaluation on 1-10 scale
- 🎨 **Visual Quadrant Matrix** - 2x2 grid for prioritization
- 🏷️ **Smart Badges** - Impact/effort scores on each tool
- 🖱️ **Drag & Drop** - Reorganize tools easily
- 💰 **Cost-Effective** - Fixed $5-6/month (vs variable API costs)

## 🚀 Quick Start

### Running Locally (5 minutes)

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Start backend** (Terminal 1):
   ```bash
   node server.js
   ```

3. **Start frontend** (Terminal 2):
   ```bash
   npm run dev
   ```

4. **Open browser**: `http://localhost:5173`

5. **Try it**: Type "I need marketing automation tools" and click Generate!

### Test the Agent
```bash
node test-agent.js
```

## 📊 Quadrant System

```
┌─────────────────────┬─────────────────────┐
│   Q1: Quick Wins    │  Q2: Major Projects │
│  High Impact        │   High Impact       │
│  Low Effort         │   High Effort       │
│  ⭐ DO THESE FIRST  │   📅 Plan & Execute │
├─────────────────────┼─────────────────────┤
│   Q3: Fill-ins      │  Q4: Time Wasters   │
│  Low Impact         │   Low Impact        │
│  Low Effort         │   High Effort       │
│  ⏰ Do When Free    │   ❌ Avoid These    │
└─────────────────────┴─────────────────────┘
```

## 🏗️ Architecture

```
User Input → React Frontend → Local Server (Dev) / Worker (Prod)
                                      ↓
                          ToolEvaluationAgent (Durable Object)
                                      ↓
                          Workers AI (Llama 3.1-8B)
                                      ↓
                    Evaluated Tools with Quadrant Placement
```

## 📁 Project Structure

```
src/
├── agent/
│   └── ToolEvaluationAgent.js    # Cloudflare Agent
├── components/
│   ├── AIToolsSectionV2.jsx      # New UI (no API keys)
│   ├── AuditBoard.jsx            # Main board
│   ├── QuadrantGrid.jsx          # 2x2 grid
│   └── StickyNote.jsx            # Enhanced with badges
└── App.jsx

worker.js                          # Cloudflare Worker
server.js                          # Local dev server
wrangler.toml                      # Cloudflare config
test-agent.js                      # Test script
```

## 🎯 Example Requests

Try these in the app:

**Marketing**
- "Tools for social media marketing and content creation"
- "Email marketing automation for e-commerce"

**Development**
- "CI/CD and deployment tools for Node.js"
- "Code quality and testing tools"

**Sales**
- "CRM and sales automation for B2B"
- "Lead generation tools"

**General**
- "Project management for remote teams"
- "Collaboration tools for startups"

## 🚀 Deploy to Production

### Prerequisites
- Cloudflare account with Workers paid plan ($5/month)
- Wrangler CLI: `npm install -g wrangler`

### Steps
```bash
# 1. Login
wrangler login

# 2. Deploy Worker
wrangler deploy

# 3. Build frontend
npm run build

# 4. Deploy frontend
wrangler pages deploy dist
```

See `CLOUDFLARE_AGENT_SETUP.md` for detailed instructions.

## 📚 Documentation

- **[QUICK_START.md](QUICK_START.md)** - Get started in 5 minutes
- **[CLOUDFLARE_AGENT_SETUP.md](CLOUDFLARE_AGENT_SETUP.md)** - Detailed setup & deployment
- **[SUMMARY.md](SUMMARY.md)** - Complete project overview
- **[test-agent.js](test-agent.js)** - Automated testing

## 💡 How It Works

1. User describes what tools they need
2. Request sent to agent via `/api/evaluate`
3. Agent uses Workers AI to generate suggestions
4. Each tool evaluated for impact (value) and effort (cost/complexity)
5. Tools automatically placed in appropriate quadrants
6. Sticky notes appear with visual impact/effort badges

## 🎨 UI Features

- **Impact Badge** (💡 Blue) - Business value score
- **Effort Badge** (⚡ Purple) - Implementation complexity
- **Hover Tooltips** - Shows reasoning for placement
- **Drag & Drop** - Move tools between quadrants
- **Clear All** - Remove AI suggestions

## 💰 Cost Comparison

| Approach | Cost | User Friction | Security |
|----------|------|---------------|----------|
| **User API Keys** | $2-7 per 1K evals | High (setup required) | Keys exposed |
| **Cloudflare Agent** | $5-6/month fixed | Zero (no setup) | Keys protected |

## 🧪 Testing

All tests passing ✅:
- Marketing tool requests
- Development tool requests
- Sales/CRM requests
- Collaboration tool requests

## 🛠️ Tech Stack

- **Frontend**: React 19, Vite 6, Tailwind CSS
- **Backend**: Cloudflare Workers, Durable Objects
- **AI**: Workers AI (Llama 3.1-8B)
- **Drag & Drop**: @dnd-kit
- **Local Dev**: Express, Node.js

## 📈 Status

✅ **Fully Functional** - Working locally right now!  
✅ **Production Ready** - Can deploy to Cloudflare anytime  
✅ **Well Documented** - Multiple guides included  
✅ **Tested** - All scenarios passing  

## 🤝 Contributing

This is a demonstration project showcasing Cloudflare Agents. Feel free to:
- Customize evaluation criteria
- Add new tool categories
- Enhance the UI
- Add export features

## 📝 License

MIT

## 🙏 Acknowledgments

Built with:
- [Cloudflare Agents SDK](https://developers.cloudflare.com/agents/)
- [Workers AI](https://developers.cloudflare.com/workers-ai/)
- [Durable Objects](https://developers.cloudflare.com/durable-objects/)

---

**Ready to try it?** Run `npm install && node server.js` (Terminal 1) and `npm run dev` (Terminal 2), then open `http://localhost:5173`!
