const express = require("express");
const route   = express.Router()
const user    = require("../user.js")
const ADD     = require("./../network/address.js");
const PEERS   = require("./../network/peers.js")



let port = process.env.PORT;
const add     = new ADD(port);



route.post("/transaction",   (req, res)=>{
  let transaction  = req.body;

  console.log("&7777777", transaction);

  let r = user.validateTransaction(transaction);



  if(r.ok) {
    // console.log("not receive ");
    // res.status(200).json({ msg: "Data  receive, not broadcast!"});
    
    PEERS.broadcast(transaction)
    .then((r)=>{
      console.log("received broadcasted");
      res.status(200).json({ msg: "Data receive, broadcasted"});
    })
    .catch((e)=>{
      console.log("received", e);
      res.status(305).json({ msg: "Data receive, not broadcast!"});
    })
    

  }else {
    console.log("not receive ");
    res.status(305).json({ msg: "Data not receive, not broadcast!"});
  }

})



route.post("/address",(req, res)=>{
  let list_receive = req.body;
  let {data : our_list} = add.getList();

  if(list.length > 0){
    add.InsertList(list).then(()=>{
      return res.status(200).send([...listAdd]);
    })
  }
  console.log("Asked for address list !", list_receive, our_list);
  res.status(200).json(our_list);

});


module.exports = route

