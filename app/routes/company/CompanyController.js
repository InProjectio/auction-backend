const express = require('express')
const _ = require('lodash')
const router = express.Router()
const mongoose = require('mongoose')
const jwt = require('jsonwebtoken')
const { User, Company, UserMapping, Entity } = require('../../models').dbInproject
const validatorData = require('../../middlewares').validatorData
const cf = require('../../helpers/CF')
const moment = require('moment')
const message = require('../../../message')
const emailContent = require('../../../emailContent')
const { sendMail } = require('../../helpers/EmailServices')
const format = require('string-format')
const config = require('../../../config')
// const commonController = require('../common/CommonController')
const authJwt = require('../../middlewares/authJwt')

// router.use(bodyParser.json())

router.post('/save-company', authJwt.authen, validatorData.validateCompany, async (req, res) => {
  const lang = req.headers['lang'] || 'vi'
  const sysdate = moment().format('YYYY-MM-DD HH:mm')
  try {

    const userLogin = req.user
    const { companyName, shortName, nationalName, businessType, taxCode, registrationAddress,
      tradingAddress, phone, fax, email, website, founding, numEmployee, representName,
      representPosition, representAddress, careers, companyId, enties, userMaps, packages, logo,
      transactionHash
    } = req.body

    let result

    let userMap = {}

    if (!companyId) {
      const countExist = await Company.countDocuments({ taxCode: taxCode })
      if (countExist > 0) {
        return cf.responseError(res, message[lang]['company.existed'])
      }

      let textSearch = `${cf.trimText(companyName)} ${cf.trimText(shortName)} ${cf.trimText(nationalName)} ${cf.trimText(phone)} ${cf.trimText(email)} ${cf.trimText(representName)} ${cf.trimText(website)}`
      textSearch = await cf.boDauTiengViet(textSearch)
      result = await Company.create({
        companyName,
        shortName,
        nationalName,
        businessType,
        taxCode,
        registrationAddress,
        tradingAddress, phone,
        fax,
        email,
        website,
        founding,
        numEmployee,
        representName,
        representPosition,
        representAddress,
        careers,
        owner: userLogin._id,
        status: 'UNVERIFY',
        textSearch,
        createdAt: sysdate,
        updatedAt: sysdate,
        createdBy: userLogin.username,
        updatedBy: userLogin.username,
        userMaps: [userLogin._id],
        deletedAt: null,
        logo
      })
      textSearch = `${cf.trimText(userLogin.username)} ${cf.trimText(userLogin.email)} ${cf.trimText(userLogin.phone)}`
      textSearch = await cf.boDauTiengViet(textSearch)
      // create user mapping
      userMap = await UserMapping.create({
        user: userLogin._id,
        email: userLogin.email,
        phone: userLogin.phone || null,
        roleType: 'OWNER',
        position: representPosition,
        status: 'ACTIVE',
        state: 'ACCEPT',
        company: result._id,
        sourceType: 'INVITE',
        createdAt: sysdate,
        updatedAt: sysdate,
        createdBy: userLogin.username,
        updatedBy: userLogin.username,
        textSearch: textSearch,
      })
      result.userMaps = [userMap._id]
      await result.save()

      // sendMail(emailContent[lang]['register.success.title'], format(emailContent[lang]['register.success.content'], username), email)
    } else {
      const updatedata = await Company.findById(companyId)
      if (!updatedata) {
        return cf.responseError(res, message[lang]['company.notfound'])
      }
      if (taxCode) {
        const countExistTaxCode = await Company.countDocuments({ _id: { $ne: companyId }, taxCode: cf.trimText(taxCode) })
        if (countExistTaxCode > 0) {
          return cf.responseError(res, message[lang]['taxcode.is.existed'])
        }
        updatedata.taxCode = taxCode
      }

      if (companyName) updatedata.companyName = companyName
      if (shortName) updatedata.shortName = shortName
      if (nationalName) updatedata.nationalName = nationalName
      if (businessType) updatedata.businessType = businessType
      if (registrationAddress) updatedata.registrationAddress = registrationAddress
      if (tradingAddress) updatedata.tradingAddress = tradingAddress
      if (fax) updatedata.fax = fax
      if (email) updatedata.email = email
      if (website) updatedata.website = website
      if (founding) updatedata.founding = founding
      if (numEmployee) updatedata.numEmployee = numEmployee
      if (representName) updatedata.representName = representName
      if (representPosition) updatedata.representPosition = representPosition
      if (representAddress) updatedata.representAddress = representAddress
      if (careers) updatedata.careers = careers
      if (enties) updatedata.enties = enties
      if (userMaps) updatedata.userMaps = userMaps
      if (packages) updatedata.packages = packages
      if (logo) updatedata.logo = logo
      if (transactionHash) updatedata.transactionHash = transactionHash

      updatedata.updatedAt = sysdate
      updatedata.updatedBy = userLogin.username
      let textSearch = `${cf.trimText(updatedata.companyName)} ${cf.trimText(updatedata.shortName)} ${cf.trimText(updatedata.nationalName)} ${cf.trimText(updatedata.phone)} ${cf.trimText(updatedata.email)} ${cf.trimText(updatedata.representName)} ${cf.trimText(updatedata.website)}`
      textSearch = await cf.boDauTiengViet(textSearch)
      result = await updatedata.save()
    }

    return cf.responseSuccess(res, message[lang]['request.success'], { ...result.toObject(), userMapping: userMap })
  } catch (error) {
    console.log(error)
    return cf.responseError(res, message[lang]['system.error'])
  }
})

