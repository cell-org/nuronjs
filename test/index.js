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
  })
  afterEach(async () => {
    await nurond.stop()
  })
  it("constructor should correctly set custom nuron endpoint urls if the full object was passed", async () => {
    nuron = new Nuron({
      node: {
        workspace: {
          url: "https://workspace.papercorp.org",
          token: "abc"
        },
        wallet: {
          url: "https://wallet.papercorp.org",
          token: "def"
        }
      },
      key: "m'/44'/60'/0'/0/0",
      workspace: "nuronjs_test",
      domain: {
        "address":"0x93f4f1e0dca38dd0d35305d57c601f829ee53b51",
        "chainId":4,
        "name":"_test_"
      }
    })
    expect(nuron.o.node).to.deep.equal({
      workspace: {
        url: "https://workspace.papercorp.org",
        token: "abc"
      },
      wallet: {
        url: "https://wallet.papercorp.org",
        token: "def"
      }
    })
  })
  it("constructor should throw an error if a nuron endpoint object was passed but doesnot include all attributes", async () => {
    try {
      nuron = new Nuron({
        node: {
          workspace: {
            url: "https://workspace.papercorp.org",
          },
          wallet: {
            url: "https://wallet.papercorp.org",
          }
        },
        key: "m'/44'/60'/0'/0/0",
        workspace: "nuronjs_test",
        domain: {
          "address":"0x93f4f1e0dca38dd0d35305d57c601f829ee53b51",
          "chainId":4,
          "name":"_test_"
        }
      })
    } catch (e) {
      expect(e.message).to.equal("the 'nuron' object must contain 'url' and 'token' attributes, or 'workspace' and 'wallet' attributes, each of which contains both the 'url' and 'token' attributes")
    }
    try {
      nuron = new Nuron({
        node: {
          workspace: {
            token: "abc"
          },
          wallet: {
            token: "abc"
          }
        },
        key: "m'/44'/60'/0'/0/0",
        workspace: "nuronjs_test",
        domain: {
          "address":"0x93f4f1e0dca38dd0d35305d57c601f829ee53b51",
          "chainId":4,
          "name":"_test_"
        }
      })
    } catch (e) {
      expect(e.message).to.equal("the 'nuron' object must contain 'url' and 'token' attributes, or 'workspace' and 'wallet' attributes, each of which contains both the 'url' and 'token' attributes")
    }
  })
  it("constructor should correctly set custom nuron endpoint urls if a 'nuron' node was passed", async () => {
    nuron = new Nuron({
      node: {
        nuron: {
          url: "https://nuronpress.papercorp.org",
          token: "abc",
        },
      },
      key: "m'/44'/60'/0'/0/0",
      workspace: "nuronjs_test",
      domain: {
        "address":"0x93f4f1e0dca38dd0d35305d57c601f829ee53b51",
        "chainId":4,
        "name":"_test_"
      }
    })
    expect(nuron.o.node).to.deep.equal({
      workspace: {
        url: "https://nuronpress.papercorp.org",
        token: "abc"
      },
      wallet: {
        url: "https://nuronpress.papercorp.org",
        token: "abc"
      }
    })
  })
  it("constructor should throw an error if the default nuron object doesn't include a token attribute", async () => {
    try {
      nuron = new Nuron({
        node: {
          nuron: {
            url: "https://nuronpress.papercorp.org",
          },
        },
        key: "m'/44'/60'/0'/0/0",
        workspace: "nuronjs_test",
        domain: {
          "address":"0x93f4f1e0dca38dd0d35305d57c601f829ee53b51",
          "chainId":4,
          "name":"_test_"
        }
      })
    } catch (e) {
      expect(e.message).to.equal("the 'nuron' object must contain 'url' and 'token' attributes, or 'workspace' and 'wallet' attributes, each of which contains both the 'url' and 'token' attributes")
    }
  })
  it("constructor should correctly set the default nuron endpoint urls to localhost if nothing was passed in", async () => {
    nuron = new Nuron({
      key: "m'/44'/60'/0'/0/0",
      workspace: "nuronjs_test",
      domain: {
        "address":"0x93f4f1e0dca38dd0d35305d57c601f829ee53b51",
        "chainId":4,
        "name":"_test_"
      }
    })
    expect(nuron.o.node).to.deep.equal({
      workspace: {
        url: "http://localhost:42000",
      },
      wallet: {
        url: "http://localhost:42000",
      }
    })
  })
})
