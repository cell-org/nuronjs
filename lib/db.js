class DB {
  constructor(core) {
    this.core = core
  }
  async write(table, body) {
    await this.core.endpoint.request("workspace", "POST", "/db/write", {
      workspace: this.core.o.workspace,
      table: table,
      payload: body
    })
  }
  async read(table, query) {
    let res = await this.core.endpoint.request("workspace", "POST", "/db/read", {
      workspace: this.core.o.workspace,
      table: table,
      payload: query
    })
    return res.response
  }
  async readOne(table, query) {
    let res = await this.core.endpoint.request("workspace", "POST", "/db/readOne", {
      workspace: this.core.o.workspace,
      table: table,
      payload: query
    })
    return res.response
  }
  async rm(table, query) {
    await this.core.endpoint.request("workspace", "POST", "/db/rm", {
      workspace: this.core.o.workspace,
      table: table,
      payload: query
    })
  }
}
module.exports = DB
