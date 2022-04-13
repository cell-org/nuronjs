const prompts = require('prompts');
const Nuronterm = require('../index');
const term = new Nuronterm()
const pass = async () => {
  const response = await prompts({
    type: 'password',
    name: 'value',
    message: 'enter wallet encryption password',
    onState: (state) => {
      if (state.aborted) {
        process.nextTick(() => {
          process.exit(0);
        })
      }
    }
  });
  return response.value
}
const walletpath = async () => {
  const response = await prompts({
    type: 'text',
    name: "value",
    message: 'enter wallet BIP44 derivation path',
    onState: (state) => {
      if (state.aborted) {
        process.nextTick(() => {
          process.exit(0);
        })
      }
    }
  });
  return response.value
}
const walletseed = async () => {
  const response = await prompts({
    type: 'text',
    name: "value",
    message: 'enter wallet seed phrase',
    onState: (state) => {
      if (state.aborted) {
        process.nextTick(() => {
          process.exit(0);
        })
      }
    }
  });
  return response.value
}
const walletusername = async () => {
  const response = await prompts({
    type: 'text',
    name: "value",
    message: 'enter username',
    onState: (state) => {
      if (state.aborted) {
        process.nextTick(() => {
          process.exit(0);
        })
      }
    }
  });
  return response.value
}
const exporter = async (account) => {
  const response = await prompts({
    type: 'select',
    name: 'value',
    hint: " ",
    message: `${account} what do you want to do?`,
    choices: [
      { title: "export seed", description: "export the seed phrase for the entire wallet", value: "all" },
      { title: "export private key", description: "export a single private key at a specific BIP44 derivation path", value: "path" },
      { title: "cancel", value: null }
    ],
    onState: (state) => {
      if (state.aborted) {
        process.nextTick(() => {
          process.exit(0);
        })
      }
    }
  });
  if (response.value === "all") {
    let password = await pass()
    try {
      let res = await term.wallet.export(password)
      console.log(res)
    } catch (e) {
      console.log("⚠️  " + e.message)
    }
  } else if (response.value === "path") {
    try {
      let path = await walletpath()
      let password = await pass()
      let res = await term.wallet.export(password, path)
      console.log(res)
    } catch (e) {
      console.log("⚠️  " + e.message)
    }
  }
}
const connector = async (account) => {
  const { accounts } = await term.wallet.accounts()
  const response = await prompts({
    type: 'select',
    name: 'value',
    hint: " ",
    message: `${account} what do you want to do?`,
    choices: accounts.map((x) => {
      return {
        title: x,
        value: x
      }
    }),
    onState: (state) => {
      if (state.aborted) {
        process.nextTick(() => {
          process.exit(0);
        })
      }
    }
  });
  let username = response.value
  try {
    let password = await pass()
    await term.wallet.connect(password, username)
    console.log("🟩 logged in!")
  } catch (e) {
    console.log("⚠️  " + e.message)
  }
}
// - when logged out
//  - login
//  - import seed
//  - generate seed
// - when logged in
//  - logout
//  - delete seed
//  - export seed
const menu = async () => {
  let r = await term.wallet.session()
  let username = r.username
  let options;
  if (username) {
    options = [
      { title: "logout", description: "log out of this wallet", value: "disconnect" },
      { title: "export", description: "export this wallet", value: "export" },
      { title: "delete", description: "delete this wallet (warning: can't be reverted)", value: "delete" },
    ]
  } else {
    options = [
      { title: "login", description: "connect to an account", value: "connect" },
      { title: "import", description: "import a wallet", value: "import" },
      { title: "generate", description: "generate a new wallet", value: "generate" },
    ]
  }
  let account = (username ? "[" + username + "]" : "[logged out]")
  const response = await prompts({
    type: 'select',
    name: 'value',
    hint: " ",
    message: `${account} what do you want to do?`,
    choices: options,
    onState: (state) => {
      if (state.aborted) {
        process.nextTick(() => {
          process.exit(0);
        })
      }
    }
  });

  if (response.value === "connect") {
    await connector()
  } else if (response.value === "delete") {
    let password = await pass()
    await term.wallet.delete(password)
    console.log("🟩 delete success")
  } else if (response.value === "export") {
    await exporter(account)
  } else if (response.value === "import") {
    let seed = await walletseed()
    let username = await walletusername()
    let password = await pass()
    await term.wallet.import(password, seed, username)
    console.log("🟩 wallet imported!")
  } else if (response.value === "generate") {
    let username = await walletusername()
    let password = await pass()
    let { generated } = await term.wallet.generate(password, username)
    console.log("🟩 wallet generated!")
    console.log(generated)
  } else if (response.value === "disconnect") {
    await term.wallet.disconnect()
    console.log("🟩 logged out!")
  }

  r = await term.wallet.session()
  account = (r && r.username ? "[" + r.username + "]" : "[logged out]")
  const response2 = await prompts({
    type: 'toggle',
    name: 'value',
    message: `${account} are you done?`,
    initial: true,
    active: "yes",
    inactive: "no",
    onState: (state) => {
      if (state.aborted) {
        process.nextTick(() => {
          process.exit(0);
        })
      }
    }
  });

  if (!response2.value) {
    await menu()
  }

}
console.clear()
menu()
