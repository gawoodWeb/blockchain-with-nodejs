const fs = require("fs")
const fsp = require("fs/promises");
const util = require("./class/util.js");


class CONTOLER {
  constructor(){
    this.SESSIONID = null;
    this.session_path = "./store/session"
    // this.getSessionId()
  }

  async getSessionId(){
    try {
      let res = await util.read(this.session_path)
        if(res.ok){
          this.SESSIONID = res.data;
          console.log("Yes we got it : ", this.SESSIONID)
        }
    } catch (error) {
      console.log(error)
    }
  }


  auth (req, res, next){
    this.getSessionId();

    let sessionFromClient = req.headers.authorization;
    if(!sessionFromClient && this.SESSIONID) {
      console.log("You need to provide a token!");
      res.status(401).json({ ok: true , msg: "No token provided!" });
    }
    if(this.SESSIONID === sessionFromClient){
      console.log("Verified go go goooo!")
      next()
    }else{
      console.log(" yourself!");
      res.status(401).json({ok: false, msg: "No token provided!" });
    }
  }


}

module.exports = new CONTOLER



