class AIService {
  constructor() {
    this.provider = 'openai'
    this.apiKey = null
  }

  setProvider(provider) {
    this.provider = provider
  }

  setApiKey(apiKey) {
    this.apiKey = apiKey
  }

  buildPrompt(customPrompt = null) {
    let prompt = `You are a business tool consultant. Generate 12 relevant business tools/solutions. Categorize them into 4 quadrants based on effort and impact:

- High Impact, Low Effort (q1): Quick wins, easy to implement
- High Impact, High Effort (q2): Major projects, significant resources
- Low Impact, Low Effort (q3): Simple tasks, minor improvements  
- Low Impact, High Effort (q4): Complex but limited benefit

Return ONLY a JSON array with this exact format:
[
  {"name": "Tool Name", "quadrant": "q1"},
  {"name": "Another Tool", "quadrant": "q2"},
  ...
]

Examples:
"Email Automation" for quadrant "q1"
"Enterprise CRM System" for quadrant "q2"
"Social Media Templates" for quadrant "q3"
"Legacy System Migration" for quadrant "q4"`

    // If custom prompt is provided, modify the base prompt
    if (customPrompt) {
      prompt = `You are a business tool consultant. Based on this context: "${customPrompt}", generate 12 relevant business tools/solutions. Categorize them into 4 quadrants based on effort and impact:

- High Impact, Low Effort (q1): Quick wins, easy to implement
- High Impact, High Effort (q2): Major projects, significant resources
- Low Impact, Low Effort (q3): Simple tasks, minor improvements  
- Low Impact, High Effort (q4): Complex but limited benefit

Return ONLY a JSON array with this exact format:
[
  {"name": "Tool Name", "quadrant": "q1"},
  {"name": "Another Tool", "quadrant": "q2"},
  ...
]`
    }

    return prompt
  }

  async generateTools(customPrompt = null) {
    console.log('AI Service generateTools called with:', {
      provider: this.provider,
      hasApiKey: !!this.apiKey,
      customPrompt,
      finalPrompt: this.buildPrompt(customPrompt).substring(0, 100) + '...'
    })
    
    const prompt = this.buildPrompt(customPrompt)
    console.log('Final prompt being sent to AI:', prompt.substring(0, 300) + '...')
    
    try {
      let result
      switch (this.provider) {
        case 'openai':
          result = await this.callOpenAIForTools(prompt)
          break
        case 'claude':
          result = await this.callClaudeForTools(prompt)
          break
        case 'gemini':
          result = await this.callGeminiForTools(prompt)
          break
        default:
          throw new Error('Unsupported AI provider')
      }
      console.log('AI API returned result:', result)
      return result
    } catch (error) {
      console.log('AI API Error:', error)
      console.log('Falling back to contextual tools due to error')
      // Fallback to contextual tools if API fails
      return this.getFallbackTools(customPrompt)
    }
  }