router.delete('/delete-company/:companyId', authJwt.authen, async (req, res) => {
  try {
    let lang = req.headers['lang'] || 'vi'
    let { companyId } = req.params
    const { mappingId } = req.query
    await Promise.all([
      Company.findByIdAndDelete(companyId),
      UserMapping.findByIdAndDelete(mappingId)
    ])
    return cf.responseSuccess(res, message[lang]['request.success'])
  } catch (e) {
    return cf.responseError(res, message[lang]['system.error'])
  }
})

router.put('/change-status/:companyId', authJwt.authen, async (req, res) => {
  let lang = req.headers['lang'] || 'vi'
  let { companyId } = req.params
  const userLogin = req.user
  const sysdate = moment().format('YYYY-MM-DD HH:mm')
  try {
    const { status } = req.body // VERIFY, UNVERIFY
    if (!['VERIFY', 'UNVERIFY'].includes(status)) {
      return cf.responseError(res, message[lang]['company.status.invalid'])
    }
    const updateDataCompany = await Company.findById(companyId)
    if (!updateDataCompany) {
      return cf.responseError(res, message[lang]['company.notfound'])
    }
    updateDataCompany.status = status
    updateDataCompany.updatedAt = sysdate
    updateDataCompany.updatedBy = userLogin.username
    await updateDataCompany.save()

    if (status === 'VERIFY' && updateDataCompany.userMaps && updateDataCompany.userMaps.length === 1) {
      const updateMapping = await UserMapping.findOneAndUpdate({ user: updateDataCompany.userMaps[0].user, company: companyId },
        { status: 'ACTIVE', updatedAt: sysdate, updatedBy: userLogin.email })
    }
    return cf.responseSuccess(res, message[lang]['request.success'])
  } catch (error) {
    return cf.responseError(res, message[lang]['system.error'])
  }
})

