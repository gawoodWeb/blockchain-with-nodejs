const crypto = require("crypto");
const TRANSACTION = require("./transaction.js")
const fsp  = require("fs/promises")
const fs  = require("fs")
const pool = require("./core/memepool.js");

class USER {
  constructor(){
    this.username = process.env.USERNAME;
    this.password = process.env.PASSWORD;
    this.id = crypto.randomUUID();
    this.path_privateKey = "./privateKey.pem";
    this.path_publicKey = "./publicKey.pem";
    this.pool = pool;


    this.init();
  }


  userLoad(){
    
  }


LOADUSER(){
    console.log(" started!")
    let name = process.env.USERNAME;
    let users = new USER(name);
    users.load();
    console.log(users);
    return users;
  }

  create(){

  }

  setUser(){
    this.user = {
      username: this.username,
      password: this.password,
      id: this.id,
      address: "5000",
      path_publicKey: this.path_privateKey,
      path_privateKey: this.path_privateKey,
      path_to_json : "./user.json"
    }
  }



  saveUser (){

  }

  
  generateAddress(){

  }


  init(){
    this.setUser();
    let keyExist = this.ifExistKey();
    if(keyExist.ok){
      this.loadKeys()
    }else {
      this.generateKey()
    }
    console.log(keyExist.msg)
  }

  loadKeys () {
    let filePrivateKey = fs.readFileSync(this.path_privateKey, "utf8")
    let filePublicKey = fs.readFileSync(this.path_privateKey, "utf8");

    this.privateKey = crypto.createPrivateKey(filePrivateKey);
    this.publicKey = crypto.createPublicKey(filePublicKey);

    console.log(this.privateKey, this.publicKey)
  }

  createTransaction (transaction) {
    let tr = new TRANSACTION("new");
    tr.make(transaction)
    let transaction_data = tr.create();
    let isValid = tr.validate();

    if(isValid.ok) {
      console.log(this.privateKey)
      let isSigned = tr.sign(this.privateKey);
      if(!isSigned) return {msg:"Signatuer error", ok: false, transaction: tr.getTransaction() };

      tr.adPubKey(this.publicKey)

      console.log("aff", tr.getTransaction())
      return {...isValid, data: transaction_data}
    };
    return {...isValid};
  }



  validateTransaction(data){
    let transaction = data.data;
    let tr                = new TRANSACTION("verify");
    console.log( data, "Lets validate signature of this transaction!", transaction)
                            tr.load(transaction);
    let transaction_data  = tr.create();
    let isValid           = tr.validate();
    

    if(isValid.ok) {
      console.log("My pK ",this.publicKey);
      let verif = tr.verify();
      if(verif.ok){
        console.log(verif.msg, "to memepool");

        this.pool.InsertTransaction(transaction);

      }else{  
        console.log(verif.msg)
      }


      return {...isValid, data: transaction_data};
    };
    
    return {...isValid};
  }



  ifExistKey(){
    try {
      fs.accessSync(this.path_privateKey, fs.constants.F_OK)
      fs.accessSync(this.path_publicKey, fs.constants.F_OK)
      console.log("Yes file exist!")
      return {msg: "Yes, there is key in the dir!", ok: true}
    } catch (error) {
      console.log("No keys pair generated!")
      return {msg: "No keys pair generated!", ok: false }
    }
  }

  async generateKey(){

    let { privateKey, publicKey } = crypto
      .generateKeyPairSync("rsa", {
        modulusLength : 2048,
        privateKeyEncoding: {type: 'pkcs8', format: "pem"},
        publicKeyEncoding : {type: "spki", format: "pem"}
      });

    console.log("Priv", privateKey, "Public", publicKey);
    
    this.privateKey = crypto.createPrivateKey(privateKey);
    this.publicKey  = crypto.createPublicKey(publicKey);

    await fsp.writeFile(this.path_privateKey, privateKey);
    await fsp.writeFile(this.path_publicKey, publicKey);

    console.log("Finish key generation!")
  }

  pushPool(tr){
    //this.pool.push(tr)
  }




}


//let peter = new USER()

module.exports =  new USER();

