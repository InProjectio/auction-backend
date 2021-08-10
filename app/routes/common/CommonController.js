const express = require('express')
const db = require('../../models')
const { User } = db
const axios = require('axios')
const config = require('../../../config')
const cf = require('../../helpers/CF')
const FireBaseService = require('../../helpers/FireBaseService')
const _ = require('lodash')
const format = require('string-format')

// send mail manager unit
const saveFcmToken = async (fcmToken, userId, isUnSubcribeTopic = false) => {
  try {
    let topic = `${config.TOPIC_USER}_${userId}`
    User.findByIdAndUpdate(userId, { topic: topic }, (err) => {
      if (err) throw err
      if (isUnSubcribeTopic) {
        FireBaseService.subcribeTopic(fcmToken, topic)
        FireBaseService.subcribeTopic(fcmToken, config.TOPIC_ALL_USER)
      } else {
        FireBaseService.unSubcribeTopic(fcmToken, topic)
      }
    })

  } catch (error) {
    console.log(error)
  }
}

const validCapcha3 = async (token, ip) => {
  const verificationUrl = format(config.recaptchaLink, config.secretKeyGoogleCaptcha, token, ip)
  let result = await axios.get(verificationUrl)
  return result && result.data && result.data.success
}

module.exports = {
  saveFcmToken,
  validCapcha3,
}
