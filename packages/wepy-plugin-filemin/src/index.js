const _prettyData = require('pretty-data')

function FileMinPlugin(options = {}) {
  return function () {
    let config = {
      enable: true,
      wxml: true, 
      json: true,
      wxss: false
    }
    config = Object.assign(config, options)
    this.register('build-components', comps => {
        if (!config.enable) {
            return comps
          }  
          let t = null    
          let c = null        
          for (let i = 0, len = comps.length; i < len; i++) {
            t = comps[i].sfc.template
            c = comps[i].sfc.config
            if (config.wxml && /^(wxml|xml)$/.test(t.lang)) {
              t.outputCode = _prettyData.pd.xmlmin(t.outputCode)
            }
            if (config.json && /^json$/.test(c.lang)) {
                c.outputCode = _prettyData.pd.jsonmin(c.outputCode)
              }
              if (config.wxss && /^wxss$/.test(c.lang)) {
                c.outputCode = _prettyData.pd.cssmin(c.outputCode)
              }
            }
            return comps
          })
          this.register('build-apps', apps => {
            if (!config.enable) {
                return apps
              }  
              let t = null    
              let c = null        
              for (let i = 0, len = apps.length; i < len; i++) {
                t = apps[i].sfc.template
                c = apps[i].sfc.config
                if (config.wxml && /^(wxml|xml)$/.test(t.lang)) {
                  t.outputCode = _prettyData.pd.xmlmin(t.outputCode)
                }
                if (config.json && /^json$/.test(c.lang)) {
                    c.outputCode = _prettyData.pd.jsonmin(c.outputCode)
                  }
                  if (config.wxss && /^wxss$/.test(c.lang)) {
                    c.outputCode = _prettyData.pd.cssmin(c.outputCode)
                  }
                }
                return apps
              })
              this.register('build-vendors', vendors => {
                if (!config.enable) {
                    return vendors
                  }  
                  let t = null    
                  let c = null        
                  for (let i = 0, len = vendors.length; i < len; i++) {
                    t = vendors[i].sfc.template
                    c = vendors[i].sfc.config
                    if (config.wxml && /^(wxml|xml)$/.test(t.lang)) {
                      t.outputCode = _prettyData.pd.xmlmin(t.outputCode)
                    }
                    if (config.json && /^json$/.test(c.lang)) {
                        c.outputCode = _prettyData.pd.jsonmin(c.outputCode)
                      }
                      if (config.wxss && /^wxss$/.test(c.lang)) {
                        c.outputCode = _prettyData.pd.cssmin(c.outputCode)
                      }
                    }
                    return vendors
                  })
        }
      }
      
      module.exports = FileMinPlugin 