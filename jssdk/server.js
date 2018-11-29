
let express = require('express'),
	jade = require('jade')
let logger = require('morgan')
let  bodyParser = require('body-parser')
let methodOverride = require('method-override')
let cookieParser = require('cookie-parser')
let compression = require('compression')
let app = express()

app.set('view engine', 'jade') // 设置模板引擎
app.set('views', './views')  // 设置模板相对路径(相对当前目录)

app.locals.basedir = './'

let port = 4567   //BAE 百度应用引擎默认端口号
//中间件定义
app.use(logger('dev'))
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))
app.use(methodOverride('X-HTTP-Method-Override'))
app.use(cookieParser())
app.use(compression())
//静态资源

app.use(express.static('./static'))

//启动服务
app.listen(port, function() {
	console.log('服务启动成功！请访问 http://localhost:' + port)
})


//启动路由分发
require('./router/index').init(app)

