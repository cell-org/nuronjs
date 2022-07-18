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
describe("db", () => {
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
  it('write()', async () => {

    try {
      // try importing
      await nuron.wallet.import("password", Util.seed, "__test__")
    } catch (e) {
      // if failed, try connecting instead 
      await nuron.wallet.connect("password", "__test__")
    }

    await nuron.db.rm("token", {})

    const buf = Buffer.from("hello world")
    let cid = await c0.util.cid(buf)
    let token = await nuron.token.create({
      cid: cid 
    })
    console.log("token", token)

    await nuron.db.write("token", token)

    let items = await nuron.db.read("token", {})
    console.log("items", items)
    expect(items.length).to.equal(1)
  })
  it("write() fails if wrong schema", async () => {
    try {
      // try importing
      await nuron.wallet.import("password", Util.seed, "__test__")
    } catch (e) {
      // if failed, try connecting instead 
      await nuron.wallet.connect("password", "__test__")
    }

    await nuron.db.rm("token", {})

    const buf = Buffer.from("hello world")
    let cid = await c0.util.cid(buf)
    let token = await nuron.token.create({
      cid: cid 
    })
    console.log("token", token)

    try {
      await nuron.db.write("metadata", token)
    } catch (e) {
      expect(/SQLITE_ERROR/.test(e.message)).to.be.true
    }
  })
  it("read()", async () => {
    try {
      // try importing
      await nuron.wallet.import("password", Util.seed, "__test__")
    } catch (e) {
      // if failed, try connecting instead 
      await nuron.wallet.connect("password", "__test__")
    }

    await nuron.db.rm("token", {})

    for(let i=0; i<10; i++) {
      const buf = Buffer.from("hello world")
      let cid = await c0.util.cid(buf)
      let token = await nuron.token.create({
        cid: cid,
        value: i
      })
      await nuron.db.write("token", token)
      console.log("token", token)
    }

    // get all => 10 items
    let tokens = await nuron.db.read("token", {})
    console.log("tokens", tokens)
    expect(tokens.length).to.equal(10)

    // get tokesn with value greater than 5
    tokens = await nuron.db.read("token", {
      select: ["*"],
      where: ["value", ">", 5]
    })
    console.log("tokens", tokens)
    expect(tokens.length).to.equal(4)

  })
  it("readOne()", async () => {
    try {
      // try importing
      await nuron.wallet.import("password", Util.seed, "__test__")
    } catch (e) {
      // if failed, try connecting instead 
      await nuron.wallet.connect("password", "__test__")
    }

    await nuron.db.rm("token", {})

    for(let i=0; i<10; i++) {
      const buf = Buffer.from("hello world")
      let cid = await c0.util.cid(buf)
      let token = await nuron.token.create({
        cid: cid,
        value: i
      })
      await nuron.db.write("token", token)
      console.log("token", token)
    }

    // get all => 10 items
    let token = await nuron.db.readOne("token", {})
    console.log("tokens", token)
    expect(Array.isArray(token)).to.be.false
    expect(typeof token).to.equal("object")


  })
  it("rm()", async () => {
    try {
      // try importing
      await nuron.wallet.import("password", Util.seed, "__test__")
    } catch (e) {
      // if failed, try connecting instead 
      await nuron.wallet.connect("password", "__test__")
    }

    await nuron.db.rm("token", {})

    for(let i=0; i<10; i++) {
      const buf = Buffer.from("hello world")
      let cid = await c0.util.cid(buf)
      let token = await nuron.token.create({
        cid: cid,
        value: i
      })
      await nuron.db.write("token", token)
      console.log("token", token)
    }

    let tokens = await nuron.db.read("token", {})
    console.log("tokens", tokens)
    expect(tokens.length).to.equal(10)

    // get all => 10 items
    await nuron.db.rm("token", ["value", "<", 5])

    tokens = await nuron.db.read("token", {})
    console.log("tokens", tokens)
    expect(tokens.length).to.equal(5)


  })
})
