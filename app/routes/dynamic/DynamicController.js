const express = require('express')
const bodyParser = require('body-parser')
const queryString = require('query-string')
const router = express.Router()
const cf = require('../../helpers/CF')
const ResponseCode = require('../../../ResponseCode')
// const moment = require('moment')
// const message = require('../../../message')
const _ = require('lodash')
const axios = require('axios').default
const routerList = require('../../../routerDynamic').routerList

router.use(bodyParser.json())

const warperResult = (res, result) => {
  // console.log('result', result)
  if (result.headers['content-type'].indexOf('text') !== -1) {
    return res.status(result.status).send(result.data)
  }
  return res.status(result.status).send(cf.buildResponseObject({
    code: result.data && result.data.code,
    message: result && result.data && result.data.message || '',
    data: result && result.data ? result.data.data : {}
  }))
}

const warperError = (res, error) => {
  // console.error(error)
  let { status , data } = error.response || {}
  // console.log(data.message)
  return res.status(status || ResponseCode.ERROR).send(cf.buildResponseObject({
    code: data && data.code,
    message: data && data.message
  }))
}

// dynamic router
console.log('-----------Start Run dynamic router--------')
routerList.forEach((item) => {
  let url = `${item.url}${!_.isEmpty(item.params) ? '/' + item.params.join('/') : ''}`
  console.log('method:   ', item.method, '    url:', url)
  if (item.method === 'get') {
    router.get(url.trim(), item.roles || [], async (req, res) => {
      try {

        console.log(url.trim())

        let lang = req.headers['lang'] || 'vi'
        let urlRequest = item.urlRequest
        if (!_.isEmpty(req.query)) {
          urlRequest += `?${queryString.stringify(req.query)}`
        }
        let config = { headers: { lang } }
        if (req.user) {
          const result = {
            _id: req.user._id, 
            unit: req.user.unit && req.user.unit.toString(),
            email: req.user.email, 
            phoneNumber: req.user.phoneNumber,
            roles: req.user.roles
          }
          if (!_.isEmpty(req.user.unitRoles)) {
            result.unitRoles = req.user.unitRoles
          }
          config.headers.user =  JSON.stringify(result)
        }
        let result = await axios.get(urlRequest, config)
        return warperResult(res, result)
      } catch (error) {
        console.log(error)
        return warperError(res, error)
      }
    })
  } else if (item.method === 'post') {
    router.post(url.trim(), item.roles || [], async (req, res) => {
      try {

        console.log(url.trim())

        let lang = req.headers['lang'] || 'vi'
        let config = { headers: { lang } }
        if (req.user) {
          const result = {
            _id: req.user._id, 
            email: req.user.email, 
            unit: req.user.unit && req.user.unit.toString(),
            roles: req.user.roles
          }
          if (!_.isEmpty(req.user.unitRoles)) {
            result.unitRoles = req.user.unitRoles
          }
          config.headers.user =  JSON.stringify(result)
        }
        let result = await axios.post(item.urlRequest, req.body, config)
        return warperResult(res, result)
      } catch (error) {
        console.error(error)
        return warperError(res, error)
      }
    })
  } else if (item.method === 'put') {
    router.put(url.trim(), item.roles || [], async (req, res) => {
      try {

        console.log(url.trim())

        let lang = req.headers['lang'] || 'vi'
        let urlRequest = item.urlRequest
        if (req.params) {
          Object.keys(req.params).forEach(key => {
            urlRequest += '/' + req.params[key]
          })
        }
        let config = { headers: { lang } }
        if (req.user) {
          const result = {
            _id: req.user._id, 
            unit: req.user.unit && req.user.unit.toString(),
            email: req.user.email, 
            phoneNumber: req.user.phoneNumber,
            roles: req.user.roles
          }
          if (!_.isEmpty(req.user.unitRoles)) {
            result.unitRoles = req.user.unitRoles
          }
          config.headers.user =  JSON.stringify(result)
        }
        let result = await axios.put(urlRequest, req.body, config)
        return warperResult(res, result)
      } catch (error) {
        console.log(error)
        return warperError(res, error)
      }
    })
  }
})
console.log('-----------End Run dynamic router--------')


module.exports = router