
const moment = require('moment');
const { Package } = require('../../../models').dbInproject

const selectingBiddingChangeStatus = async () => {
    let sysdate = moment().format('YYYY-MM-DD HH:mm')
    try {
        Package.updateMany({ toReceiveDate: { $gte: sysdate.split(' ')[0] } }, { status: 'SELECTING', updatedAt: sysdate }, (err) => {
            if (err) throw err
        })
    } catch (error) {
        console.log(error)
    }
}


module.exports = {
    selectingBiddingChangeStatus
}