router.get('/find-detail', authJwt.authen, async (req, res) => {
  let lang = req.headers['lang'] || 'vi'
  let { companyId } = req.query
  console.log('comanyId', companyId)
  try {
    const userLogin = req.user
    const userDB = await UserMapping.findOne({ status: 'ACTIVE', state: 'ACCEPT' }).populate({
      path: 'user',
      select: 'status'
    })
    if (!userDB || !userDB.user || userDB.user && userDB.user.status !== 'a') {
      return cf.responseError(res, message[lang]['usermapping.roletype.invalid'])
    }

    let data = await Company.findOne({ _id: companyId, transactionHash: { $ne: null } })
      .populate([{
        path: 'owner',
        select: '_id username email fullname intro avatar_url user_id'
      },
      {
        path: 'packages'
      }
      ])

    console.log('data ===>', data)

    const totalPackageSuccess = (data && data.packages && data.packages.filter((item) => item.status === 'CLOSING').length) || 0
    if (data && data._doc) data._doc.totalPackageSucess = totalPackageSuccess

    return cf.responseSuccess(res, message[lang]['request.success'], data)
  } catch (error) {
    console.log('error ===> ', error)
    return cf.responseError(res, message[lang]['system.error'])
  }
})

router.get('/find-detail-by-token', authJwt.authen, async (req, res) => {
  let lang = req.headers['lang'] || 'vi'
  let { token } = req.query
  try {
    jwt.verify(token, config.secret, async (err, decoded) => {
      if (err) {
        return cf.responseError(res, message[lang]['token.invalid'])
      }
      const { companyId, mappingId } = decoded

      let [data, userMapping] = await Promise.all([Company.findById(companyId)
        .populate([{
          path: 'owner',
          select: '_id username email fullname intro avatar_url user_id'
        },
        {
          path: 'packages'
        }
        ]),
      UserMapping.findById(mappingId)
      ])

      const totalPackageSuccess = (data && data.packages && data.packages.filter((item) => item.status === 'CLOSING').length) || 0
      if (data && data._doc) data._doc.totalPackageSucess = totalPackageSuccess

      return cf.responseSuccess(res, message[lang]['request.success'], { data, userMapping })
    })

  } catch (error) {
    console.log(error)
    return cf.responseError(res, message[lang]['system.error'])
  }
})

router.post('/user-mapping/invite', authJwt.authen, validatorData.validateInviteUser, async (req, res) => {
  let lang = req.headers['lang'] || 'vi'

  const userLogin = req.user
  const sysdate = moment().format('YYYY-MM-DD HH:mm')
  try {
    const { inviteUsers, companyId } = req.body
    const company = await Company.findById(companyId).populate({
      path: 'userMaps',
      select: '_id user email',
      populate: {
        path: 'user',
        select: 'email username'
      }
    })
    if (!company) {
      return cf.responseError(res, message[lang]['company.notfound'])
    }
    let userMappingIds = !_.isEmpty(company.userMaps) ? company.userMaps.map((item) => item._id.toString()) : []

    let userListEmailRegisted = !_.isEmpty(company.userMaps) ? company.userMaps.map((item) => item.email.toString()) : []

    let usersMappingCreate = []

    const emailList = inviteUsers.map((item) => item.email)

    const usersEmailUserMappingExist = await UserMapping.find({ email: { $in: emailList }, status: 'ACTIVE', state: 'ACCEPT' }).select('email')
    if (!_.isEmpty(usersEmailUserMappingExist)) {
      const emailExists = usersEmailUserMappingExist.reduce((str, item) => {
        str += (str ? ',' : '') + item.email
        return str
      }, '')
      return cf.responseError(res, format(message[lang]['usermapping.email.existed'], emailExists))
    }


    const objMapEmailUsername = {}
    for (let i = 0; i < inviteUsers.length; i++) {
      const { roleType, email, phone, detail, attackFiles, position } = inviteUsers[i]

      if (userListEmailRegisted.includes(email)) continue

      const userData = await User.findOne({ email: email })

      const userId = userData ? userData._id.toString() : null

      objMapEmailUsername[email] = userData && userData.username ? userData.username : email.split('@')[0]

      let textSearch = `${cf.trimText(email)} ${cf.trimText(phone)} `
      textSearch = await cf.boDauTiengViet(textSearch)
      const mappingCreate = {
        user: userId,
        email: email,
        phone: phone,
        company: company._id,
        textSearch: textSearch,
        roleType: roleType || 'EMPLOYEE',
        position: position,
        detail: detail || null,
        sourceType: 'INVITE',
        status: 'ACTIVE',
        state: 'PENDING',
        attackFiles: attackFiles || [],
        createdAt: sysdate,
        updatedAt: sysdate,
        createdBy: userLogin.username,
        updatedBy: userLogin.username,
      }
      usersMappingCreate.push(mappingCreate)
    }

    if (_.isEmpty(usersMappingCreate)) {
      return cf.responseError(res, message[lang]['usermapping.users.list.exist'])
    }

    let mappingCreate = await UserMapping.insertMany(usersMappingCreate)
    console.log('mappingCreate', mappingCreate)
    // send mail
    for (let item of mappingCreate) {
      const token = jwt.sign({
        mappingId: item._id.toString(),
        companyId: company._id
      }, config.secret, {
        expiresIn: config.jwtSessionExpiresTime
      })
      const linkActive = `${config.domain}/${config.activeLink}/${token}`
      console.log('token:', token)
      const mailSending = {
        email: item.email,
        subject: format(emailContent[lang]['invite.email.success.title.active'], objMapEmailUsername[item.email], company.companyName),
        content: format(emailContent[lang]['invite.email.success.content.active'], objMapEmailUsername[item.email], company.companyName, linkActive),
      }
      sendMail(mailSending.subject, mailSending.content, mailSending.email)
      if (!userMappingIds.includes(item._id.toString())) {
        userMappingIds.push(item._id.toString())
      }
    }
    // update company
    company.userMaps = userMappingIds
    company.updatedAt = sysdate
    company.updatedBy = sysdate
    await company.save()

    return cf.responseSuccess(res, message[lang]['request.success'], mappingCreate)
  } catch (error) {
    console.log(error)
    return cf.responseError(res, message[lang]['system.error'])
  }
})

