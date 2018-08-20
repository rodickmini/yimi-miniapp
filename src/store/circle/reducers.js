import { handleActions } from 'redux-actions'
import { getArticleArr } from './types'

export default handleActions({
  [getArticleArr] (state, action) {
    state.articleArrObj[action.data.key] = action.data.val
    return {
      ...state,
      articleArrObj: state.articleArrObj
    }
  },
  setCircleList (state, action) {
    return {
      ...state,
      circleList: action.data
    }
  }
}, {
  articleArrObj: {},
  systemInfo: wx.getSystemInfoSync(),
  circleList: []
})
