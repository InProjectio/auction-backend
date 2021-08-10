
const moment = require('moment');
const config = require('../../config');
const _ = require('lodash');
const cf = require('../helpers/CF')
const { Conversation, CustomerConversation, ConversationMessage, CustomerSocket, FcmCustomer } = require('../models').dbInproject
const FireBaseService = require('../helpers/FireBaseService')

const findConversation = async (input) => {
  let { page, pageSize, status, userId } = input
  page = page ? _.toNumber(page) : 1
  pageSize = pageSize ? _.toNumber(pageSize) : 30
  let offset = (_.toNumber(page) - 1) * pageSize

  const objMapConversation = await CustomerConversation.find({ user: userId })
  const allConverationIds = objMapConversation.reduce((arr, item) => {
    const conversationId = item.conversationId.toString()
    if (!arr.includes(conversationId)) {
      arr.push(conversationId)
    }
    return arr
  }, [])

  let options = {
    select: '-__v',
    sort: { updatedAt: -1 },
    offset,
    limit: pageSize,
    populate: [{
      path: 'latestCustomerConveration',
      populate: {
        path: 'User',
        select: 'fullname username avatar_url email'
      },
    },
    {
      path: 'biddingEntity',
      select: 'company',
      populate: {
        path: 'company',
        select: 'logo companyName nationalName shortName phone fax numEmployee representName'
      },
    },
    {
      path: 'tendererEntity',
      select: 'company',
      populate: {
        path: 'company',
        select: 'logo companyName nationalName shortName phone fax numEmployee representName'
      },
    },
    ]
  }
  let conversations = await Conversation.paginate({ status: status || 'ACTIVE', _id: { $in: allConverationIds } }, options)

  if(!_.isEmpty(conversations)) {
    let allCustomerConversation = await CustomerConversation.find({ conversationId: { $in: allConverationIds }, user: userId })
    const objMapConversation = allCustomerConversation.reduce((obj, item) => {
      if(!obj[item.conversationId.toString()]) {
        obj[item.conversationId.toString()] = item.numberOfUnreadMessages
      }
      return obj
    }, {})
    for (let i = 0; i < conversations.docs.length; i++) {
      conversations.docs[i]._doc.numberOfUnreadMessages = objMapConversation[conversations.docs[i]._id.toString()]
    }
  }
  return conversations
}

const findMesages = async (input) => {
  let { page, pageSize, conversationId, currentDate } = input
  page = page ? _.toNumber(page) : 1
  pageSize = pageSize ? _.toNumber(pageSize) : config.pageSizeChat
  const offset = (_.toNumber(page) - 1) * pageSize

  let query = {
    conversationId
  }
  if (currentDate) {
    let current = moment(currentDate)
    query.messageTime = { $gte: current.startOf('hour').format('YYYY-MM-DD HH:mm'), $lte: current.endOf('day').format('YYYY-MM-DD HH:mm') }
  }

  let messages = await ConversationMessage.paginate(query, {
    select: '-__v',
    sort: { messageTime: 'desc' },
    lean: true,
    offset,
    limit: pageSize,
    populate: {
      path: 'user',
      select: 'fullname avatar_url'
    }
  })
  return messages
}

const adminCreateConversation = async (input) => {
  let { conversationId, guid, user } = input
  let sysdate = moment().format('YYYY-MM-DD HH:mm')

  let updateData = { status: 'INPROGESS', updatedAt: sysdate }

  // save conversation
  let countExist = await CustomerConversation.countDocuments({ conversationId, userType: 'STAFF', user: user._id })
  if (countExist === 0) {
    let insertData = {
      user: user._id,
      email: user.email,
      conversationId: conversationId,
      phoneNumber: user.phoneNumber || '',
      guid: guid && guid || '',
      fullName: user.fullName || '',
      avatar: user.avatar || '',
      latestMessage: '',
      numberOfUnreadMessages: 0,
      userType: 'STAFF',
      createdAt: sysdate,
      updatedAt: sysdate
    }
    let adminConversation = await CustomerConversation.create(insertData)
    updateData.$push = { customerConversations: adminConversation._id }
  }

  await CustomerConversation.updateOne({ conversationId, userType: 'CUSTOMER' }, { numberOfUnreadMessages: 0 })

  let changeConversation = await Conversation.findByIdAndUpdate(conversationId, updateData)
  return changeConversation._doc
}

