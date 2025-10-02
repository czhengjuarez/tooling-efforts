/**
 * Test script for the Tool Evaluation Agent
 * Run with: node test-agent.js
 */

const testRequests = [
  "I need tools for marketing automation and social media management",
  "Looking for development tools to improve code quality and deployment",
  "Need sales and CRM tools for a B2B startup",
  "Tools for remote team collaboration and project management"
];

async function testEvaluation(request) {
  console.log('\n' + '='.repeat(80));
  console.log(`Testing: "${request}"`);
  console.log('='.repeat(80));

  try {
    const response = await fetch('http://localhost:3001/api/evaluate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ request })
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    
    console.log(`\n✅ Received ${data.tools.length} tool suggestions:\n`);

    // Group by quadrant
    const byQuadrant = {
      q1: [],
      q2: [],
      q3: [],
      q4: []
    };

    data.tools.forEach(tool => {
      byQuadrant[tool.quadrant].push(tool);
    });

    const quadrantNames = {
      q1: 'Q1: Quick Wins (High Impact, Low Effort)',
      q2: 'Q2: Major Projects (High Impact, High Effort)',
      q3: 'Q3: Fill-ins (Low Impact, Low Effort)',
      q4: 'Q4: Time Wasters (Low Impact, High Effort)'
    };

    Object.entries(byQuadrant).forEach(([quadrant, tools]) => {
      if (tools.length > 0) {
        console.log(`\n📊 ${quadrantNames[quadrant]}`);
        console.log('-'.repeat(80));
        tools.forEach(tool => {
          console.log(`  • ${tool.name}`);
          console.log(`    ${tool.description}`);
          console.log(`    💡 ${tool.benefit}`);
          console.log(`    📈 Impact: ${tool.impact}/10 | ⚡ Effort: ${tool.effort}/10`);
          console.log(`    ${tool.reasoning}`);
          console.log();
        });
      }
    });

    return data;
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    return null;
  }
}

async function runAllTests() {
  console.log('🚀 Starting Tool Evaluation Agent Tests');
  console.log('Make sure the server is running on http://localhost:3001\n');

  for (const request of testRequests) {
    await testEvaluation(request);
    // Small delay between tests
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  console.log('\n' + '='.repeat(80));
  console.log('✅ All tests completed!');
  console.log('='.repeat(80));
}

// Run tests
runAllTests().catch(console.error);