router.post('/user-mapping/deletes', authJwt.authen, async (req, res) => {
  let lang = req.headers['lang'] || 'vi'
  try {
    const { userMappingIds, companyId } = req.body
    await Promise.all([
      UserMapping.deleteMany({ _id: { $in: userMappingIds } }),
      Company.findByIdAndUpdate(companyId, {
        $pull: {
          userMaps: {
            $in: userMappingIds
          }
        }

      })
    ])
    return cf.responseSuccess(res, message[lang]['request.success'])
  } catch (e) {
    console.log('error=>', e)
    return cf.responseError(res, message[lang]['system.error'])
  }
})

router.get('/user-mapping/detail', authJwt.authen, async (req, res) => {
  let lang = req.headers['lang'] || 'vi'
  try {
    const { userId } = req.query
    const userMapping = await UserMapping.findOne({
      user: userId,
      status: 'ACTIVE',
      state: 'ACCEPT'
    })
    return cf.responseSuccess(res, message[lang]['request.success'], userMapping)
  } catch (e) {
    console.log('error=>', e)
    return cf.responseError(res, message[lang]['system.error'])
  }
})

router.get('/find-list', authJwt.authen, async (req, res) => {
  let lang = req.headers['lang'] || 'vi'
  try {
    const { textSearch } = req.query
    const result = await Company.paginate({
      $text: { $search: textSearch && textSearch.toLowerCase() }
    }, {
      offset: 0,
      limit: 20,
      select: 'companyName logo status'
    })
    return cf.responseSuccess(res, message[lang]['request.success'], result.docs)
  } catch (e) {
    return cf.responseError(res, message[lang]['system.error'])
  }
})

