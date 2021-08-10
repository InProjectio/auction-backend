var config = require('../../config');
var async = require('async')
var _ = require('lodash');
var ResponseCode = require('../../ResponseCode');
const multer = require('multer');
const mkdirp = require('mkdirp')
const path = require('path');
const Jimp = require('jimp');
var Chance = require('chance');
var chance = new Chance();
const Moment = require('moment')
const { extendMoment } = require('moment-range')
const moment = extendMoment(Moment)

function buildResponse(responseCode, responseText) {
    return new Object({ ResponseCode: responseCode, ResponseText: responseText});
}

function buildResponseObject({ code, message, data = '' }) {
    return {
        code,
        message,
        data
    }
}

function getClientIp(req) {
    return req.headers['x-forwarded-for'] ||
        req.connection.remoteAddress ||
        req.socket.remoteAddress ||
        req.connection.socket.remoteAddress;
}

function boDauTiengViet(str) {
    str = str.toLowerCase();
    str = str.replace(/à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ/g, "a");
    str = str.replace(/è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ/g, "e");
    str = str.replace(/ì|í|ị|ỉ|ĩ/g, "i");
    str = str.replace(/ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ/g, "o");
    str = str.replace(/ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ/g, "u");
    str = str.replace(/ỳ|ý|ỵ|ỷ|ỹ/g, "y");
    str = str.replace(/đ/g, "d");
    return str;
}

const renderFileName = (file) => {
    if (_.endsWith(file.mimetype, 'jpeg')) {
        return `${chance.guid()}.jpeg`
    } else if (_.endsWith(file.mimetype, 'jpg')) {
        return `${chance.guid()}.jpg`
    } else if (_.endsWith(file.mimetype, 'png')) {
        return `${chance.guid()}.png`
    } else if (_.endsWith(file.mimetype, 'gif')) {
        return `${chance.guid()}.gif`
    } else if (_.endsWith(file.mimetype, 'pdf')) {
        return `${chance.guid()}.pdf`
    } else if (_.endsWith(file.mimetype, 'xls') || _.endsWith(file.originalname, 'xls')) {
        return `${chance.guid()}.xls`
    } else if (_.endsWith(file.mimetype, 'doc') || _.endsWith(file.originalname, 'doc')) {
        return `${chance.guid()}.doc`
    } else if (_.endsWith(file.mimetype, 'docx') || _.endsWith(file.originalname, 'docx')) {
        return `${chance.guid()}.docx`
    } else if (_.endsWith(file.mimetype, 'xlsx') || _.endsWith(file.originalname, 'xlsx')) {
        return `${chance.guid()}.xlsx`
    } else if (_.endsWith(file.mimetype, 'svg+xml')) {
        return `${chance.guid()}.svg`
    }
}
const renderFileNameVideo = (file) => {
    if (_.endsWith(file.mimetype, 'flv')) {
        return `${chance.guid()}.flv`
    } else if (_.endsWith(file.mimetype, 'avi')) {
        return `${chance.guid()}.avi`
    } else if (_.endsWith(file.mimetype, 'wmv')) {
        return `${chance.guid()}.wmv`
    } else if (_.endsWith(file.mimetype, 'm4v')) {
        return `${chance.guid()}.m4v`
    } else if (_.endsWith(file.mimetype, '3gp')) {
        return `${chance.guid()}.3gp`
    } else if (_.endsWith(file.mimetype, 'mkv')) {
        return `${chance.guid()}.mkv`
    } else if (_.endsWith(file.mimetype, 'mp4')) {
        return `${chance.guid()}.mp4`
    } else if (_.endsWith(file.mimetype, 'f4v')) {
        return `${chance.guid()}.f4v`
    } else if (_.endsWith(file.mimetype, 'm4v')) {
        return `${chance.guid()}.m4v`
    } else if (_.endsWith(file.mimetype, 'm4v')) {
        return `${chance.guid()}.m4v`
    } else if (_.endsWith(file.mimetype, 'mpeg')) {
        return `${chance.guid()}.mpeg`
    } else if (_.endsWith(file.mimetype, 'm4v')) {
        return `${chance.guid()}.m4v`
    } else if (_.endsWith(file.mimetype, 'm4v')) {
        return `${chance.guid()}.m4v`
    } else if (_.endsWith(file.mimetype, 'rm')) {
        return `${chance.guid()}.rm`
    } else if (_.endsWith(file.mimetype, 'wmv')) {
        return `${chance.guid()}.wmv`
    }
}

