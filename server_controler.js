



async function WAIT_FOR_SERVER(port, timeout = 5000) {
  const start = Date.now();
  while (Date.now() - start < timeout) {
    try {
      await fetch(`http://localhost:${port}`);
      console.log("\n Server full ready!")
      return true;
    } catch {
      await new Promise(r => setTimeout(r, 300));
    }
  }
  throw new Error("Server did not start in time");
}




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
    return {msg: `Yes file ${name} exist!`, ok: true}
  } catch (error) {
      //console.log(error)
      return {msg: `No file ${name} doesn't exist!`, ok: false}
  }
}





function GET_ENV_VARIABLE(arr,path){
    let file = fs.readFileSync(path, "utf8");
    let data = file.split("\n").filter(i=>i!=="")
    data = data.map(i=>i.split("="))
    console.log(arr)

/*
    for (const d of data){
      for (let a of d){


        console.log("op", a, d)
        if(a === "USERNAME"){
          username = d[1]
        }
        if(a === "PASSWORD"){
          password = d[1]
        }

        if(a === "PORT"){
          port = d[1]
        }
      }
    }
*/

  let response = {}
  for(const d of data){
    for(const v of arr){
      if(d[0].toLowerCase() === v.toLowerCase()){
        let nv = v.toLowerCase()
        response[nv] = d[1]
      }
    }
  }
  console.log(response)
  return response
}





async function LOADSERVER(){
  let rep = fileExist(".env")

  if(rep.ok){
    let { username, password, port } = GET_ENV_VARIABLE(["USERNAME","PASSWORD","PORT"],".env") 

    console.log("ENV")

    console.log("username", username, "password", password)


    if(!username || !password){
      let resp = await rl.question("Configurer vous ? y or n : ");
      if(resp && resp === "y"){
        INITIALISATION()
      }

    }else{
      let resp = await IS_SERVER_RUNNING();

      if(false){

        console.log(resp.msg)
        console.log("Let's try to run the server!")

        // Fichiers de log
        const out = fs.openSync("server-out.log", "a");
        const err = fs.openSync("server-err.log", "a");

        // Lancer nodemon en arrière-plan
        const child = spawn("node", ["--env-file=.env", "server.js"], {
          detached: true,       // processus indépendant
          stdio: ["ignore", out, err]
        });


        serverPID = child.pid.toString()

        fs.writeFileSync(".pid",`SERVERPID=${serverPID}\n`,"utf8")


        child.unref(); // permet à ton script principal de continuer
        console.log("Starting server at : ", serverPID)

        //
        //
        await WAIT_FOR_SERVER(port);

      }else {
        
      }

    }

    console.log( username, serverPID);

    return { port, username, password, msg: "Work fine", ok: true}

  }else{
    await INITIALISATION()
    console.log("User doens't exist! ")
    return {msg: "Error", ok: false}
  }
}




async function WAIT(time){
  return await new Promise(r=>setTimeout(r,time))
}



async function KILLSERVER(){ 
  try {
    let serverPID
    let file = fileExist(".pid")
    console.log(file)
    if (file.ok) {
      let {serverpid} = GET_ENV_VARIABLE(["SERVERPID"],".pid");
      let start = Date.now();

      while(Date.now() - start < 3000 ) {
        try {
          process.kill(serverpid, "SIGTERM");
          console.log("Trying to kill ", serverpid);
          await WAIT(300)
        } catch (error) {
          console.log("Killed daemon server.js!");
          break
        }
      }
    }else {
      console.log("Unable to locate .pid file!")
    }
  } catch (error) {
      console.error("Server error  retry!");
  }
}




async function IS_SERVER_RUNNING(){
  try {
    let start = Date.now()
    let {serverpid} = GET_ENV_VARIABLE(["SERVERPID"], ".pid")
    while(Date.now() - start < 3000 ){
      try {
        process.kill(serverpid,0)
        console.log("YES SERVER IS RUNNING!")
        return {msg: " YES SERVER IS RUNNING!", ok: true}
        break
      } catch (e) {
        await new Promise(r=>setTimeout(r,300))
        console.log("retring to see if there is a server running")
      }
    }
    return {msg: "Sorry no server", ok: false}
  } catch (error) {
    console.log(error)
    return {msg:"server error try again!", ok: false}
  }
}





