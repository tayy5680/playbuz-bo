const os = require('os')
const { exec } = require('child_process')

switch (os.platform()) {
  case 'darwin':
    exec('rm -rf node_modules')
    break
  case 'win32':
    exec('rmdir /q /s node_modules')
    break
}
