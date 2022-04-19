const path = require('path')
const prettyData = require('pretty-data')
const { minify } = require('terser')

const formatSizeUnits = bytes => {
  if (bytes >= 1073741824) {
    bytes = (bytes / 1073741824).toFixed(2) + ' GB'
  } else if (bytes >= 1048576) {
    bytes = (bytes / 1048576).toFixed(2) + ' MB'
  } else if (bytes >= 1024) {
    bytes = (bytes / 1024).toFixed(2) + ' KB'
  } else if (bytes > 1) {
    bytes = bytes + ' bytes'
  } else if (bytes === 1) {
    bytes = bytes + ' byte'
  } else {
    bytes = '0 bytes'
  }
  return bytes
}

let totalSize = 0
let totalFile = 0
let totalMinSize = 0

exports = module.exports = (options = { enabled: true }) => {
  const { enabled, wxml, wxss, js, json, compress } = {
    enabled: true,
    wxml: true,
    wxss: false,
    js: true,
    json: true,
    compress: {
      drop_console: true,
      drop_debugger: true
    },
    ...options
  }

  return function () {
    if (!enabled) return

    this.register('process-done', () => {
      this.logger.info(
        'terser',
        `File Count: ${totalFile}, Original Size: ${formatSizeUnits(totalSize)}, Mini Size: ${formatSizeUnits(totalSize - totalMinSize)}, Ratio: ${(1 - totalMinSize / totalSize).toFixed(2) * 100}%`
      )

      // Clear data
      totalFile = 0
      totalSize = 0
      totalMinSize = 0
    })

    this.register('output-file', async ({ filename, code: orginiCode, encoding }) => {
      const ext = path.extname(filename)
      totalFile++
      totalSize += orginiCode.length

      switch (ext) {
        case '.wxml':
          if (wxml) {
            const code = await prettyData.pd.xmlmin(orginiCode)
            totalMinSize += code.length
            return Promise.resolve({ filename, code, encoding })
          }
          break
        case '.wxss':
          if (wxss) {
            const code = await prettyData.pd.cssmin(orginiCode)
            totalMinSize += code.length
            return Promise.resolve({ filename, code, encoding })
          }
          break
        case '.js':
          if (js) {
            const { code } = await minify({ [filename]: orginiCode }, { ecma: 5, compress })
            totalMinSize += code.length
            return Promise.resolve({ filename, code, encoding })
          }
          break
        case '.json':
          if (json) {
            const code = await prettyData.pd.jsonmin(orginiCode)
            totalMinSize += code.length
            return Promise.resolve({ filename, code, encoding })
          }
          break
      }
      return { filename, code: orginiCode, encoding }
    })
  }
}
