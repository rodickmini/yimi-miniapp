import _ from 'lodash'

const tools = {
  isRealTrue(val) {
    if (_.isObject(val)) {
      return !_.isEmpty(val)
    } else if (_.isNumber(val)) {
      return _.isNumber(val)
    }
    return val
  },

  /**
   ***************************************** 该项目独有 ************************************************
   */

  /**
   * 获取事件的指定绑定值
   * @param e {Event} event
   * @param key {String} 指定的键
   */
  getDataset(e, key) {
    const dataset = e.currentTarget.dataset
    return dataset[key]
  }
}

export default Object.assign(_, tools)
