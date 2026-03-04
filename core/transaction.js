const { exec } = require("process")
const crypto = require("crypto")


class TRANSACTION {


  constructor(isAnewTransaction){
    
  }

  load(transaction){
    console.log("loading Transaction", transaction)
    this.from = transaction.from;
    this.to = transaction.to;
    this.amount= transaction.amount;
    this.signature = transaction.signature;
    this.id = transaction.id;
    this.publicKey = crypto.createPublicKey(transaction.publicKey);
  }

  make(transaction){
    this.from = transaction.from;
    this.to = transaction.to;
    this.amount= transaction.amount;
    this.id = crypto.randomUUID();   
  }

  create(){
    this.transaction = {
      from: this.from,
      to: this.to,
      amount: this.amount,
      id: this.id,
      signature: this.signature
    } 
    return this.transaction
  }

  write(){
    
  }

  formatTransaction(tr){
    return JSON.stringify({
      id: tr.id,
      from: tr.from,
      to: tr.to,
      amount: tr.amount,
    });
  }

  adPubKey(publicKey){
    this.transaction.publicKey = publicKey.export({type: "spki",format: "pem"});
  }

  sign(privateKey){
    let signer = crypto.createSign("sha256");
    let tr = this.formatTransaction(this.transaction)
    signer.update(tr);
    signer.end()

//    console.log("befire sign", tr)
    let signature = signer.sign(privateKey, "hex");
    this.transaction.signature = signature;
    
//    console.log("after sign", this.transaction)
    return {msg : "Transaction signer avec success!", ok: true}
    //let signature = cryptop
  }

  verify(){
    let msg = "";
    let ok = false;
    let verify = crypto.createVerify("sha256")
    let tr = this.formatTransaction(this.transaction);
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
