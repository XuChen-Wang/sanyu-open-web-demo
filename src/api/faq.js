import request from '@/utils/request'

/** ���� + FAQ �б� */
export function getFaqList(params) {
  return request({
    url: '/portal/site/faq/list',
    method: 'get',
    params
  })
}

/** �ؼ������� */
export function searchFaq(q, params = {}) {
  return request({
    url: '/portal/site/faq/search',
    method: 'get',
    params: { q, ...params }
  })
}
