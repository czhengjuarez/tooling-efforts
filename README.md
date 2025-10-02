# AI Tool Adoption Evaluator 🤖

An intelligent tool adoption platform powered by **Cloudflare Agents** and **Workers AI** that evaluates AI tools based on impact and effort, automatically placing them in a decision-making quadrant matrix.

## 🌐 **Live Demo**
- **Frontend**: https://tooling-efforts.pages.dev
- **API**: https://audit-tool.coscient.workers.dev
- **GitHub**: https://github.com/czhengjuarez/tooling-efforts

## ✨ Key Features

- 🎯 **No API Keys Required** - Uses Cloudflare Workers AI (no user setup needed!)
- 🧠 **Real AI Intelligence** - Context-aware, industry-specific recommendations
- 📊 **Balanced Scoring** - Calibrated 1-10 scale with realistic distributions
- 🎨 **Clean Modern UI** - Single container design with custom brand colors
- 🏷️ **Decimal Precision** - Impact/effort scores to 1 decimal place
- 🖱️ **Drag & Drop** - Reorganize tools with @dnd-kit
- 🔄 **Auto-Clear** - Fresh start with each new prompt
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

Try these to see the AI intelligence:

**Industry-Specific**
- "I need tools for a small bakery business" → Square POS, Toast, Google My Business
- "Tools for a dental practice" → Dentrix, patient scheduling, HIPAA compliance
- "Restaurant chain management" → POS systems, inventory, staff scheduling

**Business Functions**
- "Marketing automation for e-commerce" → Klaviyo, Shopify apps, email tools
- "Development tools for code quality" → SonarQube, GitHub Actions, testing frameworks
- "CRM for B2B sales team" → Salesforce, HubSpot, LinkedIn Sales Navigator

**Company Stage**
- "Startup collaboration tools" → Slack, Notion, basic project management
- "Enterprise security solutions" → Advanced compliance, SSO, audit tools

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

## 🧠 Intelligence Upgrade: Local vs Cloudflare AI

### **Local Development (Simulation)**
- **Keyword matching** - "bakery" → generic business tools
- **Predefined categories** - Limited tool database
- **Static scoring** - Randomized around base values

### **Cloudflare AI (Production)**
- **Contextual understanding** - "bakery" → Square POS, Toast, Google My Business
- **Dynamic discovery** - Finds tools you didn't know existed
- **Industry awareness** - Healthcare vs retail vs manufacturing needs
- **Nuanced analysis** - Real impact/effort evaluation based on context

### **Algorithm Calibration**
- **Balanced thresholds** - High impact ≥ 7.5 (top 25% only)
- **Critical evaluation** - "BE CRITICAL" prompt instruction
- **Realistic distribution** - Most tools land in Q3 (Fill-ins) as expected
- **Detailed rubric** - Clear examples for 1-10 scoring

## 🎨 UI Features

- **Custom Brand Colors** - Deep magenta (#8F1F57) throughout
- **Custom SVG Icons** - AI, impact, effort, and sticky note icons
- **Impact Badge** (💡 Brand Color) - Business value score (1 decimal)
- **Effort Badge** (⚡ Purple) - Implementation complexity (1 decimal)
- **Hover Tooltips** - Shows AI reasoning for placement
- **Drag & Drop** - Move tools between quadrants
- **Auto-Clear** - Previous suggestions cleared on new prompts
- **Clean Layout** - Single container design, no nested cards

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

✅ **Live & Deployed** - Running on Cloudflare with real AI!  
✅ **Algorithm Balanced** - Fixed bias, realistic quadrant distribution  
✅ **GitHub Integrated** - All code version controlled  
✅ **Production Tested** - AI providing contextual, industry-specific suggestions  
✅ **UI Polished** - Custom brand colors, icons, clean design  
✅ **Well Documented** - Multiple guides and deployment instructions  

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

## 🎯 **Try It Now!**

**Live Demo**: https://tooling-efforts.pages.dev  
**Local Setup**: `npm install && node server.js` (Terminal 1) and `npm run dev` (Terminal 2), then open `http://localhost:5173`

**Test Prompts**:
- "Tools for a dental practice"
- "E-commerce startup selling handmade jewelry"  
- "Manufacturing quality control"
- "Restaurant chain management"

See the AI intelligence in action! 🚀
