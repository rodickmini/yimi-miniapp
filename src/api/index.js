import constVar from '../js/constVar'
import apijson from './apiJson'
import {getStore} from 'wepy-redux'

const store = getStore()
const {apiDomain} = constVar

const api = {}

apijson.forEach(val => {
  const {url, ...opt} = val
  const [controller, fun] = url.split('/')
  if (!api[controller]) {
    api[controller] = {}
  }
  api[controller][fun] = function (data) {
    return post(url, data, opt)
  }
})

export default {
  ...api
}

/**
 *
 * @param url
 * @param data
 * @param opt
 * {
 *  header: {},
 *  method: 'POST',
 *  dataType: 'json',
 *  check: resdata => !resdata.err,
 *  isNeedToken: true
 *  }
 * @returns {Promise<any>}
 */
async function post(url, data = {}, opt) {
  const app = getApp()
  data.time = +new Date()
  let opts = Object.assign({
    header: {},
    isNeedToken: true
  }, opt)

  if (app !== undefined) {
    let jwt = store.getState().utils.jwt
    if (opts.isNeedToken && (!jwt || jwt.expire_after * 1000 <= +new Date())) { // 已过期，去续租
      const jwt = await renewToken()
      store.dispatch({
        type: 'setJwt',
        data: jwt
      })
      Object.assign(opts.header, {Authorization: jwt.token})
      return doRequest(apiDomain + url, data, opts)
    } else {
      Object.assign(opts.header, {Authorization: jwt.token})
      return doRequest(apiDomain + url, data, opts)
    }
  } else {
    return doRequest(apiDomain + url, data, opts)
  }
}

function renewToken() {
  return new Promise((resolve, reject) => {
    wx.login({
      success: res => {
        let code = res.code
        if (wx.getSetting) {
          wx.getSetting({
            success: (res) => {
              if (!res.authSetting['scope.userInfo']) { // 如果用户没有授权
                wx.navigateTo({
                  url: './login'
                })
                reject()
                return false
              } else { //如果用户已经授权
                login(code).then((jwt) => {
                  resolve(jwt) // resolve jwt
                }) //通过code进行登录
              }
            }
          })
        } else {
          wx.showModal({
            title: '提示',
            content: '当前微信版本过低，无法使用部分功能，请升级到最新微信版本后重试。'
          })
        }
      }
    })
  })
}

function getToken(unionid_value, resolve, clientType, gender, model, screenHeight, screenWidth, openid, networkType, os, userInfo, token) {
  doRequest(apiDomain + '/sns/wxLogin', {
    token: token,
    unionid: unionid_value,
    nickname: userInfo.nickName,
    head_img_url: userInfo.avatarUrl,
    gender: gender,
    city: userInfo.city,
    province: userInfo.province,
    country: userInfo.country,
    client_type: clientType,
    phone_model: model,
    os: os,
    screen_height: screenHeight,
    screen_width: screenWidth,
    network_type: networkType
  }).then(res => {
    let userinfo = res.data.data.user
    let phone = res.data.data.user.phone_num
    let jwt = res.data.data.jwt

    store.dispatch({
      type: 'setUserInfo',
      data: {
        uid: userinfo.id,
        openid: openid,
        unionid: unionid_value,
        nickName: userinfo.nickname,
        avatarUrl: userinfo.head_img_url
      }
    })

    if (phone) {
      store.dispatch({
        type: 'setPhone',
        data: phone
      })
    }

    wx.setStorageSync('userinfo', userinfo)
    if (phone) {
      wx.setStorageSync('phone', phone)
    }
    resolve(jwt) // resolve jwt
  })
}

/**
 * 登陆，获取jwt
 * @param code
 * @returns {Promise<any>}
 */
function login(code) {
  return new Promise((resolve) => {
    doRequest(apiDomain + '/sns/getToken', {code: code}).then(res => {
      const {openid, token, unionid} = res.data.data
      const {userInfo, encrypted_data, login_iv} = store.getState().utils.userInfoRes
      wx.getSystemInfo({
        success: res => {
          const system = res.system
          const clientType = system.indexOf('iOS') !== -1 ? 1 : 0 // 0：Android   1：iOS
          const gender = 2 - userInfo.gender // 0：女  1：男  2：未知
          const model = res.model,
            os = system,
            screenHeight = res.screenHeight * 2,
            screenWidth = res.screenWidth * 2
          wx.getNetworkType({
            success: async res => {
              const networkType = res.networkType
              let uni
              if (unionid) {
                uni = unionid
              } else {
                const res = await doRequest(apiDomain + '/sns/wxdecryptWithNoLogin', {
                  encrypted_data: encrypted_data,
                  iv: login_iv,
                  token: token
                })
                uni = res.data.data.unionId
              }
              getToken(uni, resolve, clientType, gender, model, screenHeight, screenWidth, openid, networkType, os, userInfo, token)
            }
          })
        }
      })
    })
  })
}

/**
 * 请求接口
 * @param url
 * @param data 传参
 * @param opt 见./apiJson.json注释
 * @returns {Promise<any>}
 * !!! 总是被解决，永远不会被拒绝，不过你可以通过判断是否有rejectType值来判断是否请求OK
 * rejectType === 'http' 是请求出错
 * rejectType === 'server' 是后台处理出错，需要check函数提供判断逻辑
 */
function doRequest(url, data, opt) {
  const {header, method, dataType, check} = Object.assign({
    header: {},
    method: 'POST',
    dataType: 'json',
    check: resdata => !resdata.err
  }, opt)
  return new Promise((resolve, reject) => {
    wx.request({
      url,
      data,
      header,
      method,
      dataType,
      success: (res) => {
        if (check(res.data)) {
          resolve(res)
        } else {
          resolve(Object.assign({
            rejectType: 'server'
          }, res))
        }
      },
      fail: (err) => {
        resolve(Object.assign({
          rejectType: 'http'
        }, err))
      }
    })
  })
}