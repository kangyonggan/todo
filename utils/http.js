/**
 * 基础请求地址
 */
// const BASE_URL = 'http://localhost:8080/';
const BASE_URL = 'https://kangyonggan.com/api/';
/**
 * 请求超时时间（秒）
 */
const TIMEOUT = 30;

/**
 * get请求
 * 
 * @param {*} url 
 */
function get(url) {
  return new Promise((resolve, reject) => {
    send("GET", url, {}, resolve, reject);
  })
}
/**
 * post请求
 * 
 * @param {*} url 
 */
function post(url, data) {
  return new Promise((resolve, reject) => {
    send("POST", url, data, resolve, reject);
  })
}
/**
 * put请求
 * 
 * @param {*} url 
 */
function put(url, data) {
  return new Promise((resolve, reject) => {
    send("PUT", url, data, resolve, reject);
  })
}
/**
 * request请求
 * 
 * @param {*} url 
 */
function request(method, url, data) {
  return new Promise((resolve, reject) => {
    send(method, url, data, resolve, reject);
  })
}
/**
 * delete请求
 * 
 * @param {*} url 
 */
function del(url, data) {
  return new Promise((resolve, reject) => {
    send("DELETE", url, data, resolve, reject);
  })
}

/**
 * 网络请求
 * 
 * @param {*} method 
 * @param {*} url 
 * @param {*} data 
 * @param {*} resolve 
 * @param {*} reject 
 */
function send(method, url, data, resolve, reject) {
  wx.request({
    method: method,
    url: BASE_URL + url,
    data: data,
    timeout: TIMEOUT * 1000,
    header: {
      'openid': wx.getStorageSync('openid')
    },
    success(res) {
      if (res.data.respCo == '0000') {
        resolve(res.data.data);
      } else {
        reject(res.data.respMsg);
      }
    },
    fail: function (e) {
      console.log(e);
      reject('网络不稳定，请稍后再试！');
    }
  })
}

module.exports = {
  get: get,
  post: post,
  put: put,
  delete: del,
  request: request
}