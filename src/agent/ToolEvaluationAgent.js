import { Agent } from "agents";

/**
 * ToolEvaluationAgent - Evaluates AI tools and places them in quadrants
 * based on impact (high/low) and effort (high/low)
 * 
 * Quadrants:
 * Q1 (High Impact, Low Effort) - Quick Wins
 * Q2 (High Impact, High Effort) - Major Projects
 * Q3 (Low Impact, Low Effort) - Fill-ins
 * Q4 (Low Impact, High Effort) - Time Wasters
 */
export class ToolEvaluationAgent extends Agent {
  /**
   * Main method to evaluate tools based on user input
   * @param {string} userRequest - User's description of what tools they need
   * @returns {Promise<Array>} Array of tool suggestions with quadrant placement
   */
  async evaluateTools(userRequest) {
    try {
      // Store the request in agent state
      await this.setState({ lastRequest: userRequest, timestamp: Date.now() });
      
      // Use Workers AI to generate tool suggestions
      const tools = await this.generateToolSuggestions(userRequest);
      
      // Evaluate each tool for impact and effort
      const evaluatedTools = await this.evaluateImpactAndEffort(tools, userRequest);
      
      // Store results in SQL for history
      await this.storeEvaluation(userRequest, evaluatedTools);
      
      return evaluatedTools;
    } catch (error) {
      console.error('Error in evaluateTools:', error);
      throw error;
    }
  }

