var postcss = require('postcss')
var reduceFunctionCall = require('reduce-function-call')
var helpers = require('postcss-message-helpers')
var modularScale = require('modular-scale')

module.exports = postcss.plugin('postcss-modular-scale', function (opts) {
  opts = opts || {}
  var declarations = []
  var bases
  var ratios

  return function (css) {

    css.eachDecl(function transformDecl(decl) {
      if (!decl.value) {
        return
      }

      if (decl.parent.selector === ':root') {

         if (decl.prop === '--ms-bases') {
           bases = decl.value.split(',').map(function(base) {
             return parseInt(base, 10)
           })
         }

         if (decl.prop === '--ms-ratios') {
           ratios = decl.value.split(',').map(function(ratio) {
             return parseInt(ratio, 10)
           })
         }

      }

      if (decl.value.indexOf("ms(") !== -1) {
        declarations.push(decl)
      }

    })

    ms = modularScale({
      bases: bases,
      ratios: ratios
    })

    console.log('bases', bases)
    declarations.forEach(function(decl) {
      decl.value = helpers.try(function transformMS() {
        return reduceFunctionCall(decl.value, "ms", function reduceMS(body, fn) {
          return  ms(parseInt(body,10))
        })
      }, decl.source)
    })
  }
})

