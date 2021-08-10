const express = require('express')
const _ = require('lodash')
const router = express.Router()
const mongoose = require('mongoose')
const jwt = require('jsonwebtoken')
const { User, Company, UserMapping, Entity, Package, Bidding, Conversation, CustomerConversation,
  ProjectUser
} = require('../../models').dbInproject
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

router.post('/package/save-package', authJwt.authen, validatorData.validatePackage, async (req, res) => {
  const lang = req.headers['lang'] || 'vi'
  const sysdate = moment().format('YYYY-MM-DD HH:mm')
  console.log('test ===>')
  try {

    const userLogin = req.user
    let {
      packageId,
      packageCode,
      packageName,
      notiType = 'FIRSTIME',
      procurementPlan,
      packagesRelation,
      offeree,
      project,
      projectName,
      field,
      orderProfile,
      publicTime,
      biddingType,
      biddingMethod,
      contractType,
      foundingSource, // nguon von
      fromContractDate,
      toContractDate,
      fromReceiveDate,
      toReceiveDate,
      insuranceFee,
      receiveBidLocation,// dia diem nhan thau
      workplace,
      openDate, // time mo thau,
      closeDate, // time dong thau
      openLocation,// dia diem mo thau
      estimate, // du toan
      content,
      documentAttackFiles,
      validityDay,
      transactionHash,
    } = req.body

    const entity = await Entity.findById(offeree)
    console.log('offeree ===>', offeree, entity)
    if (!entity) {
      return cf.responseError(res, message[lang]['entity.notfound'])
    }

    const userMappingCreated = await UserMapping.findOne({ email: userLogin.email, status: 'ACTIVE', state: 'ACCEPT' })

    if (!userMappingCreated) {
      return cf.responseError(res, message[lang]['info.notfound'])
    }

    const company = await Company.findById(userMappingCreated.company)
    if (!company) {
      return cf.responseError(res, message[lang]['company.existed'])
    }

    let textSearch = `${cf.trimText(packageCode)} ${cf.trimText(packageName)}`
    textSearch = await cf.boDauTiengViet(textSearch)
    let result
    if (!packageId) {
      result = await Package.create({
        company: company._id,
        userCreated: userMappingCreated._id,
        packageName: packageName,
        postTime: sysdate,
        notiType: 'FIRSTIME',
        procurementPlan: procurementPlan,
        packagesRelation: packagesRelation || null,
        offeree: offeree,
        project: project || null,
        projectName: projectName,
        field: field,
        orderProfile: orderProfile,
        publicTime: publicTime,
        biddingType: biddingType,
        biddingMethod: biddingMethod,
        contractType: contractType,
        foundingSource: foundingSource,
        fromContractDate: fromContractDate,
        toContractDate: toContractDate,
        fromReceiveDate: fromReceiveDate,
        toReceiveDate: toReceiveDate,
        validityDay: validityDay,
        insuranceFee: insuranceFee,
        receiveBidLocation,
        workplace: workplace,
        openDate: openDate,
        closeDate: closeDate,
        openLocation: openLocation,
        estimate: estimate,
        content: content,
        documentAttackFiles: documentAttackFiles,
        status: 'BIDDING',
        textSearch: textSearch,
        createdAt: sysdate,
        updatedAt: sysdate,
        createdBy: userLogin.username,
        updatedBy: userLogin.username,
        deletedAt: null
      })
      result.genCode()
      await result.save()
      // save company
      let packages = company.packages || []
      packages = packages.map((item) => item._id.toString())
      packages.push(result._id.toString())
      company.packages = packages
      company.updatedAt = sysdate
      company.updatedBy = userLogin.username
      await company.save()
      // sendMail(emailContent[lang]['register.success.title'], format(emailContent[lang]['register.success.content'], username), email)
    } else {
      let package = await Package.findById(packageId)
      if (!package) {
        return cf.responseError(res, message[lang]['pakage.notfound'])
      }
      if (packageName) package.packageName = packageName
      if (notiType) package.notiType = notiType
      if (procurementPlan) package.procurementPlan = procurementPlan
      if (packagesRelation) package.packagesRelation = packagesRelation
      if (offeree) package.offeree = offeree
      if (project) package.project = project
      if (field) package.field = field
      if (orderProfile) package.orderProfile = orderProfile
      if (publicTime) package.publicTime = publicTime
      if (biddingType) package.biddingType = biddingType
      if (biddingMethod) package.biddingMethod = biddingMethod
      if (contractType) package.contractType = contractType
      if (foundingSource) package.foundingSource = foundingSource
      if (fromContractDate) package.fromContractDate = fromContractDate
      if (toContractDate) package.toContractDate = toContractDate
      if (fromReceiveDate) package.fromReceiveDate = fromReceiveDate
      if (toReceiveDate) package.toReceiveDate = toReceiveDate
      if (receiveBidLocation) package.receiveBidLocation = receiveBidLocation
      if (workplace) package.workplace = workplace
      if (openDate) package.openDate = openDate
      if (closeDate) package.closeDate = closeDate
      if (openLocation) package.openLocation = openLocation
      if (estimate) package.estimate = estimate
      if (content) package.content = content
      if (transactionHash) package.transactionHash = transactionHash
      if (documentAttackFiles) package.documentAttackFiles = documentAttackFiles
      if (projectName) package.projectName = projectName

      package.notiType = 'CHANGE'
      package.validityDay = validityDay
      package.updatedAt = sysdate
      package.updatedBy = userLogin.username
      package.textSearch = textSearch
      result = await package.save()

      // send mail all Bidding
      if (!_.isEmpty(package.biddings)) {
        let biddings = await Bidding.find({ _id: { $in: package.biddings } }).select('entity').populate({
          path: 'entity',
          select: 'userMaps',
          populate: {
            path: 'userMaps',
            select: 'email'
          }
        })
        let emails = []
        for (let i = 0; i < biddings.length; i++) {
          const bidding = biddings[i];
          if (bidding.entity && !_.isEmpty(bidding.entity.userMaps)) {
            for (let j = 0; j < bidding.entity.userMaps.length; j++) {
              const userMap = bidding.entity.userMaps[j];
              if (userMap.email) {
                emails.push(userMap.email)
              }
            }
          }
        }
        if (!_.isEmpty(emails)) {
          const promiseArray = []
          for (let i = 0; i < emails.length; i++) {
            const email = emails[i];
            promiseArray.push(sendMail(emailContent[lang]['change.package'], format(emailContent[lang]['change.package']), email))
          }
          Promise.all(promiseArray).then((values) => {
            console.log('send mail success');
          }).catch((err) => {
            console.log(err)
          })
        }
      }
    }
    return cf.responseSuccess(res, message[lang]['request.success'], result)
  } catch (error) {
    console.log(error)
    return cf.responseError(res, message[lang]['system.error'])
  }
})