const customerCreateConversation = async (input, io) => {

  let { user, guid } = input

  let existConversation = await Conversation.findOne({ user: user._id })
  if (existConversation && existConversation._doc) {
    return existConversation._doc
  }

  let sysdate = moment().format('YYYY-MM-DD HH:mm')

  // save conversation
  let insertData = {
    user: user._id,
    guid: guid && guid,
    title: user.fullName || user.email,
    status: 'TODO',
    currentDate: sysdate.split(' ')[0],
    createdAt: sysdate,
    updatedAt: sysdate
  }

  let conversation = await Conversation.create(insertData)

  // save customer conversation
  insertData = {
    user: user._id,
    email: user.email,
    conversationId: conversation._id,
    guid: guid && guid,
    fullName: user.fullName || '',
    phoneNumber: user.phoneNumber || '',
    avatar: user.avatar || '',
    latestMessage: '',
    numberOfUnreadMessages: 0,
    userType: 'CUSTOMER',
    createdAt: sysdate,
    updatedAt: sysdate
  }

  let custConversation = await CustomerConversation.create(insertData)

  // update converstion
  conversation = await Conversation.findByIdAndUpdate(conversation._id, { $push: { customerConversations: custConversation._id } }).select('-__v')

  // push all new conversation to all adlmin
  let custSocketIdOnlines = await CustomerSocket.find({ userType: 'STAFF', channel: 'CHAT' }).select('idSocket')
  if (custSocketIdOnlines && custSocketIdOnlines.length > 0) {

    // push all conversations    
    let conversations = await findConversation({ page: 1, pageSize: config.pageSizeConveration })

    for (let i = 0; i < custSocketIdOnlines.length; i++) {
      const socketId = custSocketIdOnlines[i].idSocket
      io.to(socketId).emit('responseGetConversations', { data: conversations })
    }
  }

  return conversation._doc

}

const updateConversation = async (input) => {
  let { conversationId, status, title, note } = input
  let sysdate = moment().format('YYYY-MM-DD HH:mm')

  let changeData = { updatedAt: sysdate }
  if (status) changeData.status = status
  if (title) changeData.title = title
  if (note) {
    changeData.$push = { notes: { note, noteTime: sysdate } }
  }

  let conversation = await Conversation.findOneAndUpdate(conversationId, changeData).select('-__v')

  return conversation._doc
}

const createMessage = async (input) => {
  const insertData = {
    conversationId: input.conversationId,
    user: input.user || null,
    message: input.message,
    messageType: input.messageType || 'TEXT',
    messageTime: moment().format('YYYY-MM-DD HH:mm:ss'),
    fileUrl: input.fileUrl || ''
  }
  let message = await ConversationMessage.create(insertData)
  return message._doc
}

const pushMessageAndNotification = async (conversationId, userId, objMessage, io, socket) => {

  let custConversations = await CustomerConversation.find({ conversationId, user: { $ne: userId } }).select('user userType')
  if (!_.isEmpty(custConversations)) {
    let users = custConversations.map((item) => item.user)
    // check user online and notification by socket if has user online
    if (users && users.length > 0 && io) {
      CustomerSocket.find({ user: { $in: users }, channel: 'CHAT' }, (err, docs) => {
        if (err) throw err
        if (!_.isEmpty(docs)) {
          for (let i = 0; i < docs.length; i++) {
            const item = docs[i];
            io.to(item.idSocket).emit('responseNewMessage', { data: objMessage, conversationId })
          }
        }
      })

      // notification with firebase
      // if (objMessage.messageType && objMessage.messageType === 'TEXT') {
      //   let fcmTokens = await FcmCustomer.find({ user: { $in: users } }).select('fcmToken')
      //   if (fcmTokens && fcmTokens.length > 0) {
      //     for (let i = 0; i < fcmTokens.length; i++) {
      //       const element = fcmTokens[i]
      //       if (element.fcmToken) {
      //         FireBaseService.sendMessage({
      //           title: 'Bạn có tin nhắn mới',
      //           message: objMessage.message,
      //           fcmToken: element.fcmToken,
      //           data: { referenceCode: `NEW_CHAT_MESSAGE` }
      //         })
      //       }
      //     }
      //   }
      // }
    }
  }
}

