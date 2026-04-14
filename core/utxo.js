//const UTIL = require('../class/util.js');
const { init_db , client : db } = require('../class/redis.db.js');



async function START (){
  await init_db();
  /*
  let keys = await db.keys("*");
  for(let key of keys){
    console.log("before", keys)
    await db.del(key);
  }
  */

}


START()

class UTXO {

  constructor() {

    this.storeUTXO  = "../store/utxo";
    this.blcn_path  = "../blockchain/";
    this.memutxo = new Map();
    this.UTXOS   = new Map();
    this.ByPubKeyHash = new Map();

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
      for (const inp in inputs){
        let input = inputs[inp];
        let id = tx.id;
        let pkh   = ["scriptPubKey"];
        let vout = input["vout"] || 0;
        let prompt = `block:utxo:txid:${id}:${vout}`;
        let {scriptPubKey} = await db.hGetAll(prompt);
        await db.del(prompt);
        await db.sRem(`addr:utxo:pkh:${scriptPubKey}`, prompt)
      }
    }
  }

  async updateOutputs (tx) {
    let outputs = tx["outputs"];
    for (const out in outputs){
      let output = outputs[out];
      let id    = tx.id;
      let vout  = output["vout"] || 0;
      let pkh   = output["scriptPubKey"];
      console.log("BEFORE ", pkh)
      //pkh       = Buffer.from(pkh).toString("hex");
      console.log("LLLLLLLLL OOOOOO", id, vout, pkh);
      let prompt = `block:utxo:txid:${id}:${vout}`;
      await db.hSet(prompt, output);
      await db.sAdd(`addr:utxo:pkh:${pkh}`, prompt )
    }
  }



  async update(blocks){
    for(const tx of blocks){
      await this.updateInputs(tx);
      await this.updateOutputs(tx);
    }
    //console.log(" UTXOS : ");
  }

  async get ({id, vout}) {
    let msg, ok;
    try {
      let prompt = `block:utxo:txid:${id}:${vout}`;
      let data = db.hGetAll(prompt);
      let utxo  = JSON.parse(data);
      console.log(msg);
      return { ok, msg, data: utxo };
    } catch (e) {
      msg = "";
      console.log(msg, e);
      return { ok, msg };
    }
  }

  async getPkhList (pkh) {
    let msg, ok;
    try {
      pkh = Buffer.from(pkh).toString("hex")
      let list = await db.sMembers(`addr:utxo:pkh:${pkh}`);
      let data = new Array();
      for(let key of list ){
        let utxo = await db.hGetAll(key);
        utxo["txid"] = key.split(":")[3];
        data.push(utxo);
      }

      console.log(" its ", list, pkh);
      return { ok, msg, data };
    } catch (e) {
      msg = "ni didnt work";
      console.log(msg, e);
      return { ok, msg };
    }
  }


  async exists (id) {
    let msg, ok;
    try {
      await db.exists(`block:utxo:id:${id}`);
      msg = `Yes ${id} entry exists on utxos MapTable!`;
      ok  = true;
      console.log(msg);
      return { ok, msg };
    } catch (e) {
      msg = `No ${id} entry doesn't exists on utsxo MapTsble!`;
      console.log(msg, e);
      return { ok, msg };
    }
  }

  init(){


  }

  compare(){

  }


}

module.exports = new UTXO();


