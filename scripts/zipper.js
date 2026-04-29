const os = require('os')
const { exec } = require('child_process')

switch (os.platform()) {
  case 'darwin':
    exec('tar zcvf dist.tar.gz dist && rm -rf dist')
    break
  case 'win32':
    exec('tar zcvf dist.tar.gz dist && rmdir /q /s dist')
    break
}
