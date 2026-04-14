const fs = require('fs');
const UTXO = require("../core/utxo.js");
const utxo = require('../core/utxo.js');



class Validator {
  constructor() {
    this.prop = "r"
  }

  async validate(tx){

     await this.utxo(tx)
  }

  async utxo (tx) {
    console.log("This is the : ", tx);
    let msg, ok;
    try {

      let inputs = tx["inputs"];

      for( let input of inputs ){
        let id = input["txid"];

        let {ok} = await UTXO.exists(id);

        console.log("Input ", id, ok);

        if(ok){
          let useUtxo = await UTXO.get(id);


        }

      }



      console.log(msg);
      return { ok, msg };
    } catch (e) {
      msg = "";
      console.log(msg, e);
      return { ok, msg };
    }
  }



  validate_input (){
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




}

module.exports = Validator;
