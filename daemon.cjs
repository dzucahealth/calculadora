const { spawn } = require('child_process');
const fs = require('fs');

function start() {
  const child = spawn('npx', ['next', 'dev', '-p', '3000'], {
    cwd: '/home/z/my-project',
    stdio: ['ignore', fs.openSync('/home/z/my-project/dev.log', 'a'), fs.openSync('/home/z/my-project/dev.log', 'a')],
    detached: true,
  });
  child.unref();
  child.on('exit', () => {
    fs.appendFileSync('/home/z/my-project/dev.log', '\n--- RESTARTING ---\n');
    setTimeout(start, 1000);
  });
}
start();
