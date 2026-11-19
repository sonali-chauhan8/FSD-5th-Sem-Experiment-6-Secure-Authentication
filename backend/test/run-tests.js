const { spawn, execSync } = require('child_process');
const net = require('net');
const path = require('path');
const fs = require('fs');

const MONGOD_PATH = 'C:\\Program Files\\MongoDB\\Server\\8.2\\bin\\mongod.exe';
const DB_PATH = 'C:\\Users\\anmol\\.gemini\\antigravity\\scratch\\mongodb-data';

function checkMongoRunning() {
  return new Promise((resolve) => {
    const socket = net.createConnection({ port: 27017, host: '127.0.0.1' }, () => {
      socket.end();
      resolve(true);
    });
    socket.on('error', () => {
      resolve(false);
    });
  });
}

async function main() {
  const isRunning = await checkMongoRunning();
  let mongodProcess = null;

  if (!isRunning) {
    if (!fs.existsSync(DB_PATH)) {
      fs.mkdirSync(DB_PATH, { recursive: true });
    }
    console.log('[Runner] Starting MongoDB instance on 127.0.0.1:27017...');
    mongodProcess = spawn(MONGOD_PATH, [
      '--dbpath', DB_PATH,
      '--port', '27017',
      '--bind_ip', '127.0.0.1',
    ]);

    // Wait until mongod is ready
    let attempts = 0;
    while (attempts < 20) {
      await new Promise((r) => setTimeout(r, 400));
      const ready = await checkMongoRunning();
      if (ready) {
        console.log('[Runner] MongoDB started successfully.');
        break;
      }
      attempts++;
    }
  } else {
    console.log('[Runner] MongoDB is already running on port 27017.');
  }

  // Run the test suite
  console.log('[Runner] Executing test-suite.js...');
  const testProc = spawn('node', [path.join(__dirname, 'test-suite.js')], {
    stdio: 'inherit',
    env: process.env,
  });

  testProc.on('exit', (code) => {
    if (mongodProcess && mongodProcess.pid) {
      try {
        execSync(`taskkill /pid ${mongodProcess.pid} /T /F`);
      } catch (e) {}
    }
    process.exit(code || 0);
  });
}

main().catch((err) => {
  console.error('[Runner Fatal Error]:', err);
  process.exit(1);
});
