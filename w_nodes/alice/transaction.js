//const { exec } = require("process")
const crypto = require("crypto");
const { timeStamp, log } = require("console");
const  UTILS = require("./class/util.js");
const worker = require("worker_threads");

class TRANSACTION {

  constructor({publicKey, privateKey}){
    this.privateKey = privateKey;
    this.publicKey  = publicKey ;
    this.address = process.env.PORT || '5000'
  }


  load(transaction){
    this.transaction = transaction;
    
    this.bindToThis();
    this.setType();

    if(this.type === "ctx") {
      this.transformOutput();
      this.create()
    } else if(this.type === "p2p"){
      this.transformInput();
      this.transformOutput();
      this.create()
      this.sign();
    }

    console.log("AFTER ...", this.transaction.inputs, this.transaction.outputs)
    return this.transaction;
  }


  get TxInterface (){
    return {
      id        : 0 ,
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
        id    : "01",
        index : "0",
        amount: "",
        scriptSig: {
          signature : "abcd",
          pubkey    : "",
        },
      }
  }


  get OutputInterface (){
    return {
        address : "",
        amount  : 0,
        scriptPubKey : ""
      }
  }

  setOutputs (){
    let output          = this.OutputInterface;
    let {to, amount}    = this.transaction;
  }


  setInputs (){
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


  getUtxos(){

  }

  
  getOutput(txs){

    // convertir Map → Array 
    const entries = Array.from(txs.entries());

    // transformer en objets simples
    const utxos = entries.map(([id, output]) => ({
      id,
      amount: Number(output.amount)
    }));

    // trier du plus grand au plus petit
    utxos.sort((a,b)=> b.amount - a.amount);

    let selected = [];
    let total = 0;

    for(const utxo of utxos){

      selected.push(utxo.id);
      total += utxo.amount;

      if(total >= this.amount){
        break;
      }

    }

    if(total < this.amount){
      throw new Error("Insufficient funds");
    }

    return {
      ids: selected,
      amount: total,
      size: selected.length
    };

  }


  bindToThis (){
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

  transformInput(){
    let input   = {};
    input["id"] = "88888888";
    input["index"] = 0;
    input["amount"] = this.amount;
    input["scriptSig"] = {
      key: this.publicKey.export({type:"spki",format:"pem"})
        .toString(),
      signature : ""
    };
    this.inputs.push(input);
  }

  transformOutput (){
    let output  = {};
    output["address"] = this.to;
    output["amount"] = this.amount;
    output["scriptPubKey"] = UTILS.hash(this.to.toString());
    // output["address"] = Tx.to;
    this.outputs.push(output);
  }

  create(){
    //console.log("in, op", this.inputs, this.outputs)
    this.transaction = {
      id        : this.id || crypto.randomUUID(),
      type      : this.type   ,
      version   : "1.1.0"     ,
      address   : "00000000"  ,
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

  adPubKey(publicKey){
    this.transaction.publicKey = publicKey.export({type: "spki",format: "pem"});
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


  validate (){
    let msg = "Transaction validate"
//    console.log("vli",this.transaction, "\n")
    if(this.from === this.to ) {
      msg = "You can't send token to yourself!"
//      console.log(msg)
      return {msg, ok: false}
    }
    else if ( this.to === "5000" ) { 
      msg = "You can't send token to the system!"
//      console.log(msg)
      return {msg, ok: false}
    }
    else {
      if(true){
        msg = "Great your transaction is validate!"
        return {msg, ok: true}
      }else{
        msg = "You don't have enougth token!"
        return {msg, ok: false}
      }
    }
  }


  verify_input (Transactions){

    let sold = 0
    Transactions.forEach((item)=>{
        if(item.to == this.from || item.from == this.from ){
//            console.log("Yes" , this.from, "is indicated!", item.id);

            if(this.from == item.to){
                sold += item.amount
//                console.log(sold, item)
            }
            else {
                sold -= item.amount
//                console.log(sold, item)
            }
        }
    })

//    console.log(this.from, sold)

    return sold >= this.amount
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