const renderFileNameCompress = (file) => {
    if (_.endsWith(file.mimetype, 'rar')) {
        return `${chance.guid()}.rar`
    } else if (_.endsWith(file.mimetype, 'zip')) {
        return `${chance.guid()}.zip`
    }
}

var storageSingle = multer.diskStorage({
    destination: function (req, file, cb) {
        const dir = req.dir;
        mkdirp(dir, (err) => { // tao ra thu muc theo con..Id neu thu muc nay chua co
            if (err) {
                cb(new Error(ResponseCode.ERROR, 'Không thê upload document, vui lòng thử lại'))
            } else {
                cb(null, dir);
            }
        })
    },
    filename: function (req, file, cb) {
        var filetypes = /jpg|svg|jpeg|png|gif|pdf|doc|docx|xls|xlsx/;
        var mimetype = filetypes.test(file.mimetype);
        var extname = filetypes.test(path.extname(file.originalname));
        if (mimetype || extname) {
            var fileName = renderFileName(file);
            cb(null, fileName);
        } else {
            cb(new Error('Định dạng không hỗ trợ'))
        }
    }
});

var uploadForSingle = multer({ storage: storageSingle }).array('files', 1);

var uploadForMulti = multer({ storage: storageSingle }).any();

var uploadForSingleArtical = multer({ storage: storageSingle }).array('upload', 1);


var storageSingleVideo = multer.diskStorage({
    destination: function (req, file, cb) {
        const dir = req.dir;
        mkdirp(dir, (err) => { // tao ra thu muc theo con..Id neu thu muc nay chua co
            if (err) {
                cb(new Error(ResponseCode.ERROR, 'Không thê upload document, vui lòng thử lại'))
            } else {
                cb(null, dir);
            }
        })
    },
    filename: function (req, file, cb) {
        var filetypes = /flv|avi|wmv|m4v|3gp|mkv|mp4|f4v|m4v|mpeg|rm|rm|wmv/;
        var mimetype = filetypes.test(file.mimetype);
        var extname = filetypes.test(path.extname(file.originalname));
        if (mimetype || extname) {
            var fileName = renderFileNameVideo(file);
            cb(null, fileName);
        } else {
            cb(new Error('Định dạng không hỗ trợ'))
        }
    }
});

var uploadForSingleVideo = multer({ storage: storageSingleVideo }).array('files', 1);

var storageSingleCompress = multer.diskStorage({
    destination: function (req, file, cb) {
        const dir = req.dir;
        mkdirp(dir, (err) => { // tao ra thu muc theo con..Id neu thu muc nay chua co
            if (err) {
                cb(new Error(ResponseCode.ERROR, 'Không thê upload document, vui lòng thử lại'))
            } else {
                cb(null, dir);
            }
        })
    },
    filename: function (req, file, cb) {
        var filetypes = /rar|zip|jar/;
        var mimetype = filetypes.test(file.mimetype);
        var extname = filetypes.test(path.extname(file.originalname));
        if (mimetype || extname) {
            var fileName = renderFileNameCompress(file);
            cb(null, fileName);
        } else {
            cb(new Error('Định dạng không hỗ trợ'))
        }
    }
});

var uploadForSingleCompress = multer({ storage: storageSingleCompress }).array('files', 1);

