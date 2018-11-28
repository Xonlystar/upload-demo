const Koa = require('koa2')
const fs = require('fs')
const path = require('path')
const koaBody = require('koa-body')
const Router = require('koa-router')
const static = require('koa-static') 
const app = new Koa()
const router = new Router()
app.use(static( path.join( __dirname, './www') )).use(router.routes())
router.post('/uploadFile', koaBody({multipart: true}), async (ctx, next) => {
  let file = ctx.request.files.file
  // 创建可读流
  const reader = fs.createReadStream(file.path)
  let filename = +new Date() + file.name
  let filePath =  path.join(__dirname, './www/upload/') + `/${filename}`
  // 创建可写流
  const upStream = fs.createWriteStream(filePath)
  // 可读流通过管道写入可写流
  reader.pipe(upStream)
  // return ctx.body =  `localhost:3000/upload/${file.name}`
  return ctx.body =  `<script>window.location.href="/upload/${filename}"</script>`
})
app.listen(3000, () => { console.log('启动成功') })
