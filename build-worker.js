import fs from 'fs';
import path from 'path';

// Read the built assets
const indexHtml = fs.readFileSync('dist/index.html', 'utf8');
const cssFile = fs.readdirSync('dist/assets').find(f => f.endsWith('.css'));
const jsFile = fs.readdirSync('dist/assets').find(f => f.endsWith('.js'));

const cssContent = fs.readFileSync(`dist/assets/${cssFile}`, 'utf8');
const jsContent = fs.readFileSync(`dist/assets/${jsFile}`, 'utf8');
const viteSvg = fs.readFileSync('dist/vite.svg', 'utf8');

// Create the worker with inlined assets
const workerCode = `
// AI API handlers
async function handleOpenAI(request, env) {
  const { apiKey, prompt } = await request.json()
  
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': \`Bearer \${apiKey}\`
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
  
  const response = await fetch(\`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=\${apiKey}\`, {
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

// Inlined assets
const CSS_CONTENT = \`${cssContent.replace(/`/g, '\\`')}\`;
const JS_CONTENT = \`${jsContent.replace(/`/g, '\\`')}\`;
const VITE_SVG = \`${viteSvg.replace(/`/g, '\\`')}\`;

const HTML_TEMPLATE = \`<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/vite.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Audit Tool - Idea Generator with AI</title>
    <style>\${CSS_CONTENT}</style>
  </head>
  <body>
    <div id="root"></div>
    <script type="module">\${JS_CONTENT}</script>
  </body>
</html>\`;

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
    
    // Serve vite.svg
    if (url.pathname === '/vite.svg') {
      return new Response(VITE_SVG, {
        headers: {
          'Content-Type': 'image/svg+xml',
          'Cache-Control': 'public, max-age=31536000'
        }
      })
    }
    
    // Serve the React app for all other routes
    return new Response(HTML_TEMPLATE, {
      headers: {
        'Content-Type': 'text/html',
        'Cache-Control': 'public, max-age=300'
      }
    })
  },
}
`;

// Write the new worker file
fs.writeFileSync('workers-site/index.js', workerCode);
console.log('Worker built successfully with inlined assets!');
