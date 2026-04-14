const express = require("express")
const route = express.Router()
const utils = require("../class/util.js");

const user = require("../user.js");

let SESSIONID = null;
let path_session_db = null;

route.post("/", (req, res)=>{
  let {username, password } = req.body;

  

  console.log(user, "ok\n")
  
  if( user.username === username && password === user.password ){
    console.log("Yes is her!");
  

  SESSIONID = crypto.randomUUID();

  console.log(SESSIONID);

  utils.write("./store/session", SESSIONID.toString())
    .then((reponse)=>{
      console.log(  SESSIONID, password , "FILIPO ", reponse)
      res.status(200).json({msg: "You are auth", ok: true, id: SESSIONID});
    })
    .catch(e=>{
      console.log(e, SESSIONID, password ,'Fpp', reponse)
      res.status(403).json({msg: "You are not auth", ok: false});
    })

  }else{
      console.log( SESSIONID, password ,'Fppp' )
      res.status(403).json({msg: "PASS OR NAME DONT MATCH", ok: false});
  }

})






module.exports = route
