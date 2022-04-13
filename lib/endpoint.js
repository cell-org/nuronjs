const stringify = require('json-stringify-deterministic')
const fetch = require('cross-fetch');
const FormData = require('form-data')
const isBrowser = () => { return typeof window !== "undefined" }
class Endpoint {
  constructor(core) {
    this.core = core
  }
  async request(method, path, payload, type) {
    if (method === "GET") {
      let url = (path.startsWith("http") ? path : this.core.o.nuron + path)
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
    } else {
      if (type === "blob") {
        let data;
        let type = payload.body.constructor.name;
        if (type === 'Uint8Array') {
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
        let r = await fetch(this.core.o.nuron + path, {
          method: "POST",
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
        let r = await fetch(this.core.o.nuron + path, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
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
