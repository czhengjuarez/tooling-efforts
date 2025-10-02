import express from 'express';
import cors from 'cors';
import fetch from 'node-fetch';

const app = express();
const PORT = 3001;

// Enable CORS for all routes
app.use(cors());
app.use(express.json());

// OpenAI proxy endpoint
app.post('/api/openai', async (req, res) => {
  try {
    const { apiKey, prompt } = req.body;
    
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 2000,
        temperature: 0.7
      })
    });

    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error('OpenAI API Error:', error);
    res.status(500).json({ error: 'Failed to call OpenAI API' });
  }
});

// Claude proxy endpoint
app.post('/api/claude', async (req, res) => {
  try {
    const { apiKey, prompt } = req.body;
    
    console.log('Claude proxy received request with prompt length:', prompt?.length);
    
    if (!apiKey || !prompt) {
      return res.status(400).json({ error: 'Missing apiKey or prompt' });
    }
    
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey.toString(),
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-3-sonnet-20240229',
        max_tokens: 2000,
        messages: [{ role: 'user', content: prompt.toString() }]
      })
    });

    console.log('Claude API response status:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Claude API error response:', errorText);
      return res.status(response.status).json({ error: errorText });
    }

    const data = await response.json();
    console.log('Claude API success, response length:', JSON.stringify(data).length);
    res.json(data);
  } catch (error) {
    console.error('Claude API Error:', error.message);
    res.status(500).json({ error: 'Failed to call Claude API: ' + error.message });
  }
});

// Gemini proxy endpoint
app.post('/api/gemini', async (req, res) => {
  try {
    const { apiKey, prompt } = req.body;
    
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        contents: [{
          parts: [{ text: prompt }]
        }]
      })
    });

    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error('Gemini API Error:', error);
    res.status(500).json({ error: 'Failed to call Gemini API' });
  }
});

// New endpoint for Cloudflare Agent evaluation (local development)
app.post('/api/evaluate', async (req, res) => {
  try {
    const { request: userRequest, numTools } = req.body;
    
    if (!userRequest || typeof userRequest !== 'string') {
      return res.status(400).json({ error: 'Invalid request' });
    }

    const requestedNum = numTools || 10;
    console.log('Evaluation request:', userRequest, '| Requested tools:', requestedNum);

    // For local development, we'll use a simplified evaluation
    // In production, this would call the actual Cloudflare Worker
    const tools = await generateLocalToolEvaluation(userRequest, requestedNum);
    
    res.json({ tools });
  } catch (error) {
    console.error('Evaluation Error:', error);
    res.status(500).json({ error: 'Failed to evaluate tools: ' + error.message });
  }
});

// Local tool evaluation function (simulates the agent behavior)
async function generateLocalToolEvaluation(userRequest, numTools = 10) {
  const request = userRequest.toLowerCase();
  console.log('🔍 Analyzing request:', userRequest);
  
  // Enhanced keyword detection with more categories
  const categories = detectCategories(request);
  console.log('📂 Detected categories:', categories);
  
  let allTools = [];
  
  // Build tool pool based on detected categories
  categories.forEach(category => {
    allTools.push(...getToolsForCategory(category, request));
  });
  
  // If no specific categories detected, use general business tools
  if (allTools.length === 0) {
    allTools = getToolsForCategory('general', request);
  }
  
  // Add some randomization and context-specific tools
  allTools = addContextSpecificTools(allTools, request);
  
  // Shuffle and limit to requested number
  const shuffledTools = shuffleArray(allTools).slice(0, numTools);
  
  console.log('🛠️ Generated tools:', shuffledTools.map(t => t.name));
  
  const finalTools = shuffledTools.map(tool => {
    // Add some randomization to impact/effort to simulate AI variability
    const finalImpact = Math.round((Math.max(1, Math.min(10, tool.impact + (Math.random() - 0.5) * 2))) * 10) / 10;
    const finalEffort = Math.round((Math.max(1, Math.min(10, tool.effort + (Math.random() - 0.5) * 2))) * 10) / 10;
    
    return {
      ...tool,
      impact: finalImpact,
      effort: finalEffort,
      quadrant: determineQuadrant(finalImpact, finalEffort),
      reasoning: `Impact: ${finalImpact}/10, Effort: ${finalEffort}/10`
    };
  });
  
  // Debug: Show quadrant distribution
  const quadrantCounts = finalTools.reduce((acc, tool) => {
    acc[tool.quadrant] = (acc[tool.quadrant] || 0) + 1;
    return acc;
  }, {});
  console.log('📊 Quadrant distribution:', quadrantCounts);
  
  return finalTools;
}

