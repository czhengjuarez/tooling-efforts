// AI API handlers
async function handleOpenAI(request, env) {
  const { apiKey, prompt } = await request.json()
  
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
  })

  return new Response(await response.text(), {
    status: response.status,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    }
  })
}

async function handleClaude(request, env) {
  const { apiKey, prompt } = await request.json()
  
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01'
    },
    body: JSON.stringify({
      model: 'claude-3-haiku-20240307',
      max_tokens: 2000,
      messages: [{ role: 'user', content: prompt }]
    })
  })

  return new Response(await response.text(), {
    status: response.status,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    }
  })
}

async function handleGemini(request, env) {
  const { apiKey, prompt } = await request.json()
  
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
  })

  return new Response(await response.text(), {
    status: response.status,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    }
  })
}

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url)
    
    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type'
        }
      })
    }
    
    // Handle AI API routes
    if (url.pathname === '/api/openai' && request.method === 'POST') {
      return handleOpenAI(request, env)
    }
    
    if (url.pathname === '/api/claude' && request.method === 'POST') {
      return handleClaude(request, env)
    }
    
    if (url.pathname === '/api/gemini' && request.method === 'POST') {
      return handleGemini(request, env)
    }
    
    // Serve a working app with AI functionality and business suggestions display
    const html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Audit Tool - AI Integration Test</title>
    <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-white">
    <div class="min-h-screen p-8">
        <div class="max-w-4xl mx-auto">
            <h1 class="text-3xl font-bold text-gray-700 mb-8 text-center">AI suggestions</h1>
            
            <div class="border border-gray-200 rounded-lg p-4 mb-6 hidden" style="background-color: #F5DEEA;">
                <h2 class="text-lg font-semibold text-gray-800 mb-2">Business Tool Suggestions</h2>
                <p class="text-gray-700 text-sm">Get AI-powered business tool recommendations. Enter your API key and describe your needs.</p>
            </div>
            
            <div class="space-y-4 mb-8">
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">AI Provider</label>
                    <select id="provider" class="w-full px-3 py-2 border border-gray-300 rounded">
                        <option value="openai">OpenAI</option>
                        <option value="claude">Claude</option>
                        <option value="gemini">Gemini</option>
                    </select>
                </div>
                
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">API Key</label>
                    <input type="password" id="apiKey" placeholder="Enter your API key" 
                           class="w-full px-3 py-2 border border-gray-300 rounded">
                </div>
                
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">Custom Prompt</label>
                    <input type="text" id="prompt" placeholder="e.g., marketing automation, software development" 
                           class="w-full px-3 py-2 border border-gray-300 rounded">
                </div>
                
                <button onclick="testAPI()" id="testBtn" 
                        class="w-full text-white py-2 px-4 rounded hover:opacity-90" style="background-color: #8F1F57;">
                    Check AI suggestion
                </button>
            </div>
            
            <div id="result" class="hidden" style="display: none;">
                <h3 class="text-lg font-semibold mb-4">API Response:</h3>
                <pre id="response" class="bg-gray-100 p-4 rounded text-sm overflow-auto max-h-96"></pre>
            </div>
            
            <div id="suggestions" class="hidden mt-8">
                <h3 class="text-2xl font-bold text-gray-700 mb-6">Business Suggestions</h3>
                <div id="suggestionsGrid" class="grid grid-cols-1 md:grid-cols-2 gap-6"></div>
            </div>
            
            <div class="mt-8 text-center text-gray-600">
                <p>Get API keys: 
                    <a href="https://platform.openai.com/api-keys" class="text-blue-600 underline">OpenAI</a> | 
                    <a href="https://console.anthropic.com/" class="text-blue-600 underline">Claude</a> | 
                    <a href="https://makersuite.google.com/app/apikey" class="text-blue-600 underline">Gemini</a>
                </p>
            </div>
        </div>
    </div>

    <script>
        function parseBusinessSuggestions(content, provider) {
            const suggestions = [];
            
            try {
                // Extract text content based on provider
                let text = '';
                if (provider === 'openai') {
                    text = content.choices[0].message.content;
                } else if (provider === 'claude') {
                    text = content.content[0].text;
                } else if (provider === 'gemini') {
                    text = content.candidates[0].content.parts[0].text;
                }
                
                // Parse numbered list items (1. Tool Name)
                const lines = text.split('\\n');
                let currentTool = null;
                
                for (const line of lines) {
                    const trimmed = line.trim();
                    
                    // Match numbered items like "1. Figma" or "2. Miro"
                    const toolMatch = trimmed.match(/^\\d+\\.\\s*(.+)$/);
                    if (toolMatch) {
                        if (currentTool) {
                            suggestions.push(currentTool);
                        }
                        currentTool = {
                            name: toolMatch[1].trim(),
                            effort: 'Unknown',
                            impact: 'Unknown',
                            description: ''
                        };
                        continue;
                    }
                    
                    if (currentTool) {
                        // Look for effort/impact indicators
                        if (trimmed.toLowerCase().includes('effort:')) {
                            const effortMatch = trimmed.match(/effort:\\s*(\\w+)/i);
                            if (effortMatch) currentTool.effort = effortMatch[1];
                        }
                        if (trimmed.toLowerCase().includes('impact:')) {
                            const impactMatch = trimmed.match(/impact:\\s*(\\w+)/i);
                            if (impactMatch) currentTool.impact = impactMatch[1];
                        }
                        
                        // Collect description
                        if (trimmed && !trimmed.toLowerCase().includes('effort:') && !trimmed.toLowerCase().includes('impact:')) {
                            currentTool.description += (currentTool.description ? ' ' : '') + trimmed;
                        }
                    }
                }
                
                // Add the last tool
                if (currentTool) {
                    suggestions.push(currentTool);
                }
                
            } catch (error) {
                console.error('Error parsing suggestions:', error);
            }
            
            return suggestions;
        }
        
        function displaySuggestions(suggestions) {
            const grid = document.getElementById('suggestionsGrid');
            const suggestionsDiv = document.getElementById('suggestions');
            
            if (suggestions.length === 0) {
                suggestionsDiv.classList.add('hidden');
                return;
            }
            
            grid.innerHTML = '';
            
            suggestions.forEach(tool => {
                const card = document.createElement('div');
                card.className = 'bg-white border border-gray-200 p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow';
                
                const effortColor = tool.effort.toLowerCase() === 'low' ? 'text-green-600 bg-green-100' : 
                                   tool.effort.toLowerCase() === 'medium' ? 'text-yellow-600 bg-yellow-100' : 
                                   tool.effort.toLowerCase() === 'high' ? 'text-red-600 bg-red-100' : 'text-gray-600 bg-gray-100';
                
                const impactColor = tool.impact.toLowerCase() === 'high' ? 'text-green-600 bg-green-100' : 
                                   tool.impact.toLowerCase() === 'medium' ? 'text-yellow-600 bg-yellow-100' : 
                                   tool.impact.toLowerCase() === 'low' ? 'text-red-600 bg-red-100' : 'text-gray-600 bg-gray-100';
                
                card.innerHTML = \`
                    <h4 class="text-lg font-semibold text-gray-800 mb-3">\${tool.name}</h4>
                    <div class="flex gap-2 mb-3">
                        <span class="px-2 py-1 text-xs rounded-full \${effortColor}">
                            \${tool.effort} Effort
                        </span>
                        <span class="px-2 py-1 text-xs rounded-full \${impactColor}">
                            \${tool.impact} Impact
                        </span>
                    </div>
                    <p class="text-gray-600 text-sm leading-relaxed">\${tool.description}</p>
                \`;
                
                grid.appendChild(card);
            });
            
            suggestionsDiv.classList.remove('hidden');
        }
        
        async function testAPI() {
            const provider = document.getElementById('provider').value;
            const apiKey = document.getElementById('apiKey').value;
            const customPrompt = document.getElementById('prompt').value;
            const testBtn = document.getElementById('testBtn');
            const result = document.getElementById('result');
            const response = document.getElementById('response');
            
            if (!apiKey.trim()) {
                alert('Please enter an API key');
                return;
            }
            
            const prompt = customPrompt.trim() ? 
                \`Based on "\${customPrompt}", suggest business tools with effort/impact categories. Format as numbered list with effort and impact levels.\` :
                'Suggest 3 business productivity tools with effort/impact categories. Format as numbered list.';
            
            testBtn.textContent = 'Testing...';
            testBtn.disabled = true;
            
            try {
                const res = await fetch(\`/api/\${provider}\`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ apiKey, prompt })
                });
                
                const data = await res.json();
                
                result.classList.remove('hidden');
                response.textContent = JSON.stringify(data, null, 2);
                
                if (res.ok) {
                    result.innerHTML = '<h3 class="text-lg font-semibold mb-4 text-green-600">✅ API Success!</h3>' + 
                                     '<pre id="response" class="bg-gray-100 p-4 rounded text-sm overflow-auto max-h-96"></pre>';
                    document.getElementById('response').textContent = JSON.stringify(data, null, 2);
                    
                    // Parse and display business suggestions
                    const suggestions = parseBusinessSuggestions(data, provider);
                    displaySuggestions(suggestions);
                } else {
                    result.innerHTML = '<h3 class="text-lg font-semibold mb-4 text-red-600">❌ API Error</h3>' + 
                                     '<pre id="response" class="bg-red-50 p-4 rounded text-sm overflow-auto max-h-96"></pre>';
                    document.getElementById('response').textContent = JSON.stringify(data, null, 2);
                }
            } catch (error) {
                result.classList.remove('hidden');
                result.innerHTML = '<h3 class="text-lg font-semibold mb-4 text-red-600">❌ Network Error</h3>' + 
                                 '<pre class="bg-red-50 p-4 rounded text-sm">' + error.message + '</pre>';
            } finally {
                testBtn.textContent = 'Test AI API';
                testBtn.disabled = false;
            }
        }
    </script>
</body>
</html>`
    
    return new Response(html, {
      headers: {
        'Content-Type': 'text/html',
        'Cache-Control': 'public, max-age=300'
      }
    })
  },
}
