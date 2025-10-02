import { useState } from 'react'
import AIService from '../utils/aiService'

const AIToolsSection = ({ onGenerateTools, onClearAINotes }) => {
  const [selectedProvider, setSelectedProvider] = useState('')
  const [apiKey, setApiKey] = useState('')
  const [customPrompt, setCustomPrompt] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)

  const aiProviders = [
    { id: 'openai', name: 'ChatGPT (OpenAI)', placeholder: 'Enter OpenAI API Key' },
    { id: 'claude', name: 'Claude (Anthropic)', placeholder: 'Enter Anthropic API Key' },
    { id: 'gemini', name: 'Gemini (Google)', placeholder: 'Enter Google API Key' }
  ]

  const handleGenerateTools = async () => {
    if (!selectedProvider) {
      alert('Please select an AI provider')
      return
    }
    
    // Allow demo mode without API key
    if (!apiKey.trim()) {
      const useDemo = confirm('No API key provided. Would you like to use Demo Mode with sample suggestions?')
      if (!useDemo) return
    }

    setIsGenerating(true)
    
    try {
      let tools = []
      
      console.log('Generate Tools Debug:', {
        selectedProvider,
        hasApiKey: !!apiKey,
        customPrompt: customPrompt.trim()
      })
      
      // Try to use real AI service if API key is provided
      if (selectedProvider && apiKey.trim()) {
        const aiService = new AIService(selectedProvider, apiKey)
        console.log('Calling AI service with custom prompt:', customPrompt.trim() || 'no custom prompt')
        tools = await aiService.generateTools(customPrompt.trim() || null)
        console.log('AI service returned tools:', tools)
      } else {
        // Demo mode - generate contextual suggestions based on custom prompt
        const prompt = customPrompt.trim().toLowerCase()
        if (prompt.includes('marketing') || prompt.includes('social')) {
          tools = [
            { name: 'Social Media Scheduler', quadrant: 'q1' },
            { name: 'Email Marketing Tool', quadrant: 'q1' },
            { name: 'Analytics Dashboard', quadrant: 'q1' },
            { name: 'Marketing Automation Platform', quadrant: 'q2' },
            { name: 'Customer Journey Mapping', quadrant: 'q2' },
            { name: 'A/B Testing Suite', quadrant: 'q2' },
            { name: 'Content Calendar', quadrant: 'q3' },
            { name: 'Basic Landing Pages', quadrant: 'q3' },
            { name: 'Survey Tools', quadrant: 'q3' },
            { name: 'Custom Attribution Model', quadrant: 'q4' },
            { name: 'Advanced Personalization', quadrant: 'q4' },
            { name: 'Multi-touch Campaign', quadrant: 'q4' }
          ]
        } else if (prompt.includes('development') || prompt.includes('software') || prompt.includes('tech')) {
          tools = [
            { name: 'Code Review Tool', quadrant: 'q1' },
            { name: 'Automated Testing', quadrant: 'q1' },
            { name: 'CI/CD Pipeline', quadrant: 'q1' },
            { name: 'Microservices Architecture', quadrant: 'q2' },
            { name: 'Cloud Migration', quadrant: 'q2' },
            { name: 'API Gateway', quadrant: 'q2' },
            { name: 'Documentation Site', quadrant: 'q3' },
            { name: 'Bug Tracking', quadrant: 'q3' },
            { name: 'Team Chat Integration', quadrant: 'q3' },
            { name: 'Custom Framework', quadrant: 'q4' },
            { name: 'Legacy Code Rewrite', quadrant: 'q4' },
            { name: 'Hardware Optimization', quadrant: 'q4' }
          ]
        } else {
          // Generic business tools
          tools = [
            { name: 'Process Automation', quadrant: 'q1' },
            { name: 'Data Analytics Dashboard', quadrant: 'q1' },
            { name: 'Customer Support Chatbot', quadrant: 'q1' },
            { name: 'Enterprise CRM System', quadrant: 'q2' },
            { name: 'Machine Learning Platform', quadrant: 'q2' },
            { name: 'Cloud Infrastructure', quadrant: 'q2' },
            { name: 'Email Templates', quadrant: 'q3' },
            { name: 'Social Media Scheduler', quadrant: 'q3' },
            { name: 'Basic Website Builder', quadrant: 'q3' },
            { name: 'Legacy System Migration', quadrant: 'q4' },
            { name: 'Custom Hardware Solution', quadrant: 'q4' },
            { name: 'Manual Data Entry Tool', quadrant: 'q4' }
          ]
        }
      }
      
      onGenerateTools(tools, selectedProvider, apiKey)
    } catch (error) {
      console.error('Error generating tools:', error)
      
      // Provide more specific error messages
      if (error.message.includes('Failed to fetch') || error.message.includes('CORS')) {
        alert('Network error: AI APIs cannot be called directly from the browser due to CORS restrictions. The app is using fallback suggestions instead. For real AI integration, you would need a backend server to proxy the API calls.')
      } else if (error.message.includes('401') || error.message.includes('403')) {
        alert('Invalid API key. Please check your API key and try again.')
      } else {
        alert('Failed to generate AI tools: ' + error.message)
      }
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-8">
      <h2 className="text-2xl font-semibold text-gray-700 mb-6">Idea Generator with AI</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* AI Provider Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Select AI Provider
          </label>
          <div className="space-y-2">
            {aiProviders.map(provider => (
              <label key={provider.id} className="flex items-center">
                <input
                  type="radio"
                  name="aiProvider"
                  value={provider.id}
                  checked={selectedProvider === provider.id}
                  onChange={(e) => setSelectedProvider(e.target.value)}
                  className="mr-3 text-primary-500 focus:ring-primary-500"
                />
                <span className="text-gray-700">{provider.name}</span>
              </label>
            ))}
          </div>
        </div>

        {/* API Key Input */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            API Key
          </label>
          <input
            type="text"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder={selectedProvider ? aiProviders.find(p => p.id === selectedProvider)?.placeholder : 'Select a provider first'}
            className="w-full px-3 py-2 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500"
            disabled={!selectedProvider}
          />
        </div>
        
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Custom Context (Optional)
          </label>
          <textarea
            value={customPrompt}
            onChange={(e) => setCustomPrompt(e.target.value)}
            placeholder="e.g., 'for a healthcare startup', 'for remote team collaboration', 'for e-commerce business'..."
            className="w-full px-3 py-2 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500 h-20 resize-none"
            rows={3}
          />
          <p className="text-xs text-gray-500 mt-1">
            Add context to get more relevant tool suggestions for your specific industry, use case, or business type.
          </p>
          <p className="text-xs text-gray-500 mt-2">
            Your API key is stored locally and never sent to our servers.<br/>
            <a href="https://platform.openai.com/api-keys" target="_blank" rel="noopener noreferrer" className="text-gray-600 underline hover:text-gray-800">Get OpenAI API key</a> | 
            <a href="https://console.anthropic.com/" target="_blank" rel="noopener noreferrer" className="text-gray-600 underline hover:text-gray-800">Get Claude API key</a> | 
            <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="text-gray-600 underline hover:text-gray-800">Get Gemini API key</a>
          </p>
        </div>
      </div>

      {/* Generate Button */}
      <div className="text-center">
        <div className="flex gap-2">
          <button
            onClick={handleGenerateTools}
            disabled={isGenerating}
            className="flex-1 bg-gray-600 hover:bg-gray-700 disabled:bg-gray-400 text-white px-4 py-2 transition-colors"
          >
            {isGenerating ? 'Generating...' : (customPrompt.trim() ? 'Generate Custom Suggestions' : 'Generate Suggestions')}
          </button>
          <button
            onClick={onClearAINotes}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 transition-colors"
            title="Clear all AI-generated sticky notes"
          >
            Clear All
          </button>
        </div>
      </div>

      <div className="mt-4 text-sm text-gray-600 text-center">
        <p>AI will generate tool suggestions and automatically place them in the appropriate quadrants based on impact and effort analysis.</p>
      </div>
    </div>
  )
}

export default AIToolsSection
