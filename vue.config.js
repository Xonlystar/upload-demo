const path = require('path')
function resolve (dir) {
  return path.join(__dirname, dir)
}

module.exports = {
  // 基本路径
  baseUrl: '/',
  // 输出文件目录
  outputDir: 'dist',
  // eslint-loader 是否在保存的时候检查
  lintOnSave: true,
  // webpack配置
  chainWebpack: (config) => {
    config.resolve.alias
      .set('@$', resolve('src'))
  },
  configureWebpack: () => {},
  devServer: {
    proxy: {
      '/admin': {
        // 目标 API 地址
        // target: 'https://shouzhan1-p-test.51fubei.com',
        // target: 'https://shouzhan1-p-beta.51fubei.com',
        target: 'https://shouzhan1-p.51fubei.com',
        changeOrigin: true,
        pathRewrite: {
          '^/admin': '/admin'
        }
      }
    }
  }
}