const pushConversation = async (conversationId, io, userId) => {

  const latestConveration = await Conversation.findById(conversationId).populate({
    path: 'latestCustomerConveration',
    populate: {
      path: 'User',
      select: 'fullname username avatar_url email'
    },
  }).populate({
    path: 'biddingEntity',
    select: 'company',
    populate: {
      path: 'company',
      select: 'logo companyName nationalName shortName phone fax numEmployee representName'
    },
  }).populate({
    path: 'tendererEntity',
    select: 'company',
    populate: {
      path: 'company',
      select: 'logo companyName nationalName shortName phone fax numEmployee representName'
    },
  })
  let custConversations = await CustomerConversation.find({ conversationId })
  if (!_.isEmpty(custConversations)) {
    let userIds = []
    const objMapConversation = custConversations.reduce((obj, item) => {
      userIds.push(item.user.toString())
      if(!obj[item.user.toString()]) {
        obj[item.user.toString()] = item.numberOfUnreadMessages
      }
      return obj
    }, {})


    if (userIds && userIds.length > 0 && io) {
      CustomerSocket.find({ user: { $in: userIds }, channel: 'CHAT' }, (err, docs) => {
        if (err) throw err
        if (!_.isEmpty(docs)) {
          for (let i = 0; i < docs.length; i++) {
            const item = docs[i]
            let  numberOfUnreadMessages = objMapConversation[item.user.toString()] ? objMapConversation[item.user.toString()] : 0
            if (item.user.toString() !== userId) {
              latestConveration._doc.numberOfUnreadMessages = numberOfUnreadMessages

              io.to(item.idSocket).emit('responseNewConversation', { data: latestConveration })
            }
            
          }
        }
      })
    }
  }
}

const findAllConersationIdAdminHasJoins = async (user) => {
  let conversationIds = await CustomerConversation.find({ user: user, userType: 'STAFF' })
    .select('conversationId')
    .limit(config.pageSizeChat)
    .sort({ createdAt: -1 })

  if (conversationIds && conversationIds.length > 0) {
    return conversationIds.map((item) => item.conversationId)
  }
  return []
}

const updateInforChatConversation = async (input) => {
  let { guid, user, phoneNumber, fullName, conversationId, email, note, vsdAccountNo } = input

  let changeData = {}
  if (note) {
    changeData.note = note
  }
  if (email) {
    changeData.email = email
  }
  if (fullName) {
    changeData.fullName = fullName
  }
  if (phoneNumber) {
    changeData.phoneNumber = phoneNumber
  }
  if (user) {
    changeData.user = user
  }
  if (vsdAccountNo) {
    changeData.vsdAccountNo = vsdAccountNo
  }
  let custConversation = await CustomerConversation.findOneAndUpdate({ conversationId, userType: 'CUSTOMER' }, changeData)
  return custConversation

}

const registerFcmTokenToAccount = async (input) => {
  const { deviceType, userId, fcmToken } = input
  let sysdate = moment().format('YYYY-MM-DD HH:mm')

  let fcm = await FcmCustomer.findOne({ user: userId, deviceType })

  let changeData = {}
  if (deviceType) changeData.deviceType = deviceType
  if (userId) changeData.user = userId
  if (fcmToken) changeData.fcmToken = fcmToken

  if (!fcm) {
    FcmCustomer.create(changeData, (err) => {
      if (err) throw err
    })
  } else {
    changeData.updatedAt = sysdate
    FcmCustomer.findByIdAndUpdate(fcm._id, changeData, (err) => {
      if (err) throw err
    })
  }
}

module.exports = {
  findConversation,
  findMesages,
  customerCreateConversation,
  adminCreateConversation,
  createMessage,
  updateConversation,
  pushMessageAndNotification,
  findAllConersationIdAdminHasJoins,
  updateInforChatConversation,
  registerFcmTokenToAccount,
  pushConversation
}


