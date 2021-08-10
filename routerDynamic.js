
const { authPassport } = require('./app/middlewares')
const config = require('./config')
/*

quy dinh: private: cac api can login, can cho them roles.isLogin
quy dinh: public: cac api ko can login

*/
module.exports = {
  routerList: [
    {
      method: 'post',
      url: '/public/insert-product',
      urlRequest: `${config.domainInternal}/api/public/insert-product`,
      params: [],
      roles: []
    },
    {
      method: 'put',
      url: '/public/update-product',
      urlRequest: `${config.domainInternal}/api/public/update-product`,
      params: [':productId'],
      roles: []
    },
    {
      method: 'get',
      url: '/public/find-product',
      urlRequest: `${config.domainInternal}/api/public/find-product`,
      params: [],
      roles: []
    },
    {
      method: 'post',
      url: '/admin/private/save-make',
      urlRequest: `${config.domainInternal}/api/public/save-make`,
      params: [],
      roles: [authPassport.checkRolePermissions]
    },
    {
      method: 'post',
      url: '/admin/private/save-model',
      urlRequest: `${config.domainInternal}/api/public/save-model`,
      params: [],
      roles: [authPassport.checkRolePermissions]
    },
    {
      method: 'get',
      url: '/public/find-all-make',
      urlRequest: `${config.domainInternal}/api/public/find-all-make`,
      params: [],
      roles: []
    },
    {
      method: 'get',
      url: '/admin/private/find-make',
      urlRequest: `${config.domainInternal}/api/public/find-make`,
      params: [],
      roles: [authPassport.checkRolePermissions]
    },
    {
      method: 'get',
      url: '/admin/private/find-model',
      urlRequest: `${config.domainInternal}/api/public/find-model`,
      params: [],
      roles: [authPassport.checkRolePermissions]
    },
    {
      method: 'get',
      url: '/public/find-all-model-by-make',
      urlRequest: `${config.domainInternal}/api/public/find-all-model-by-make`,
      params: [],
      roles: []
    },
    {
      method: 'post',
      url: '/admin/private/save-car',
      urlRequest: `${config.domainInternal}/api/public/save-car`,
      params: [],
      roles: [authPassport.checkRolePermissions]
    },
    {
      method: 'post',
      url: '/customer/private/save-car',
      urlRequest: `${config.domainInternal}/api/public/customer/save-car`,
      params: [],
      roles: [authPassport.checkRolePermissions]
    },
    {
      method: 'put',
      url: '/admin/private/car-change-status',
      urlRequest: `${config.domainInternal}/api/public/car-change-status`,
      params: [':carId'],
      roles: [authPassport.checkRolePermissions]
    },
    {
      method: 'get',
      url: '/admin/private/find-car',
      urlRequest: `${config.domainInternal}/api/public/find-car`,
      params: [],
      roles: [authPassport.checkRolePermissions]
    },
    {
      method: 'get',
      url: '/admin/private/find-detail-car',
      urlRequest: `${config.domainInternal}/api/public/find-detail-car`,
      params: [],
      roles: [authPassport.checkRolePermissions]
    },
    {
      method: 'post',
      url: '/admin/private/manage-item-car',
      urlRequest: `${config.domainInternal}/api/admin/manage-item-car`,
      params: [],
      roles: [authPassport.checkRolePermissions]
    },
    {
      method: 'get',
      url: '/public/find-all-submodel',
      urlRequest: `${config.domainInternal}/api/public/find-all-submodel`,
      params: [],
      roles: []
    },
    {
      method: 'get',
      url: '/admin/private/find-item-detail',
      urlRequest: `${config.domainInternal}/api/public/find-item-detail`,
      params: [],
      roles: [authPassport.checkRolePermissions]
    },
    {
      method: 'get',
      url: '/admin/private/find-item-car',
      urlRequest: `${config.domainInternal}/api/public/find-item-car`,
      params: [],
      roles: [authPassport.checkRolePermissions]
    },
    {
      method: 'get',
      url: '/admin/private/find-item-accessory',
      urlRequest: `${config.domainInternal}/api/admin/find-item-accessory`,
      params: [],
      roles: [authPassport.checkRolePermissions]
    },
    {
      method: 'get',
      url: '/admin/private/find-item-history',
      urlRequest: `${config.domainInternal}/api/public/find-item-history`,
      params: [],
      roles: [authPassport.checkRolePermissions]
    },
    {
      method: 'post',
      url: '/admin/private/save-promote',
      urlRequest: `${config.domainInternal}/api/admin/save-promote`,
      params: [],
      roles: [authPassport.checkRolePermissions]
    },
    {
      method: 'put',
      url: '/admin/private/change-status-promote',
      urlRequest: `${config.domainInternal}/api/admin/change-status-promote`,
      params: [':promotionId'],
      roles: [authPassport.checkRolePermissions]
    },
    {
      method: 'get',
      url: '/customer/private/find-promote',
      urlRequest: `${config.domainInternal}/api/public/find-promote`,
      params: [],
      roles: [authPassport.checkRolePermissions]
    },
    {
      method: 'get',
      url: '/admin/private/find-promote',
      urlRequest: `${config.domainInternal}/api/admin/find-promote`,
      params: [],
      roles: [authPassport.checkRolePermissions]
    },
    {
      method: 'post',
      url: '/customer/private/check-promote',
      urlRequest: `${config.domainInternal}/api/user/check-promote`,
      params: [],
      roles: [authPassport.checkRolePermissions]
    },
    {
      method: 'post',
      url: '/customer/private/add-order',
      urlRequest: `${config.domainInternal}/api/public/add-order`,
      params: [],
      roles: [authPassport.checkRolePermissions]
    },
    {
      method: 'get',
      url: '/customer/private/get-payment-link',
      urlRequest: `${config.domainInternal}/api/public/get-payment-link`,
      params: [],
      roles: [authPassport.checkRolePermissions]
    },
    {
      method: 'post',
      url: '/customer/private/accessory-add-order',
      urlRequest: `${config.domainInternal}/api/public/accessory-add-order`,
      params: [],
      roles: [authPassport.checkRolePermissions]
    },
    {
      method: 'put',
      url: '/customer/private/pay-order',
      urlRequest: `${config.domainInternal}/api/public/pay-order`,
      params: [':orderId'],
      roles: [authPassport.checkRolePermissions]
    },
    {
      method: 'get',
      url: '/public/onepay-ipn-update',
      urlRequest: `${config.domainInternal}/api/public/onepay-ipn-update`,
      roles: [],
      params: []
    },
    {
      method: 'get',
      url: '/public/find-advance-car',
      urlRequest: `${config.domainInternal}/api/public/find-advance-car`,
      params: [],
      roles: []
    },
    {
      method: 'get',
      url: '/public/find-detail-search',
      urlRequest: `${config.domainInternal}/api/public/find-detail-search`,
      params: [],
      roles: []
    },
    {
      method: 'post',
      url: '/customer/private/asign-order-item',
      urlRequest: `${config.domainInternal}/api/public/asign-order-item`,
      params: [],
      roles: [authPassport.checkRolePermissions]
    },
    {
      method: 'get',
      url: '/admin/private/find-order',
      urlRequest: `${config.domainInternal}/api/admin/find-order`,
      params: [],
      roles: [authPassport.checkRolePermissions]
    },
    {
      method: 'get',
      url: '/admin/private/find-order-detail',
      urlRequest: `${config.domainInternal}/api/admin/find-order-detail`,
      params: [],
      roles: [authPassport.checkRolePermissions]
    },
    {
      method: 'get',
      url: '/customer/private/find-order-owner',
      urlRequest: `${config.domainInternal}/api/public/customer/find-order-owner`,
      params: [],
      roles: [authPassport.checkRolePermissions]
    },
    {
      method: 'put',
      url: '/customer/private/delete-order',
      urlRequest: `${config.domainInternal}/api/public/customer/delete-order`,
      params: [':orderId'],
      roles: [authPassport.checkRolePermissions]
    },
    {
      method: 'get',
      url: '/admin/private/find-order-detail',
      urlRequest: `${config.domainInternal}/api/public/find-order-detail`,
      params: [],
      roles: [authPassport.checkRolePermissions]
    },
    {
      method: 'get',
      url: '/customer/private/find-order-detail',
      urlRequest: `${config.domainInternal}/api/public/find-order-detail`,
      params: [],
      roles: [authPassport.checkRolePermissions]
    },
    {
      method: 'post',
      url: '/admin/private/assign-order-to-unit',
      urlRequest: `${config.domainInternal}/api/admin/assign-order-to-unit`,
      params: [],
      roles: [authPassport.checkRolePermissions]
    },
    {
      method: 'put',
      url: '/admin/private/realocate-order-to-unit',
      urlRequest: `${config.domainInternal}/api/admin/realocate-order-to-unit`,
      params: [':assignItemId'],
      roles: [authPassport.checkRolePermissions]
    },
    {
      method: 'get',
      url: '/admin/private/assign-item/find-item',
      urlRequest: `${config.domainInternal}/api/admin/assign-item/find-item`,
      params: [],
      roles: [authPassport.checkRolePermissions]
    },
    {
      method: 'put',
      url: '/admin/private/assign-item/change-status',
      urlRequest: `${config.domainInternal}/api/admin/assign-item/change-status`,
      params: [':assignItemId'],
      roles: [authPassport.checkRolePermissions]
    },
    {
      method: 'get',
      url: '/admin/private/assign-item/find-detail',
      urlRequest: `${config.domainInternal}/api/admin/assign-item/find-detail`,
      params: [],
      roles: [authPassport.checkRolePermissions]
    },
    {
      method: 'put',
      url: '/admin/private/assign-item/reassign-item',
      urlRequest: `${config.domainInternal}/api/admin/assign-item/reassign-item`,
      params: [':assignItemId'],
      roles: [authPassport.checkRolePermissions]
    },
    {
      method: 'get',
      url: '/admin/private/transaction/change-status',
      urlRequest: `${config.domainInternal}/api/admin/transaction/change-status`,
      params: [':transId'],
      roles: [authPassport.checkRolePermissions]
    },
    {
      method: 'put',
      url: '/admin/private/transaction/set-staff',
      urlRequest: `${config.domainInternal}/api/admin/transaction/set-staff`,
      params: [':transactionId'],
      roles: [authPassport.checkRolePermissions]
    },
    {
      method: 'put',
      url: '/admin/private/transaction/change-status',
      urlRequest: `${config.domainInternal}/api/admin/transaction/change-status`,
      params: [':transactionId'],
      roles: [authPassport.checkRolePermissions]
    },
    {
      method: 'get',
      url: '/admin/private/transaction/find-trans',
      urlRequest: `${config.domainInternal}/api/admin/transaction/find-trans`,
      params: [],
      roles: [authPassport.checkRolePermissions]
    },
    {
      method: 'get',
      url: '/admin/private/transaction/find-trans-detail',
      urlRequest: `${config.domainInternal}/api/admin/transaction/find-trans-detail`,
      params: [],
      roles: [authPassport.checkRolePermissions]
    },
    {
      method: 'get',
      url: '/admin/private/car-owner/find-car-owner',
      urlRequest: `${config.domainInternal}/api/admin/car-owner/find-car-owner`,
      params: [],
      roles: [authPassport.checkRolePermissions]
    },
    {
      method: 'get',
      url: '/admin/private/car-owner/find-car-owner-detail',
      urlRequest: `${config.domainInternal}/api/admin/car-owner/find-car-owner-detail`,
      params: [],
      roles: [authPassport.checkRolePermissions]
    },
    {
      method: 'post',
      url: '/admin/private/save-params',
      urlRequest: `${config.domainInternal}/api/public/save-params`,
      params: [],
      roles: [authPassport.checkRolePermissions]
    },
    {
      method: 'get',
      url: '/admin/private/find-param-by-code',
      urlRequest: `${config.domainInternal}/api/public/find-param-by-code`,
      params: [],
      roles: [authPassport.checkRolePermissions]
    },
    {
      method: 'get',
      url: '/admin/private/find-params',
      urlRequest: `${config.domainInternal}/api/public/find-params`,
      params: [],
      roles: [authPassport.checkRolePermissions]
    },
    {
      method: 'get',
      url: '/customer/public/find-accessory-all-group-make',
      urlRequest: `${config.domainInternal}/api/public/find-accessory-all-group-make`,
      params: [],
      roles: []
    },
    {
      method: 'get',
      url: '/customer/public/find-accessory-by-make',
      urlRequest: `${config.domainInternal}/api/public/find-accessory-by-make`,
      params: [],
      roles: []
    },
    {
      method: 'post',
      url: '/admin/private/manage-item-accessory',
      urlRequest: `${config.domainInternal}/api/admin/manage-item-accessory`,
      params: [],
      roles: [authPassport.checkRolePermissions]
    },
    {
      method: 'post',
      url: '/admin/private/save-accessory',
      urlRequest: `${config.domainInternal}/api/admin/save-accessory`,
      params: [],
      roles: [authPassport.checkRolePermissions]
    },
    {
      method: 'put',
      url: '/admin/private/accessory-change-status',
      urlRequest: `${config.domainInternal}/api/admin/accessory-change-status`,
      params: [':accessoryId'],
      roles: [authPassport.checkRolePermissions]
    },
    {
      method: 'put',
      url: '/admin/private/delete-accessory',
      urlRequest: `${config.domainInternal}/api/admin/delete-accessory`,
      params: [':accessoryId'],
      roles: [authPassport.checkRolePermissions]
    },
    {
      method: 'put',
      url: '/admin/private/change-status-accessory',
      urlRequest: `${config.domainInternal}/api/admin/change-status-accessory`,
      params: [':accessoryId'],
      roles: [authPassport.checkRolePermissions]
    },
    {
      method: 'get',
      url: '/public/find-advance-accessory',
      urlRequest: `${config.domainInternal}/api/public/find-advance-accessory`,
      params: [],
      roles: []
    },
    {
      method: 'get',
      url: '/admin/private/find-accessory',
      urlRequest: `${config.domainInternal}/api/admin/find-accessory`,
      params: [],
      roles: [authPassport.checkRolePermissions]
    },
    {
      method: 'get',
      url: '/public/find-detail-accessory',
      urlRequest: `${config.domainInternal}/api/public/find-detail-accessory`,
      params: [],
      roles: [authPassport.checkRolePermissions]
    },
    {
      method: 'get',
      url: '/admin/private/find-detail-accessory',
      urlRequest: `${config.domainInternal}/api/public/admin/find-detail-accessory`,
      params: [],
      roles: [authPassport.checkRolePermissions]
    },
    {
      method: 'post',
      url: '/admin/private/save-category',
      urlRequest: `${config.domainInternal}/api/admin/save-category`,
      params: [],
      roles: [authPassport.checkRolePermissions]
    },
    {
      method: 'get',
      url: '/public/get-category',
      urlRequest: `${config.domainInternal}/api/public/get-category`,
      params: [],
      roles: []
    },
    {
      method: 'post',
      url: '/admin/private/evaluation/assign-to-unit',
      urlRequest: `${config.domainInternal}/api/admin/evaluation/assign-to-unit`,
      params: [],
      roles: [authPassport.checkRolePermissions]
    },
    {
      method: 'put',
      url: '/admin/private/evaluation/setting',
      urlRequest: `${config.domainInternal}/api/admin/evaluation/setting`,
      params: [':evaluationId'],
      roles: [authPassport.checkRolePermissions]
    },
    {
      method: 'put',
      url: '/admin/private/evaluation/reassign-to-unit',
      urlRequest: `${config.domainInternal}/api/admin/evaluation/reassign-to-unit`,
      params: [':evaluationId'],
      roles: [authPassport.checkRolePermissions]
    },
    {
      method: 'put',
      url: '/admin/private/evaluation/check-old-car',
      urlRequest: `${config.domainInternal}/api/admin/evaluation/check-old-car`,
      params: [':product'],
      roles: [authPassport.checkRolePermissions]
    },
    {
      method: 'get',
      url: '/admin/private/evaluation/find-evaluation',
      urlRequest: `${config.domainInternal}/api/admin/evaluation/find-evaluation`,
      params: [],
      roles: [authPassport.checkRolePermissions]
    },
    {
      method: 'get',
      url: '/admin/private/evaluation/find-detail-evaluation',
      urlRequest: `${config.domainInternal}/api/admin/evaluation/find-detail-evaluation`,
      params: [],
      roles: [authPassport.checkRolePermissions]
    },
    {
      method: 'put',
      url: '/admin/private/evaluation/change-status-oldcar',
      urlRequest: `${config.domainInternal}/api/admin/evaluation/change-status-oldcar`,
      params: [':product'],
      roles: [authPassport.checkRolePermissions]
    },
    {
      method: 'get',
      url: '/public/find-make-by-country',
      urlRequest: `${config.domainInternal}/api/public/find-make-by-country`,
      params: [],
      roles: []
    },
    {
      method: 'post',
      url: '/user/save-cmt',
      urlRequest: `${config.domainInternal}/api/user/save-cmt`,
      params: [],
      roles: [authPassport.checkRolePermissions]
    },
    {
      method: 'get',
      url: '/user/get-cmt',
      urlRequest: `${config.domainInternal}/api/user/get-cmt`,
      params: [],
      roles: []
    },
    {
      method: 'post',
      url: '/user/save-watched',
      urlRequest: `${config.domainInternal}/api/user/save-watched`,
      params: [],
      roles: [authPassport.checkRolePermissions]
    },
    {
      method: 'get',
      url: '/user/find-watched',
      urlRequest: `${config.domainInternal}/api/user/find-watched`,
      params: [],
      roles: [authPassport.checkRolePermissions]
    },
    {
      method: 'post',
      url: '/user/save-bmsearch',
      urlRequest: `${config.domainInternal}/api/user/save-bmsearch`,
      params: [],
      roles: [authPassport.checkRolePermissions]
    },
    {
      method: 'get',
      url: '/user/get-all-bmsearch',
      urlRequest: `${config.domainInternal}/api/user/get-all-bmsearch`,
      params: [],
      roles: [authPassport.checkRolePermissions]
    },
    {
      method: 'put',
      url: '/user/delete-all-bmsearch',
      urlRequest: `${config.domainInternal}/api/user/delete-all-bmsearch`,
      params: [],
      roles: [authPassport.checkRolePermissions]
    },
    {
      method: 'get',
      url: '/public/find-most-sold-car',
      urlRequest: `${config.domainInternal}/api/public/find-most-sold-car`,
      params: [],
      roles: []
    },
    {
      method: 'post',
      url: '/user/save-bm',
      urlRequest: `${config.domainInternal}/api/user/save-bm`,
      params: [],
      roles: [authPassport.checkRolePermissions]
    },
    {
      method: 'get',
      url: '/user/find-bm',
      urlRequest: `${config.domainInternal}/api/user/find-bm`,
      params: [],
      roles: [authPassport.checkRolePermissions]
    },
    {
      method: 'get',
      url: '/user/find-bmIds',
      urlRequest: `${config.domainInternal}/api/user/find-bmIds`,
      params: [],
      roles: [authPassport.checkRolePermissions]
    },
    {
      method: 'get',
      url: '/public/quick-search',
      urlRequest: `${config.domainInternal}/api/public/quick-search`,
      params: [],
      roles: []
    },
    {
      method: 'get',
      url: '/public/find-most-found-accessories',
      urlRequest: `${config.domainInternal}/api/public/find-most-found-accessories`,
      params: [],
      roles: []
    },
    {
      method: 'get',
      url: '/admin/private/find-all-comment',
      params: [],
      urlRequest: `${config.domainInternal}/api/admin/find-all-comment`,
    },
    {
      method: 'get',
      url: '/admin/private/find-accessory-by-product',
      urlRequest: `${config.domainInternal}/api/admin/find-accessory-by-product`,
      params: [],
      roles: [authPassport.checkRolePermissions]
    },
    {
      method: 'post',
      url: '/admin/private/inactive-comment',
      urlRequest: `${config.domainInternal}/api/admin/inactive-comment`,
      params: [],
      roles: [authPassport.checkRolePermissions]
    }, {
      method: 'get',
      url: '/admin/private/manage-item/find-detail',
      urlRequest: `${config.domainInternal}/api/admin/manage-item/find-detail`,
      params: [],
      roles: [authPassport.checkRolePermissions]
    },
    {
      method: 'get',
      url: '/public/find-most-sold-accessories',
      urlRequest: `${config.domainInternal}/api/public/find-most-sold-accessories`,
      params: [],
      roles: []
    },
    {
      method: 'post',
      url: '/customer/private/add-basket',
      urlRequest: `${config.domainInternal}/api/user/add-basket`,
      params: [],
      roles: [authPassport.checkRolePermissions]
    },
    {
      method: 'put',
      url: '/customer/private/update-basket',
      urlRequest: `${config.domainInternal}/api/user/update-basket`,
      params: [':basketId'],
      roles: [authPassport.checkRolePermissions]
    },
    {
      method: 'get',
      url: '/customer/private/find-all-basket',
      urlRequest: `${config.domainInternal}/api/user/find-all-basket`,
      params: [],
      roles: [authPassport.checkRolePermissions]
    },
    {
      method: 'get',
      url: '/user/not-rate-order',
      urlRequest: `${config.domainInternal}/api/user/not-rate-order`,
      params: [],
      roles: [authPassport.checkRolePermissions]
    }, {
      method: 'get',
      url: '/public/find-accessories-unit',
      urlRequest: `${config.domainInternal}/api/public/find-accessories-unit`,
      params: [],
      roles: []
    },
    {
      method: 'get',
      url: '/public/find-item-accessory',
      urlRequest: `${config.domainInternal}/api/public/find-item-accessory`,
      params: [],
      roles: []
    },
    {
      method: 'get',
      url: '/admin/private/find-all-comment',
      params: [],
      urlRequest: `${config.domainInternal}/api/admin/find-all-comment`,
    },
    {
      method: 'get',
      url: '/user/find-basket-count',
      params: [],
      urlRequest: `${config.domainInternal}/api/user/find-basket-count`,
      roles: [authPassport.checkRolePermissions]
    },
    {
      method: 'put',
      url: '/admin/private/comment/change-status',
      params: [':commentId'],
      urlRequest: `${config.domainInternal}/api/admin/comment/change-status`,
      roles: [authPassport.checkRolePermissions]
    },
    {
      method: 'get',
      url: '/admin/private/comment/find-comment',
      params: [],
      urlRequest: `${config.domainInternal}/api/admin/comment/find-comment`,
      roles: [authPassport.checkRolePermissions]
    },
    {
      method: 'post',
      url: '/customer/private/car-request/save-request',
      params: [],
      urlRequest: `${config.domainInternal}/api/public/customer/car-request/save-request`,
      roles: [authPassport.checkRolePermissions]
    },
    {
      method: 'put',
      url: '/admin/private/car-request/assign-to-unit',
      params: [':requestId'],
      urlRequest: `${config.domainInternal}/api/admin/car-request/assign-to-unit`,
      roles: [authPassport.checkRolePermissions]
    },
    {
      method: 'put',
      url: '/admin/private/car-request/reassign-to-unit',
      params: [':requestId'],
      urlRequest: `${config.domainInternal}/api/admin/car-request/reassign-to-unit`,
      roles: [authPassport.checkRolePermissions]
    },
    {
      method: 'put',
      url: '/admin/private/car-request/set-staff',
      params: [':requestId'],
      urlRequest: `${config.domainInternal}/api/admin/car-request/set-staff`,
      roles: [authPassport.checkRolePermissions]
    },
    {
      method: 'put',
      url: '/admin/private/car-request/change-status',
      params: [':requestId'],
      urlRequest: `${config.domainInternal}/api/admin/car-request/change-status`,
      roles: [authPassport.checkRolePermissions]
    },
    {
      method: 'get',
      url: '/admin/private/car-request/find-request',
      params: [],
      urlRequest: `${config.domainInternal}/api/admin/car-request/find-request`,
      roles: [authPassport.checkRolePermissions]
    },
    {
      method: 'get',
      url: '/admin/private/car-request/find-request-detail',
      params: [],
      urlRequest: `${config.domainInternal}/api/admin/car-request/find-request-detail`,
      roles: [authPassport.checkRolePermissions]
    },
    {
      method: 'put',
      url: '/admin/private/restore-item-history',
      params: [':historyId'],
      urlRequest: `${config.domainInternal}/api/admin/restore-item-history`,
      roles: [authPassport.checkRolePermissions]
    },
  ]
}
