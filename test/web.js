const Util = require('./util')
const { expect } = require('chai')
const Nuron = require('../index')
const C0 = require('c0js')
const Web3 = require('web3')
const fs = require('fs')
var nurond;
var nuron;
var c0
var web3
describe("web", () => {
  beforeEach(async () => {
    // start nuron server
    nurond = await Util.nurond() 
    nuron = new Nuron({
      key: "m'/44'/60'/0'/0/0",
      workspace: "nuronjs_test",
      domain: {
        "address":"0x93f4f1e0dca38dd0d35305d57c601f829ee53b51",
        "chainId":4,
        "name":"_test_"
      }
    })
    web3 = new Web3()
    c0 = new C0()
    await c0.init({ web3, key: process.env.RINKEBY_PRIVATE_KEY })
  })
  afterEach(async () => {
    await nurond.stop()
  })
  it("web.build()", async () => {
    let files = await fs.promises.readdir(__dirname + "/__nuron__/home/workspace")
    expect(files.length).to.equal(0)

    await nuron.web.build()
    files = await fs.promises.readdir(__dirname + "/__nuron__/home/workspace/nuronjs_test/web")
    expect(files.length).to.equal(2)
    expect(files).to.deep.equal(["index.html", "token.html"])
  })
})