  async callOpenAIForTools(prompt) {
    console.log('Calling OpenAI API with prompt:', prompt.substring(0, 300) + '...')
    
    const response = await fetch('http://localhost:3001/api/openai', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        apiKey: this.apiKey,
        prompt: prompt
      })
    })

    console.log('OpenAI API response status:', response.status)
    
    if (!response.ok) {
      const errorText = await response.text()
      console.error('OpenAI API error details:', errorText)
      throw new Error(`OpenAI API error: ${response.status} - ${errorText}`)
    }

    const data = await response.json()
    const content = data.choices[0].message.content
    console.log('OpenAI API raw response:', content)

    const parsedTools = this.parseTools(content)
    console.log('Parsed tools from OpenAI:', parsedTools)
    return parsedTools
  }

  async callClaudeForTools(prompt) {
    console.log('Calling Claude API with prompt:', prompt.substring(0, 300) + '...')
    
    const response = await fetch('http://localhost:3001/api/claude', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        apiKey: this.apiKey,
        prompt: prompt
      })
    })

    if (!response.ok) {
      throw new Error(`Claude API error: ${response.status}`)
    }

    const data = await response.json()
    const content = data.content[0].text

    return this.parseTools(content)
  }

  async callGeminiForTools(prompt) {
    console.log('Calling Gemini API with prompt:', prompt.substring(0, 300) + '...')
    
    const response = await fetch('http://localhost:3001/api/gemini', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        apiKey: this.apiKey,
        prompt: prompt
      })
    })

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.status}`)
    }

    const data = await response.json()
    const content = data.candidates[0].content.parts[0].text

    return this.parseTools(content)
  }

  parseTools(content) {
    try {
      // Try to extract JSON from the response
      const jsonMatch = content.match(/\[[\s\S]*\]/)
      if (jsonMatch) {
        const tools = JSON.parse(jsonMatch[0])
        return tools.map(tool => ({
          id: `ai-${Date.now()}-${Math.random()}`,
          content: tool.name,
          quadrant: tool.quadrant,
          x: Math.random() * 200,
          y: Math.random() * 100
        }))
      }
      
      // If no JSON found, return empty array
      console.warn('No valid JSON found in AI response')
      return []
    } catch (error) {
      console.error('Error parsing AI response:', error)
      return []
    }
  }

  async generateStrategy(noteContent) {
    const prompt = `Based on this business idea: "${noteContent}", provide 3 strategic recommendations for implementation. Be specific and actionable.`
    
    try {
      let result
      switch (this.provider) {
        case 'openai':
          result = await this.callOpenAIForStrategy(prompt)
          break
        case 'claude':
          result = await this.callClaudeForStrategy(prompt)
          break
        case 'gemini':
          result = await this.callGeminiForStrategy(prompt)
          break
        default:
          throw new Error('Unsupported AI provider')
      }
      return result
    } catch (error) {
      console.error('AI API Error:', error)
      // Fallback to contextual mock strategies if API fails
      return this.getFallbackStrategies(noteContent)
    }
  }

  async callOpenAIForStrategy(prompt) {
    const response = await fetch('http://localhost:3001/api/openai', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        apiKey: this.apiKey,
        prompt: prompt
      })
    })

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`)
    }

    const data = await response.json()
    return data.choices[0].message.content
  }

  async callClaudeForStrategy(prompt) {
    const response = await fetch('http://localhost:3001/api/claude', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        apiKey: this.apiKey,
        prompt: prompt
      })
    })

    if (!response.ok) {
      throw new Error(`Claude API error: ${response.status}`)
    }

    const data = await response.json()
    return data.content[0].text
  }

  async callGeminiForStrategy(prompt) {
    const response = await fetch('http://localhost:3001/api/gemini', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        apiKey: this.apiKey,
        prompt: prompt
      })
    })

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.status}`)
    }

    const data = await response.json()
    return data.candidates[0].content.parts[0].text
  }

  getFallbackTools(customPrompt) {
    // Contextual fallback based on custom prompt
    if (customPrompt) {
      const lowerPrompt = customPrompt.toLowerCase()
      
      // Marketing context
      if (lowerPrompt.includes('marketing') || lowerPrompt.includes('social') || lowerPrompt.includes('brand')) {
        return [
          { id: `ai-${Date.now()}-1`, content: 'Social Media Scheduler', quadrant: 'q1', x: Math.random() * 200, y: Math.random() * 100 },
          { id: `ai-${Date.now()}-2`, content: 'Email Campaign Tool', quadrant: 'q1', x: Math.random() * 200, y: Math.random() * 100 },
          { id: `ai-${Date.now()}-3`, content: 'Content Calendar', quadrant: 'q1', x: Math.random() * 200, y: Math.random() * 100 },
          { id: `ai-${Date.now()}-4`, content: 'Marketing Automation Platform', quadrant: 'q2', x: Math.random() * 200, y: Math.random() * 100 },
          { id: `ai-${Date.now()}-5`, content: 'Customer Journey Mapping', quadrant: 'q2', x: Math.random() * 200, y: Math.random() * 100 },
          { id: `ai-${Date.now()}-6`, content: 'Advanced Analytics Dashboard', quadrant: 'q2', x: Math.random() * 200, y: Math.random() * 100 },
          { id: `ai-${Date.now()}-7`, content: 'Basic Template Library', quadrant: 'q3', x: Math.random() * 200, y: Math.random() * 100 },
          { id: `ai-${Date.now()}-8`, content: 'Simple A/B Testing', quadrant: 'q3', x: Math.random() * 200, y: Math.random() * 100 },
          { id: `ai-${Date.now()}-9`, content: 'Stock Photo Collection', quadrant: 'q3', x: Math.random() * 200, y: Math.random() * 100 },
          { id: `ai-${Date.now()}-10`, content: 'Legacy CRM Integration', quadrant: 'q4', x: Math.random() * 200, y: Math.random() * 100 },
          { id: `ai-${Date.now()}-11`, content: 'Custom Attribution Model', quadrant: 'q4', x: Math.random() * 200, y: Math.random() * 100 },
          { id: `ai-${Date.now()}-12`, content: 'Manual Campaign Tracking', quadrant: 'q4', x: Math.random() * 200, y: Math.random() * 100 }
        ]
      }
      
      // Tech/Development context
      else if (lowerPrompt.includes('tech') || lowerPrompt.includes('dev') || lowerPrompt.includes('software') || lowerPrompt.includes('app')) {
        return [
          { id: `ai-${Date.now()}-1`, content: 'Code Review Tool', quadrant: 'q1', x: Math.random() * 200, y: Math.random() * 100 },
          { id: `ai-${Date.now()}-2`, content: 'Automated Testing Suite', quadrant: 'q1', x: Math.random() * 200, y: Math.random() * 100 },
          { id: `ai-${Date.now()}-3`, content: 'CI/CD Pipeline', quadrant: 'q1', x: Math.random() * 200, y: Math.random() * 100 },
          { id: `ai-${Date.now()}-4`, content: 'Microservices Architecture', quadrant: 'q2', x: Math.random() * 200, y: Math.random() * 100 },
          { id: `ai-${Date.now()}-5`, content: 'Machine Learning Platform', quadrant: 'q2', x: Math.random() * 200, y: Math.random() * 100 },
          { id: `ai-${Date.now()}-6`, content: 'Enterprise Security Framework', quadrant: 'q2', x: Math.random() * 200, y: Math.random() * 100 },
          { id: `ai-${Date.now()}-7`, content: 'Documentation Generator', quadrant: 'q3', x: Math.random() * 200, y: Math.random() * 100 },
          { id: `ai-${Date.now()}-8`, content: 'Simple Monitoring Dashboard', quadrant: 'q3', x: Math.random() * 200, y: Math.random() * 100 },
          { id: `ai-${Date.now()}-9`, content: 'Basic Error Logging', quadrant: 'q3', x: Math.random() * 200, y: Math.random() * 100 },
          { id: `ai-${Date.now()}-10`, content: 'Legacy System Migration', quadrant: 'q4', x: Math.random() * 200, y: Math.random() * 100 },
          { id: `ai-${Date.now()}-11`, content: 'Custom Framework Development', quadrant: 'q4', x: Math.random() * 200, y: Math.random() * 100 },
          { id: `ai-${Date.now()}-12`, content: 'Manual Code Deployment', quadrant: 'q4', x: Math.random() * 200, y: Math.random() * 100 }
        ]
      }
    }

    // Default generic business tools
    return [
      { id: `ai-${Date.now()}-1`, content: 'Task Automation Tool', quadrant: 'q1', x: Math.random() * 200, y: Math.random() * 100 },
      { id: `ai-${Date.now()}-2`, content: 'Team Communication App', quadrant: 'q1', x: Math.random() * 200, y: Math.random() * 100 },
      { id: `ai-${Date.now()}-3`, content: 'Project Management System', quadrant: 'q1', x: Math.random() * 200, y: Math.random() * 100 },
      { id: `ai-${Date.now()}-4`, content: 'Enterprise Resource Planning', quadrant: 'q2', x: Math.random() * 200, y: Math.random() * 100 },
      { id: `ai-${Date.now()}-5`, content: 'Advanced Analytics Platform', quadrant: 'q2', x: Math.random() * 200, y: Math.random() * 100 },
      { id: `ai-${Date.now()}-6`, content: 'Custom CRM Solution', quadrant: 'q2', x: Math.random() * 200, y: Math.random() * 100 },
      { id: `ai-${Date.now()}-7`, content: 'Document Templates', quadrant: 'q3', x: Math.random() * 200, y: Math.random() * 100 },
      { id: `ai-${Date.now()}-8`, content: 'Simple Reporting Tool', quadrant: 'q3', x: Math.random() * 200, y: Math.random() * 100 },
      { id: `ai-${Date.now()}-9`, content: 'Basic Time Tracker', quadrant: 'q3', x: Math.random() * 200, y: Math.random() * 100 },
      { id: `ai-${Date.now()}-10`, content: 'Legacy System Integration', quadrant: 'q4', x: Math.random() * 200, y: Math.random() * 100 },
      { id: `ai-${Date.now()}-11`, content: 'Custom Workflow Engine', quadrant: 'q4', x: Math.random() * 200, y: Math.random() * 100 },
      { id: `ai-${Date.now()}-12`, content: 'Manual Process Documentation', quadrant: 'q4', x: Math.random() * 200, y: Math.random() * 100 }
    ]
  }

  getFallbackStrategies(noteContent) {
    return `Based on "${noteContent}", here are strategic recommendations:

1. **Quick Implementation**: Start with a pilot program to test feasibility and gather initial feedback from key stakeholders.

2. **Resource Planning**: Allocate dedicated team members and establish clear timelines with measurable milestones for tracking progress.

3. **Risk Mitigation**: Identify potential challenges early and develop contingency plans to ensure smooth execution and minimize disruptions.`
  }
}

export default AIService
