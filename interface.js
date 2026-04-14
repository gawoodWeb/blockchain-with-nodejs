const readline = require("readline/promises")
const fs = require("fs")
const fsp = require("fs/promises")

const { exec, spawn } = require("child_process")

const UTILS = require("./class/util.js");
  
let username , password, port, serverPID, SessionID

console.log("Init");


console.log('joes');
let rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
})



async function INITOP() {

   let response = await UTILS.fileExist(".env") 

  if(response.ok){
    await MAKE_TRANSACTION({});
  }else{
    INITIALISATION()
  }


  //await KILLSERVER()
  //let data = await LOADSERVER()<F11>
  //console.log(data)

  //await AUTH({port: data.port})

}


async function AUTH({port}){
  let username = await rl.question("Username : ");
  let password = await rl.question("What is your password : ");

  console.log("Golp", port)
  let rep = await fetch("http://localhost:" + port + "/auth",{
      headers: {
        "Content-Type" : "application/json"
      },
      method: "POST",
      body: JSON.stringify({username, password})
  });

  let data = await rep.json();
  SessionID = data.id; 
  console.log(data, SessionID);

}



async function INITIALISATION (){
  try {
    let port =  await rl.question("Enter port number : ")
    let name =  await rl.question("Enter username : ")
    let pass =  await rl.question("Enter passphrase : ")

    let data = `PORT=${port}\nUSERNAME=${name}\nPASSWORD=${pass}\n`;

    let ret = await fsp.writeFile('.env', data, "utf8");
    console.log(ret, data);

    await INIT()
    
  } catch (error) {
    return false 
  }

}


let arr = [
  {
    to: '5002',
    amount: '60'
  },
  {
    to: '5003',
    amount: '40'
  },

  {
    to: '5002',
    amount: '72'
  }/* ,
  {
    to: '5004',
    amount: '440'
  },

  {
    to: '5042',
    amount: '260'
  },
  {
    to: '5003',
    amount: '43'
  },
  {
    to: '7002',
    amount: '660'
  },
  {
    to: '5003',
    amount: '30'
  }*/
]




async function MAKE_TRANSACTION () {

  console.log("MAKE_TRANSACTION api ", SessionID);


  let from    = "alice" ;// | await rl.question("Your Address : ");
  let to      =  "14tPJ3rX9DysVUT3LpoThCohnkh7RFVsxJ" ; //await rl.question("Target Address : ");
  let amount  =  "50";// await rl.question("Token amount : ");
  
  let port = process.env.PORT;
  //console.log(yA,tA,amount);

  await fetch(`http://localhost:${port}/order/transaction`, {
      headers: {
        "Authorization":`Bearer ${SessionID}`,
        "Content-Type" : "application/json"
      },
      method: "POST",
      body: JSON.stringify({ from, to, amount })
    })
    .then((resp)=> resp.json())
    .then((msg)=>console.log("Lasaline ",msg))

  .catch((e)=>{
    console.log(e);
  })

}








async function START_MINING () {

  console.log("START MINING api ", SessionID);


  let block   =  await rl.question("How many block : ");
  let user    =  await rl.question("For who : ");
  
  let port = process.env.PORT;

  await fetch(`http://localhost:${port}/order/mining`, {
      headers: {
        "Authorization":`Bearer ${SessionID}`,
        "Content-Type" : "application/json"
      },
      method: "POST",
      body: JSON.stringify({ block, user  })
    })
    .then((resp)=> resp.json())
    .then((msg)=>console.log("Mining ",msg))

  .catch((e)=>{
    console.log(e);
  })

}






async function INIT() {

   // let response = await UTILS.fileExist(".env") 

  //if(response.ok){

    let r = await rl.question("MINING Y : ");
    if(r === "y"){
      START_MINING()
    }else{
      MAKE_TRANSACTION()
    }
      /*
    for(const {to, amount} of arr){
      await MAKE_TRANSACTION({to, amount});
    }

  }else{
    INITIALISATION()
  }*/

  //process.exit(0)
}

INIT();


//GET_ENV_VARIABLE(["username","port"])






