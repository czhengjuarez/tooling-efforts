import { ToolEvaluationAgent } from './src/agent/ToolEvaluationAgent';

/**
 * Cloudflare Worker entry point
 * Handles HTTP requests and WebSocket connections to the ToolEvaluationAgent
 */
export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    // CORS headers for browser requests
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    };

    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    // Health check endpoint
    if (url.pathname === '/health') {
      return new Response(JSON.stringify({ status: 'ok', timestamp: Date.now() }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // WebSocket upgrade for real-time communication
    if (url.pathname === '/ws') {
      return handleWebSocket(request, env);
    }

    // HTTP API endpoint for tool evaluation
    if (url.pathname === '/api/evaluate' && request.method === 'POST') {
      try {
        const { request: userRequest } = await request.json();
        
        if (!userRequest || typeof userRequest !== 'string') {
          return new Response(JSON.stringify({ error: 'Invalid request' }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        }

        // Create or get agent instance
        const agentId = env.TOOL_EVALUATION_AGENT.idFromName('default');
        const agent = env.TOOL_EVALUATION_AGENT.get(agentId);

        // Call the agent
        const response = await agent.fetch(new Request('http://agent/evaluate', {
          method: 'POST',
          body: JSON.stringify({ request: userRequest }),
          headers: { 'Content-Type': 'application/json' }
        }));

        const tools = await response.json();

        return new Response(JSON.stringify({ tools }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      } catch (error) {
        console.error('Error in /api/evaluate:', error);
        return new Response(JSON.stringify({ error: error.message }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }
    }

    // Get evaluation history
    if (url.pathname === '/api/history' && request.method === 'GET') {
      try {
        const agentId = env.TOOL_EVALUATION_AGENT.idFromName('default');
        const agent = env.TOOL_EVALUATION_AGENT.get(agentId);

        const response = await agent.fetch(new Request('http://agent/history', {
          method: 'GET'
        }));

        const history = await response.json();

        return new Response(JSON.stringify({ history }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      } catch (error) {
        console.error('Error in /api/history:', error);
        return new Response(JSON.stringify({ error: error.message }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }
    }

    return new Response('Not Found', { status: 404, headers: corsHeaders });
  }
};

/**
 * Handle WebSocket connections
 */
async function handleWebSocket(request, env) {
  const upgradeHeader = request.headers.get('Upgrade');
  if (!upgradeHeader || upgradeHeader !== 'websocket') {
    return new Response('Expected Upgrade: websocket', { status: 426 });
  }

  const agentId = env.TOOL_EVALUATION_AGENT.idFromName('default');
  const agent = env.TOOL_EVALUATION_AGENT.get(agentId);

  // Forward WebSocket to agent
  return agent.fetch(request);
}

/**
 * Agent Durable Object export
 * This handles the actual agent logic and state
 */
export { ToolEvaluationAgent };
