const UTILS = require("../class/util.js");
const { log } = require("console");
const MEMPOOL = require("./memepool.js");
const crypto = require('crypto');
const { init_db, client: db } = require("../class/redis.db.js")
const UTXO = require("./utxo.js");



async function START (){
  await init_db();
}


START()


class BLOCK {
  constructor({list}) {
    this.prop = "";
    this.mempool = MEMPOOL
    this.hashMap = new Map();
    this.data = list
    this.goodNonce = false
    this.tried = 0;
    this.storeLastHash = "../store/previoushash";
    this.histBlock = "../store/blockhistory";
    this.histBlockSet = "../store/blockset";

  }

  setBlock (){
    return this.block = {
      header : {},
      data   : []
    }
  }


  initHeader(){
    this.header = {
      _id           : crypto.randomUUID(),
      timestamp     : Date.now(),
      time          : Date.now(),
      height        : 0,
      difficulty    : 3,
      threshold     : 40000,
      merkleroot    : "",
      previoushash  : "",
      nonce         : 0
    }
  }


  async init () {
    let msg, ok;
    try {
      //console.log(msg);
      this.setBlock();
      this.initHeader();
      this.setMerkel();
      await this.setPrevHeader();
      await this.mining();
      this.setHeader();
      //console.log(this.block);
      this.setData();
      await this.setblockchainHistory();
      await this.saveBlock();
      await this.setLastBlock();

      await UTXO.update(this.block.data);
      console.log("Block", this.block.header);
      //this.reinitialize();

      return { ok, msg };
    } catch (e) {
      msg = "";
      console.log(msg, e);
      return { ok, msg };
    }
  }


  async saveBlock(){
    let hash = this.block["hash"]

    let filePath = "../blockchain/" + hash;
    let lb = await UTILS.write(filePath, 
      JSON.stringify(this.block));
    let slbh = await UTILS.write(this.storeLastHash, hash.toString())
  }




  hash (text){
    try {
      if(typeof text === "object"){
        // console.log("yes its an object!");
        text = JSON.stringify(text);
      }
      return crypto.hash("sha256", text, "hex");
    } catch (e) {
      console.log(e) 
      return false
    }
  }

  get calculate_merkle () {
    // log("These are data", this.data)
    if(!Array.isArray(this.data) && ! this.length > 0) {
      console.log("Data list empty");
      return {ok: false, msg: ""}
    } 

    let merkle = [...this.data]
    while (merkle.length > 1){
      let concat = [];
      for(let i = 0; i < merkle.length; i += 2){
        let curr = this.data[i];
        let next = this.data[i + 1];
        next = next ? next : curr;
        let currHash = this.hash(this.hash(curr));
        let nextHash = this.hash(this.hash(next));
        let paired = curr && next ? 
          currHash + nextHash : 'Not hash';
        
        let hash = this.hash(this.hash(paired))
        concat.push(hash);
        // console.log( i, i + 1 , "Paired", paired.toString());
      }
      merkle = [...concat]
    }

    return  this.hash(this.hash(merkle));
    
  }



  header_hash () {
    let msg ;
    try {
      //console.log(msg);
      let hash = this.hash(this.hash(this.header));
      return hash;
      // no block hash not  stored in  lock data strructure this.header["hash"] = hash;
    } catch (e) {
      msg = "";
      console.log(msg, e);
      return false
    }
  }

  async setPrevHeader (){
    await this.setHeight();
    await this.setPreviousHash();
  }

  async setLastBlock (){
    let hash = this.block["hash"]
    let info = {
      height: this.block.header.height,
      hash
    }
    await db.set(`block:last`, JSON.stringify(info));
  }

  async getLastBlock (){
    let info = await db.get(`block:last`);
    //log(info)
    info = JSON.parse(info) || { height: 0, hash: 0 };
    return info;
  }


  async setHeight (){
    let LB = await this.getLastBlock();
    log("This what i got : ", Number(LB.height) + 1)
    this.header["height"] = Number(LB.height) + 1;
  }


  async setPreviousHash (){
    try {
      
      let L_B = await this.getLastBlock();
      let prev_hash = L_B.hash;
      this.header["previoushash"] = prev_hash;


    } catch (e) {
      throw e
    }
  }

  setMerkel () {
    this.header["merkleroot"] = this.calculate_merkle;
  }

  setHeader(){
    this.block["header"] = this.header;
  }


  setData (){
      this.block["data"] = Array.from(this.data);
  }

  






  async setblockchainHistory(){
    let hash    = this.block["hash"]
    let id      = this.header["_id"];
    let height  = this.header["height"];

    await db.set(`block:height:${height}`,
     hash)
    console.log("History set")
  }

  readBlockHist(){

  }

  writeBlockHist(){
    
  }






  reinitialize(){
    this.setBlock()
    this.initHeader()
    // console.log("reinitialization ...", this.block );
  }


  setDifficulty (){
    try {
      let n0 = ""
      let d = this.header["difficulty"] || 4;
      for (let i = 0; i < d ; i++) {
        n0 = n0 + "0";
      }
      //console.log(n0);
      return n0
    } catch (e) {
      console.log(e);
      return false
    }
  }





  reloadHeader(){
    // console.log("Reload Dont find hash");
    this.tried = 0

  }

  setTime(){
    this.header["time"] = Date.now();
  }

  async setHash(hash){
    this.block["hash"] = hash;
    //await UTILS.write(this.storeLastHash, hash)
  }


  async mining(){
    let threshold = this.header["threshold"];
    try {
      while (!this.goodNonce ) { 
        this.tried++

        if(this.tried > threshold ) {
          this.reloadHeader()
        }

        this.setTime();
        let hash = this.header_hash();
        if(this.proofOfWork(hash)){

          this.goodNonce = true;
          
          // console.log("Tried ", this.tried , 
          //  " hash ", hash , 
          //  "Yes we found it! \n Block validate!");

          this.setHash(hash)
        }else{
          this.header["nonce"] += 1;
          //process.stdout.write("\n")
          process.stdout.write
          (`\x1b[?25l\rMining nonce : ${this.header["nonce"]} Time ${this.header["time"]} \r`);;
          //
        }
      }

      return true
    } catch (e) {
      //throw e
      console.log(e)
    }
  }



  proofOfWork(hash){
    let diff = this.setDifficulty()
    if(hash.toString().startsWith(diff)){
      return true
    }else{
      return false
    }
  }




}

module.exports = BLOCK



