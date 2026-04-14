const crypto = require("crypto");
const fsp  = require("fs/promises");
const fs  = require("fs");
const pool = require("./core/memepool.js");
const ADD = require("./network/address.js");
let ADDRESS = new ADD(null);


const { client: db, init_db  } = require('./class/redis.db.js');

async function start() {
  await init_db();
  console.log(await db.get("ok"));
}


class USER {
  constructor(){
    this.pool = pool;
    this.mempool = new Map();
    this.peersDirPath = "./peers";
  }


  async init (peer) {
    this.peer = peer;
    console.log("User = ", this.peer );
    this.path = `${this.peersDirPath}/${this.peer}/key`;

    this.path_publicKey   = this.path + "/public.pem";
    this.path_privateKey  = this.path + "/private.pem";

    let isExt = await this.isExist();

    console.log(isExt , "for peer ", this.peer );
    if(isExt){
      await this.load()
    } else{
      console.log("Not exist")
      await this.create();
    }

  }

  async isExist () {
    let dir   =  await fsp.opendir(this.peersDirPath);
    let yes = false;
    console.log("Verifing user existence !");    
    for await ( const dirent of dir ) {
      if( dirent.isDirectory() && dirent.name === this.peer){
        console.log(dirent.name, "Yes found directory ")
        yes = true;
        break;
      }
      //console.log( dirent.isDirectory() && dirent.name )
    }
    console.log(dir, this.peer, yes );
    return yes;
  }


  async create () {
    this.id = crypto.randomUUID();
    await fsp.mkdir(this.path, { recursive : true });
    console.log("Generating keys for user ", this.peer);
    await this.generateKey();
    this.cryptoAddress = ADDRESS
      .pathPubKey(`${this.path}/public.pem`)
      .create();
    await this.giveIp()
    this.setUser({id: this.id , address: this.cryptoAddress, ip: this.ip  });
    await this.saveUser();
    
  }

  async load () {
  
    let verifKeys = this.ifExistKey();
    console.log(" Verify keys existence : ", verifKeys);

    if( verifKeys.ok ){
      this.loadKeys();
    } else {
      console.log("No no keys for user ", this.peer);
      this.generateKey();
    }

    this.setCryptoAddress()
  }

  async setCryptoAddress(){ 
    let file = await fsp.readFile(
    `${this.peersDirPath}/${this.peer}/config.json`
      , "utf8");

    console.log(file);

    let { id, ip } = JSON.parse(file);
    this.cryptoAddress = ADDRESS 
      .setPubKey(this.publicKey) 
      .create();

    this.setUser({id, address: this.cryptoAddress, ip });

  }


  setUser({id, address, ip}){
    this.user = {
      username: this.peer,
      password: null,
      id: id,
      ip: ip,
      address : address,
    }
  }

  async giveIp(){
    console.log("IPSSSSSSSSSSS");
    let last = await db.get("user:last:ip") || 5000;
    let ip = Number(last) + 1;
    console.log("USERS LAST IP ***",last, ip);
    await db.set(`user:last:ip`,`${ip}`)
    this.ip = ip;
    return ip;
  }

  async saveUser (){
    console.log(this.user)
    await fsp.writeFile(`${this.peersDirPath}/${this.peer}/config.json`, 
      JSON.stringify(this.user),"utf8");
  }


  ifExistKey(){
    try {
      fs.accessSync(this.path_privateKey, fs.constants.F_OK)
      fs.accessSync(this.path_publicKey, fs.constants.F_OK)
      console.log("Yes file exist!")
      return {ok: true}
    } catch (error) {
      console.log("No keys pair generated!");
      return {ok: false }
    }
  }

  loadKeys () {
    let filePrivateKey = fs.readFileSync(this.path_privateKey, "utf8")
    let filePublicKey = fs.readFileSync(this.path_privateKey, "utf8");

    this.privateKey = crypto.createPrivateKey(filePrivateKey);
    this.publicKey = crypto.createPublicKey(filePublicKey);

    console.log(this.privateKey, this.publicKey)
  }


  async generateKey(){

    /*
    let { privateKey, publicKey } = crypto
      .generateKeyPairSync("rsa", {
        modulusLength : 2048,
        privateKeyEncoding: {type: 'pkcs8', format: "pem"},
        publicKeyEncoding : {type: "spki", format: "pem"}
      });
    */ 


    let {publicKey, privateKey} = crypto
      .generateKeyPairSync("ec",{
        namedCurve : "secp256k1",
        publicKeyEncoding: {
          type: "spki", format: "pem"
        },
        privateKeyEncoding: {
          type: "pkcs8", format: "pem"
        }
      })

    console.log("Priv", privateKey, "Public", publicKey);
    
    this.privateKey = crypto.createPrivateKey({
      key: privateKey, type: "pkcs8", format: "pem" 
    });

    this.publicKey  = crypto.createPublicKey({
      key: publicKey, type: "spki", format: "pem" 
    });

    await fsp.writeFile(this.path_privateKey, privateKey);
    await fsp.writeFile(this.path_publicKey, publicKey);

    console.log("Finish key generation!")

    //this.loadKeys()
  }

  pushPool(tr){
    //this.pool.push(tr)
  }

  get keys (){ 
    console.log(" Now Your keys ", this.publicKey, this.privateKey);
    return {
      privateKey : this.privateKey,
      publicKey  : this.publicKey
    }
  }


}


//let peter = new USER()

module.exports = USER;



