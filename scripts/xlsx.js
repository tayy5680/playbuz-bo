const fs = require('fs')
const xlsx = require('xlsx')

const SHEETS_LABEL = 'FRONT _BACKGROUND'
const KEY_CODE = 'key'

const parseXlsx = (file) => {
  const data = xlsx.readFile(file)
  const character = []
  const target = Object.entries(data.Sheets[SHEETS_LABEL]).reduce((acc, cur) => {
    const [key, value] = cur

    if (!value) return acc

    const int = key.match(/\d+/)?.[0]
    const type = key.match(/[A-Z]/)?.[0]
    if (!int || !type) return acc

    if (int === '1') {
      const key = value.v.match(/(?<=:)\S+$/)
      acc[key] = {}
      character.push(type)
      return acc
    }

    const curIndex = character.indexOf(type)
    const curKey = Object.keys(acc)[curIndex]
    acc[curKey][int] = value.v
    return acc
  }, {})

  for (const [key, value] of Object.entries(target)) {
    if (key === KEY_CODE) continue

    const json = {}
    for (const [subkey, subvalue] of Object.entries(target[KEY_CODE])) {
      json[subvalue] = value[subkey]
    }

    fs.writeFile(`./src/locales/${key}.json`, JSON.stringify(json), function () {})
  }

  fs.unlinkSync(file)
}

parseXlsx('./xlsx.xlsx')