// Enhanced category detection
function detectCategories(request) {
  const categories = [];
  
  // Marketing & Social Media
  if (request.match(/(marketing|social|advertising|campaign|seo|content|email|brand)/)) {
    categories.push('marketing');
  }
  
  // Development & Tech
  if (request.match(/(development|coding|software|programming|api|deployment|devops|tech)/)) {
    categories.push('development');
  }
  
  // Sales & CRM
  if (request.match(/(sales|crm|customer|lead|prospect|revenue|deal|pipeline)/)) {
    categories.push('sales');
  }
  
  // Design & Creative
  if (request.match(/(design|creative|graphics|ui|ux|visual|prototype|brand)/)) {
    categories.push('design');
  }
  
  // Analytics & Data
  if (request.match(/(analytics|data|metrics|reporting|dashboard|insights|tracking)/)) {
    categories.push('analytics');
  }
  
  // HR & People
  if (request.match(/(hr|human|people|recruiting|hiring|employee|team|talent)/)) {
    categories.push('hr');
  }
  
  // Finance & Accounting
  if (request.match(/(finance|accounting|budget|expense|invoice|payment|money)/)) {
    categories.push('finance');
  }
  
  // E-commerce & Retail
  if (request.match(/(ecommerce|retail|store|shop|inventory|product|commerce)/)) {
    categories.push('ecommerce');
  }
  
  // Communication & Collaboration
  if (request.match(/(communication|collaboration|meeting|chat|video|remote|team)/)) {
    categories.push('communication');
  }
  
  return categories.length > 0 ? categories : ['general'];
}

