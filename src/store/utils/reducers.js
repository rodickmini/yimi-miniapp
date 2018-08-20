import { handleActions } from 'redux-actions'

export default handleActions({
  setJwt (state, action) {
    wx.setStorage({ key: 'jwt', data: action.data })
    return {
      ...state,
      jwt: action.data
    }
  },
  setUserInfoRes (state, action) {
    wx.setStorage({ key: 'userInfoRes', data: action.data })
    return {
      ...state,
      userInfoRes: action.data
    }
  },
  setUserInfo (state, action) {
    wx.setStorage({ key: 'userInfo', data: action.data })
    return {
      ...state,
      userInfo: action.data
    }
  },
  setPhone (state, action) {
    wx.setStorage({ key: 'phone', data: action.data })
    return {
      ...state,
      phone: action.data
    }
  },
  setJwtReadCallback (state, action) {
    return {
      ...state,
      jwtReadCallback: action.data
    }
  }
}, {
  jwt: wx.getStorageSync('jwt'),
  userInfoRes: wx.getStorageSync('userInfoRes') || {},
  jwtReadCallback: '',
  userInfo: wx.getStorageSync('userInfo') || {}
})
