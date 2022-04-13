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
describe("token", () => {
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
  it('build() should fail when not logged in', async () => {
    const buf = Buffer.from("hello world")
    let cid = await c0.util.cid(buf)
    try {
      let token = await nuron.token.build({
        cid: cid 
      })
    } catch (e) {
      expect(e.message).to.equal("not logged in")
    }
  })
  it('create() should fail when not logged in', async () => {
    const buf = Buffer.from("hello world")
    let cid = await c0.util.cid(buf)
    try {
      let token = await nuron.token.create({
        cid: cid 
      })
    } catch (e) {
      expect(e.message).to.equal("not logged in")
    }
  })
  it("build() should work when logged in, and isomorphic to using c0.token.build()", async () => {
    try {
      // try importing
      await nuron.wallet.import("password", Util.seed, "__test__")
    } catch (e) {
      // if failed, try connecting instead 
      await nuron.wallet.connect("password", "__test__")
    }
    const buf = Buffer.from("hello world")
    let cid = await c0.util.cid(buf)
    let token = await nuron.token.build({
      cid: cid 
    })
    console.log("token", token)
    expect(token.domain).to.exist
    expect(token.domain.verifyingContract).to.exist
    expect(token.domain.chainId).to.exist
    expect(token.domain.name).to.exist
    expect(token.domain.version).to.exist
    expect(token.body).to.exist

    let localToken = await c0.token.build({
      domain: {
        "address":"0x93f4f1e0dca38dd0d35305d57c601f829ee53b51",
        "chainId":4,
        "name":"_test_"
      },
      body: {
        cid: cid
      }
    })
    expect(token).to.deep.equal(localToken)
  })
  it("create() should work when logged in, and isomorphic to using c0.token.create()", async () => {
    try {
      // try importing
      await nuron.wallet.import("password", Util.seed, "__test__")
    } catch (e) {
      // if failed, try connecting instead 
      await nuron.wallet.connect("password", "__test__")
    }
    const buf = Buffer.from("hello world")
    let cid = await c0.util.cid(buf)
    let token = await nuron.token.create({
      cid: cid 
    })
    console.log("token", token)
    expect(token.domain).to.exist
    expect(token.domain.verifyingContract).to.exist
    expect(token.domain.chainId).to.exist
    expect(token.domain.name).to.exist
    expect(token.domain.version).to.exist
    expect(token.body).to.exist

    let localToken = await c0.token.create({
      domain: {
        "address":"0x93f4f1e0dca38dd0d35305d57c601f829ee53b51",
        "chainId":4,
        "name":"_test_"
      },
      body: {
        cid: cid
      }
    })

    expect(token.body.signature).to.exist
    expect(localToken.body.signature).to.exist
    console.log("localToken", localToken)
    delete token.body.signature
    delete localToken.body.signature
    expect(token).to.deep.equal(localToken)
  })
  it("sign() should work when logged in", async () => {
    try {
      // try importing
      await nuron.wallet.import("password", Util.seed, "__test__")
    } catch (e) {
      // if failed, try connecting instead 
      await nuron.wallet.connect("password", "__test__")
    }
    const buf = Buffer.from("hello world")
    // build the token locally
    let cid = await c0.util.cid(buf)
    let localToken = await c0.token.build({
      domain: {
        "address":"0x93f4f1e0dca38dd0d35305d57c601f829ee53b51",
        "chainId":4,
        "name":"_test_"
      },
      body: {
        cid: cid
      }
    })
    console.log("localToken", localToken)
    // ask nuron to sign the token 
    let signedToken = await nuron.token.sign(localToken)
    console.log("token", signedToken)
    expect(signedToken.domain).to.exist
    expect(signedToken.domain.verifyingContract).to.exist
    expect(signedToken.domain.chainId).to.exist
    expect(signedToken.domain.name).to.exist
    expect(signedToken.domain.version).to.exist
    expect(signedToken.body).to.exist

    expect(signedToken.body.signature).to.exist

    delete signedToken.body.signature
    delete localToken.body.signature
    expect(signedToken).to.deep.equal(localToken)
  })
})
