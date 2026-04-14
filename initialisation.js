/*
 * 

const UTILS = require("./class/util.js");
const PATH  = require("path");
const fs = require('fs');
const fsp = require('fs/promises');
const { log } = require("console");
//const memepool = require("./core/memepool.js");
const crypto = require("crypto");

*/ 

const USER = require("./user.js")

const { client: db, init_db  } = require('./class/redis.db.js');

const EMULATOR = require("./emulator.js");

async function start() {
  await init_db();
  console.log(await db.get("ok"));
}





start();



const PEERS = ["alice","bob"]

class INIT {
  constructor() {
    this.hashMap = new Map();
    this.utxosMap = new Map();
    this.hashMap = new Map();
    this.peersDirPath = "./peers";
    //this.start();
    this.LOADPEERS();

    // this.path_publicKey = path + "/public.pem"
    // this.path_privateKey = path + "/private.pem"

  }


  async LOADPEERS () {
    for(let peer of PEERS){
      await USER.init(peer);
      console.log("No no problem");
      EMULATOR.start(peer)
      console.log(peer)
    }
  }

  systemInput (){
    return {
      id: 8888,
      index: 0,
      scriptSig : {
        key : "",
        signature: "ffffssss"
      }
    }
  }

  start(){
    //let a =  this.openDir("../blockchain");  
  }

  setUtxos(){

  }

  updateUtxos(outputs){
   // console.log("Ooooooo",outputs);


  }

  async blockSet(block){
    let id = block["_id"];
    let height = block["height"];
    let hash = block["hash"];

    let champ = `block:height:${height}`

    console.log( )
    //await db.set(champ, hash);

    
  }

  getBlock(block){

    this.blockSet(block)
    block = JSON.parse(block) ? JSON.parse(block) : block;
    if( typeof block === "object" || true ){
      let dataTx = block["data"] || [];
      if( dataTx.length > 0 ){
        for (const tx of dataTx) {
          this.eachTx(tx); 
        }
        ///console.log(this.hashMap);  
      }
    }

  }


  eachTx (Tx) {
    //log(Tx);
    //Tx = this.transformTx(Tx); 

    let inputs = Tx["inputs"];
    let outputs = Tx["outputs"];
    if(inputs.length > 1){
      for(const inp of inputs){
       //console.log("MIC");
        if(this.hashMap.has(inp.id)){
          this.updateUtxos(inp)
        }
      }
    }else{
      let input = inputs[0] || {id: "5"};
      //console.log(inputs);
      if(this.hashMap.has(input.id)){
        this.updateUtxos(input);
      }else{
        this.hashMap.set(Tx.id, Tx);
      }

    }

    //this.hashMap.set(Tx.id, Tx );

    // log(inputs);

    
  }

  transformTx(Tx){

    let inputs  = []
    let input   = {};
    input["id"] = "8888";
    input["index"] = 0;
    input["amount"] = Tx.amount;
    input["scriptSig"] = {
      key: Tx.publicKey,
      signature : Tx.signature
    };
    inputs.push(input);

    let outputs = [];
    let output  = {};
    output["address"] = Tx.to;
    output["amount"] = Tx.amount;
    output["scriptKey"] = UTILS.hash(Tx.to);
    // output["address"] = Tx.to;
    outputs.push(output);

    return {
      inputs  : inputs,
      outputs : outputs
    }
  }


  writeBlock(){

  }

  writeUtxos(){

  }


  async openDir(name){
    let path = await UTILS.getPath(name);
    let dir = await  fsp.opendir(path);
    // console.log(path, await dir.read());
    // console.log(path)
    
    for await (const dirent of dir){
      if(dirent.isFile()){
        let filename = dirent.name;
        let fullPath = PATH.join(path, filename);
        //log("DIRREN", fullPath , filename );;  
        let file = await fsp.readFile(fullPath, "utf8")
        this.getBlock(file);

      }
    }
  }



}

let init = new INIT();


/***/