router.post('/user-mapping/request', authJwt.authen, async (req, res) => {
  const lang = req.headers['lang'] || 'vi'
  const userLogin = req.user
  const sysdate = moment().format('YYYY-MM-DD HH:mm')
  try {
    const { companyId } = req.body

    const company = await Company.findById(companyId).populate({
      path: 'userMaps',
      select: '_id email',
      match: { state: { $ne: 'REJECT' } },
    })
    if (!company) {
      return cf.responseError(res, message[lang]['company.notfound'])
    }
    let userListEmailRegisted = !_.isEmpty(company.userMaps) ? company.userMaps.map((item) => item.email.toString()) : []

    if (userListEmailRegisted.includes(userLogin.email)) {
      return cf.responseError(res, message[lang]['usermapping.users.list.exist'])
    }

    let userMappingIds = !_.isEmpty(company.userMaps) ? company.userMaps.map((item) => item._id.toString()) : []
    let textSearch = `${cf.trimText(userLogin.email)} ${cf.trimText(userLogin.phone)} ${cf.trimText(userLogin.username)}`

    textSearch = await cf.boDauTiengViet(textSearch)
    const mappingCreate = await UserMapping.create({
      user: userLogin._id,
      email: userLogin.email,
      phone: userLogin.phone || null,
      company: companyId,
      textSearch: textSearch,
      roleType: 'EMPLOYEE',
      sourceType: 'REQUEST',
      status: 'ACTIVE',
      state: 'UNVERIFY',
      createdAt: sysdate,
      updatedAt: sysdate,
      createdBy: userLogin.username,
      updatedBy: userLogin.username,
    })

    userMappingIds = userMappingIds.concat(mappingCreate._id.toString())
    company.userMaps = userMappingIds
    company.updatedAt = sysdate
    company.updatedBy = sysdate
    await company.save()


    sendMail(emailContent[lang]['register.success.title'], format(emailContent[lang]['register.success.content'], userLogin.username), userLogin.email)

    return cf.responseSuccess(res, message[lang]['request.success'])
  } catch (error) {
    console.log(error)
    return cf.responseError(res, message[lang]['system.error'])
  }
})

router.post('/user-mapping/active-user-invite', authJwt.authen, async (req, res) => {
  const lang = req.headers['lang'] || 'vi'
  const userLogin = req.user
  const sysdate = moment().format('YYYY-MM-DD HH:mm')
  try {
    const { token } = req.body
    jwt.verify(token, config.secret, async (err, decoded) => {
      if (err) {
        return cf.responseError(res, message[lang]['token.invalid'])
      }
      const mappingId = decoded.mappingId
      if (!mappingId) {
        return cf.responseError(res, message[lang]['key.id.not.empty'])
      }

      const mapping = await UserMapping.findById(mappingId)
      // console.log('mapping', mapping, userLogin)
      if (!mapping) {
        return cf.responseError(res, message[lang]['info.notfound'])
      }
      if (mapping.email && mapping.email !== userLogin.email) {
        return cf.responseError(res, message[lang]['usermapping.token.email.active.invalid'])
      }

      const usersEmailUserMappingExist = await UserMapping.countDocuments({ email: mapping.email, status: 'ACTIVE', state: 'ACCEPT', company: { $ne: mapping.company } })
      if (usersEmailUserMappingExist > 0) {
        return cf.responseError(res, format(message[lang]['usermapping.email.existed'], emailExists))
      }

      if (mapping.state === 'ACCEPT') {
        return cf.responseError(res, message[lang]['usermapping.token.email.reactive.invalid'])
      }
      mapping.state = 'ACCEPT'
      if (!mapping.user) {
        mapping.user = userLogin._id
      }
      mapping.updatedAt = sysdate
      mapping.updatedBy = userLogin.username
      await mapping.save()
      return cf.responseSuccess(res, message[lang]['request.success'], mapping)
    })
  } catch (error) {
    console.log(error)
    return cf.responseError(res, message[lang]['system.error'])
  }
})

