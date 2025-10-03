import { useState } from 'react';
import Icon from './Icon';

/**
 * AIToolsSectionV2 - Uses Cloudflare Agent instead of requiring user API keys
 * Users simply describe what tools they need, and the agent evaluates and suggests tools
 */
const AIToolsSectionV2 = ({ onGenerateTools, onClearAINotes, onClearAllNotes }) => {
  const [userRequest, setUserRequest] = useState('');
  const [numTools, setNumTools] = useState(10);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState(null);

  // Determine API endpoint based on environment
  const getApiEndpoint = () => {
    // In production, use the Cloudflare Worker URL
    // In development, use local proxy
    if (import.meta.env.PROD) {
      return 'https://audit-tool.coscient.workers.dev/api/evaluate';
    }
    return 'http://localhost:3001/api/evaluate';
  };

  const handleGenerateTools = async () => {
    if (!userRequest.trim()) {
      setError('Please describe what AI tools you are looking for');
      return;
    }

    // Clear existing AI-generated sticky notes before generating new ones
    onClearAINotes();
    console.log('🧹 Auto-cleared previous AI suggestions for new prompt');

    setIsGenerating(true);
    setError(null);
    
    try {
      const response = await fetch(getApiEndpoint(), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ request: userRequest.trim(), numTools: numTools })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error);
      }

      // Transform the tools to match the expected format
      let tools = data.tools.map(tool => ({
        name: tool.name,
        quadrant: tool.quadrant,
        description: tool.description,
        impact: tool.impact,
        effort: tool.effort,
        reasoning: tool.reasoning
      }));

      // Limit to requested number of tools
      if (tools.length > numTools) {
        tools = tools.slice(0, numTools);
      }

      onGenerateTools(tools, 'cloudflare-agent', null);
    } catch (error) {
      console.error('Error generating tools:', error);
      setError(`Failed to generate tools: ${error.message}`);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleGenerateTools();
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-8 mb-8">
      {/* Header Section */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <Icon name="robot" className="w-8 h-8 text-gray-700" />
          <div>
            <h2 className="text-2xl font-semibold text-gray-900">AI Tool Evaluator</h2>
            <p className="text-sm text-gray-600">Powered by Cloudflare AI - No API keys required</p>
            <p className="text-xs text-amber-600 mt-1">⚠️ AI knowledge may be outdated. Verify current tool status before deciding.</p>
          </div>
        </div>
        <div className="inline-flex items-center bg-green-50 text-green-700 px-3 py-1 rounded-full text-sm">
          <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
          Ready
        </div>
      </div>

      {/* Input Section */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-3">
          What AI tools are you looking for?
        </label>
        <textarea
          value={userRequest}
          onChange={(e) => setUserRequest(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Example: 'I need tools for marketing automation and social media management' or 'Looking for development tools to improve code quality and deployment'"
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors resize-none"
          rows={3}
          disabled={isGenerating}
        />
        <div className="mt-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <label className="text-sm text-gray-700">Number of tools:</label>
            <input
              type="number"
              min="1"
              max="20"
              value={numTools}
              onChange={(e) => setNumTools(Math.min(20, Math.max(1, parseInt(e.target.value) || 10)))}
              className="w-16 px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm"
              disabled={isGenerating}
            />
          </div>
          <div className="flex items-center gap-1 text-xs text-gray-500">
            <Icon name="info" className="w-3 h-3" />
            <span>Be specific for better recommendations • Previous AI suggestions will be cleared</span>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 text-sm">
          {error}
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-3 mb-6">
        <button
          onClick={handleGenerateTools}
          disabled={isGenerating || !userRequest.trim()}
          className="flex-1 bg-primary-500 hover:bg-primary-600 disabled:bg-gray-400 text-white font-medium px-6 py-3 rounded-lg transition-colors disabled:cursor-not-allowed"
        >
          {isGenerating ? (
            <span className="flex items-center justify-center">
              <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Analyzing...
            </span>
          ) : (
            <span className="flex items-center justify-center gap-2">
              <Icon name="sparkles" className="w-4 h-4" />
              Generate Tool Suggestions
            </span>
          )}
        </button>
        <button
          onClick={onClearAINotes}
          className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium px-4 py-3 rounded-lg transition-colors flex items-center gap-2"
          title="Clear AI-generated sticky notes only"
        >
          <Icon name="trash" className="w-4 h-4" />
          Clear AI
        </button>
        <button
          onClick={onClearAllNotes}
          className="bg-gray-600 hover:bg-gray-700 text-white font-medium px-4 py-3 rounded-lg transition-colors flex items-center gap-2"
          title="Clear ALL sticky notes (including manual ones)"
        >
          <Icon name="trash" className="w-4 h-4" />
          Clear All
        </button>
      </div>

      {/* Legend and Instructions */}
      <div className="border-t border-gray-200 pt-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Legend */}
          <div>
            <h3 className="text-sm font-medium text-gray-900 mb-3 flex items-center gap-2">
              <Icon name="book" className="w-4 h-4 text-gray-600" />
              Sticky Note Legend
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <span className="bg-primary-500 text-white text-xs px-2 py-1 rounded font-medium flex items-center gap-1">
                  <Icon name="lightbulb" className="w-3 h-3" />
                  8.5
                </span>
                <span className="text-gray-600">Impact Score - Business value (1-10, higher is better)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="bg-purple-500 text-white text-xs px-2 py-1 rounded font-medium flex items-center gap-1">
                  <Icon name="lightning" className="w-3 h-3" />
                  4.2
                </span>
                <span className="text-gray-600">Effort Score - Implementation complexity (1-10, lower is easier)</span>
              </div>
            </div>
          </div>

          {/* How it works */}
          <div>
            <h3 className="text-sm font-medium text-gray-900 mb-3">How it works:</h3>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• AI analyzes your needs using Cloudflare Workers</li>
              <li>• Each tool gets impact & effort scores</li>
              <li>• Tools are placed in quadrants automatically</li>
              <li>• Drag sticky notes to reorganize as needed</li>
            </ul>
            
            <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
              <h4 className="text-xs font-medium text-amber-800 mb-2">💡 Getting Better Results:</h4>
              <ul className="text-xs text-amber-700 space-y-1">
                <li>• Be specific: "design tools for mobile apps" vs "design tools"</li>
                <li>• Add context: "for a 5-person startup" or "enterprise team"</li>
                <li>• Include current year: "2024 project management tools"</li>
                <li>• Mention preferences: "prefer open-source" or "must integrate with Slack"</li>
              </ul>
            </div>
          </div>
        </div>
        
        <div className="mt-4 flex items-start gap-2 text-xs text-gray-500">
          <Icon name="info" className="w-3 h-3 flex-shrink-0 mt-0.5" />
          <p>Hover over badges for reasoning • Click "Research" links to verify current tool status</p>
        </div>
      </div>
    </div>
  );
};

export default AIToolsSectionV2;
