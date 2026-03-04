const expres = require("express");
const app = expres();
const fs = require("fs")
const fsp = require("fs/promises")

let port =  null // process.env.PORT;
let username = null

let USER = require("./user.js")
app.use(expres.json());
app.use(expres.urlencoded({ extended: true }));



let add = fs.readFileSync("pubAdd.txt",{ encoding: "utf8" });
add = add.toString().trim();
console.log(  process.env.PORT);


const callNet = async () => {

  if(port === "5000")  add = 5001;

  let address = "http://localhost:" + add + "/";

  try {	
    let resp = await fetch(address);
    let data = await resp.text();
    console.log("receives : " , data);

    data = JSON.parse(data)

  let read = fs.readFileSync(`add${port}.txt`,{ encoding: "utf8" })
	read = read
    .split("\n")
    .filter(i=>i.trim() !== "");

    let merged = [...new Set([...data,...read])]
    console.log("rdm", read, data, merged)

    clearFile(`add${port}.txt`);

      merged.forEach(e=>{
        console.log("e", e)
        fs.appendFileSync(`add${port}.txt`, `${e}\n`)
      })

    //fs.writeFileSync("add" + port + ".txt", `\n${data}`, {flag: "a"})
    //FIND_AND_CHOOSE_ADDRESS()
  } catch (err) {
    console.log(err);
  }

}

function FIND_AND_CHOOSE_ADDRESS () {


  let data = fs.readFileSync(`add${port}.txt`,{ encoding: "utf8" })
	data = read
    .split("\n")
    .filter(i=>i.trim() !== "");

  console.log("file content ", data );
  let address = "http://localhost:"  + "/";

  console.log(getRandomElement(data));
}

function getRandomElement(list) {
  return list[Math.floor(Math.random() * list.length)];
}


/*
  let rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  })
*/



//async function Inter (){




//}



//Inter()

/**
 * Vide complètement un fichier.
 * @param {string} filename - Le chemin du fichier à nettoyer
 */
function clearFile(filename) {
  fs.writeFile(filename, "", (err) => {
    if (err) {
      console.error(`Impossible de vider le fichier ${filename} :`, err);
    } else {
      console.log(`Fichier ${filename} vidé avec succès !`);
    }
  });
}

// Exemple d'utilisation


//FIND_AND_CHOOSE_ADDRESS();



let timerGetNet = new setInterval(()=>{
//  callNet();
   //SYNCRONYSE();
}, 10000);


async function BRODCAST (address, transaction) {

  try {
    let resp = await fetch("http://localhost:" + address + "/new", {
      method : "POST",
      headers : {
        "Content-Type" : "application/json"
      },
      body : JSON.stringify({transaction})
    });

    if (resp.ok !== true) {
      console.log("Sorry")
      return {msg: "Server error", ok: false};
    }

    let data = await resp.json();

    return {msg: data.msg, ok: true}

  } catch (err) {
    
    console.log(err)
    return {msg: "Sorry brodcast errro", ok : false}
  }

}



let poolmeme = []
let listAdd = [port];


async function SYNCRONYSE () {

  let add = getRandomElement(listAdd);

  console.log("firs",add, port)
  if(listAdd.length <= 1 && add === port) {
    add = "5000"    
  }

  console.log("second",add, port)
  if( port === add ) return true;

  let resp = await fetch("http://localhost:" + add + "/sync", {
      method : "POST",
      headers : {
        "Content-Type" : "application/json"
      },
      body : JSON.stringify([...listAdd.filter(i=> i !== add )])
    });

    if (resp.ok !== true) {
      console.log("Sorry")
      return false ///{err: "Server error"};
    }

    let newAdd = await resp.json()
    console.log( "Response : ",  newAdd);
    listAdd = [...new Set([...newAdd, ...listAdd])]
    return true


}

//clearTimeout(timerGetNet)


let users = new USER("peter");
console.log(users)
users.load()

function ADD_NEW_ADDRESS (add,port){
  listAdd = [...new Set([...listAdd, add])]
  return listAdd.filter(a=>a!==port)
}



async function SEND (transaction, to){

  let newList = ADD_NEW_ADDRESS(to,port)

  console.log("Send to ", to, "All ", listAdd)

  try {
    for(const add of newList){
      if(add === port ) return false

      let resp = await BRODCAST(add, transaction);

      if(resp.ok){
        console.log("Ok from ", add , resp.msg )
      }
    }

    return {msg: "Everthing fine!", ok : true}

  } catch(e) {
    console.log(e)
    return {msg: "Error sorry try again!", ok : false}
  }

}


//app.use()
console.log(port)













app.get("/", (req, res)=> {

  let addressList = fs.readFileSync("add" + port + ".txt", "utf8")
	addressList = addressList
    .split("\n")
    .filter(i=>i.trim() !== "");
  console.log("Ask readed sent :", addressList)
  
	res.send(JSON.stringify(addressList));
  // callNet(); 
})



app.post("/sync",(req, res)=>{
  let newAdd = req.body;

  if(newAdd.length > 0){
    listAdd = [...new Set([...newAdd, ...listAdd])]

    //console.log("Asked for address list !", newAdd, listAdd);
   
    return res.status(200).send([...listAdd]);
  }

  console.log("Asked for address list !", newAdd, listAdd);
  res.status(200).send(listAdd);

});



app.post("/auth",(req, res)=>{

  let {name} = req.body;
  if(username && name === username){
    

  }
  let user = new USER(name);
  if(user.auth()){

  }
})

app.post("/msg", async (req,res)=>{
  let response = users.createTransaction(req.body);
  console.log(response)
  if(response.ok){
    let transaction = response.transaction;
    let prs = await SEND(transaction,transaction.to )
    if(prs.ok){  
      res.send(prs.msg);
    }
  }else {
    console.log(response.msg)
    res.send(response.msg)
  }
})



app.post("/new", (req, res)=>{
  let {transaction}  = req.body;
  users.validateTransaction(transaction);
  users.pushToPool();
  console.log("receive ", req.body);
  res.send({ msg: "data receive!"})
})


app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).send("Erreur serveur");
});


console.log("Is port", port)
if(!port) return true

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
