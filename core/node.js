const C_USER        = require("../user.js")
const USER          = new C_USER();
const C_VALIDATOR   = require("../core/validator.js");
const VALIDATOR     = new C_VALIDATOR();
const C_TRANSACTION = require("../transaction.js")
const C_BLOCK       = require('../core/block.js');



class Nodes {
  constructor() {
    this.prop = ""
  }

  async setKeys (peer){
    await USER.init(peer)
    let {privateKey , publicKey }   = USER.keys
    this.privateKey         = privateKey;
    this.publicKey          = publicKey;
    console.log("Your keys ", publicKey, privateKey);
  }

  async create (transaction) {
    console.log("Address of to : ", transaction.from );
    await this.setKeys(transaction.from);
     
    let tx = new C_TRANSACTION({
      privateKey  : this.privateKey,
      publicKey   : this.publicKey
    });

    let transaction_data = await tx.load(transaction);
    let isValid = { ok: true }  || await VALIDATOR.validate(transaction_data); 

    if( isValid.ok ) {
      // await this.pool.InsertTransaction(transaction_data);
      console.log("added to memepool");
      return {...isValid, data : transaction_data}
    };

    return {...isValid  };
  }



  validate(tr){
    /*
    let transaction = data.data;
    let tr                = new TRANSACTION("verify");
    let transaction_data  = tr.load(transaction);
    let isValid           = tr.validate();
    //console.log( data, "Lets validate signature of this transaction!", transaction)

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
    */
  }

  async mine ({ block, user }){
    let minedBlock = null;
    for (let i = 0; i < block; i++){
      await this.setKeys(user);

      let cbtx = new C_TRANSACTION({
        privateKey  : this.privateKey,
        publicKey   : this.publicKey
      });

      cbtx.cointbase();
      let tx = cbtx.transaction;
      console.log("CTBTX LOOK LIKE : ", tx)

     
      const BLOCK = new C_BLOCK({list: [tx]})
      BLOCK.init();
    }

    return minedBlock;
  }






}


module.exports = Nodes;
