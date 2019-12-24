let Koa = require('koa')
let Router = require('koa-router')
let app = new Koa()

let weixinRouter = require('./router/')

const weixin = new Router()
weixin.use('/', weixinRouter.routes())

app.use(weixin.routes())

app.listen(3333, () => {
  console.log('localhost:3333')
})