

const UTIL = require('../class/util.js');

const { init_db , client : db } = require('../class/redis.db.js');

async function START (){
  await init_db();
}


START()

class UTXO {

  constructor() {
    this.storeUTXO  = "../store/utxo";
    this.blcn_path  = "../blockchain/";
    this.memutxo = new Map();
    this.UTXOS   = new Map();
    this.getUtxosMap();
  }


  async getUtxosMap(){
    let list = await db.keys("block:utxo:id:*")
    for (const key of list ){
      let utxos = await db.get(key);
      console.log("UTXO ", key, utxos );
    }

    //console.log("TRUSTED PILOTS", list);
  }


  runBlockchain(){

  }

  async updateInputs (tx) {

    if(tx.type !== "ctx"){
      let inputs = tx.inputs;
      if ( inputs.length > 0 ) {
        for (const inp of inputs){
          let id = tx.id;
          await db.del(`block:utxo:id:${id}`)
        }
      }else {
        let id = tx.id;
        await db.del(`block:utxo:id:${id}`)
      }
    }
  }

  async updateOutputs (tx) {
    let outputs = tx["outputs"];
    if ( outputs.length > 0 ) {
      for (const inp of outputs){
        let id = tx.id;
        console.log("yes ", id)
        await db.set(`block:utxo:id:${id}`, 
          JSON.stringify(outputs));
      }
    }else {
      let id = tx.id;
      //console.log("yes ", id)
      await db.set(`block:utxo:id:${id}`, 
        JSON.stringify(outputs));
    }
  }


  async update(blocks){

    for(const tx of blocks){
      this.updateInputs(tx);
      this.updateOutputs(tx);
    }

    //console.log(" UTXOS : ");
    
  }

  init(){


  }

  compare(){

  }


}

module.exports = new UTXO();


