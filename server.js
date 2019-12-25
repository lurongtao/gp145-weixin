let path = require('path')
let Koa = require('koa')
let Router = require('koa-router')
let static = require('koa-static')
let bodyparser = require('koa-bodyparser')
let views = require('koa-views')
let app = new Koa()

app.use(static('./public'))
app.use(bodyparser())
app.use(views(path.join(__dirname, './view'), {
  extension: 'ejs'
}))

let weixinRouter = require('./router/')

const weixin = new Router()
weixin.use('/', weixinRouter.routes())

app.use(weixin.routes())

app.listen(3333, () => {
  console.log('localhost:3333')
})