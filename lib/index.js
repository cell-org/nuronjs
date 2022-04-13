const Endpoint = require('./endpoint')
const FS = require('./fs')
const Token = require('./token')
const DB = require('./db')
const Web = require('./web')
const Wallet = require('./wallet')
class Nuron {
  constructor(o) {
    //  o := {
    //    key: bip44,
    //    fs: folderPath,
    //    domain: domain,
    //    nuron: nuronURL
    //  }
    this.o = (o ? o : {})
    if (!this.o.nuron) {
      this.o.nuron = "http://localhost:42000"
    }
    this.endpoint = new Endpoint(this)
    this.wallet = new Wallet(this)
    this.fs = new FS(this)
    this.db = new DB(this)
    this.token = new Token(this)
    this.web = new Web(this)
  }
  async config() {
    let res = await this.endpoint.request("GET", "/config")
    return res
  }
  async configure(config) {
    /*
      config := {
        ipfs: <nft.storage key>
      }
    */
    let r = await this.endpoint.request("POST", "/configure", config)
    return r.response
  }
}
module.exports = Nuron