router.delete('/package/delete-package/:packageId', authJwt.authen, async (req, res) => {
  try {
    let lang = req.headers['lang'] || 'vi'
    const { packageId } = req.params
    await Package.findByIdAndDelete(packageId)
    return cf.responseSuccess(res, message[lang]['request.success'])
  } catch(e) {
    return cf.responseError(res, message[lang]['system.error'])
  }
})

router.put('/package/change-status/:packageId', authJwt.authen, async (req, res) => {
  const lang = req.headers['lang'] || 'vi'
  const sysdate = moment().format('YYYY-MM-DD HH:mm')
  const userLogin = req.user
  try {
    const packageId = req.params.packageId
    const { status } = req.body
    if (!['BIDDING', 'SELECTING', 'CLOSING', 'CANCEL'].includes(status)) {
      return cf.responseError(res, message[lang]['pakage.status.invalid'])
    }
    const package = await Package.findById(packageId)
    if (!package) {
      return cf.responseError(res, message[lang]['pakage.notfound'])
    }
    package.status = status
    package.updatedAt = sysdate
    package.updatedBy = userLogin.username
    await package.save()

    return cf.responseSuccess(res, message[lang]['request.success'])
  } catch (error) {
    return cf.responseError(res, message[lang]['system.error'])
  }
})

