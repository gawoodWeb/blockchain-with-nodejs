const exp = require("express");
const route = exp.Router();
const USER    = require("../user.js")
const PEERS   = require("../network/peers.js")
const CONTROLER = require("../controler.js")

route.post("/transaction", async (req,res)=>{
  let response = USER.createTransaction(req.body);

  console.log("CREATED TRANSACTION ", response)
  if(response.ok){

    let transaction = { data: response.data};
    transaction.nodes = []
    transaction.nodes.push( response.data.from );

    console.log("what is Sending...", transaction);

    let prs = await PEERS.broadcast(transaction);

    if(prs.ok){  
      res.status(200).json({msg: prs.msg});
    }else{
      console.log("Can't send transaction to ", prs.msg)
      res.status(300).json({msg: prs.msg});
    }

  }else {
    console.log("TRANSAC NOT CREATE",response.msg)
    res.status(300).json({msg: response.msg});
  }
})



module.exports = route;
