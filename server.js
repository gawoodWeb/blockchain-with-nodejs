const expres = require("express");
const app = expres();
const fs = require("fs")
const fsp = require("fs/promises")

let port = process.env.PORT;
let SESSIONID = null;




async function configLoad () {
  console.log("Server.js");
  let args = process.argv;
  let node = args
    .find((e)=> e.startsWith("--node"))
    .split("=")[1];


  let path = `./peers/${node}/config.json`;
  let file = await fsp.readFile(path, "utf8");
  let data = JSON.stringify(file);
  console.log(data, node, args );

  let { ip } = data;
  port = ip;

}

//configLoad()


// let port = process.env.PORT;
console.log("Environement", port);

const ADD = require("./network/address.js"); 
const add = new ADD(port); 

const PEERS = require("./network/peers.js");



const user = require("./user.js");

const controler = require("./controler.js");

app.use(expres.json());
app.use(expres.urlencoded({ extended: true }));



const authRoute   = require("./routes/auth.js");
const orderRoute  = require("./routes/order.js");
const peersRoute  = require("./routes/peers.js");
const { argv } = require("process");

app.use("/order", orderRoute);
app.use("/auth",  authRoute);
app.use("/nodes", peersRoute);



app.get("/log", controler.auth , (req, res)=>{
  res.send("<h1>Welcom to heaven</h1>")
})



app.get("/", (req, res)=> {
  res.status(200).send("Welcome")
})

/*
app.post("", async (req,res)=>{
  let response = user.createTransaction(req.body);
  console.log("CREATED TRANSACTION ", response)
  if(response.ok){
    let transaction = response.transaction;
    let port        = response.transaction.to;

    console.log("Sending...", transaction, port)
    let prs = await PEERS.sendData({transaction, port} );
    if(prs.ok){  
      res.status(200).json({msg: prs.msg});
    }else{
      console.log("Can't send transaction to ", port, prs.msg)
      res.status(300).json({msg: prs.msg});
    }

  }else {
    console.log("TRANSAC NOT CREATE",response.msg)
    res.status(300).json({msg: response.msg});
  }
})
*/


app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).send("Erreur serveur");
});





console.log("No port variable vonfigured !", port)
// if(!port) return true

process.on("SIGTERM", () => {
  console.log("Server shutting down...");
  process.exit(0);
});

app.listen(port, ()=>{
	console.log("Server on port ", port)
})

/*
 * rl.question("quel est ? votre address :  ", (data, err)=>{
    if(err) return console.error(err)
  console.log(data)
})


rl.close()
*/


// 354