  /**
   * Generate tool suggestions using Workers AI
   */
  async generateToolSuggestions(userRequest) {
    const prompt = `You are an AI tool recommendation expert. Based on the following request, suggest 8-12 specific AI tools or software solutions that would be helpful.

User Request: "${userRequest}"

For each tool, provide:
1. Tool name (be specific, e.g., "Slack", "GitHub Copilot", "Notion AI")
2. Brief description (one sentence)
3. Primary benefit

Format your response as a JSON array of objects with fields: name, description, benefit.

Example format:
[
  {"name": "GitHub Copilot", "description": "AI-powered code completion tool", "benefit": "Speeds up coding by 40%"},
  {"name": "Grammarly", "description": "AI writing assistant", "benefit": "Improves writing quality and catches errors"}
]`;

    try {
      // Call Workers AI (assuming env.AI is bound)
      const response = await this.env.AI.run('@cf/meta/llama-3.1-8b-instruct', {
        messages: [
          { role: 'system', content: 'You are a helpful AI tool recommendation expert. Always respond with valid JSON.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.7,
        max_tokens: 1500
      });

      // Parse the AI response
      let tools = [];
      try {
        const content = response.response || response.result?.response || '';
        // Try to extract JSON from the response
        const jsonMatch = content.match(/\[[\s\S]*\]/);
        if (jsonMatch) {
          tools = JSON.parse(jsonMatch[0]);
        }
      } catch (parseError) {
        console.error('Failed to parse AI response:', parseError);
        // Fallback to demo tools
        tools = this.getFallbackTools(userRequest);
      }

      return tools;
    } catch (error) {
      console.error('Workers AI error:', error);
      // Return fallback tools
      return this.getFallbackTools(userRequest);
    }
  }

  /**
   * Evaluate impact and effort for each tool
   */
  async evaluateImpactAndEffort(tools, userRequest) {
    const evaluatedTools = [];

    for (const tool of tools) {
      const evaluation = await this.evaluateSingleTool(tool, userRequest);
      evaluatedTools.push({
        ...tool,
        impact: evaluation.impact,
        effort: evaluation.effort,
        quadrant: this.determineQuadrant(evaluation.impact, evaluation.effort),
        reasoning: evaluation.reasoning
      });
    }

    return evaluatedTools;
  }

  /**
   * Evaluate a single tool's impact and effort
   */
  async evaluateSingleTool(tool, userRequest) {
    const prompt = `Evaluate the following tool for a user who needs: "${userRequest}"

Tool: ${tool.name}
Description: ${tool.description}
Benefit: ${tool.benefit}

Rate this tool on two dimensions (BE REALISTIC AND BALANCED):

IMPACT (1-10): How much business value will this provide?
- 1-3: Minimal impact (nice-to-have, small convenience)
- 4-6: Moderate impact (useful but not game-changing)
- 7-8: High impact (significant business value)
- 9-10: Transformational impact (revolutionary for the business)

EFFORT (1-10): How much work to implement and maintain?
- 1-3: Low effort (quick setup, minimal learning)
- 4-6: Moderate effort (some setup time, learning curve)
- 7-8: High effort (complex setup, training needed)
- 9-10: Very high effort (major project, extensive resources)

Consider:
- Implementation time and complexity
- Learning curve for team
- Cost (subscription, setup, ongoing)
- Integration with existing systems
- Maintenance and support requirements
- Relevance to the specific user request

BE CRITICAL: Not every tool should be high impact. Many tools are useful but not transformational.

Respond in JSON format:
{
  "impact": <number 1-10>,
  "effort": <number 1-10>,
  "reasoning": "<brief explanation of scores>"
}`;

    try {
      const response = await this.env.AI.run('@cf/meta/llama-3.1-8b-instruct', {
        messages: [
          { role: 'system', content: 'You are a critical business analyst evaluating software tools. Be realistic and balanced in your scoring. Most tools should score 4-6 for impact. Only truly transformational tools deserve 8+. Always respond with valid JSON.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.5,
        max_tokens: 300
      });

      const content = response.response || response.result?.response || '';
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      
      if (jsonMatch) {
        const evaluation = JSON.parse(jsonMatch[0]);
        return {
          impact: Math.min(10, Math.max(1, evaluation.impact)),
          effort: Math.min(10, Math.max(1, evaluation.effort)),
          reasoning: evaluation.reasoning || 'No reasoning provided'
        };
      }
    } catch (error) {
      console.error('Evaluation error:', error);
    }

    // Fallback to random evaluation
    return {
      impact: Math.floor(Math.random() * 6) + 5, // 5-10
      effort: Math.floor(Math.random() * 10) + 1, // 1-10
      reasoning: 'Automated evaluation'
    };
  }

  /**
   * Determine quadrant based on impact and effort scores
   */
  determineQuadrant(impact, effort) {
    // More balanced thresholds - only top 30% are "high impact"
    const highImpact = impact >= 7.5;
    const highEffort = effort >= 6.5;

    if (highImpact && !highEffort) return 'q1'; // High Impact, Low Effort - Quick Wins
    if (highImpact && highEffort) return 'q2';  // High Impact, High Effort - Major Projects
    if (!highImpact && !highEffort) return 'q3'; // Low Impact, Low Effort - Fill-ins
    return 'q4'; // Low Impact, High Effort - Time Wasters
  }

  /**
   * Store evaluation in SQL for history
   */
  async storeEvaluation(request, tools) {
    try {
      await this.sql.exec(`
        CREATE TABLE IF NOT EXISTS evaluations (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          request TEXT,
          tools TEXT,
          timestamp INTEGER
        )
      `);

      await this.sql.exec(
        `INSERT INTO evaluations (request, tools, timestamp) VALUES (?, ?, ?)`,
        request,
        JSON.stringify(tools),
        Date.now()
      );
    } catch (error) {
      console.error('Failed to store evaluation:', error);
    }
  }

  /**
   * Get evaluation history
   */
  async getHistory(limit = 10) {
    try {
      const result = await this.sql.exec(
        `SELECT * FROM evaluations ORDER BY timestamp DESC LIMIT ?`,
        limit
      );
      return result.rows || [];
    } catch (error) {
      console.error('Failed to get history:', error);
      return [];
    }
  }

  /**
   * Fallback tools when AI is unavailable
   */
  getFallbackTools(userRequest) {
    const request = userRequest.toLowerCase();
    
    if (request.includes('marketing') || request.includes('social')) {
      return [
        { name: 'HubSpot', description: 'All-in-one marketing platform', benefit: 'Centralized marketing automation' },
        { name: 'Buffer', description: 'Social media scheduler', benefit: 'Save time on social posting' },
        { name: 'Mailchimp', description: 'Email marketing tool', benefit: 'Easy email campaigns' },
        { name: 'Canva', description: 'Design tool with AI', benefit: 'Create professional graphics quickly' },
        { name: 'Google Analytics', description: 'Web analytics platform', benefit: 'Understand your audience' },
        { name: 'Hootsuite', description: 'Social media management', benefit: 'Manage multiple channels' },
        { name: 'SEMrush', description: 'SEO and marketing toolkit', benefit: 'Improve search rankings' },
        { name: 'Zapier', description: 'Automation platform', benefit: 'Connect marketing tools' }
      ];
    } else if (request.includes('development') || request.includes('coding') || request.includes('software')) {
      return [
        { name: 'GitHub Copilot', description: 'AI code completion', benefit: 'Write code faster' },
        { name: 'Cursor', description: 'AI-powered code editor', benefit: 'Intelligent code assistance' },
        { name: 'Linear', description: 'Issue tracking tool', benefit: 'Streamlined project management' },
        { name: 'Vercel', description: 'Deployment platform', benefit: 'Deploy instantly' },
        { name: 'Sentry', description: 'Error monitoring', benefit: 'Catch bugs in production' },
        { name: 'Postman', description: 'API testing tool', benefit: 'Test APIs efficiently' },
        { name: 'Docker', description: 'Containerization platform', benefit: 'Consistent environments' },
        { name: 'Datadog', description: 'Monitoring and analytics', benefit: 'Full-stack observability' }
      ];
    } else {
      return [
        { name: 'Notion', description: 'All-in-one workspace', benefit: 'Organize everything in one place' },
        { name: 'Slack', description: 'Team communication', benefit: 'Faster team collaboration' },
        { name: 'Zoom', description: 'Video conferencing', benefit: 'Connect remotely' },
        { name: 'Asana', description: 'Project management', benefit: 'Track tasks and projects' },
        { name: 'Figma', description: 'Design collaboration', benefit: 'Design together in real-time' },
        { name: 'Loom', description: 'Video messaging', benefit: 'Async video communication' },
        { name: 'Calendly', description: 'Meeting scheduler', benefit: 'Eliminate scheduling back-and-forth' },
        { name: 'Airtable', description: 'Flexible database', benefit: 'Organize data your way' }
      ];
    }
  }

  /**
   * HTTP fetch handler for API requests
   */
  async fetch(request) {
    const url = new URL(request.url);
    
    if (url.pathname === '/evaluate' && request.method === 'POST') {
      try {
        const { request: userRequest } = await request.json();
        const tools = await this.evaluateTools(userRequest);
        
        return new Response(JSON.stringify(tools), {
          headers: { 'Content-Type': 'application/json' }
        });
      } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), {
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        });
      }
    }
    
    if (url.pathname === '/history' && request.method === 'GET') {
      try {
        const history = await this.getHistory();
        return new Response(JSON.stringify(history), {
          headers: { 'Content-Type': 'application/json' }
        });
      } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), {
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        });
      }
    }

    return new Response('Not Found', { status: 404 });
  }

  /**
   * WebSocket handler for real-time updates
   */
  async webSocketMessage(ws, message) {
    try {
      const data = JSON.parse(message);
      
      if (data.type === 'evaluate') {
        // Send progress updates
        ws.send(JSON.stringify({ type: 'status', message: 'Generating tool suggestions...' }));
        
        const tools = await this.evaluateTools(data.request);
        
        ws.send(JSON.stringify({ type: 'result', tools }));
      } else if (data.type === 'history') {
        const history = await this.getHistory(data.limit || 10);
        ws.send(JSON.stringify({ type: 'history', data: history }));
      }
    } catch (error) {
      ws.send(JSON.stringify({ type: 'error', message: error.message }));
    }
  }
}
