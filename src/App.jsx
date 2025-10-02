import { useState } from 'react'
import AuditBoard from './components/AuditBoard'

function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-semibold text-gray-900 mb-2">
            AI Tool Adoption Evaluator
          </h1>
          <p className="text-gray-600">
            Evaluate AI tools by impact and effort - No API keys required!
          </p>
        </div>
        <AuditBoard />
      </div>
    </div>
  )
}

export default App