exports.uploadSingleImage = function uploadSingleImage(req, res, callback) {
    uploadForSingle(req, res, function (err) {
        console.log('test', req.files)
        if (err || !req.files || req.files.length === 0) {
            callback(false, err == null ? new Error('Không có ảnh tải lên') : err)
        } else {
            const filename = req.files[0].filename;
            Jimp.read(req.dir + filename).then(function (lenna) {
                var width = lenna.bitmap.width; // the width of the image
                var height = lenna.bitmap.height; // the height of the image
                if (width > height && width > 900) {
                    width = 900;
                    height = Jimp.AUTO;
                } else if (height > width && height > 900) {
                    width = Jimp.AUTO;
                    height = 900;
                }
                /////////////////////////// resize anh nho lai
                lenna.resize(width, height)
                    .quality(90)                 // set JPEG quality
                    .write(req.dir + filename); // save
                //////////////////////////// luu lai anh thumb
                mkdirp(req.dirThumb, (err) => { // tao ra thu muc theo con..Id neu thu muc nay chua co
                    if (err) {
                        callback(true, err);
                    } else {
                        if (width === -1 || height === -1) { // neu width dang la auto thi no se la -1
                            width = width === -1 ? Jimp.AUTO : 300;
                            height = height === -1 ? Jimp.AUTO : 300;
                        } else { // neu height la auto
                            if (width > height && width > 300) {
                                width = 300;
                                height = Jimp.AUTO;
                            } else if (height > width && height > 300) {
                                width = Jimp.AUTO;
                                height = 300;
                            }
                        }
                        lenna.resize(width, height)
                            .quality(80)                 // set JPEG quality
                            .write(req.dirThumb + filename); // save
                        /////////////////////////////
                        callback(false, 'Success', filename)
                    }
                })
            }).catch(function (err) {
                console.log('------------err---------------');
                console.log(err);
                callback(true, err, '');
            });
        }
    })
}

exports.uploadMultiImage = function uploadMultiImage(req, res, callback) {
    // console.log('test1', req.files)
    uploadForMulti(req, res, function (err) {
        console.log('test', req.files)
        if (err || !req.files || req.files.length === 0) {
            callback(false, err == null ? new Error('Không có ảnh tải lên') : err, '')
        } else {
            for (let i = 0; i < req.files.length; i++) {
                const item = req.files[i]
                let filename = item.filename
                // let filename = req.files[0].filename
                Jimp.read(req.dir + filename).then(function (lenna) {
                    var width = lenna.bitmap.width; // the width of the image
                    var height = lenna.bitmap.height; // the height of the image
                    if (width > height && width > 900) {
                        width = 900;
                        height = Jimp.AUTO;
                    } else if (height > width && height > 900) {
                        width = Jimp.AUTO;
                        height = 900;
                    }
                    /////////////////////////// resize anh nho lai
                    lenna.resize(width, height)
                        .quality(90)                 // set JPEG quality
                        .write(req.dir + filename); // save
                    //////////////////////////// luu lai anh thumb
                    mkdirp(req.dirThumb, (err) => { // tao ra thu muc theo con..Id neu thu muc nay chua co
                        if (err) {
                            callback(true, err, '');
                        } else {
                            if (width === -1 || height === -1) { // neu width dang la auto thi no se la -1
                                width = width === -1 ? Jimp.AUTO : 300;
                                height = height === -1 ? Jimp.AUTO : 300;
                            } else { // neu height la auto
                                if (width > height && width > 300) {
                                    width = 300;
                                    height = Jimp.AUTO;
                                } else if (height > width && height > 300) {
                                    width = Jimp.AUTO;
                                    height = 300;
                                }
                            }
                            lenna.resize(width, height)
                                .quality(80)                 // set JPEG quality
                                .write(req.dirThumb + filename); // save
                            /////////////////////////////
                            callback(false, 'Success', filename)
                        }
                    })
                }).catch(function (err) {
                    console.log('------------err---------------');
                    console.log(err);
                    callback(true, err, '');
                });
            }
        }
    })
}


