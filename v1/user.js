const crypto = require("crypto");
const TRANSACTION = require("./transaction.js")
const fsp  = require("fs/promises")
const fs  = require("fs")

class USER {

  constructor(name){
    this.name = name;
    this.id = crypto.randomUUID();
    this.path_privateKey = "./privateKey.pem";
    this.path_publicKey = "./publicKey.pem";
    this.setUser()
    this.pool
  }


  create(){

  }

  setUser(){
    this.user = {
      name: this.name,
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


  load(){
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
      if(tr.sign(this.privateKey).ok){

      }else{

      }
      return {...isValid, transaction: transaction_data}
    };
    return {...isValid}
  }



  validateTransaction(transaction){
    let tr = new TRANSACTION("verify");
    tr.load(transaction)
    let transaction_data = tr.create();
    let isValid = tr.validate();
    
    console.log(isValid, "Lets validate signature of this transaction!")

    if(isValid.ok) {
      console.log(this.publicKey);
      let verif = tr.verify(this.publicKey);
      if(verif.ok){
        console.log(verif.msg)
      }else{  
        console.log(verif.msg)
      }

      return {...isValid, transaction: transaction_data}
    };

    return {...isValid}
  }

  ifExistKey(){
    try {
      fs.accessSync(this.path_privateKey, fs.constants.F_KO)
      fs.accessSync(this.path_publicKey, fs.constants.F_KO)
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




}


//let peter = new USER()

module.exports = USER;