// Get tools for specific category
function getToolsForCategory(category, request) {
  const toolSets = {
    marketing: [
      { name: 'HubSpot Marketing Hub', description: 'All-in-one marketing platform', benefit: 'Centralized marketing automation', impact: 9, effort: 7 },
      { name: 'Buffer', description: 'Social media scheduler', benefit: 'Save time on social posting', impact: 7, effort: 3 },
      { name: 'Mailchimp', description: 'Email marketing tool', benefit: 'Easy email campaigns', impact: 8, effort: 4 },
      { name: 'Canva Pro', description: 'Design tool with AI', benefit: 'Create professional graphics quickly', impact: 8, effort: 2 },
      { name: 'SEMrush', description: 'SEO and marketing toolkit', benefit: 'Improve search rankings', impact: 8, effort: 6 },
      { name: 'Hootsuite', description: 'Social media management', benefit: 'Manage multiple channels', impact: 7, effort: 4 },
      { name: 'ConvertKit', description: 'Creator-focused email marketing', benefit: 'Build audience relationships', impact: 7, effort: 3 },
      { name: 'Unbounce', description: 'Landing page builder', benefit: 'Increase conversion rates', impact: 8, effort: 4 },
      { name: 'Hotjar', description: 'User behavior analytics', benefit: 'Understand user interactions', impact: 7, effort: 3 },
      { name: 'Facebook Ads Manager', description: 'Social media advertising', benefit: 'Targeted ad campaigns', impact: 8, effort: 5 }
    ],
    
    development: [
      { name: 'GitHub Copilot', description: 'AI code completion', benefit: 'Write code 40% faster', impact: 9, effort: 2 },
      { name: 'Cursor', description: 'AI-powered code editor', benefit: 'Intelligent code assistance', impact: 8, effort: 3 },
      { name: 'Linear', description: 'Issue tracking tool', benefit: 'Streamlined project management', impact: 7, effort: 3 },
      { name: 'Vercel', description: 'Deployment platform', benefit: 'Deploy instantly', impact: 8, effort: 2 },
      { name: 'Sentry', description: 'Error monitoring', benefit: 'Catch bugs in production', impact: 8, effort: 4 },
      { name: 'Postman', description: 'API testing tool', benefit: 'Test APIs efficiently', impact: 7, effort: 2 },
      { name: 'Docker', description: 'Containerization platform', benefit: 'Consistent environments', impact: 9, effort: 6 },
      { name: 'Supabase', description: 'Open source Firebase alternative', benefit: 'Rapid backend development', impact: 8, effort: 3 },
      { name: 'Terraform', description: 'Infrastructure as code', benefit: 'Automate infrastructure management', impact: 8, effort: 7 },
      { name: 'Prisma', description: 'Database toolkit', benefit: 'Type-safe database access', impact: 7, effort: 4 }
    ],
    
    sales: [
      { name: 'HubSpot CRM', description: 'Free CRM platform', benefit: 'Track customer relationships', impact: 9, effort: 3 },
      { name: 'Salesforce', description: 'Enterprise CRM', benefit: 'Comprehensive sales management', impact: 9, effort: 8 },
      { name: 'Pipedrive', description: 'Sales pipeline tool', benefit: 'Visual deal tracking', impact: 8, effort: 3 },
      { name: 'Calendly', description: 'Meeting scheduler', benefit: 'Eliminate scheduling back-and-forth', impact: 7, effort: 1 },
      { name: 'Gong', description: 'Revenue intelligence', benefit: 'AI-powered sales insights', impact: 8, effort: 6 },
      { name: 'Outreach', description: 'Sales engagement platform', benefit: 'Automate outreach sequences', impact: 8, effort: 5 },
      { name: 'LinkedIn Sales Navigator', description: 'B2B prospecting tool', benefit: 'Find and connect with leads', impact: 7, effort: 2 },
      { name: 'Close', description: 'Inside sales CRM', benefit: 'Built-in calling and SMS', impact: 7, effort: 4 },
      { name: 'Apollo', description: 'Sales intelligence platform', benefit: 'Find and engage prospects', impact: 8, effort: 4 },
      { name: 'Intercom', description: 'Customer messaging platform', benefit: 'Convert visitors to customers', impact: 8, effort: 5 }
    ],
    
    design: [
      { name: 'Figma', description: 'Design collaboration platform', benefit: 'Real-time design collaboration', impact: 9, effort: 3 },
      { name: 'Adobe Creative Cloud', description: 'Professional design suite', benefit: 'Industry-standard design tools', impact: 9, effort: 7 },
      { name: 'Canva Pro', description: 'AI-powered design tool', benefit: 'Quick professional designs', impact: 8, effort: 2 },
      { name: 'Sketch', description: 'Vector graphics editor', benefit: 'Precise UI/UX design', impact: 8, effort: 4 },
      { name: 'Framer', description: 'Interactive design tool', benefit: 'Design with code components', impact: 7, effort: 5 },
      { name: 'Webflow', description: 'Visual web development', benefit: 'Design and build websites visually', impact: 8, effort: 6 },
      { name: 'Principle', description: 'Animation and interaction design', benefit: 'Create interactive prototypes', impact: 7, effort: 4 },
      { name: 'Midjourney', description: 'AI image generation', benefit: 'Generate unique visuals with AI', impact: 8, effort: 2 }
    ],
    
    analytics: [
      { name: 'Google Analytics 4', description: 'Web analytics platform', benefit: 'Understand user behavior', impact: 9, effort: 5 },
      { name: 'Mixpanel', description: 'Product analytics', benefit: 'Track user interactions', impact: 8, effort: 4 },
      { name: 'Amplitude', description: 'Digital optimization system', benefit: 'Optimize user experiences', impact: 8, effort: 5 },
      { name: 'Tableau', description: 'Data visualization platform', benefit: 'Create interactive dashboards', impact: 9, effort: 7 },
      { name: 'Looker', description: 'Business intelligence platform', benefit: 'Self-service analytics', impact: 8, effort: 6 },
      { name: 'Hotjar', description: 'Behavior analytics', benefit: 'See how users interact', impact: 7, effort: 3 },
      { name: 'Segment', description: 'Customer data platform', benefit: 'Unify customer data', impact: 8, effort: 6 }
    ],
    
    ecommerce: [
      // Q1 - Quick Wins
      { name: 'Stripe', description: 'Payment processing', benefit: 'Accept online payments easily', impact: 8.5, effort: 2 },
      { name: 'Shopify', description: 'E-commerce platform', benefit: 'Quick online store setup', impact: 8, effort: 3 },
      { name: 'Gorgias', description: 'Customer service for e-commerce', benefit: 'Centralized customer support', impact: 7, effort: 3 },
      
      // Q2 - Major Projects  
      { name: 'BigCommerce', description: 'Enterprise e-commerce', benefit: 'Scalable online selling', impact: 8, effort: 6 },
      { name: 'Custom E-commerce Platform', description: 'Build from scratch', benefit: 'Fully customized solution', impact: 9, effort: 9 },
      { name: 'Magento', description: 'Advanced e-commerce platform', benefit: 'Highly customizable store', impact: 8, effort: 8 },
      
      // Q3 - Fill-ins
      { name: 'Square Online', description: 'Simple online store', benefit: 'Basic e-commerce functionality', impact: 5, effort: 2 },
      { name: 'Facebook Shop', description: 'Social commerce', benefit: 'Sell on social media', impact: 6, effort: 2 },
      
      // Q4 - Time Wasters
      { name: 'Legacy POS Integration', description: 'Connect old systems', benefit: 'Unified old and new systems', impact: 5, effort: 8 },
      
      // Mixed
      { name: 'WooCommerce', description: 'WordPress e-commerce plugin', benefit: 'Flexible online store', impact: 7, effort: 4 },
      { name: 'Klaviyo', description: 'E-commerce email marketing', benefit: 'Personalized customer messaging', impact: 7.5, effort: 4 },
      { name: 'Inventory Management System', description: 'Stock tracking solution', benefit: 'Optimize inventory levels', impact: 6.5, effort: 5 }
    ],
    
    hr: [
      { name: 'BambooHR', description: 'HR management system', benefit: 'Streamline HR processes', impact: 8, effort: 5 },
      { name: 'Greenhouse', description: 'Recruiting software', benefit: 'Optimize hiring process', impact: 8, effort: 4 },
      { name: 'Workday', description: 'Enterprise HR platform', benefit: 'Comprehensive workforce management', impact: 9, effort: 8 },
      { name: 'Slack', description: 'Team communication', benefit: 'Improve team collaboration', impact: 8, effort: 2 },
      { name: 'Lattice', description: 'Performance management', benefit: 'Employee development tracking', impact: 7, effort: 4 },
      { name: 'Gusto', description: 'Payroll and benefits', benefit: 'Simplify payroll processing', impact: 8, effort: 3 }
    ],
    
    finance: [
      { name: 'QuickBooks', description: 'Accounting software', benefit: 'Manage business finances', impact: 8, effort: 4 },
      { name: 'Xero', description: 'Cloud accounting', benefit: 'Real-time financial data', impact: 8, effort: 3 },
      { name: 'FreshBooks', description: 'Invoicing and time tracking', benefit: 'Streamline billing process', impact: 7, effort: 2 },
      { name: 'Expensify', description: 'Expense management', benefit: 'Automate expense reporting', impact: 7, effort: 2 },
      { name: 'Stripe', description: 'Payment processing', benefit: 'Accept payments online', impact: 9, effort: 3 },
      { name: 'Wave', description: 'Free accounting software', benefit: 'Basic financial management', impact: 6, effort: 2 }
    ],
    
    communication: [
      { name: 'Slack', description: 'Team messaging', benefit: 'Centralized team communication', impact: 9, effort: 2 },
      { name: 'Microsoft Teams', description: 'Collaboration platform', benefit: 'Integrated productivity suite', impact: 8, effort: 4 },
      { name: 'Zoom', description: 'Video conferencing', benefit: 'High-quality video meetings', impact: 8, effort: 1 },
      { name: 'Discord', description: 'Community communication', benefit: 'Engage with communities', impact: 7, effort: 2 },
      { name: 'Loom', description: 'Async video messaging', benefit: 'Record and share quick videos', impact: 7, effort: 2 },
      { name: 'Calendly', description: 'Meeting scheduling', benefit: 'Eliminate scheduling conflicts', impact: 7, effort: 1 }
    ],
    
    general: [
      // Q1 - Quick Wins (High Impact, Low Effort)
      { name: 'Slack', description: 'Team communication', benefit: 'Faster team collaboration', impact: 8.5, effort: 2 },
      { name: 'Zoom', description: 'Video conferencing', benefit: 'Connect remotely', impact: 7.5, effort: 1 },
      { name: 'Trello', description: 'Visual project management', benefit: 'Simple task organization', impact: 7, effort: 2 },
      { name: 'Calendly', description: 'Meeting scheduler', benefit: 'Eliminate scheduling conflicts', impact: 7, effort: 1 },
      
      // Q2 - Major Projects (High Impact, High Effort)
      { name: 'Notion', description: 'All-in-one workspace', benefit: 'Organize everything in one place', impact: 8, effort: 6 },
      { name: 'Monday.com', description: 'Work OS platform', benefit: 'Centralize team workflows', impact: 8, effort: 7 },
      { name: 'Salesforce', description: 'Enterprise CRM platform', benefit: 'Complete customer management', impact: 9, effort: 8 },
      
      // Q3 - Fill-ins (Low Impact, Low Effort)
      { name: 'Google Drive', description: 'Cloud file storage', benefit: 'Access files anywhere', impact: 6, effort: 2 },
      { name: 'Todoist', description: 'Personal task manager', benefit: 'Stay organized personally', impact: 5, effort: 2 },
      { name: 'Dropbox', description: 'File sharing service', benefit: 'Share files easily', impact: 5, effort: 1 },
      
      // Q4 - Time Wasters (Low Impact, High Effort)
      { name: 'Custom Internal Tool', description: 'Build from scratch', benefit: 'Perfectly tailored solution', impact: 6, effort: 9 },
      { name: 'Legacy System Migration', description: 'Modernize old systems', benefit: 'Updated infrastructure', impact: 5, effort: 8 },
      
      // Mixed/Balanced
      { name: 'Google Workspace', description: 'Productivity suite', benefit: 'Collaborative document editing', impact: 7.5, effort: 3 },
      { name: 'Asana', description: 'Project management', benefit: 'Track tasks and projects', impact: 7.5, effort: 4 },
      { name: 'Airtable', description: 'Flexible database', benefit: 'Organize data your way', impact: 6.5, effort: 4 }
    ]
  };
  
  return toolSets[category] || toolSets.general;
}

