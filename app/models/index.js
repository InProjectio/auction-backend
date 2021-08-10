const mongoose = require('mongoose')
const config = require('../../config')
const AutoIncrementFactory = require('mongoose-sequence')
mongoose.Promise = global.Promise

const initConnect = () => {
    const dbInproject = {}
    const conn = mongoose.createConnection(config.mongoURI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        useCreateIndex: true,
        useFindAndModify: false,
        // replicaSet      : 'rs0'
    })
    const AutoIncrement = AutoIncrementFactory(conn)
    dbInproject.mongoose = mongoose
    dbInproject.conn = conn
    dbInproject.Bidding = conn.model('Bidding', require('./Bidding').plugin(AutoIncrement, { inc_field: 'biddingSeq', start_seq: 10 }))
    dbInproject.Company = conn.model('Company', require('./Company').plugin(AutoIncrement, { inc_field: 'companySeq', start_seq: 10 }))
    dbInproject.Conversation = conn.model('Conversation', require('./Conversation'))
    dbInproject.CustomerConversation = conn.model('CustomerConversation', require('./CustomerConversation'))
    dbInproject.ConversationMessage = conn.model('ConversationMessage', require('./ConversationMessage'))
    dbInproject.CustomerSocket = conn.model('CustomerSocket', require('./CustomerSocket'))
    dbInproject.Entity = conn.model('Entity', require('./Entity').plugin(AutoIncrement, { inc_field: 'entitySeq', start_seq: 10 }))
    dbInproject.FcmCustomer = conn.model('FcmCustomer', require('./FcmCustomer'))
    dbInproject.ProjectUser = conn.model('ProjectUser', require('./ProjectUser'))
    dbInproject.Package = conn.model('Package', require('./Package').plugin(AutoIncrement, { inc_field: 'packageSeq', start_seq: 10 }))
    dbInproject.User = conn.model('User', require('./User').plugin(AutoIncrement, { inc_field: 'user_id', start_seq: 10 }))
    dbInproject.UserMapping = conn.model('UserMapping', require('./UserMapping').plugin(AutoIncrement, { inc_field: 'mapingSeq', start_seq: 10 }))
    console.log('Connect success MongoDB Bussiness')
    return dbInproject
}

module.exports = { 
    dbInproject: initConnect()
}