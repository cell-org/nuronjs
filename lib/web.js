class Web {
  constructor(core) {
    this.core = core
  }
  async build() {
    let res = await this.core.endpoint.request("POST", "/web/build", {
      workspace: this.core.o.workspace,
      domain: this.core.o.domain,
    })
    return res
  }
}
module.exports = Web
