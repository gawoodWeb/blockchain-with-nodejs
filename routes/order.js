const exp         = require("express");
const route       = exp.Router();
const C_NODE      = require('../core/node.js');
const NODE        = new C_NODE()
const PEERS       = require("../network/peers.js")
const CONTROLER   = require("../controler.js")





route.post("/transaction", async (req,res)=>{
  NODE.create(req.body)
  .then((response)=>{
    console.log("response", response)

  

  console.log("CREATED TRANSACTION ")
  if(response.ok){

    let transaction = { data: response.data};
    transaction.nodes = []
    //t::ransaction.nodes.push( response.data.from );

    //console.log("what is Sending...");

    /*
     *
     * let prs = await PEERS.broadcast(transaction);

    if(prs.ok){  
      res.status(200).json({msg: prs.msg});
    }else{
      console.log("Can't send transaction to ", prs.msg)
      res.status(300).json({msg: prs.msg});
    }*
     */
      //console.log("Can't send transaction to ")
      res.status(200).json({msg: "Template.js"});

  }else {
    console.log("TRANSAC NOT CREATE",response.msg)
    res.status(300).json({msg: response.msg});
  }
    
  })
  .catch(e=>{
    throw e
  })
})


route.post("/mining", (req, res)=>{

  let n_block = req.body.block || 2;
  let user    = req.body.user;
  console.log("Lets start mining ", n_block)
  NODE.mine({ block: parseInt(n_block), user })
    .then(response =>{
      let block = response;

    })
    .catch(e=>{
      console.log(e);
    })

})



module.exports = route;
