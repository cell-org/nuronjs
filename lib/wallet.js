class Wallet {
  constructor(core) {
    this.core = core
  }
  async accounts() {
    let res = await this.core.endpoint.request("wallet", "GET", "/wallet/accounts")
    return res.response
  }
  async session() {
    let url = "/wallet/session"
    if (this.core.o && this.core.o.key) {
      url += ("?path=" + this.core.o.key)
    }
    let res = await this.core.endpoint.request("wallet", "GET", url)
    return res.response
  }
  async chain(chainId) {
    if (chainId) {
      let res = await this.core.endpoint.request("wallet", "GET", "/wallet/chains/" + chainId)
      return res.response
    } else {
      throw new Error("chainId required")
    }
  }
  async connect(password, username) {
    await this.core.endpoint.request("wallet", "POST", "/wallet/connect", {
      username: username, 
      password: password,
    })
  }
  async disconnect() {
    await this.core.endpoint.request("wallet", "POST", "/wallet/disconnect", { })
  }
  async delete(password) {
    await this.core.endpoint.request("wallet", "POST", "/wallet/delete", {
      password: password,
    })
  }
  async export(password, key) {
    let res = await this.core.endpoint.request("wallet", "POST", "/wallet/export", { password, key })
    return res.response
  }
  async import(password, seed, username) {
    let res = await this.core.endpoint.request("wallet", "POST", "/wallet/import", {
      username: username,
      password: password,
      seed: seed,
    })
    return res.response
  }
  async generate(password, username) {
    let res = await this.core.endpoint.request("wallet", "POST", "/wallet/generate", {
      username: username,
      password: password,
    })
    return res.response
  }
}
module.exports = Wallet