router.get('/package/find-detail', async (req, res) => {
  let lang = req.headers['lang'] || 'vi'
  let { packageId } = req.query
  try {
    await Package.findByIdAndUpdate(packageId, { $inc: { totalViews: 1 } })
    let package = await Package.findById(packageId)
      .populate([{
        path: 'company',
        select: 'logo companyName shortName nationalName businessType registrationAddress tradingAddress fax email website numEmployee representName representPosition ',
        populate: {
          path: 'owner',
          select: 'email username avatar_url'
        }
      },
      {
        path: 'packagesRelation',
        select: 'packageName packageCode postTime publicTime'
      },
      {
        path: 'offeree',
        select: 'entityName content userMaps',
        populate: {
          path: 'userMaps',
          select: 'user phone roleType position email',
          populate: {
            path: 'user',
            select: 'email username avatar_url'
          }
        }
      },
      {
        path: 'biddings',
        populate: {
          path: 'entity',
          select: 'entityName content',
          populate: {
            path: 'company',
            select: 'logo companyName'
          }
        }
      }
      ])

    package._doc.totalBiddings = package._doc.biddings ? package._doc.biddings.length : 0

    return cf.responseSuccess(res, message[lang]['request.success'], package)
  } catch (error) {
    return cf.responseError(res, message[lang]['system.error'])
  }
})

router.put('/package/inc-follow/:packageId', authJwt.authen, async (req, res) => {
  const lang = req.headers['lang'] || 'vi'
  const userLogin = req.user
  try {
    let package = await Package.findByIdAndUpdate(req.params.packageId, { $inc: { totalFollows: 1 }, $addToSet: { userFollows: userLogin._id } })
    if (!package) {
      return cf.responseError(res, message[lang]['pakage.notfound'])
    }
    return cf.responseSuccess(res, message[lang]['request.success'])
  } catch (error) {
    return cf.responseError(res, message[lang]['system.error'])
  }
})

router.put('/package/inc-view/:packageId', authJwt.authen, async (req, res) => {
  const lang = req.headers['lang'] || 'vi'
  try {
    let package = await Package.findByIdAndUpdate(req.params.packageId, { $inc: { totalViews: 1 } })
    if (!package) {
      return cf.responseError(res, message[lang]['pakage.notfound'])
    }
    return cf.responseSuccess(res, message[lang]['request.success'])
  } catch (error) {
    return cf.responseError(res, message[lang]['system.error'])
  }
})

router.put('/package/select-win-bidding/:packageId', authJwt.authen, async (req, res) => {
  const lang = req.headers['lang'] || 'vi'
  const userLogin = req.user
  const sysdate = moment().format('YYYY-MM-DD HH:mm')
  try {
    //xxx
    const { packageId } = req.params
    const { biddingId, transactionHash } = req.body
    if (!biddingId || !packageId) {
      return cf.responseError(res, message[lang]['key.id.not.empty'])
    }
    let package = await Package.findById(packageId)
    if (!package) {
      return cf.responseError(res, message[lang]['pakage.notfound'])
    }

    let result = await Bidding.findById(biddingId).populate({
      path: 'entity',
      select: 'entityName userMaps',
      populate: {
        path: 'userMaps',
        select: 'user',
        populate: {
          path: 'user',
          select: 'user_id'
        }
      }
    })

    const projectUsers = result.entity.userMaps.map((item) => ({
      user_id: item.user.user_id,
      project_id: package.project,
      role: 'ASSIGNEE',
      is_owner: 'n',
      is_accepted: 'y',
      txhash: transactionHash
    }))


    // console.log('test ===>', result, package)

    // console.log(projectUsers)

    ProjectUser.insertMany(projectUsers)

    if (!result) {
      return cf.responseError(res, message[lang]['bidding.notfound'])
    }

    result.status = 'ACCEPT'
    result.updatedAt = sysdate
    result.updatedBy = userLogin.username
    await result.save()
    await Bidding.updateMany({ package: packageId, _id: { $ne: biddingId } }, { status: 'REJECT' })

    package.status = 'CLOSING'
    package.updatedAt = sysdate
    package.updatedBy = userLogin.username
    await package.save()

    return cf.responseSuccess(res, message[lang]['request.success'])
  } catch (error) {
    return cf.responseError(res, message[lang]['system.error'])
  }
})

