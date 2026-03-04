const readline = require("readline/promises")
const fs = require("fs")
const fsp = require("fs/promises")

const { exec, spawn } = require("child_process")

const UTILS = require("./class/util.js");
  
let username , password, port, serverPID, SessionID


let rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
})



async function INIT() {

   let response = await UTILS.fileExist(".env") 

  if(response.ok){
    await MAKE_TRANSACTION()
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




async function MAKE_TRANSACTION () {

  console.log("MAKE_TRANSACTION api ", SessionID);


  let from    = await rl.question("Your Address : ");
  let to      = await rl.question("Target Address : ");
  let amount  = await rl.question("Token amount : ");
  
  //console.log(yA,tA,amount);

  await fetch(`http://localhost:${from}/order/transaction`, {
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


//GET_ENV_VARIABLE(["username","port"])

INIT()