router.put('/user-mapping/re-send-mail-active/:mappingId', authJwt.authen, async (req, res) => {
  const lang = req.headers['lang'] || 'vi'
  const userLogin = req.user
  // const sysdate = moment().format('YYYY-MM-DD HH:mm')
  try {
    const { mappingId } = req.params
    if (!mappingId) {
      return cf.responseError(res, message[lang]['key.id.not.empty'])
    }
    const mapping = await UserMapping.findById(mappingId)
      .populate({
        path: 'company',
        select: 'companyName logo',
        populate: {
          path: 'userMaps',
          select: 'email',
          match: { status: 'ACTIVE', state: 'ACCEPT' }
        }
      })
    if (!mapping) {
      return cf.responseError(res, message[lang]['info.notfound'])
    }

    let userListEmailRegisted = !_.isEmpty(mapping.company.userMaps) ? mapping.company.userMaps.map((item) => item.email.toString()) : []

    if (!userListEmailRegisted.includes(userLogin.email)) {
      return cf.responseError(res, message[lang]['usermapping.roletype.invalid'])
    }
    if (mapping.state === 'ACCEPT') {
      return cf.responseError(res, message[lang]['usermapping.token.email.reactive.invalid'])
    }

    const token = jwt.sign({
      mappingId: mappingId,
      companyId: mapping.company,
    }, config.secret, {
      expiresIn: config.jwtSessionExpiresTime
    })
    const linkActive = `${config.domain}/${config.activeLink}/${token}`

    const mailSending = {
      email: mapping.email,
      subject: format(emailContent[lang]['invite.email.success.title.active'], mapping.email, mapping.company.companyName),
      content: format(emailContent[lang]['invite.email.success.content.active'], mapping.email, mapping.company.companyName, linkActive),
    }

    sendMail(mailSending.subject, mailSending.content, mailSending.email)
    return cf.responseSuccess(res, message[lang]['request.success'])
  } catch (error) {
    console.log(error)
    return cf.responseError(res, message[lang]['system.error'])
  }
})

router.put('/user-mapping/update/:mappingId', authJwt.authen, validatorData.validateSettingUser, async (req, res) => {
  const lang = req.headers['lang'] || 'vi'
  const userLogin = req.user
  const sysdate = moment().format('YYYY-MM-DD HH:mm')
  try {
    const { roleType, status, state, position, detail, attackFiles, phone, email } = req.body
    const mappingId = req.params.mappingId
    if (!mappingId) {
      return cf.responseError(res, message[lang]['key.id.not.empty'])
    }
    const mapping = await UserMapping.findById(mappingId)
      .populate({
        path: 'company',
        select: 'companyName logo',
        populate: {
          path: 'userMaps',
          select: 'email',
          match: { status: 'ACTIVE', state: 'ACCEPT' }
        }
      })
    if (!mapping) {
      return cf.responseError(res, message[lang]['info.notfound'])
    }
    let userListEmailRegisted = !_.isEmpty(mapping.company.userMaps) ? mapping.company.userMaps.map((item) => item.email.toString()) : []

    if (!userListEmailRegisted.includes(userLogin.email)) {
      return cf.responseError(res, message[lang]['usermapping.roletype.invalid'])
    }
    const updateData = { updatedAt: sysdate, updatedBy: userLogin.username }
    if (!status) {
      updateData.roleType = roleType
      updateData.state = state
      updateData.position = position
    } else {
      updateData.status = status
    }
    await UserMapping.findByIdAndUpdate(mappingId, updateData)

    return cf.responseSuccess(res, message[lang]['request.success'])
  } catch (error) {
    console.log(error)
    return cf.responseError(res, message[lang]['system.error'])
  }
})

