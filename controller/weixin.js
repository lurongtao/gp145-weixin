const weixin = async (ctx, next) => {
  await ctx.body = 'abcd'
}

exports.weixin = weixin