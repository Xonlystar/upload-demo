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
        target: 'https://shouzhan1-p.51fubei.com',
        changeOrigin: true,
        pathRewrite: {
          '^/admin': '/admin'
        }
      }
    }
  }
}
