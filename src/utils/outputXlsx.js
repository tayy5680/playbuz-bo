const XLSX = require('xlsx')

export const outputXlsx = (data, fileName = '') => {
  // 創建一個新的工作簿
  const wb = XLSX.utils.book_new()

  // 創建一個工作表
  const ws = XLSX.utils.json_to_sheet(data)

  // 向工作簿添加工作表
  XLSX.utils.book_append_sheet(wb, ws, fileName || 'Sheet1')

  // 將工作簿寫入 XLSX 檔案
  XLSX.writeFile(wb, `${fileName || 'output'}.xlsx`)
}

export const outputXlsxGameReport = (data, fileName = '') => {
  const wb = XLSX.utils.book_new()

  data.forEach((item) => {
    const ws = XLSX.utils.json_to_sheet([...item.totalData, {}, ...item.gameData])
    XLSX.utils.book_append_sheet(wb, ws, item.sheetName)
  })

  XLSX.writeFile(wb, `${fileName || 'output'}.xlsx`)
}
