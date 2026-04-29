const path = require('path')

const WEBSITE_TITLE = 'XPG Back Office'

module.exports = {
  productionSourceMap: false,
  devServer: {
    proxy: {
      '/api': {
        target: process.env.VUE_APP_API_URL,
        changeOrigin: true,
        pathRewrite: {
          '^/api': '',
        },
      },
    },
    host: process.env.DEV_SERVER_HOST,
    https: true,
  },
  configureWebpack: {
    module: {
      rules: [
        {
          test: /\.mjs$/,
          include: /node_modules/,
          type: 'javascript/auto',
        },
      ],
    },
  },
  chainWebpack: (config) => {
    config.resolve.alias
      .set('@', path.resolve(__dirname, 'src/'))
      .set('~', path.resolve(__dirname, 'src/assets/'))
      .set('vue-i18n', 'vue-i18n/dist/vue-i18n.cjs.js')
    config.plugin('html').tap(args => {
      args[0].title = WEBSITE_TITLE
      args[0].img_url = process.env.VUE_APP_IMG_URL
      return args
    })
    config.plugin('stylelint')
      .use(require('stylelint-webpack-plugin'), [
        {
          files: ['**/*.{vue,htm,html,css,scss}'],
        },
      ])
  },
}
