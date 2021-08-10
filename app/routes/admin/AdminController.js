const express = require('express')
const bodyParser = require('body-parser')
const jwt = require('jsonwebtoken')
const router = express.Router()
const _ = require('lodash')
const axios = require('axios')
const db = require('../../models')
const { User } = db
const cf = require('../../helpers/CF')
const ResponseCode = require('../../../ResponseCode')
const moment = require('moment')
const { authPassport, validatorData } = require('../../middlewares')
const message = require('../../../message')


router.put('/private/contact/change-status/:contactId', authPassport.checkRolePermissions, async (req, res) => {
  const lang = req.headers['lang'] || 'vi'
  const { contactId } = req.params
  const { status } = req.body
  try {
    const sysdate = moment().format('YYYY-MM-DD HH:mm')
    const contactUpdate = await Contact.findByIdAndUpdate(contactId, { status: status, updatedAt: sysdate })
    if (!contactUpdate) {
      return cf.responseError(res, message[lang]['contact.not.found'])
    }
    return cf.responseSuccess(res, message[lang]['request.success'])
  } catch (e) {
    return cf.responseError(res, message[lang]['system.error'])
  }
})

module.exports = router