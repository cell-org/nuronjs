const Nuron = require('nurond')
const path = require('path');
const fs = require('fs');
const nurond = async () => {
  const nuron = new Nuron();
  const nuronHome = path.resolve(__dirname, "__nuron__", "home")
  const nuronTmp = path.resolve(__dirname, "__nuron__", "tmp")
  await fs.promises.rm(nuronHome, { force: true, recursive: true })
  await fs.promises.rm(nuronTmp, { force: true, recursive: true })
  console.log("nuron fs located at:", nuronHome);
  await fs.promises.mkdir(nuronHome, { recursive: true }).catch((e) => {})
  await fs.promises.mkdir(nuronTmp, { recursive: true }).catch((e) => {})
  await nuron.init({
    ipfs: {},
    path: nuronHome,
    tmp: nuronTmp
  })
  console.log("nuron started")
  return nuron
}
const seed = "member chase vapor genius away scissors pottery poverty express void smart strike"
module.exports = {
  nurond,seed
}
