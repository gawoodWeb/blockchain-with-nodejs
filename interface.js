const readline = require("readline/promises")

let rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
})

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




