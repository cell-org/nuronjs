class FS {
  constructor(core) {
    this.core = core
  }
  async write (o) {
    let r;
    let type = o.constructor.name;
    if (type === 'Uint8Array') {
      r = await this.upload(o)
    } else if (type === 'ArrayBuffer') {
      r = await this.upload(o)
    } else if (type === "Blob") {
      r = await this.upload(o)
    } else if (type === "Buffer") {
      r = await this.upload(o)
    } else if (typeof o === 'object' && typeof o.pipe === 'function' && o.readable !== false && typeof o._read === "function" && typeof o._readableState === "object") {
      r = await this.upload(o)
    } else if (typeof o === 'string') {
      r = await this.upload(new TextEncoder().encode(o))
    } else if (typeof o === "object") {
      r = await this.json(o)
    } else {
      throw new Error("argument must be Uint8Array, ArrayBuffer, Blob, Buffer, Stream, string, or JSON")
    }
    return r;
  }
  async upload(blob) {
    let res = await this.core.endpoint.request("POST", "/fs/binary", {
      workspace: this.core.o.workspace,
      body: blob,
    }, "blob")
    return res.cid
  }
  async json(o) {
    let res = await this.core.endpoint.request("POST", "/fs/json", {
      workspace: this.core.o.workspace,
      body: o,
    })
    return res.cid
  }
  async rm(cids) {
    await this.core.endpoint.request("POST", "/fs/rm", {
      workspace: this.core.o.workspace,
      cids: cids
    })
  }
  async pin(cid, cb) {
    let interval
    if (cb) {
      interval = setInterval(async () => {
        let r = await this.core.endpoint.request("POST", "/fs/pin/progress", {
          workspace: this.core.o.workspace
        })
        cb({
          completed: r.completed,
          total: r.total,
          progress: r.completed/r.total
        })
      }, 2000)
    }
    let res = await this.core.endpoint.request("POST", "/fs/pin", {
      workspace: this.core.o.workspace,
      cid
    })
    if (cb) clearInterval(interval)
    return res.response
  }
}
module.exports = FS
