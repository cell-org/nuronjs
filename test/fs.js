require('dotenv').config()
const { Blob } = require("buffer");
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
describe("fs", () => {
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
  it('Buffer: nuron.write() result must match c0.util.cid()', async () => {
    const buf = Buffer.from("hello world")
    let nuron_cid = await nuron.fs.write(buf)
    let c0_cid = await c0.util.cid(buf)
    expect(nuron_cid).to.equal(c0_cid)
  })
  it("Buffer cid must match Uint8Array cid", async () => {
    const nuron2 = new Nuron({
      key: "m'/44'/60'/0'/0/0",
      workspace: "nuronjs_test2",
      domain: {
        "address":"0x93f4f1e0dca38dd0d35305d57c601f829ee53b51",
        "chainId":4,
        "name":"_test_"
      }
    })
    const buf = Buffer.from("hello world")
    const uintarray = Uint8Array.from(buf)
    let nuron_buf_cid = await nuron.fs.write(buf)
    let nuron_uint8array_cid = await nuron2.fs.write(uintarray)
    console.log(nuron_buf_cid)
    console.log(nuron_uint8array_cid)
    expect(nuron_buf_cid).to.equal(nuron_uint8array_cid)
  })
  it("Buffer cid must match Stream cid", async () => {
    const nuron2 = new Nuron({
      key: "m'/44'/60'/0'/0/0",
      workspace: "nuronjs_test2",
      domain: {
        "address":"0x93f4f1e0dca38dd0d35305d57c601f829ee53b51",
        "chainId":4,
        "name":"_test_"
      }
    })
    const buf = await fs.promises.readFile(__dirname + "/fs.js")
    let nuron_buf_cid = await nuron.fs.write(buf)
    const stream = fs.createReadStream(__dirname + "/fs.js")
    let nuron_stream_cid = await nuron2.fs.write(stream)
    console.log(nuron_buf_cid)
    console.log(nuron_stream_cid)
    expect(nuron_buf_cid).to.equal(nuron_stream_cid)
  })
  it('Blob: nuron write result must match c0.util.cid()', async () => {
    const buf = Buffer.from("hello world")
    const blob = new Blob([buf])

    let bufferCid = await c0.util.cid(buf)
    let blobCid = await c0.util.cid(blob)
    let nuronBufferCid = await nuron.fs.write(buf)
    let nuronBlobCid = await nuron.fs.write(blob)
    expect(bufferCid).to.equal(blobCid)
    expect(bufferCid).to.equal(nuronBufferCid)
    expect(bufferCid).to.equal(nuronBlobCid)
  })
  it('Uint8Array: nuron write result must match c0.util.cid()', async () => {
    const buf = Buffer.from("hello world")
    const uintarray = Uint8Array.from(buf)

    let bufferCid = await c0.util.cid(buf)
    let uintarrayCid = await c0.util.cid(uintarray)
    let nuronBufferCid = await nuron.fs.write(buf)
    let nuronUintarrayCid = await nuron.fs.write(uintarray)
    expect(bufferCid).to.equal(uintarrayCid)
    expect(bufferCid).to.equal(nuronBufferCid)
    expect(bufferCid).to.equal(nuronUintarrayCid)
  })
  it('ArrayBuffer: nuron write result must match c0.util.cid()', async () => {
    const buf = Buffer.from("hello world")
    const arraybuf = buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength);

    let bufferCid = await c0.util.cid(buf)
    let arraybufferCid = await c0.util.cid(arraybuf)
    let nuronBufferCid = await nuron.fs.write(buf)
    let nuronArraybufferCid = await nuron.fs.write(arraybuf)
    expect(bufferCid).to.equal(arraybufferCid)
    expect(bufferCid).to.equal(nuronBufferCid)
    expect(bufferCid).to.equal(nuronArraybufferCid)
  })
  it('String: nuron write result must match c0.util.cid()', async () => {

    // util.cid will return identical results regardless of the structure, as long as the contents are the same
    let c0cid = await c0.util.cid("blabla")
    let nuroncid = await nuron.fs.write("blabla")
    expect(c0cid).to.equal(nuroncid)
  })
  it('JSON: nuron write result must match c0.util.cid()', async () => {

    // util.cid will return identical results regardless of the structure, as long as the contents are the same
    let c0cid = await c0.util.cid({
      name: "hello",
      description: "world"
    })
    let nuroncid = await nuron.fs.write({
      name: "hello",
      description: "world"
    })
    expect(c0cid).to.equal(nuroncid)
  })

  it('rm entire fs folder', async () => {
    // write
    const nuron3 = new Nuron({
      key: "m'/44'/60'/0'/0/0",
      workspace: "nuronjs_test3",
      domain: {
        "address":"0x93f4f1e0dca38dd0d35305d57c601f829ee53b51",
        "chainId":4,
        "name":"_test_"
      }
    })
    // remove all
    await fs.promises.rm(__dirname + "/__nuron__/home/workspace/nuronjs_test3/fs", { force: true, recursive: true }).catch((e) => {})

    // write something
    for(let i=0; i<10; i++) {
      let nuroncid = await nuron3.fs.write({
        name: "hello " + i,
        description: "world"
      })
    }
    // check the file exists
    let files = await fs.promises.readdir(__dirname + "/__nuron__/home/workspace/nuronjs_test3/fs")
    expect(files.length).to.equal(10)

    // try calling rm() without an argument => shouldn't delete anything
    await nuron3.fs.rm()
    files = await fs.promises.readdir(__dirname + "/__nuron__/home/workspace/nuronjs_test3/fs")
    console.log("files", files)
    expect(files.length).to.equal(10)
  })
  it('rm one file', async () => {
    // write
    const nuron3 = new Nuron({
      key: "m'/44'/60'/0'/0/0",
      workspace: "nuronjs_test3",
      domain: {
        "address":"0x93f4f1e0dca38dd0d35305d57c601f829ee53b51",
        "chainId":4,
        "name":"_test_"
      }
    })
    // remove all
    await fs.promises.rm(__dirname + "/__nuron__/home/workspace/nuronjs_test3/fs", { force: true, recursive: true }).catch((e) => {})
    // write something
    for(let i=0; i<10; i++) {
      let nuroncid = await nuron3.fs.write({
        name: "hello " + i,
        description: "world"
      })
    }
    // check the file exists
    let files = await fs.promises.readdir(__dirname + "/__nuron__/home/workspace/nuronjs_test3/fs")
    expect(files.length).to.equal(10)

    // remove one file
    await nuron3.fs.rm(files[0])
    files = await fs.promises.readdir(__dirname + "/__nuron__/home/workspace/nuronjs_test3/fs")
    console.log("files", files)
    expect(files.length).to.equal(9)


    await nuron3.fs.rm(files.slice(1, 3))
    files = await fs.promises.readdir(__dirname + "/__nuron__/home/workspace/nuronjs_test3/fs")
    console.log("files", files)
    expect(files.length).to.equal(7)

    // remove all files
    /*
    */
    // rm
    // check the file doesn't exist
  })
  it("rm *", async () => {
    const nuron3 = new Nuron({
      key: "m'/44'/60'/0'/0/0",
      workspace: "nuronjs_test3",
      domain: {
        "address":"0x93f4f1e0dca38dd0d35305d57c601f829ee53b51",
        "chainId":4,
        "name":"_test_"
      }
    })
    await fs.promises.rm(__dirname + "/__nuron__/home/workspace/nuronjs_test3/fs", { force: true, recursive: true }).catch((e) => {})
    // write something
    for(let i=0; i<10; i++) {
      let nuroncid = await nuron3.fs.write({
        name: "hello " + i,
        description: "world"
      })
    }
    // check the file exists
    let files = await fs.promises.readdir(__dirname + "/__nuron__/home/workspace/nuronjs_test3/fs")
    expect(files.length).to.equal(10)

    // remove *
    await nuron3.fs.rm("*")
    files = await fs.promises.readdir(__dirname + "/__nuron__/home/workspace/nuronjs_test3/fs")
    expect(files.length).to.equal(0)
  })
  it("pin should fail with an error if theres no token", async () => {
    let nuroncid = await nuron.fs.write({
      name: "hello",
      description: "world"
    })
    try {
      let response = await nuron.fs.pin(nuroncid)
      console.log("response", response)
    } catch (e) {
      expect(e.message).to.equal("missing token")
    }

  })
  it.skip("pin should succeed when the API token is set", async () => {
    let nuroncid = await nuron.fs.write({
      name: "hello",
      description: "world"
    })

    await nuron.configure({
      ipfs: {
        key: process.env.NFT_STORAGE_KEY
      }
    })

    let config = await nuron.config()

    let cid = await nuron.fs.pin(nuroncid)
    console.log("pinned cid", cid)

  })
  it("pin without an argument throws an error", async () => {
    for(let i=0; i<10; i++) {
      let nuroncid = await nuron.fs.write({
        name: "hello " + i,
        description: "world"
      })
    }
    try {
      let cid = await nuron.fs.pin()
    } catch (e) {
      console.log(e)
      expect(e.message).to.equal("cid required")
    }
  })
  it.skip("pin the entire fs folder", async () => {
    for(let i=0; i<10; i++) {
      let nuroncid = await nuron.fs.write({
        name: "hello " + i,
        description: "world"
      })
    }
    await nuron.configure({
      ipfs: {
        key: process.env.NFT_STORAGE_KEY
      }
    })
    let cid = await nuron.fs.pin("*")
    console.log("pinned", cid)
  })
  it.skip("pin the entire fs folder with progress", async () => {
    for(let i=0; i<100; i++) {
      let nuroncid = await nuron.fs.write({
        name: "hello " + i,
        description: "world"
      })
    }
    await nuron.configure({
      ipfs: {
        key: process.env.NFT_STORAGE_KEY
      }
    })
    let cid = await nuron.fs.pin("*", (update) => {
      console.log(update)
    })
    console.log("pinned", cid)
  })
})
