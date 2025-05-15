const { io } = require('socket.io-client');
const axios = require('axios');

async function runDemo() {
  // Create a room
  const roomId = 'demo-room-' + Math.random().toString(36).substring(7);
  const userId = 'user-' + Math.random().toString(36).substring(7);

  console.log('🚀 Starting demo...');
  console.log(`Room ID: ${roomId}`);
  console.log(`User ID: ${userId}`);

  // Connect to WebSocket
  const socket = io('http://localhost:3001', {
    query: { roomId, userId }
  });

  // Test code execution
  const testCode = `
    console.log('Hello from the container!');
    console.log('Current time:', new Date().toISOString());
    console.log('Node version:', process.version);
  `;

  try {
    // Execute code
    console.log('\n📝 Executing code...');
    const response = await axios.post('http://localhost:3000/execute', {
      code: testCode,
      roomId
    });
    console.log('Output:', response.data.output);

    // Test real-time collaboration
    console.log('\n👥 Testing real-time collaboration...');
    socket.emit('code-change', {
      roomId,
      code: '// This is a collaborative edit\nconsole.log("Real-time sync working!");'
    });

    // Wait for changes to propagate
    await new Promise(resolve => setTimeout(resolve, 1000));

    console.log('\n✅ Demo completed successfully!');
  } catch (error) {
    console.error('❌ Error during demo:', error.message);
  } finally {
    socket.disconnect();
  }
}

runDemo(); 