// Add context-specific tools based on request content
function addContextSpecificTools(tools, request) {
  const contextTools = [];
  
  // Add AI-specific tools if AI is mentioned
  if (request.includes('ai') || request.includes('artificial intelligence')) {
    contextTools.push(
      { name: 'ChatGPT Plus', description: 'Advanced AI assistant', benefit: 'Enhanced productivity with AI', impact: 8, effort: 1 },
      { name: 'Claude Pro', description: 'AI assistant for analysis', benefit: 'Deep reasoning and analysis', impact: 8, effort: 1 },
      { name: 'Midjourney', description: 'AI image generation', benefit: 'Create unique visuals', impact: 7, effort: 2 }
    );
  }
  
  // Add automation tools if automation is mentioned
  if (request.includes('automat') || request.includes('workflow')) {
    contextTools.push(
      { name: 'Zapier', description: 'Workflow automation', benefit: 'Connect apps automatically', impact: 8, effort: 3 },
      { name: 'Make (Integromat)', description: 'Visual automation platform', benefit: 'Complex workflow automation', impact: 8, effort: 5 }
    );
  }
  
  return [...tools, ...contextTools];
}

// Utility function to shuffle array
function shuffleArray(array) {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

// Determine quadrant based on impact and effort scores
function determineQuadrant(impact, effort) {
  // More balanced thresholds for better distribution
  const highImpact = impact >= 6.5;  // Raised threshold
  const highEffort = effort >= 5.5;  // Lowered threshold for more balance
  
  if (highImpact && !highEffort) return 'q1'; // Quick Wins (High Impact, Low Effort)
  else if (highImpact && highEffort) return 'q2'; // Major Projects (High Impact, High Effort)
  else if (!highImpact && !highEffort) return 'q3'; // Fill-ins (Low Impact, Low Effort)
  else return 'q4'; // Time Wasters (Low Impact, High Effort)
}

app.listen(PORT, () => {
  console.log(`Proxy server running on http://localhost:${PORT}`);
});
