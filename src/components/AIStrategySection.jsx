import { useState, forwardRef, useImperativeHandle } from 'react'
import { useDroppable } from '@dnd-kit/core'
import StickyNote from './StickyNote'
import AIService from '../utils/aiService'

const AIStrategySection = forwardRef(({ strategyNotes, onAddStrategyNote, onUpdateStrategyNote, onDeleteStrategyNote, onGenerateStrategy, selectedProvider, apiKey }, ref) => {
  const [isGenerating, setIsGenerating] = useState(false)
  const [suggestions, setSuggestions] = useState([])
  
  const { setNodeRef, isOver } = useDroppable({ id: 'strategy-area' })

  // Expose methods to parent component
  useImperativeHandle(ref, () => ({
    generateStrategyForNote: handleGenerateStrategy
  }))

  const handleGenerateStrategy = async (noteContent) => {
    if (!noteContent) return
    
    setIsGenerating(true)
    
    try {
      let strategies = []
      
      // Try to use real AI service if API key is provided
      if (selectedProvider && apiKey) {
        const aiService = new AIService(selectedProvider, apiKey)
        strategies = await aiService.generateStrategies(noteContent)
      } else {
        // Fallback to contextual mock strategies
        strategies = generateContextualStrategies(noteContent)
        // Simulate API delay for consistency
        await new Promise(resolve => setTimeout(resolve, 1500))
      }
      
      // Add strategies to suggestions
      setSuggestions(prev => [...prev, ...strategies])
      
    } catch (error) {
      console.error('Error generating strategy:', error)
      alert('Failed to generate strategy. Please try again.')
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <div className="mt-8">
      <div className="bg-white border border-gray-300 p-6">
        <h3 className="text-xl font-semibold text-gray-700 mb-4">AI Strategy & Implementation Suggestions</h3>
        <p className="text-sm text-gray-600 mb-4">
          Drag sticky notes here to get AI-powered implementation strategies and tool recommendations.
        </p>
        
        <div
          ref={setNodeRef}
          className={`min-h-40 border-2 border-dashed border-gray-300 bg-gray-50 p-4 relative ${
            isOver ? 'border-primary-400 bg-primary-50' : ''
          }`}
        >
          {strategyNotes.length === 0 && suggestions.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              <p>Drop sticky notes here to generate AI strategies</p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Duplicated sticky notes */}
              <div className="relative">
                {strategyNotes.map(note => (
                  <StickyNote
                    key={note.id}
                    note={note}
                    onUpdate={onUpdateStrategyNote}
                    onDelete={onDeleteStrategyNote}
                  />
                ))}
              </div>
              
              {/* AI Suggestions */}
              {suggestions.length > 0 && (
                <div className="mt-6">
                  <h4 className="text-lg font-medium text-gray-700 mb-3">AI Recommendations:</h4>
                  <div className="space-y-3">
                    {suggestions.map((suggestion, index) => (
                      <div key={index} className="bg-primary-50 border border-primary-200 p-3 text-sm text-gray-700">
                        <div className="flex items-start">
                          <svg className="h-5 w-5 text-primary-500 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                          </svg>
                          <p>{suggestion}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {isGenerating && (
                <div className="flex items-center justify-center py-4">
                  <svg className="animate-spin h-5 w-5 text-gray-500 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span className="text-gray-600">Generating strategy suggestions...</span>
                </div>
              )}
            </div>
          )}
        </div>
        
        {strategyNotes.length > 0 && !isGenerating && (
          <div className="mt-4 text-center">
            <button
              onClick={() => handleGenerateStrategy(strategyNotes[strategyNotes.length - 1]?.content)}
              className="px-6 py-2 bg-gray-500 text-white hover:bg-gray-600 transition-colors"
            >
              Generate More Strategies
            </button>
          </div>
        )}
      </div>
    </div>
  )
})

// Generate contextual strategies based on note content
const generateContextualStrategies = (noteContent) => {
  const content = noteContent.toLowerCase()
  const strategies = []
  
  // Technology/Software related
  if (content.includes('app') || content.includes('software') || content.includes('platform') || content.includes('system')) {
    strategies.push(`💻 **Tech Stack**: Consider using React/Vue for frontend, Node.js/Python for backend, and cloud hosting (AWS/Vercel)`)
    strategies.push(`🔧 **Development**: Start with a simple MVP, use existing APIs where possible, implement core features first`)
    strategies.push(`📱 **Mobile**: Build responsive web app first, then consider React Native or Flutter for native apps`)
  }
  
  // Business/Marketing related
  if (content.includes('business') || content.includes('marketing') || content.includes('sales') || content.includes('customer')) {
    strategies.push(`📊 **Market Research**: Use Google Trends, surveys, and competitor analysis to validate demand`)
    strategies.push(`🎯 **Go-to-Market**: Start with a specific niche, use social media and content marketing for early traction`)
    strategies.push(`💰 **Revenue Model**: Consider freemium, subscription, or one-time payment based on your target audience`)
  }
  
  // Automation/Process related
  if (content.includes('automat') || content.includes('workflow') || content.includes('process') || content.includes('task')) {
    strategies.push(`⚡ **No-Code Tools**: Use Zapier, Make.com, or Microsoft Power Automate for quick automation`)
    strategies.push(`🔄 **Process Mapping**: Document current workflow, identify bottlenecks, then automate repetitive tasks`)
    strategies.push(`🤖 **AI Integration**: Consider ChatGPT API, Claude API, or Google AI for intelligent automation`)
  }
  
  // Data/Analytics related
  if (content.includes('data') || content.includes('analytic') || content.includes('report') || content.includes('dashboard')) {
    strategies.push(`📈 **Visualization**: Use Tableau, Power BI, or build custom dashboards with Chart.js/D3.js`)
    strategies.push(`🗄️ **Data Pipeline**: Set up automated data collection, cleaning, and storage (PostgreSQL/MongoDB)`)
    strategies.push(`🔍 **Insights**: Implement real-time analytics and automated alerts for key metrics`)
  }
  
  // Communication/Collaboration related
  if (content.includes('team') || content.includes('communication') || content.includes('collaboration') || content.includes('meeting')) {
    strategies.push(`💬 **Communication**: Integrate with Slack/Teams, set up automated notifications and updates`)
    strategies.push(`👥 **Collaboration**: Use shared workspaces, real-time editing, and version control systems`)
    strategies.push(`📅 **Scheduling**: Implement calendar integration, automated meeting scheduling, and reminders`)
  }
  
  // E-commerce/Marketplace related
  if (content.includes('shop') || content.includes('store') || content.includes('marketplace') || content.includes('ecommerce')) {
    strategies.push(`🛒 **Platform**: Use Shopify, WooCommerce, or build custom with Stripe for payments`)
    strategies.push(`📦 **Fulfillment**: Integrate with shipping APIs, inventory management, and order tracking`)
    strategies.push(`🎨 **Design**: Focus on mobile-first design, fast loading, and seamless checkout experience`)
  }
  
  // Education/Learning related
  if (content.includes('learn') || content.includes('education') || content.includes('course') || content.includes('training')) {
    strategies.push(`🎓 **Content Delivery**: Use video platforms, interactive quizzes, and progress tracking`)
    strategies.push(`📚 **Curriculum**: Structure content in modules, provide certificates, and enable peer interaction`)
    strategies.push(`🔄 **Engagement**: Implement gamification, discussion forums, and personalized learning paths`)
  }
  
  // Generic strategies if no specific category matches
  if (strategies.length === 0) {
    strategies.push(`🚀 **MVP Approach**: Start small, validate with users, iterate based on feedback`)
    strategies.push(`🔧 **Tool Selection**: Research existing solutions, consider build vs buy decisions`)
    strategies.push(`📋 **Project Planning**: Break into phases, set milestones, track progress regularly`)
  }
  
  // Always add some universal strategies
  strategies.push(`💡 **Innovation**: Look for creative solutions, consider emerging technologies and trends`)
  strategies.push(`🤝 **Partnerships**: Explore collaborations, integrations, and strategic alliances`)
  
  // Return 2-3 random strategies to avoid overwhelming
  const shuffled = strategies.sort(() => 0.5 - Math.random())
  return shuffled.slice(0, Math.min(3, strategies.length))
}

export default AIStrategySection
