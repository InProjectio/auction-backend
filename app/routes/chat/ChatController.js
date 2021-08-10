const express = require('express')
const moment = require('moment')
const config = require('../../../config')
const cf = require('../../helpers/CF')
const { Conversation } = require('../../models').dbInproject
const FireBaseService = require('../../helpers/FireBaseService')
const ChatService = require('../../socket/ChatService')
const router = express.Router()
const { authPassport, validatorData } = require('../../middlewares')
const message = require('../../../message')
const authJwt = require('../../middlewares/authJwt')

router.post('/public/test-push', async (req, res) => {
  FireBaseService.sendMessage({ title: req.body.title, message: req.body.message, fcmToken: req.body.fcmToken })
  return cf.responseSuccess(res, message[lang]['request.success'])
})

router.get('/find-messages', authJwt.authen, async (req, res) => {

  let { page, pageSize, conversationId } = req.query
  const lang = req.headers['lang'] || 'vi'
  let messsages = await ChatService.findMesages(
    {
      page: page || 1,
      pageSize: pageSize || config.pageSizeChat,
      conversationId
    })
  return cf.responseSuccess(res, message[lang]['request.success'], messsages)
})

router.get('/find-conversations', authJwt.authen, async (req, res) => {
  const lang = req.headers['lang'] || 'vi'
  let conversations = await ChatService.findConversation({
    page: req.query.page || 1,
    pageSize: req.query.pageSize || config.pageSizeConveration,
    user: req.user._id
  })
  return cf.responseSuccess(res, message[lang]['request.success'], conversations)
})

router.get('/find-detail-conversation', authJwt.authen, async (req, res) => {
  let lang = req.headers['lang'] || 'vi'
  let { conversationId } = req.query
  try {
    const data = await Conversation.findById(conversationId).populate([
      {
        path: 'biddingEntity',
        select: 'entityName userMaps company',
        populate: [{
          path: 'userMaps',
          select: 'user phone roleType position email',
          populate: {
            path: 'user',
            select: 'fullname avatar_url'
          }
        }, {
          path: 'company',
          select: 'companyName logo'
        }]
      },
      {
        path: 'tendererEntity',
        select: 'entityName userMaps',
        populate: {
          path: 'userMaps',
          select: 'user phone roleType position email',
          populate: {
            path: 'user',
            select: 'avatar_url fullname'
          }
        }
      },
      {
        path: 'package',
        select: 'packageName',
        populate: {
          path: 'company',
          select: 'companyName logo'
        }
      },
    ]).select('tendererEntity biddingEntity package status ')

    return cf.responseSuccess(res, message[lang]['request.success'], data)
  } catch (error) {
    return cf.responseError(res, message[lang]['system.error'])
  }
})


router.post('/private/register-fcm-token', async (req, res) => {
  const lang = req.headers['lang'] || 'vi'
  await ChatService.registerFcmTokenToAccount({ ...req.body, userId: req.user._id })
  return cf.responseSuccess(res, message[lang]['request.success'])
})


module.exports = router