router.post('/package/find-list', async (req, res) => {
  let lang = req.headers['lang'] || 'vi'
  try {

    let { page, pageSize, status, sort, sortType, biddingType, companyId, notiType, textSearch, currentTime } = req.body

    const sortObj = await cf.getCommonSort(sort, sortType)
    pageSize = pageSize ? _.toNumber(pageSize) : 10
    page = page ? _.toNumber(page) : 1
    let offset = (_.toNumber(page) - 1) * pageSize
    var options = {
      offset,
      populate: [
        {
          path: 'offeree',
          select: 'entityName content userMaps',
          populate: {
            path: 'userMaps',
            select: 'user phone roleType position email',
            populate: {
              path: 'user',
              select: 'email username avatar_url'
            }
          }
        },
        {
          path: 'company',
          select: 'companyName logo'
        }
      ],
      select: 'createdAt totalViews field contractType foundingSource status company package packageName biddingType biddingMethod offeree biddings insuranceFee foundingSource validityDay fromReceiveDate toReceiveDate publicTime ',
      limit: pageSize,
      sort: sortObj,
    }

    let query = {}
    if (companyId) query.company = companyId
    if (status) query.status = status ? { $in: status.split(',') } : { $in: ['BIDDING'] }
    if (notiType) query.notiType = notiType ? { $in: notiType.split(',') } : { $in: ['FIRSTIME', 'CHANGE', 'CANCEL'] }
    if (biddingType) query.biddingType = biddingType ? { $in: biddingType.split(',') } : ['PUBLIC', 'PRIVATE']
    if (textSearch) {
      textSearch = await cf.boDauTiengViet(textSearch)
      query.$text = { $search: textSearch.toLowerCase() }
    }
    if (currentTime) {
      query.publicTime = { $lte: currentTime }
    }

    let datas = await Package.paginate(query, options)

    if (datas && datas.docs && datas.docs.length > 0) {
      datas && datas.docs && datas.docs.forEach((item) => {
        item._doc.totalBiddings = item._doc.biddings ? item._doc.biddings.length : 0
      })
    }

    return cf.responseSuccess(res, message[lang]['request.success'], datas)
  } catch (error) {
    console.log(error)
    return cf.responseError(res, message[lang]['system.error'])
  }
})

router.post('/package/authen/find-list', authJwt.authen, async (req, res) => {
  let lang = req.headers['lang'] || 'vi'
  try {
    let { page, pageSize, status, sort, sortType, biddingType, notiType } = req.body

    const userLogin = req.user

    const userMap = await UserMapping.find({ user: userLogin._id }).select('company')

    if (!userMap) return cf.responseSuccess(res, message[lang]['request.success'], {})

    const biddings = await Bidding.find({ company: { $in: userMap.company } }).select('package')

    if (_.isEmpty(biddings)) return cf.responseSuccess(res, message[lang]['request.success'], {})

    let packageIds = biddings.reduce((arr, item) => {
      const packageId = item.package.toString()
      if (!arr.includes(packageId)) {
        arr.push(packageId)
      }
      return arr
    }, [])

    const sortObj = await cf.getCommonSort(sort, sortType)
    pageSize = pageSize ? _.toNumber(pageSize) : 10
    page = page ? _.toNumber(page) : 1
    let offset = (_.toNumber(page) - 1) * pageSize
    var options = {
      offset,
      populate: [
        {
          path: 'offeree',
          select: 'entityName content userMaps',
          populate: {
            path: 'userMaps',
            select: 'user phone roleType position email',
            populate: {
              path: 'user',
              select: 'email username avatar_url'
            }
          }
        },
      ],
      select: 'package packageName biddingType biddingMethod offeree biddings insuranceFee foundingSource validityDay fromReceiveDate toReceiveDate publicTime ',
      limit: pageSize,
      sort: sortObj,
    }

    let query = { publicTime: { $gte:  moment().format('DD-MM-YYYY') } }
    if (status) query.status = status ? { $in: status.split(',') } : { $in: ['BIDDING', 'SELECTING', 'CLOSING', 'CANCEL'] }
    if (notiType) query.notiType = notiType ? { $in: notiType.split(',') } : { $in: ['FIRSTIME', 'CHANGE', 'CANCEL'] }
    if (biddingType) query.biddingType = biddingType ? { $in: biddingType.split(',') } : ['PUBLIC', 'PRIVATE']
    if (!_.isEmpty(packageIds)) {
      query._id = { $in: packageIds }
    }

    let datas = await Package.paginate(query, options)

    if (datas && datas.docs && datas.docs.length > 0) {
      datas && datas.docs && datas.docs.forEach((item) => {
        item._doc.totalBiddings = item._doc.biddings ? item._doc.biddings.length : 0
      })
    }

    return cf.responseSuccess(res, message[lang]['request.success'], datas)
  } catch (error) {
    console.log(error)
    return cf.responseError(res, message[lang]['system.error'])
  }
})