router.get('/user-mapping/find-mappings', authJwt.authen, async (req, res) => {
  let lang = req.headers['lang'] || 'vi'

  try {
    let { companyId, status, roleType, sourceType, state, page, pageSize, textSearch } = req.query
    if (!companyId) {
      return cf.responseSuccess(res, message[lang]['request.success'], {})
    }
    pageSize = pageSize ? _.toNumber(pageSize) : 10
    page = page ? _.toNumber(page) : 1
    let offset = (_.toNumber(page) - 1) * pageSize
    var options = {
      offset,
      populate: [
        { path: 'user', select: '_id username email fullname intro avatar_url user_id' },
      ],
      select: '-__v',
      limit: pageSize,
      sort: { updatedAt: 'desc' },
    }

    let query = { company: companyId }
    if (status) query.status = status ? { $in: status.split(',') } : { $in: ['ACTIVE'] }
    if (roleType) query.roleType = roleType ? { $in: roleType.split(',') } : { $in: ['OWNER', 'PROFILE', 'EMPLOYEE'] }
    if (state) query.state = state ? { $in: state.split(',') } : ['ACCEPT']
    if (sourceType) query.sourceType = sourceType ? { $in: sourceType.split(',') } : { $in: ['INVITE'] }

    if (textSearch) {
      textSearch = await cf.boDauTiengViet(textSearch)
      query.$text = { $search: textSearch.toLowerCase() }
    }

    let datas = await UserMapping.paginate(query, options)
    return cf.responseSuccess(res, message[lang]['request.success'], datas)
  } catch (error) {
    console.log(error)
    return cf.responseError(res, message[lang]['system.error'])
  }
})

router.post('/entity/save-entity', authJwt.authen, validatorData.validateEntity, async (req, res) => {
  let lang = req.headers['lang'] || 'vi'
  const sysdate = moment().format('YYYY-MM-DD HH:mm')
  try {
    const userLogin = req.user
    const { entityId, users, entityType, entityName, content, description, attackFiles, avatar, transactionHash } = req.body
    // valid users
    const userMaps = await UserMapping.find({ user: { $in: users }, status: 'ACTIVE', state: 'ACCEPT' }).select('_id')
    if (userMaps.length !== users.length) {
      return cf.responseError(res, message[lang]['usermapping.users.invalid'])
    }
    const userMappingCreated = await UserMapping.findOne({ email: userLogin.email, status: 'ACTIVE', state: 'ACCEPT' })
      .populate({ path: 'company' })
    if (!userMappingCreated) {
      return cf.responseError(res, message[lang]['info.notfound'])
    }
    const company = userMappingCreated.company
    if (!company) {
      return cf.responseError(res, message[lang]['company.existed'])
    }

    const entityChange = {
      company: company._id, userMaps: userMaps.map((item) => item._id),
      entityName, entityType, updatedBy: userLogin.username, updatedAt: sysdate
    }
    if (content) entityChange.content = content
    if (description) entityChange.description = description
    if (!_.isEmpty(attackFiles)) entityChange.attackFiles = attackFiles
    if (description) entityChange.description = description
    if (avatar) entityChange.avatar = avatar
    if (transactionHash) entityChange.transactionHash = transactionHash

    let entityUpdated
    if (!entityId) {
      entityChange.createdAt = sysdate
      entityChange.createdBy = userLogin.username
      let textSearch = `${cf.trimText(entityName)} ${cf.trimText(entityType)} ${cf.trimText(company.companyName)}`
      textSearch = await cf.boDauTiengViet(textSearch)
      entityChange.textSearch = textSearch
      entityChange.status = 'ACTIVE'
      entityChange.userCreated = userMappingCreated._id
      entityChange.state = 'TODO'
      entityUpdated = await Entity.create(entityChange)
      let enties = company.enties || []
      enties = enties.map((item) => item._id.toString())
      enties.push(entityUpdated._id.toString())
      company.updatedAt = sysdate
      company.updatedBy = userLogin.username
      await company.save()
    } else {
      entityUpdated = await Entity.findByIdAndUpdate(entityId, entityChange, { new: true })
      if (!entityUpdated) {
        return cf.responseError(res, message[lang]['entity.notfound'])
      }
    }
    return cf.responseSuccess(res, message[lang]['request.success'], entityUpdated)
  } catch (error) {
    console.log(error)
    return cf.responseError(res, message[lang]['system.error'])
  }
})

