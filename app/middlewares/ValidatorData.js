const Validator = require('validatorjs')
const cf = require('../helpers/CF')
const message = require('../../message')

const validateCompany = (req, res, next) => {
  let { companyName, shortName, nationalName, businessType, taxCode, registrationAddress,
    tradingAddress, phone, email, website, founding, numEmployee, representName,
    representPosition, representAddress, career, companyId } = req.body
  // set language
  let lang = req.headers['lang'] || 'vi'
  Validator.useLang(lang)
  // create validation rule
  let validation = new Validator({
    companyName, shortName, nationalName, businessType, taxCode, registrationAddress,
    tradingAddress, phone, email, website, founding, numEmployee, representName,
    representPosition, representAddress, career
  }, {
    companyName: 'required',
    shortName: 'required',
    nationalName: 'required',
    businessType: 'required',
    taxCode: 'required',
    registrationAddress: 'required',
    tradingAddress: 'required',
    phone: 'required',
    // fax: 'required',
    email: 'required|email',
    website: 'required',
    founding: 'required',
    numEmployee: 'required',
    representName: 'required',
    representAddress: 'required',
    representPosition: 'required',
    careers: 'required',
  })


  validation.setAttributeNames({
    companyName: message[lang]['company.companyName'],
    shortName: message[lang]['company.shortName'],
    nationalName: message[lang]['company.nationalName'],
    businessType: message[lang]['company.businessType'],
    taxCode: message[lang]['company.taxCode'],
    registrationAddress: message[lang]['company.registrationAddress'],
    tradingAddress: message[lang]['company.tradingAddress'],
    phone: message[lang]['company.phone'],
    // fax: message[lang]['company.fax'],
    email: message[lang]['company.email'],
    website: message[lang]['company.website'],
    founding: message[lang]['company.founding'],
    numEmployee: message[lang]['company.numEmployee'],
    representName: message[lang]['company.representName'],
    representAddress: message[lang]['company.representAddress'],
    representPosition: message[lang]['company.representPosition'],
    career: message[lang]['company.career'],

  });

  if (validation.fails() && !companyId) {
    if (validation.errors.first('companyName')) {
      return cf.responseError(res, validation.errors.first('companyName'))
    }
    if (validation.errors.first('shortName')) {
      return cf.responseError(res, validation.errors.first('shortName'))
    }
    if (validation.errors.first('businessType')) {
      return cf.responseError(res, validation.errors.first('businessType'))
    }
    if (validation.errors.first('taxCode')) {
      return cf.responseError(res, validation.errors.first('taxCode'))
    }
    if (validation.errors.first('unitType')) {
      return cf.responseError(res, validation.errors.first('unitType'))
    }
    if (validation.errors.first('registrationAddress')) {
      return cf.responseError(res, validation.errors.first('registrationAddress'))
    }
    if (validation.errors.first('tradingAddress')) {
      return cf.responseError(res, validation.errors.first('tradingAddress'))
    }
    if (validation.errors.first('phone')) {
      return cf.responseError(res, validation.errors.first('phone'))
    }
    // if (validation.errors.first('fax')) {
    //   return cf.responseError(res, validation.errors.first('fax'))
    // }
    if (validation.errors.first('email')) {
      return cf.responseError(res, validation.errors.first('email'))
    }
    if (validation.errors.first('website')) {
      return cf.responseError(res, validation.errors.first('website'))
    }
    if (validation.errors.first('founding')) {
      return cf.responseError(res, validation.errors.first('founding'))
    }
    if (validation.errors.first('numEmployee')) {
      return cf.responseError(res, validation.errors.first('numEmployee'))
    }
    if (validation.errors.first('representName')) {
      return cf.responseError(res, validation.errors.first('representName'))
    }
    if (validation.errors.first('representAddress')) {
      return cf.responseError(res, validation.errors.first('representAddress'))
    }
    if (validation.errors.first('representPosition')) {
      return cf.responseError(res, validation.errors.first('representPosition'))
    }
    if (validation.errors.first('career')) {
      return cf.responseError(res, validation.errors.first('career'))
    }
  }
  next()
}

const validateInviteUser = (req, res, next) => {
  const { inviteUsers, companyId } = req.body
  // set language
  const lang = req.headers['lang'] || 'vi'
  Validator.useLang(lang)
  for (const request of inviteUsers) {
    // create validation rule
    const { roleType, email } = request
    let validation = new Validator({ roleType, email, companyId }, {
      roleType: 'required',
      email: 'required|email',
      companyId: 'required',
    })

    validation.setAttributeNames({
      roleType: message[lang]['usermapping.roletype'],
      email: message[lang]['company.email'],
      companyId: message[lang]['usermapping.companyId'],
    });

    if (validation.fails()) {
      if (validation.errors.first('roletype')) {
        return cf.responseError(res, validation.errors.first('roletype'))
      }
      if (validation.errors.first('email')) {
        return cf.responseError(res, validation.errors.first('email'))
      }
      if (validation.errors.first('companyId')) {
        return cf.responseError(res, validation.errors.first('companyId'))
      }
    }
    if (!['PROFILE', 'EMPLOYEE'].includes(roleType)) {
      return cf.responseError(res, message[lang]['usermapping.roletype.invalid'])
    }
  }
  next()
}

