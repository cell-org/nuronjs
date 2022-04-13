const Util = require('./util')
const { expect } = require('chai')
const Nuron = require('../index')
var nurond;
var nuron;
describe("wallet", () => {
  describe("logged out", () => {
    beforeEach(async () => {
      // start nuron server
      nurond = await Util.nurond() 
      nuron = new Nuron({
        key: "m'/44'/60'/0'/0/0",
        fs: "nuronjs_test",
        domain: {
          "address":"0x93f4f1e0dca38dd0d35305d57c601f829ee53b51",
          "chainId":4,
          "name":"_test_"
        }
      })
    })
    afterEach(async () => {
      await nurond.stop()
    })

    it("accounts()", async () => {
      // returns the usernames array even when logged out
      let accounts = await nuron.wallet.accounts()
      expect(Array.isArray(accounts)).to.equal(true)
    })
    it('session() when not logged in', async () => {
      // returns null username and no address attribute
      let session = await nuron.wallet.session()
      expect(session.username).to.equal(null)
      expect(session.address).to.not.exist
    })
    it('chain(chainId)', async () => {
      // should throw error
      try {
        let r = await nuron.wallet.chain(4)
      } catch (e) {
        expect(e.message).to.equal("logged out")
      }
    })
    it('delete() should fail', async () => {
      try {
        let exported = await nuron.wallet.delete("password")
      } catch (e) {
        expect(e.message).to.equal("not logged in")
      }
    })
    it('try export() when not logged in => should fail', async () => {
      try {
        let exported = await nuron.wallet.export("password")
      } catch (e) {
        expect(e.message).to.equal("not logged in")
      }
    })
    it('try generate() when not logged in => should work and return the generated rsults', async () => {
      let generated = await nuron.wallet.generate("password", "__generated__")
      console.log("exported", generated)
      expect(generated.seed).to.exist
      expect(generated.seed.length > 0).to.be.true
      expect(generated.encrypted).to.exist
      expect(generated.encrypted.iv).to.exist
      expect(generated.encrypted.data).to.exist
      expect(generated.encrypted.tag).to.exist
      // clean up

//      await nuron.wallet.connect("password", "__generated__")
      await nuron.wallet.delete("password")
    })
  })
  describe("logged in", () => {
    beforeEach(async () => {
      // start nuron server
      nurond = await Util.nurond() 
      nuron = new Nuron({
        key: "m'/44'/60'/0'/0/0",
        fs: "nuronjs_test",
        domain: {
          "address":"0x93f4f1e0dca38dd0d35305d57c601f829ee53b51",
          "chainId":4,
          "name":"_test_"
        }
      })
      try {
        // try importing
        await nuron.wallet.import("password", Util.seed, "__test__")
      } catch (e) {
        // if failed, try connecting instead 
        await nuron.wallet.connect("password", "__test__")
      }
    })
    afterEach(async () => {
      await nuron.wallet.delete("password")
      await nuron.wallet.disconnect()
      await nurond.stop()
    })
    it("accounts()", async () => {
      let accounts = await nuron.wallet.accounts()
      expect(Array.isArray(accounts)).to.equal(true)
    })
    it('chain(chainId)', async () => {
      let r = await nuron.wallet.chain(4)
      expect(r.chain).to.equal("ETH")
      expect(r.chainId).to.equal(4)
      expect(r.accounts.length).to.equal(100)
      expect(r.accounts[0].address).to.exist
      expect(r.accounts[0].path).to.equal("m/44'/60'/0'/0/0")
    })
    it('export()', async () => {
      let exported = await nuron.wallet.export("password")
      console.log("exported", exported)
      expect(exported).to.equal(Util.seed)
    })
    it("import()", async () => {
      await nuron.wallet.delete("password")
      let imported = await nuron.wallet.import("password", Util.seed, "__test__")
      expect(imported.username).to.exist
      expect(imported.username).to.equal("__test__")
      expect(imported.seed).to.exist
      expect(imported.seed.length > 0).to.be.true
      expect(imported.encrypted).to.exist
      expect(imported.encrypted.iv).to.exist
      expect(imported.encrypted.data).to.exist
      expect(imported.encrypted.tag).to.exist
    })
    it("generate()", async () => {
      await nuron.wallet.disconnect()
      let generated = await nuron.wallet.generate("password", "__generated2__")
      console.log("exported", generated)
      expect(generated.username).to.exist
      expect(generated.username).to.equal("__generated2__")
      expect(generated.seed).to.exist
      expect(generated.seed.length > 0).to.be.true
      expect(generated.encrypted).to.exist
      expect(generated.encrypted.iv).to.exist
      expect(generated.encrypted.data).to.exist
      expect(generated.encrypted.tag).to.exist
    })
  })
})