router.get('/package/count-status-all', async (req, res) => {
  let lang = req.headers['lang'] || 'vi'
  try {
    const result = await Promise.all([Package.countDocuments({ status: 'BIDDING' }),
    Package.countDocuments({ status: 'SELECTING' }),
    Package.countDocuments({ status: 'CLOSING' })])
    return cf.responseSuccess(res, message[lang]['request.success'], {
      totalCountBidding: result[0],
      totalCountSelecting: result[1],
      totalCountClosing: result[2],
    })
  } catch (error) {
    return cf.responseError(res, message[lang]['system.error'])
  }
})

const insertConveration = async (objConversation) => {
  let conversationInsert = await Conversation.create({
    ...objConversation,
  })
  let datas = []
  for (let i = 0; i < objConversation.lsUsersBidding.length; i++) {
    const userIdBidding = objConversation.lsUsersBidding[i];
    let data = await CustomerConversation.create({
      user: userIdBidding,
      conversationId: conversationInsert._id,
      userType: 'BIDDING',
      createdAt: objConversation.createdAt,
      updatedAt: objConversation.updatedAt,
    })
    datas.push(data._id.toString())
  }
  for (let i = 0; i < objConversation.lsUsersTenderer.length; i++) {
    const userIdBidding = objConversation.lsUsersTenderer[i];
    let data = await CustomerConversation.create({
      user: userIdBidding,
      conversationId: conversationInsert._id,
      userType: 'TENDERER',
      createdAt: objConversation.createdAt,
      updatedAt: objConversation.updatedAt,
    })
    datas.push(data._id.toString())
  }

  conversationInsert.customerConversations = datas
  await conversationInsert.save()
}