const validateSettingUser = (req, res, next) => {
  // set language
  const lang = req.headers['lang'] || 'vi'
  Validator.useLang(lang)
  const { roleType, state, position, status } = req.body
  if (status) {
    if (!['ACTIVE', 'INACTIVE'].includes(status)) {
      return cf.responseError(res, message[lang]['company.status.invalid'])
    }
    next()
    return
  }
  if (state && state !== 'ACCEPT') {
    if (!['ACCEPT', 'REJECT'].includes(state)) {
      return cf.responseError(res, message[lang]['company.status.invalid'])
    }
    next()
    return
  }
  let validation = new Validator({ roleType, state, position }, {
    state: 'required',
    roleType: 'required',
    position: 'required',
  })

  validation.setAttributeNames({
    state: message[lang]['usermapping.users.state'],
    roleType: message[lang]['usermapping.roletype'],
    position: message[lang]['usermapping.users.position'],
  });

  if (validation.fails()) {
    if (validation.errors.first('roletype')) {
      return cf.responseError(res, validation.errors.first('roletype'))
    }
    if (validation.errors.first('state')) {
      return cf.responseError(res, validation.errors.first('state'))
    }
    if (validation.errors.first('position')) {
      return cf.responseError(res, validation.errors.first('position'))
    }
  }
  if (!['ACCEPT', 'UNVERIFY', 'REJECT', 'PENDING'].includes(state)) {
    return cf.responseError(res, message[lang]['company.status.invalid'])
  }
  if (!['PROFILE', 'EMPLOYEE'].includes(roleType)) {
    return cf.responseError(res, message[lang]['usermapping.roletype.invalid'])
  }
  next()
}

const validateEntity = (req, res, next) => {
  let { users, entityName, entityType } = req.body

  // set language
  let lang = req.headers['lang'] || 'vi'
  Validator.useLang(lang)
  // create validation rule
  let validation = new Validator({ entityName, entityType }, {
    entityName: 'required',
    entityType: 'required',
  })

  validation.setAttributeNames({
    entityName: message[lang]['entity.entityName'],
    entityType: message[lang]['entity.entityType'],
  })

  if (validation.fails()) {
    if (validation.errors.first('entityName')) {
      return cf.responseError(res, validation.errors.first('entityName'))
    }
    if (validation.errors.first('entityType')) {
      return cf.responseError(res, validation.errors.first('entityType'))
    }
  }
  if (!users || users.length === 0) {
    return cf.responseError(res, message[lang]['usermapping.users.not.empty'])
  }
  if (!['BIDDING', 'TENDERER'].includes(entityType)) {
    return cf.responseError(res, message[lang]['usermapping.users.not.empty'])
  }
  next()
}

