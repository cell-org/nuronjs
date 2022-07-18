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
    if (o.node) {
      if (typeof o.node === "object") {
        if (o.node.workspace && o.node.wallet) {
          // do nothing
        } else if (o.node.nuron) {
          o.node = {
            workspace: o.node.nuron,
            wallet: o.node.nuron,
          }
        } else {
          throw new Error("the 'node' object must contain 'workspace' and 'wallet' attributes, or a 'nuron' attribute")
        }
      } else {
        throw new Error("the 'node' attribute must be an object")
      }
    } else {
      o.node = {
        wallet: {
          url: "http://localhost:42000",
        },
        workspace: {
          url: "http://localhost:42000",
        }
      }
    }

    this.o = (o ? o : {})
    this.endpoint = new Endpoint(this)
    this.wallet = new Wallet(this)
    this.fs = new FS(this)
    this.db = new DB(this)
    this.token = new Token(this)
    this.web = new Web(this)
  }
  async config() {
    let res = await this.endpoint.request("workspace", "GET", "/config")
    return res
  }
  async configure(config) {
    /*
      config := {
        ipfs: <nft.storage key>
      }
    */
    let r = await this.endpoint.request("workspace", "POST", "/configure", config)
    return r.response
  }
}
module.exports = Nuron
