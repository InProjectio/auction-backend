const moment = require('moment')
const _ = require('lodash');
const config = require('../../config')
const { CustomerSocket, CustomerConversation, Conversation, User } = require('../models').dbInproject
const ChatService = require('./ChatService')
const FireBaseService = require('../helpers/FireBaseService')

exports = module.exports = function (io) {

    io.sockets.on('connection', (socket) => {
        // console.log(socket.request.user)
        // console.log('socket.guid:', socket.guid);
        if (!socket.userId) {
            console.log('not found guid chat socket')
            return
        }

        // console.log('user connect ===>', socket.id)

        CustomerSocket.findOneAndUpdate({ user: socket.userId },
            { user: socket.userId, idSocket: socket.id, channel: 'CHAT' }, { upsert: true }, (err) => {
                if (err) throw err
            })

        socket.on('disconnectManually', () => {
            socket.disconnect()
        })

        socket.on('disconnect', () => {
            console.log('user disconnect ===>', socket.id)
            CustomerSocket.deleteMany({ user: socket.userId }, (err) => {
                if (err) throw err
            })
        })

        socket.on('requestJoinRoom', async (data) => {
            socket.join(data.conversationId)
            console.log(data.conversationId)
            CustomerConversation.updateOne(
                { conversationId: data.conversationId, user: socket.userId },
                { numberOfUnreadMessages: 0, updatedAt: moment().format('YYYY-MM-DD HH:mm') }, (err) => {
                    if (err) throw err
                })
        })

        socket.on('requestLeaveRoom', function (data) {
            console.log(socket.conversationId + 'Leave room');
            socket.leave(data.conversationId);
        })

        socket.on('requestGetConversations', async () => {
            let conversations = await ChatService.findConversation({ page: 1, pageSize: config.pageSizeConveration, userId: socket.userId })
            socket.emit('responseGetConversations', {
                data: conversations
            })
        })

        socket.on('requestGetMessages', async (data) => {
            const conversationId = data.conversationId
            if (!conversationId) return

            const page = data.page ? _.toNumber(data.page) : 1
            const pageSize = data.pageSize ? _.toNumber(data.pageSize) : config.pageSizeChat

            let messages = await ChatService.findMesages({ page, pageSize, conversationId })

            socket.emit('responseGetMessages', {
                data: messages,
                conversationId
            })
        })

        socket.on('requestSendMessage', async (data) => {
            const { conversationId, message, messageType, tempId } = data
            // let sysdate = moment().format('YYYY-MM-DD HH:mm')

            if (!conversationId) return

            const insertData = {
                conversationId: conversationId,
                user: socket.userId,
                message: message,
                messageType,
                imageUrl: '',
                videoUrl: '',
                soundUrl: '',
            }

            let objMessage = await ChatService.createMessage(insertData)
            objMessage.user = {
                _id: socket.userId
            }
            socket.emit('responseNewMessage', { data: {...objMessage, tempId}, conversationId })

            let user = await User.findById(socket.userId).select('fullName _id email fullname avatar_url ')
            objMessage.user = user

            // send channelMessage and pushNotification
            await ChatService.pushMessageAndNotification(conversationId, socket.userId, objMessage, io, socket)

            await CustomerConversation.updateMany(
                { conversationId, user: { $ne: socket.userId } },
                { latestMessage: insertData.message, $inc: { numberOfUnreadMessages: 1 } }
            )
            const latestCustomerConveration = await CustomerConversation.findOneAndUpdate(
                { conversationId, user: socket.userId },
                { updatedAt: moment().format('YYYY-MM-DD HH:mm'), latestMessage: insertData.message }
            )

            await Conversation.updateOne({ _id: latestCustomerConveration.conversationId }, { latestCustomerConveration: latestCustomerConveration._id, updatedAt: moment().format('YYYY-MM-DD HH:mm') })

            await ChatService.pushConversation(conversationId, io, socket.userId)
            // push all conversations    
        })
    })
}