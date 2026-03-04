const readline = require("readline/promises")

let rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
})

async function AUTH(){
  let username = await rl.question("Username : ");
  
}

let port, username 


async function dirExist(name){
  try {
    await fsp.access("./net/alice")
    return {msg: "yes user dir exist!", ok: true}
  } catch (error) {
      return {msg: "No", ok: false}
  }
}

function fileExist(name){
  try {
    fs.accessSync(name)
    return {msg: "yes user dir exist!", ok: true}
  } catch (error) {
    console.log(error)
      return {msg: "No", ok: false}
  }
}

function LOADSERVER(){
  
  let rep = fileExist(".env")

  if(rep.ok){
    
  let file = fs.readFileSync(".env", "utf8");
  let data = file.split("\n").filter(i=>i!=="")
  data = data.map(i=>i.split("="))


  for (const d of data){
    for (let a of d){
      console.log("op", a, d)
      if(a === "USERNAME"){
        username = d[1]
      }
    }
  }

  if(!username){
    let resp = rl.question("Configurer vous ? y or n : ");
    if(resp && resp === "y"){
      let name = rl.question("Entre votre nom : ");

    }

  }


  console.log('is',file, rep, data,port, username);
  }else{

    console.log("User doens't exist! ", port)
  
  }
}




LOADSERVER()







async function CALL () {
  let yA = await rl.question("Your Address : ");
  let tA = await rl.question("Target Address : ");
  let amount = await rl.question("Token amount : ");
  

    console.log(yA,tA,amount)

  await fetch(`http://localhost:${yA}/msg`, {
      headers: {
        "Content-Type" : "application/json"
      },
      method: "POST",
      body: JSON.stringify({ to: tA, amount, from: yA})
    })
    .then((resp)=> resp.text())
    .then((msg)=>console.log(msg));

  rl.close()

}

CALL()




