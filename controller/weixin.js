const crypto = require('crypto')
const getRawBody = require('raw-body')
const contentType = require('content-type')
const querystring = require('querystring')

const { xml2js, genTimestamp, genNonceStr, genTimestampSecond } = require('../utils/tools')
const { get } = require('../utils/http')
const config = require('../config/config')

const db = require('../model/db')

const auth = async (ctx, next) => {
  let token = 'weixin'

  let {
    signature,
    echostr,
    timestamp,
    nonce
  } = ctx.query

  // 1. 将token、timestamp、nonce三个参数进行字典序排序
  let str = [token, timestamp, nonce].sort().join('')
  
  // 2. 将三个参数字符串拼接成一个字符串进行sha1加密
  let selfSign = crypto.createHash('sha1').update(str).digest('hex')

  // 3. signature比较
  if (signature === selfSign) {
    ctx.body = echostr
  } else {
    ctx.body = '非法请求'
  }
}

const autoReply = async (ctx, next) => {
  ctx.type = 'text/plain; charset=utf-8'

  let result = await getRawBody(ctx.req, {
    length: ctx.req.headers['content-length'],
    limit: '1mb',
    encoding: contentType.parse(ctx.req).parameters.charset
  })
  
  let xml = result.toString()

  let { ToUserName, FromUserName } = xml2js(xml)

  let reply = {
    ToUserName: FromUserName,
    FromUserName: ToUserName,
    CreateTime: genTimestamp(),
    MsgType: 'text',
    Content: '<a href="http://jiaxinmxx.top/cookbook">美食大全</a>'
  }


  // render方法是个异步方法
  await ctx.render('reply', reply)
}

const _getTicket = async () => {
  // 1. 获取 access_token
  let { access_token } = await get({
    url: `https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=${config.appid}&secret=${config.secret}`
  })

  console.log(access_token)

  // 2. 获得 jsapi_ticket
  let { ticket } = await get({
    url: `https://api.weixin.qq.com/cgi-bin/ticket/getticket?access_token=${access_token}&type=jsapi`
  })

  return ticket
}

const sign = async (ctx, next) => {
  let ticket = ''

  let selectResult = await db('select * from ticket', [])
  if (selectResult.length === 0) {
    ticket = await _getTicket()
    // console.log(ticket)
    await db('insert into ticket(expires, jsapi_ticket) values(?, ?)', [new Date().getTime(), ticket])
  } else {

  }

  // 3. 定义(获取) 参与签名的字段
  let noncestr = genNonceStr()
  let timestamp = genTimestampSecond()
  let fieldObj = {
    noncestr,
    timestamp,
    url: config.url,
    jsapi_ticket: _getTicket()
  }

  // 4. 按照字段名排序
  let orderedFieldObj = Object.keys(fieldObj).sort().reduce((obj, key) => {
    obj[key] = fieldObj[key]
    return obj
  }, {})

  // 5. 生成query
  let query = querystring.stringify(orderedFieldObj, null, null, {
    encodeURIComponent: (str) => {
      return querystring.unescape(str)
    }
  })

  // 6. sha1 加密
  let signature = crypto.createHash('sha1').update(query).digest('hex')

  // 7. 返回接口
  ctx.body = {
    appId: config.appid,
    timestamp,
    nonceStr: noncestr,
    signature
  }
}

exports.auth = auth
exports.autoReply = autoReply
exports.sign = sign