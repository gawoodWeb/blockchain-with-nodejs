//const { exec } = require("process")
const crypto = require("crypto");
const { timeStamp, log } = require("console");
const  UTILS = require("./class/util.js");
const worker = require("worker_threads");
const {selectCoins, CONFIG} = require('./selector.js');
const ADD = require('./network/address.js');
const ADDRESS = new ADD();

const UTXO = require('./core/utxo.js');
const utxo = require("./core/utxo.js");

class TRANSACTION {

  constructor({publicKey, privateKey}){
    this.indexOutput = 0;
    this.privateKey = privateKey;
    this.publicKey  = publicKey ;
    this.address = ADDRESS
      .setPubKey(publicKey)
      .create(); 
  }


  async load(transaction){
    this.transaction = transaction;
    
    this.bindToThis();
    this.setType();

    if(this.type === "ctx") {
      this.transformOutput();
      this.create();
    } else if(this.type === "p2p"){
      await this.getUtxos();
      //  this.transformInput();
      this.transformOutput();
      this.create();
      this.sign();
      this.adPubKey()
    }

    console.log("AFTER ...", this.transaction.inputs, this.transaction.outputs)
    return this.transaction;
  }

  async create (payload){
    this.transaction = payload;
    this.bindToThis();
    this.type = "p2p";

    await this.getUtxos()
    this.transformInput();
    this.transformOutput();
    this.create()
    this.sign();
    console.log("End")
  }

  cointbase (){
    this.transaction = {
      to: this.address,
      amount : 40
    };
    this.bindToThis();
    this.type = "cbtx";
    this.transformOutput();
    this.create();
  }




  get TxInterface (){
    return {
      id      : 0 ,
      type      : "",
      inputs    : [],
      outputs   : [],
      network   : "",
      version   : "",
      locktime  : "",
      timestamp : ""
    }
  }


  get InputInterface (){
    return {
        txid        : "01",
        vout        : "0",
        amount      : "",
        scriptSig: {
          signature : "abcd",
          pubkey    : "",
        },
      }
  }


  get OutputInterface (){
    return {
        n            : 0,
        value        : 0,
        scriptPubKey : ""
      }
  }



  setOutputs (){
    let output          = this.OutputInterface;
    let {to, amount}    = this.transaction;
  }


  setInputs () {
    /*
    let inputs    = new Array();
    let UtxosTx   = this.getUtxos();
/    let outputs   = new Map();

    for(const tx of UtxosTx){
      outputs.set(tx.id, tx["outputs"]);
    }

    let selected  = this.getOutput(outputs);
    for(const id of selected.ids){
      let utxo = outputs.get(id)
      let input = this.InputInterface;
      input["id"] = id;
      input["index"] = "0"; 
      input["amount"] = utxo.amount
      inputs.push(input);

    }

    return inputs;
    */
  }


  async getUtxos () {
    let pkh       = ADDRESS.getPubKeyHash(this.address);
    let {data}    = await UTXO.getPkhList(pkh);


    console.log("Omg : ", this );
    let result = selectCoins(data, this.amount );
    console.log("Omg : ", result);

    this.change = result.summary.change;
    this.fee = result.summary.fee;
    this.total = result.summary.totalInput;

    if(result.ok){
      for( let utxo of result.inputs ){
        this.transformInput({
          txid: utxo.txid, index: utxo.n, value: utxo.value 
        });
      }
    }

    if( result.summary.change ) this.changeOutput();

    console.log("GETTING UTXOS : ", pkh,
      "LIST : " , data );
  }

  


  bindToThis () {
    for (const [intKey, keyType] of Object.entries(this.TxInterface)){
      this[intKey] = keyType;
      for (const [key, value] of Object.entries(this.transaction)){
        //console.log("loop", key);
        if(intKey === key ) {
          this[intKey] = value;
          console.log("yes", key)
          if(intKey === "publicKey"){
            this[intKey] = crypto.createPublicKey(value);
          }
        }else{
          this[key] = value
        }
      }
    }
  }


  setType (){
    this.type = this.type === "" ? "p2p" 
      : this.type;
  }

  transformInput({txid, index, value}) {
    let input   = {};
    console.log("ECT ", this.publicKey );
    input["txid"] = txid;
    input["vout"] = index;
    input["value"] = value;
    input["scriptSig"] = {
      key: "",
      signature : ""
    };
    this.inputs.push(input);
  }

  transformOutput () {
    let pubkeyHash = ADDRESS
      .getPubKeyHash(this.to); 
    let output  = {};
    output["n"] = this.indexOutput++;
    output["value"] = parseFloat(this.amount);
    output["scriptPubKey"] = Buffer
      .from(pubkeyHash)
      .toString("hex");
    // UTILS.hash(this.to.toString());
    // output["address"] = Tx.to;
    this.outputs.push(output);
  }


  changeOutput (){
    let pubkeyHash = ADDRESS
      .getPubKeyHash(this.address); 
    let output  = {};
    output["n"] = this.indexOutput++;
    output["value"] = this.change;
    output["scriptPubKey"] = Buffer
      .from(pubkeyHash)
      .toString("hex");
    // UTILS.hash(this.to.toString());
    // output["address"] = Tx.to;
    this.outputs.push(output);
  }

  

  create(){
    //console.log("in, op", this.inputs, this.outputs)
    this.transaction = {
      id        : this.id || crypto.randomUUID(),
      type      : this.type   ,
      version   : "1.1.0"     ,
      timestamp : Date.now()  ,
      inputs    : this.inputs ,
      outputs   : this.outputs
    }
  }

  write(){
    
  }

  formatTransaction(){
    let tr      =  JSON.parse(JSON.stringify(this.transaction));

    let inputs  = tr["inputs"][0];
    let outputs = tr["outputs"][0];
    
    inputs["scriptSig"]     = "";
    outputs["scriptPubKey"] = "";

    return JSON.stringify({
      inputs, outputs
    });
  }




  adPubKey(){
    let key = this.publicKey.export({type: "spki",format: "jwk"});
    let x = key.x;
    let y = key.y;


    console.log("Jwkkkkkk : ", key, this.publicKey);



    //this.transaction.publicKey = p
  }



  sign(){

    let signer = crypto.createSign("sha256");
    let tr = this.formatTransaction(this.transaction);
    log("look of ...", tr);
    signer.update(tr);
    signer.end()

    let signature = signer.sign(this.privateKey, "hex");
    this.transaction["inputs"][0]["scriptSig"]["signature"] = signature;
      
//    console.log("after sign", this.transaction)
    return {msg : "Transaction signer avec success!", ok: true}
    //let signature = cryptop
  }

  verify(){
    let msg = "";
    let ok = false;
    let verify = crypto.createVerify("sha256")
    let tr = this.formatTransaction();
//    console.log("before verify", tr)

    verify.update(tr);
    verify.end();
//    console.log("verif",this.signature)
    let verification = verify.verify(this.publicKey, this.signature, "hex");

//    console.log(verification)
    msg = verification ? "Yes, Transaction is verified and validate!" : "No, there is an issue. Transactions not verified!";
    ok = verification ? true : false;

    return {msg, ok}
  }


  SIGNED_TRANSACTION(private_key ){
    let cmd = `openssl dgst -sha256 -sign in ${private_key} -out `;
  }

  VERIFY_SIGNATURE(public_key, signature){

      return yes
      
  }

  getTransaction (){
    return this.transaction
  }


}




module.exports =  TRANSACTION
