const _ = require('lodash')
const { line, middleware } = require('../libs/line')
const { middlewareCompose } = require('../libs/helper')
const express = require('express')
const router = express.Router()

const handleEvent = middlewareCompose([
  async ({ req, event }, next) => {
    event.replyMessage = async messages => {
      const replyToken = _.get(event, 'replyToken')
      if (!replyToken) return
      delete event.replyToken
      await line.replyMessage(replyToken, messages)
    }
    await next()
  },
  async ({ req, event }, next) => {
    if (_.get(event, 'type') !== 'message') await next()
    if (_.get(event, 'message.type') !== 'text') await next()
    await event.replyMessage({
      type: 'text',
      text: _.get(event, 'message.text'),
    })
  },
  async ({ req, event }, next) => {
    await event.replyMessage({
      type: 'text',
      text: '我還在努力學習中',
    })
  },
])

router.post(middleware, async (req, res) => {
  const events = _.get(req, 'body.events', [])
  await Promise.all(_.map(events, event => handleEvent({ req, events })))
  res.json({})
})

module.exports = router