const validatePackage = (req, res, next) => {
  let {
    packageId,
    packageCode,
    packageName,
    postTime,
    notiType,
    procurementPlan,
    packagesRelation,
    offeree,
    task,
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
    validityDay,
    receiveBidLocation,// dia diem nhan thau
    workeplace,
    openDate, // time mo thau,
    closeDate, // time dong thau
    openLocation,// dia diem mo thau
    estimate, // du toan
    workplace,
    content,
    documentAttackFiles,
  } = req.body
  // set language
  let lang = req.headers['lang'] || 'vi'
  Validator.useLang(lang)
  // create validation rule
  let validation = new Validator({
    packageName,
    procurementPlan,
    offeree,
    field,
    // orderProfile,
    biddingType,
    contractType,
    foundingSource,
    fromContractDate,
    toContractDate,
    fromReceiveDate,
    toReceiveDate,
    insuranceFee,
    receiveBidLocation,
    workplace,
    openLocation,
    estimate,
  }, {
    packageName: 'required',
    procurementPlan: 'required',
    offeree: 'required',
    field: 'required',
    // orderProfile: 'required',
    biddingType: 'required',
    contractType: 'required',
    foundingSource: 'required',
    fromContractDate: 'required',
    toContractDate: 'required',
    fromReceiveDate: 'required',
    toReceiveDate: 'required',
    insuranceFee: 'required',
    receiveBidLocation: 'required',
    workplace: 'required',
    openLocation: 'required',
    estimate: 'required',
  })
  

  validation.setAttributeNames({
    packageName: message[lang]['pakage.packageName'],
    procurementPlan: message[lang]['pakage.procurementPlan'],
    offeree: message[lang]['pakage.offeree'],
    field: message[lang]['pakage.field'],
    // orderProfile: message[lang]['pakage.orderProfile'],
    biddingType: message[lang]['pakage.biddingType'],
    contractType: message[lang]['pakage.contractType'],
    foundingSource: message[lang]['pakage.foundingSource'],
    fromContractDate: message[lang]['pakage.fromContractDate'],
    toContractDate: message[lang]['pakage.toContractDate'],
    fromReceiveDate: message[lang]['pakage.fromReceiveDate'],
    toReceiveDate: message[lang]['pakage.toReceiveDate'],
    insuranceFee: message[lang]['pakage.insuranceFee'],
    receiveBidLocation: message[lang]['pakage.receiveBidLocation'],
    workplace: message[lang]['pakage.workeplace'],
    openLocation: message[lang]['pakage.openLocation'],
    estimate: message[lang]['pakage.estimate'],
  });

  if (validation.fails()) {
    if (validation.errors.first('packageName')) {
      return cf.responseError(res, validation.errors.first('packageName'))
    }
    if (validation.errors.first('procurementPlan')) {
      return cf.responseError(res, validation.errors.first('procurementPlan'))
    }
    if (validation.errors.first('offeree')) {
      return cf.responseError(res, validation.errors.first('offeree'))
    }
    if (validation.errors.first('field')) {
      return cf.responseError(res, validation.errors.first('field'))
    }
    if (validation.errors.first('orderProfile')) {
      return cf.responseError(res, validation.errors.first('orderProfile'))
    }
    if (validation.errors.first('biddingType')) {
      return cf.responseError(res, validation.errors.first('biddingType'))
    }
    if (validation.errors.first('contractType')) {
      return cf.responseError(res, validation.errors.first('contractType'))
    }
    if (validation.errors.first('foundingSource')) {
      return cf.responseError(res, validation.errors.first('foundingSource'))
    }
    if (validation.errors.first('fromContractDate')) {
      return cf.responseError(res, validation.errors.first('fromContractDate'))
    }
    if (validation.errors.first('toContractDate')) {
      return cf.responseError(res, validation.errors.first('toContractDate'))
    }
    if (validation.errors.first('fromReceiveDate')) {
      return cf.responseError(res, validation.errors.first('fromReceiveDate'))
    }
    if (validation.errors.first('toReceiveDate')) {
      return cf.responseError(res, validation.errors.first('toReceiveDate'))
    }
    if (validation.errors.first('insuranceFee')) {
      return cf.responseError(res, validation.errors.first('insuranceFee'))
    }
    if (validation.errors.first('receiveBidLocation')) {
      return cf.responseError(res, validation.errors.first('receiveBidLocation'))
    }
    if (validation.errors.first('workplace')) {
      return cf.responseError(res, validation.errors.first('workplace'))
    }
    if (validation.errors.first('openLocation')) {
      return cf.responseError(res, validation.errors.first('openLocation'))
    }
    if (validation.errors.first('estimate')) {
      return cf.responseError(res, validation.errors.first('estimate'))
    }
  }
  if (!['PUBLIC', 'PRIVATE'].includes(biddingType)) {
    return cf.responseError(res, message[lang]['pakage.biddingType.not.include'])
  }
  // if (!['FIRSTIME', 'CHANGE', 'CANCEL'].includes(notiType)) {
  //   return cf.responseError(res, message[lang]['pakage.notiType.invalid'])
  // }
  next()
}

const validateBidding = (req, res, next) => {
  let {
    packageId,
    entityId,
    cost,
    startDate,
    endDate,
    attackFiles,
  } = req.body
  // set language
  let lang = req.headers['lang'] || 'vi'
  Validator.useLang(lang)
  // create validation rule
  let validation = new Validator({
    packageId,
    entityId,
    cost,
    startDate,
    endDate,
    attackFiles,
  }, {
    packageId: 'required',
    entityId: 'required',
    cost: 'required',
    startDate: 'required',
    endDate: 'required',
    attackFiles: 'required',
  })

  validation.setAttributeNames({
    packageId:message[lang]['bidding.cost'],
    entityId:message[lang]['bidding.entity'],
    cost:message[lang]['bidding.cost'],
    startDate: message[lang]['usermapping.companyId'],
    endDate: message[lang]['usermapping.companyId'],
    attackFiles: message[lang]['usermapping.companyId'],
  
  });

  if (validation.fails()) {
    if (validation.errors.first('packageId')) {
      return cf.responseError(res, validation.errors.first('packageId'))
    }
    if (validation.errors.first('entityId')) {
      return cf.responseError(res, validation.errors.first('entityId'))
    }
    if (validation.errors.first('cost')) {
      return cf.responseError(res, validation.errors.first('cost'))
    }
    if (validation.errors.first('offeree')) {
      return cf.responseError(res, validation.errors.first('offeree'))
    }
    if (validation.errors.first('startDate')) {
      return cf.responseError(res, validation.errors.first('startDate'))
    }
    if (validation.errors.first('endDate')) {
      return cf.responseError(res, validation.errors.first('endDate'))
    }
    if (validation.errors.first('attackFiles')) {
      return cf.responseError(res, validation.errors.first('attackFiles'))
    }
  }
  next()
}

module.exports = {
  validateCompany,
  validateInviteUser,
  validateEntity,
  validateSettingUser,
  validatePackage,
  validateBidding,
}