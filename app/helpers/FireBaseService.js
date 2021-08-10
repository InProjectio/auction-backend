const admin = require('firebase-admin')
const config = require('../../config')
const FcmCustomer = require('../models/FcmCustomer')

const sendMessage = async (msgInput) => {
    if (!config.isEnablePushNoti) {
        return
    }
    const icon = msgInput.icon ? `${msgInput.icon}` : null
    const message = msgInput.message ? `${msgInput.message}` : ''
    const title = msgInput.title ? `${msgInput.title}` : ''

    const data = {
        message,
        title,
    }
    if (icon) data.icon = icon
    if (msgInput.data && msgInput.data.referenceId) data.referenceId = `${msgInput.data.referenceId}`
    if (msgInput.data && msgInput.data.referenceCode) data.referenceCode = `${msgInput.data.referenceCode}`
    if (msgInput.data && msgInput.data.referencePath) data.referencePath = `${msgInput.data.referencePath}`

    const notification = {
        body: message,
        title
    }
    if (icon) notification.icon = icon
    if (msgInput.data && msgInput.data.referenceId) notification.referenceId = `${msgInput.data.referenceId}`
    // if (msgInput.data && msgInput.data.referenceCode) notification.referenceCode = `${msgInput.data.referenceCode}`
    if (msgInput.data && msgInput.data.referencePath) notification.referencePath = `${msgInput.data.referencePath}`

    try {
        const result = admin.messaging().send({
            data,
            notification,
            token: msgInput.fcmToken
        }).catch((error) => {
            const errCode = error.errorInfo.code;
            if (errCode == 'messaging/registration-token-not-registered') {
                FcmCustomer.deleteOne({ fcmToken: msgInput.fcmToken }).exec((err) => {
                    if (err) console.log(err)
                })
                console.log('Error sending message:', error);
            }
        });
        console.log(result);
    } catch (error) {
        console.log(error);
    }
}

const sendTopicMessage = async (msgInput) => {
    if (!config.isEnablePushNoti) {
        return
    }
    const message = {
        data: {
            message: msgInput.message ? msgInput.message : '',
            title: msgInput.title ? msgInput.title : ''
        },
        notification: {
            body: msgInput.message ? msgInput.message : '',
            title: msgInput.title ? msgInput.title : ''
        },
        topic: msgInput.topic
    }
    if (msgInput.code) {
        message.data.code = msgInput.code
        // message.notification.code = msgInput.code
    }
    try {
        const resutl = await admin.messaging().send(message)
        console.log(resutl);
    } catch (error) {
        console.log(error);
    }
}

const subcribeTopic = async (fcmTokens, topic) => {
    if (!config.isEnablePushNoti) {
        return
    }
    try {
        let result = await admin.messaging().subscribeToTopic(fcmTokens, topic)
        console.log(result)
    } catch (error) {
        console.log(error);
    }
}

const unSubcribeTopic = async (fcmTokens, topic) => {
    if (!config.isEnablePushNoti) {
        return
    }
    try {
        await admin.messaging().unsubscribeFromTopic(fcmTokens, topic)
    } catch (error) {
        console.log(error);
    }
}

module.exports = {
    sendMessage,
    sendTopicMessage,
    subcribeTopic,
    unSubcribeTopic,
}