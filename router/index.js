const Router = require('koa-router')

const router = new Router()

const { weixin } = require('../controller/weixin')

router.get('weixin', weixin)

module.exports = router