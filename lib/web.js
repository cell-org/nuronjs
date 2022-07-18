class Web {
  constructor(core) {
    this.core = core
  }
  async build(o) {
    let payload = {
      workspace: this.core.o.workspace,
      domain: this.core.o.domain,
    }
    if (o) {
      payload = Object.assign(payload, o)
    }
    await this.core.endpoint.request("workspace", "POST", "/web/build", payload)
  }
}
module.exports = Web
