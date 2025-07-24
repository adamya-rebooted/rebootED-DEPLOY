#!/usr/bin/env node

const { spawn } = require('child_process');
const os = require('os');

function runPythonBackend() {
  const isWindows = os.platform() === 'win32';
  
  console.log(`🐍 Starting Python FastAPI backend...`);
  
  // Command to activate venv and run server
  const command = isWindows
    ? `venv\\Scripts\\activate && python run_server.py`
    : `source venv/bin/activate && python run_server.py`;
    
  const pythonProcess = spawn(command, {
    shell: true, // Required for running multiple commands
    stdio: 'inherit',
    cwd: process.cwd() // Run from project root
  });
  
  pythonProcess.on('error', (error) => {
    console.error('❌ Failed to start Python backend:', error.message);
    process.exit(1);
  });
  
  pythonProcess.on('close', (code) => {
    if (code !== 0) {
      console.error(`❌ Python backend exited with code ${code}`);
      process.exit(code);
    }
  });
  
  // Handle shutdown
  process.on('SIGINT', () => {
    console.log('\n🛑 Shutting down Python backend...');
    pythonProcess.kill('SIGINT');
  });
  
  process.on('SIGTERM', () => {
    console.log('\n🛑 Terminating Python backend...');
    pythonProcess.kill('SIGTERM');
  });
}

runPythonBackend(); 