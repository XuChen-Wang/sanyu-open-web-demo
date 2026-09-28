import request from '@/utils/request'

export function createPayOrder(data) {
  return request({
    url: '/portal/pay/orders',
    method: 'post',
    data
  })
}

/** 查询数据库字典中当前启用的余额充值金额档位。 */
export function getRechargeAmounts() {
  return request({
    url: '/portal/pay/recharge-orders/amounts',
    method: 'get'
  })
}

/** 创建余额充值订单，金额由后端数据库字典校验。 */
export function createRechargeOrder(data) {
  return request({
    url: '/portal/pay/recharge-orders',
    method: 'post',
    data
  })
}

export function getPayOrder(orderNo) {
  return request({
    url: `/portal/pay/orders/${encodeURIComponent(orderNo)}`,
    method: 'get'
  })
}

export function queryPayOrder(orderNo) {
  return request({
    url: `/portal/pay/orders/${encodeURIComponent(orderNo)}/query`,
    method: 'post'
  })
}