// send to device
exports.PushNotificationsUsingFirebaseAdminWithData = function PushNotificationsUsingFirebaseAdminWithData(req, title, body, data, fcmIds) {
    const admin = req.app.locals.admin;
    const customDataConfig = {
        show_in_foreground: true,
        click_action: 'OPEN_ACTIVITY',
        sound: 'default',
        title: title,
        body: body,
        priority: 'high',
        auto_cancel: true,
        icon: 'ic_logo',
        large_icon: 'ic_logo',
        contentAvailable: true,
        vibrate: 300,
        lights: true
    }
    //
    const resp = { data }
    Object.assign(resp, customDataConfig);
    const payload = {
        notification: {
            title: title,
            click_action: "OPEN_ACTIVITY",
            body: body,
            content_available: 'true',
            icon: 'ic_logo',
            large_icon: 'ic_logo',
            sound: "default",
        },
        data: {
            type: "MEASURE_CHANGE",
            custom_notification: JSON.stringify(resp)
        }
    }
    return new Promise((resolve, reject) => {
        if (fcmIds && fcmIds !== '') {
            admin.messaging().sendToDevice(fcmIds, payload)
                .then(function (response) {
                    resolve(response)
                    console.log(response);
                    console.log('--------------------ban thong bao feedback--------------------');
                })
                .catch(function (error) {
                    reject(error);
                    console.log(error);
                });
        }
    })
}

// send to topic
exports.PushNotificationsTopicUsingFirebaseAdminWithData = function PushNotificationsTopicUsingFirebaseAdminWithData(req, title, body, data, topicName) {
    const admin = req.app.locals.admin;
    const customDataConfig = {
        show_in_foreground: true,
        click_action: 'OPEN_ACTIVITY',
        sound: 'default',
        title: title,
        body: body,
        priority: 'high',
        auto_cancel: true,
        icon: 'ic_logo',
        large_icon: 'ic_logo',
        contentAvailable: true,
        vibrate: 300,
        lights: true
    }
    //
    const resp = { data }
    Object.assign(resp, customDataConfig);
    const payload = {
        notification: {
            title: title,
            click_action: "OPEN_ACTIVITY",
            body: body,
            content_available: 'true',
            icon: 'ic_logo',
            large_icon: 'ic_logo',
            sound: "default",
        },
        data: {
            type: "MEASURE_CHANGE",
            custom_notification: JSON.stringify(resp)
        }
    }
    return new Promise((resolve, reject) => {
        if (topicName && topicName !== '') {
            const topic = boDauTiengViet('/topics/' + topicName);
            admin.messaging().sendToTopic(topic, payload).then(function (response) {
                resolve(response)
                console.log(response);
                console.log('--------------------ban thong bao feedback topic--------------------');
            }).catch(function (error) {
                reject(error);
                console.log(error);
            });
        }
    })
}


exports.SubscribeFcmIdToTopic = function SubscribeFcmIdToTopic(req, fcmIds, topic, phoneNumber, callback) {
    var admin = req.app.locals.admin;
    topic = boDauTiengViet(topic)
    // Subscribe the device corresponding to the registration token to the
    // topic. max subscribe is 1000 so we need to split
    if (fcmIds && fcmIds.length > 0) {
        admin.messaging().subscribeToTopic(fcmIds, topic)
            .then(function (response) {
                // See the MessagingTopicManagementResponse reference documentation
                // for the contents of response.
                console.log('----------------------------');
                console.log('SubscribeFcmIdToTopic: ' + topic);
                console.log(response);
                var indexToRemove = [];
                if (response.failureCount > 0) {
                    async.everySeries(response.errors, function (error, callbackError) {
                        // console.log(error.error)
                        indexToRemove.push(error.index);
                        callbackError(null, true);
                    }, (err) => {
                        _.pullAt(fcmIds, indexToRemove); // Xoa cac fcm id bi loi ra khoi mang fcm ids
                        //Cap nhat vao db
                        // models.Parent.update(
                        //     { fcmIds: fcmIds },
                        //     { where: { phoneNumber: phoneNumber } }
                        // ).then(numberOfRowUpdated => {
                        //     console.log('FcmIds: ');
                        //     console.log(fcmIds)
                        // })
                    });
                }
                callback(response)
            })
            .catch(function (error) {
                // console.log('----------------------------');
                // console.log('SubscribeFcmIdToTopic: ' + topic);
                // console.log(fcmIds);
                console.log(error)
                console.log('----------------------------');
                callback(error)
            });
    } else {
        callback('FCMID is NULL')
    }
}

