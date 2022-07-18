const stringify = require('json-stringify-deterministic')
const fetch = require('cross-fetch');
const FormData = require('form-data')
const isBrowser = () => { return typeof window !== "undefined" }
const f2u = (file) => {
  return new Promise((resolve, reject) => {
    try {
      let reader = new FileReader();
      reader.readAsArrayBuffer(file);
      reader.onloadend = (e) => {
        resolve(new Uint8Array(e.target.result));
      }
    }
    catch (e) {
      reject(e);
    }
  })
}
class Endpoint {
  constructor(core) {
    this.core = core
  }
  async request(endpoint, method, path, payload, type) {
    let headers = (this.core.o && this.core.o.node && this.core.o.node[endpoint] && this.core.o.node[endpoint].token ? { "Authorization": "token " + this.core.o.node[endpoint].token } : null)
    if (method === "GET") {
      let url = (path.startsWith("http") ? path : this.core.o.node[endpoint].url + path)
      if (headers) {
        let r = await fetch(url, { headers }).then((res) => {
          if (res.ok) {
            return res.json()
          } else {
            return res.json().then((json) => {
              throw new Error(json.error)
            })
          }
        })
        return r;
      } else {
        let r = await fetch(url).then((res) => {
          if (res.ok) {
            return res.json()
          } else {
            return res.json().then((json) => {
              throw new Error(json.error)
            })
          }
        })
        return r;
      }
    } else {
      if (type === "blob") {
        let data;
        let type = payload.body.constructor.name;
        if (type === 'File') {
          if (isBrowser()) {
            let u = await f2u(payload.body)
            data = new Blob([u]);
          } else {
            throw Error("File object only supported in the browser")
          }
        } else if (type === 'Uint8Array') {
          if (isBrowser()) data = new Blob([payload.body]);
          else data = Buffer.from(payload.body.buffer)
        } else if (type === 'ArrayBuffer') {
          if (isBrowser()) data = new Blob([payload.body]);
          else data = Buffer.from(payload.body)
        } else if (type === "Blob") {
          if (isBrowser()) {
            data = payload.body
          } else {
            let arrayBuf = await payload.body.arrayBuffer()
            data = Buffer.from(new Uint8Array(arrayBuf).buffer)
          }
        } else if (type === "Buffer") {
          data = payload.body
        } else if (typeof payload.body === 'object' && typeof payload.body.pipe === 'function' && payload.body.readable !== false && typeof payload.body._read === "function" && typeof payload.body._readableState === "object") {
          data = payload.body
        } else {
          throw new Error("argument must be Uint8Array, ArrayBuffer, Blob, Buffer, or Stream")
        }
        let fd = new FormData()
        fd.append('file', data, { filename: "filename" })
        fd.append('workspace', payload.workspace)
        let r = await fetch(this.core.o.node[endpoint].url + path, {
          method: "POST",
          headers,
          body: fd
        }).then((res) => {
          if (res.ok) {
            return res.json()
          } else {
            return res.json().then((json) => {
              throw new Error(json.error)
            })
          }
        })
        return r
      } else {
        if (!headers) headers = {}
        headers["Content-Type"] = "application/json"
        let r = await fetch(this.core.o.node[endpoint].url + path, {
          method: "POST",
          headers,
          body: stringify(payload)
        }).then((res) => {
          if (res.ok) {
            return res.json()
          } else {
            return res.json().then((json) => {
              throw new Error(json.error)
            })
          }
        })
        return r
      }
    }
  }
}
module.exports = Endpoint
