/**
 * Test script for Cloudflare Agent Worker
 * Sends requests to the agent and prints AI responses
 */

const WORKER_URL = 'https://agentfs-cloudflare-example.txdygl.workers.dev/chat';

/**
 * Send a message to the agent and get the response
 * @param {string} message - The message to send
 * @returns {Promise<string>} - The AI response
 */
async function chatWithAgent(message) {
  try {
    console.log('Sending request...');
    const response = await fetch(WORKER_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ message }),
    });

    console.log('Response status:', response.status);
    console.log('Response headers:', Object.fromEntries(response.headers.entries()));

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP error! status: ${response.status}, body: ${errorText}`);
    }

    // Read the stream as text
    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let result = '';

    console.log('Reading stream...');
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      
      const chunk = decoder.decode(value, { stream: true });
      result += chunk;
      process.stdout.write(chunk); // Print in real-time
    }
    console.log(); // New line after stream ends

    return result;
  } catch (error) {
    console.error('Error:', error.message);
    throw error;
  }
}

/**
 * Main test function
 */
async function runTests() {
  console.log('='.repeat(60));
  console.log('Testing Cloudflare Agent Worker');
  console.log('='.repeat(60));
  console.log();

  const testMessages = [
    'Hello, can you introduce yourself?',
    'Create a file called hello.txt with content "Hello World"',
    'List all files in the current directory',
    'Read the content of hello.txt',
    'What is 2+2?',
    'Create a directory called testdir',
    'Create a file testdir/note.txt with content "This is a note"',
    'List files in testdir',
  ];

  for (let i = 0; i < testMessages.length; i++) {
    const message = testMessages[i];
    console.log(`\n${'─'.repeat(60)}`);
    console.log(`Test ${i + 1}/${testMessages.length}`);
    console.log(`Message: ${message}`);
    console.log(`${'─'.repeat(60)}`);
    
    try {
      const response = await chatWithAgent(message);
      console.log('Response:', response);
    } catch (error) {
      console.error('Failed:', error.message);
    }

    // Add a small delay between requests
    if (i < testMessages.length - 1) {
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }

  console.log('\n' + '='.repeat(60));
  console.log('All tests completed!');
  console.log('='.repeat(60));
}

// Run the tests
runTests().catch(console.error);