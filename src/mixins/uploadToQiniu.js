import wepy from 'wepy'
import api from '../api'
import qiniuUploader from '../js/qiniuUploader'
import constVar from '../js/constVar'
const { qiniu } = constVar
/**
 * 上传图片
 * @param files 文件的临时路径数组
 * @param type 类型
 * @returns {Promise<any>} 包含一些信息
 */
async function getTokenAndUpload(files, type = 'image') {
  const res = await api.upload.batchToken({files, type})
  if (res.errType) {
    return false
  }
  let keyTokenArr = res.data.data
  let paras = []
  const getWHPromise = files.map((path, index) => {
    paras.push({
      path,
      key: keyTokenArr[index].key,
      token: keyTokenArr[index].token,
      dest: keyTokenArr[index].dest
    })
    if (type === 'image') {
      return new Promise(resolve => {
        wx.getImageInfo({
          src: path,
          success(res) {
            resolve(res)
          }
        })
      })
    }
  })

  const promises = paras.map((para) => upload2Qiniu(para.path, para.key, para.token, para.dest))
  if (type === 'image') {
    promises.push(...getWHPromise)
  }
  const remoteImagesArr = await Promise.all(promises)
  const arr = []
  let len = remoteImagesArr.length
  if (type === 'image') {
    len = remoteImagesArr.length / 2
  }
  for (let i = 0; i < len; i++) {
    let obj = { src: keyTokenArr[i].dest }
    if (type === 'image') {
      obj = {
        src: keyTokenArr[i].dest,
          img_height: remoteImagesArr[len + i].height,
        img_width: remoteImagesArr[len + i].width
      }
    }
    arr.push(obj)
  }
  return arr
}

function upload2Qiniu(tempFilePath, key, token, dest) {
  return new Promise((resolve, reject) => {
    qiniuUploader.upload(tempFilePath, (res) => {
      if (res.error) {
        console.log(res)
      } else {
        resolve(dest)
      }
    }, (error) => {
      console.error('error: ' + JSON.stringify(error))
      reject(error)
    }, {
      region: qiniu.region,
      key: key,
      uptoken: token
    })
  })
}

export default class uploadToQiniuMixin extends wepy.mixin {
  uploadToQiniu = getTokenAndUpload
}