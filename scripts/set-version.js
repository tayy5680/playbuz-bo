const fs = require('fs')

const setConfig = (version) => {
  const content = `export const VERSION = '${version}'\n`
  fs.writeFile('src/configs/version.js', content, 'utf-8', (err) => {
    if (err) throw err
    console.log(`
      ******************************
        > VERSION: ${version}
      ******************************
    `)
  })
}

const readPackage = () => {
  const packageText = fs.readFileSync('./package.json', 'utf8')
  const version = JSON.parse(packageText).version.toString() || 'none'
  setConfig(version)
}

readPackage()