router.delete('/entity/delete-entity/:entityId', authJwt.authen, async (req, res) => {
  try {
    let lang = req.headers['lang'] || 'vi'
    const { entityId } = req.params
    await Entity.findByIdAndDelete(entityId)
    return cf.responseSuccess(res, message[lang]['request.success'])
  } catch (e) {
    return cf.responseError(res, message[lang]['system.error'])
  }
})

router.get('/entity/find-entity', async (req, res) => {
  let lang = req.headers['lang'] || 'vi'

  try {
    let { companyId, status, state, entityType, page, pageSize, textSearch } = req.query
    if (!companyId) {
      return cf.responseSuccess(res, message[lang]['request.success'], {})
    }
    pageSize = pageSize ? _.toNumber(pageSize) : 10
    page = page ? _.toNumber(page) : 1
    let offset = (_.toNumber(page) - 1) * pageSize
    var options = {
      offset,
      populate: [
        {
          path: 'userMaps',
          populate: {
            path: 'user',
            select: '_id email fullname intro avatar_url user_id',
          }
        },
        {
          path: 'userCreated',
          populate: {
            path: 'user',
            select: '_id email fullname intro avatar_url user_id',
          }
        },
      ],
      select: '-__v',
      limit: pageSize,
      sort: { updatedAt: 'desc' },
    }

    let query = { company: companyId }
    if (status) query.status = status ? { $in: status.split(',') } : { $in: ['ACTIVE'] }
    if (state) query.state = state ? { $in: state.split(',') } : { $in: ['TODO', 'PROCESS', 'DONE'] }
    if (entityType) query.entityType = entityType ? { $in: entityType.split(',') } : { $in: ['BIDDING'] }

    if (textSearch) {
      textSearch = await cf.boDauTiengViet(textSearch)
      query.$text = { $search: textSearch.toLowerCase() }
    }

    let datas = await Entity.paginate(query, options)
    return cf.responseSuccess(res, message[lang]['request.success'], datas)
  } catch (error) {
    return cf.responseError(res, message[lang]['system.error'])
  }
})


router.get('/entity/find-entity-detail', async (req, res) => {
  let lang = req.headers['lang'] || 'vi'

  try {
    let { entityId } = req.query
    if (!entityId) {
      return cf.responseError(res, message[lang]['system.error'], {})
    }

    let data = await Entity.findById(entityId)
      .populate({
        path: 'userMaps',
        populate: {
          path: 'user',
          select: '_id email fullname intro avatar_url user_id',
        }
      })
      .populate({
        path: 'userCreated',
        populate: {
          path: 'user',
          select: '_id email fullname intro avatar_url user_id',
        }
      }).populate({
        path: 'company'
      })

    return cf.responseSuccess(res, message[lang]['request.success'], data)
  } catch (error) {
    return cf.responseError(res, message[lang]['system.error'])
  }
})

router.put('/entity/change-status/:entityId', authJwt.authen, async (req, res) => {
  let lang = req.headers['lang'] || 'vi'
  const sysdate = moment().format('YYYY-MM-DD HH:mm')
  try {
    const userLogin = req.user
    const entityId = req.params.entityId
    const { status, state } = req.body

    if (!status && !state) {
      return cf.responseError(res, message[lang]['company.status.invalid'])
    }

    if (status && !['ACTIVE', 'INACTIVE'].includes(status)) {
      return cf.responseError(res, message[lang]['company.status.invalid'])
    }
    if (state && !['TODO', 'PROCESS', 'DONE'].includes(state)) {
      return cf.responseError(res, message[lang]['company.status.invalid'])
    }
    const updateData = { status: status, updatedAt: sysdate, updatedBy: userLogin.username }
    if (status) updateData.status = status
    if (state) updateData.state = state
    const existEntity = await Entity.findByIdAndUpdate(entityId, updateData)
    if (!existEntity) {
      return cf.responseError(res, message[lang]['entity.notfound'])
    }
    return cf.responseSuccess(res, message[lang]['request.success'])
  } catch (error) {
    return cf.responseError(res, message[lang]['system.error'])
  }
})


module.exports = router