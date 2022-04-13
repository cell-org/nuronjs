class Token {
  constructor(core) {
    this.core = core
  }
  async build(body) {
    let res = await this.core.endpoint.request("POST", "/token/build", {
      payload: {
        domain: this.core.o.domain,
        body: body
      }
    })
    return res
  }
  async sign(token) {
    let res = await this.core.endpoint.request("POST", "/token/sign", {
      key: this.core.o.key,
      payload: token,
    })
    return res
  }
  async create(body) {
    let res = await this.core.endpoint.request("POST", "/token/create", {
      key: this.core.o.key,
      payload: {
        domain: this.core.o.domain,
        body: body
      }
    })
    return res
  }
}
module.exports = Token