router.post('/save-bidding', authJwt.authen, validatorData.validateBidding, async (req, res) => {
  let lang = req.headers['lang'] || 'vi'
  const userLogin = req.user
  const sysdate = moment().format('YYYY-MM-DD HH:mm')
  try {
    let {
      biddingId,
      packageId,
      entityId,
      cost,
      startDate,
      endDate,
      attackFiles,
      transactionHash
    } = req.body

    const package = await Package.findById(packageId).populate({
      path: 'offeree',
      select: 'userMaps entityName ',
      populate: {
        path: 'userMaps',
        select: 'user'
      }
    })
    if (!package) {
      return cf.responseError(res, message[lang]['pakage.notfound'])
    }
    let biddings = package.biddings || []
    biddings = biddings.map((item) => item._id.toString())
    const biddingEntity = await Entity.findById(entityId).populate({
      path: 'userMaps'
    })
    if (!biddingEntity) {
      return cf.responseError(res, message[lang]['entity.notfound'])
    }
    const userMappingCreated = await UserMapping.findOne({user: userLogin._id}).select('_id')

    console.log('userMappingCreated ===>', userMappingCreated)

    let textSearch = `${cf.trimText(biddingEntity.entityName)} ${cf.trimText(package.packageName)}`
    textSearch = await cf.boDauTiengViet(textSearch)
    const numberActionDay = moment(endDate, ['DD-MM-YYYY', 'YYYY-MM-DD', 'MM/DD/YYYY']).diff(moment(startDate, ['DD-MM-YYYY', 'YYYY-MM-DD', 'MM/DD/YYYY']), 'days')
    let result
    if (!biddingId) {
      const countExistEntity = await Bidding.countDocuments({ entity: entityId, package: packageId })
      if (countExistEntity > 0) {
        return cf.responseError(res, message[lang]['bidding.existed'])
      }
      result = await Bidding.create({
        company: biddingEntity.company,
        package: package._id,
        entity: biddingEntity._id,
        cost: cost,
        startDate: startDate,
        endDate: endDate,
        numberActionDay: numberActionDay,
        attackFiles: attackFiles,
        textSearch: textSearch,
        status: 'DISCUSS',
        createdAt: sysdate,
        updatedAt: sysdate,
        createdBy: userLogin.username,
        updatedBy: userLogin.username,
        userCreated: userMappingCreated && userMappingCreated._id,
        deletedAt: null
      })

      biddings.push(result._id.toString())
      package.biddings = biddings
      await package.save()

      // create conversation
      const objConversation = {
        status: 'ACTIVE',
        user: userLogin._id,
        biddingEntity: biddingEntity._id,
        tendererEntity: package.offeree._id,
        package: package._id,
        user: userLogin._id,
        title: package.packageName,
        subTitle: `${package.offeree.entityName}-${biddingEntity.entityName}`,
        lsUsersBidding: biddingEntity.userMaps.map((item) => item.user.toString()),
        lsUsersTenderer: package.offeree.userMaps.map((item) => item.user.toString()),
        createdAt: sysdate,
        updatedAt: sysdate,
      }

      await insertConveration(objConversation)

    } else {
      result = await Bidding.findById(biddingId)
      if (!result) {
        return cf.responseError(res, message[lang]['bidding.notfound'])
      }
      if (cost) result.cost = cost
      if (startDate) result.startDate = startDate
      if (endDate) result.endDate = endDate
      if (attackFiles) result.attackFiles = attackFiles
      if (transactionHash) result.transactionHash = transactionHash
      result.updatedAt = sysdate
      result.updatedBy = userLogin.username
      result.textSearch = textSearch
      await result.save()
    }
    return cf.responseSuccess(res, message[lang]['request.success'], result)
  } catch (error) {
    console.log(error)
    return cf.responseError(res, message[lang]['system.error'])
  }
})

router.delete('/delete-bidding/:biddingId', authJwt.authen, async (req, res) => {
  try {
    let lang = req.headers['lang'] || 'vi'
    const { biddingId } = req.params
    await Bidding.findByIdAndDelete(biddingId)
    return cf.responseSuccess(res, message[lang]['request.success'])
  } catch(e) {
    return cf.responseError(res, message[lang]['system.error'])
  }
})


router.get('/find-list', async (req, res) => {
  let lang = req.headers['lang'] || 'vi'
  try {
    let { page, pageSize, status, sort, sortType, packageId, companyId, entity } = req.query
    const sortObj = await cf.getCommonSort(sort ? sort : 'createdAt', sortType ? sortType : 'desc')

    pageSize = pageSize ? _.toNumber(pageSize) : 10
    page = page ? _.toNumber(page) : 1
    let offset = (_.toNumber(page) - 1) * pageSize
    var options = {
      offset,
      populate: [
        {
          path: 'userCreated',
          populate: {
            path: 'user',
            select: '_id email fullname intro avatar_url user_id',
          }
        },
        {
          path: 'entity',
          select: '_id entityName userMaps content attackFiles avatar',
          populate: {
            path: 'userMaps',
            select: 'fullname email avatar_url user phone',
            populate: {
              path: 'user',
              select: 'email avatar_url fullname'
            }
          }
        },
        {
          path: 'package',
          populate: [{
            path: 'company',
            select: 'logo companyName nationalName shortName phone fax numEmployee representName'
          }, {
            path: 'offeree',
            select: 'entityName'
          }],
        },
      ],
      select: '-__v',
      limit: pageSize,
      sort: sortObj,
    }
    let query = {}

    if (packageId) query.package = packageId
    if (companyId) query.company = companyId
    if (status) query.status = status ? { $in: status.split(',') } : { $in: ['ACCEPT', 'REJECT', 'DISCUSS'] }
    if (entity) query.entity = entity
    let datas = await Bidding.paginate(query, options)
    return cf.responseSuccess(res, message[lang]['request.success'], datas)
  } catch (error) {
    return cf.responseError(res, message[lang]['system.error'])
  }
})



module.exports = router