exports.UnSubscribeFcmIdToTopic = function UnSubscribeFcmIdToTopic(req, fcmIds, topic, callback) {
    var admin = req.app.locals.admin;
    topic = boDauTiengViet(topic);
    // Subscribe the device corresponding to the registration token to the
    // topic. max subscribe is 1000 so we need to split
    if (fcmIds && fcmIds.length > 0) {
        admin.messaging().unsubscribeFromTopic(fcmIds, topic)
            .then(function (response) {
                // See the MessagingTopicManagementResponse reference documentation
                // for the contents of response.
                console.log('----------------------------');
                console.log('UnSubscribeFcmIdToTopic: ' + topic);
                console.log('FcmIds: ');
                console.log(fcmIds);
                console.log(response)
                // console.log(response.errors[0].error)
                // console.log('----------------------------');
                callback(response)
            }).catch(function (error) {
                // console.log('----------------------------');
                // console.log('UnSubscribeFcmIdToTopic: ' + topic);
                console.log('Loiii: ');
                // console.log(fcmIds);
                console.log(error)
                console.log('----------------------------');
                callback(error)
            });
    } else {
        callback('FCMID is NULL')
    }
}


exports.checkLength255 = function checkLength255(input, text) {
    if (input.length === 0) {
        return text + ' không được để trống';
    } else if (input.length > 255) {
        return text + ' không được dài quá 255 ký tự';
    } else {
        return '';
    }
}

exports.lastIndex = function lastIndex(page, limit) {
    return (_.toNumber(page) - 1) * limit
}

exports.getLimitOffset = function getLimitOffset(page, pageSize, totalRow) {
    const mPageSize = pageSize ? pageSize : config.pageSize;
    const mPage = page ? parseInt(page) : 1
    var offset = (_.toNumber(mPage) - 1) * mPageSize;
    var totalPages = Math.ceil(totalRow / mPageSize);

    return {
        limit: mPageSize,
        offset: offset,
        totalPages: totalPages,
        totalElements: totalRow,
        page: mPage,
        pageSize: mPageSize
    }
}

function getRandomCode(length) {
    length = length || 8
    var result = '';
    var characters = 'abcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for (var i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}

function responseError(res, message, responseCode = ResponseCode.ERROR, status = 400) {
    return res.status(status).send(buildResponseObject({
        code: responseCode,
        message
    }))
}

function responseSuccess(res, message, data) {
    return res.status(200).send(buildResponseObject({
        code: ResponseCode.SUCCESS,
        message: message || message['vi']['request.success'],
        data
    }))
}

function getCommonSort(sort, sortType, isAdvance = false) {
    let result = {}
    if (sort && sortType) {
        if (isAdvance) {
            result[`sort.${sort}`] = sortType
        } else {
            result[sort] = sortType
        }
        return result
    }
    return { 'updatedAt': 'desc' }
}

var enumerateDaysBetweenDatesIgnoreDayOfWeek = (startDate, endDate, arrIngoreDayOfWeek = []) => {
    const start = moment(startDate);
    const end = moment(endDate);
    const range = moment.range(start, end)
    let arr = Array.from(range.by('day'))
    return arr.reduce((arr, item) => {
        if (!arrIngoreDayOfWeek.includes(item.weekday())) {
            arr.push(item.format('YYYY-MM-DD'))
        }
        return arr
    }, [])

}

const trimText = (value) => (value ? value.trim() : '')

exports.buildResponse = buildResponse;
exports.buildResponseObject = buildResponseObject
exports.boDauTiengViet = boDauTiengViet;
exports.uploadForSingle = uploadForSingle;
exports.uploadForSingleArtical = uploadForSingleArtical
exports.uploadForMulti = uploadForMulti
exports.uploadForSingleVideo = uploadForSingleVideo
exports.uploadForSingleCompress = uploadForSingleCompress
exports.getRandomCode = getRandomCode
exports.responseError = responseError
exports.responseSuccess = responseSuccess
exports.getCommonSort = getCommonSort
exports.enumerateDaysBetweenDatesIgnoreDayOfWeek = enumerateDaysBetweenDatesIgnoreDayOfWeek
exports.getClientIp = getClientIp
exports.trimText = trimText