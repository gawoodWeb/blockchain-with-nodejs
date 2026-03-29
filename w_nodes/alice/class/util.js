const fsp = require("fs/promises")
const fs = require('fs')
const PATH = require("path")
const crypto = require('crypto');
const { log } = require("console");

class UTILS {
  constructor () {

  }

  async getPath (path){
    return PATH.resolve(__dirname, path)
  }

  getDirPath(name){
    
  }

  hash (text){
    try {
      if(typeof text === "object"){
        //console.log("yes its an object!");
        text = JSON.stringify(text);
      }
      return crypto.hash("sha256", text, "hex");
    } catch (e) {
      console.log(e)
      return false
    }
  }

  async fileExist (path){
    let msg = "Yes, file exist!"
    try {
      await fsp.access(path)
      console.log(msg);
      return {msg, ok: true}
    } catch (error) {
      msg = "No file does not exist!"
      console.log( msg, error);
      return {msg, ok: false}
    }
  }

  async apendToFile(path, data){

  }

  async write (path, data){
    let fullPath = await this.getPath(path);
    console.log(fullPath);
    try {
      let msg = "Realized writed file!"
      let res = await fsp.writeFile(fullPath, data, "utf8");
      return {msg, ok: true}
    } catch (error) {
      console.log(error);
      return {ok: false, msg: error}
    }
  }


  async read (path ) {
    let msg = "Yes, read file and data sent!"
    let data = null
    let fullPath = await this.getPath(path);
    try {
      let res = await this.fileExist(fullPath);
      console.log("ooooo", res)
      if(res.ok){
        data = await fsp.readFile(fullPath, "utf8");
      }
      console.log(msg, data)
      return {msg, ok: true, data}
    } catch (error) {
      msg = "No file does not read!"
      console.log( msg, error);
      return {msg, ok: false}
    }
  }



  async openDir(name){
    let path = await this.getPath(name);
    let dir = await  fsp.opendir(path);
    // console.log(path, await dir.read());
     
    for await (const dirent of dir){
      if(dirent.isFile()){
        let filename = dirent.name;
        let fullPath = PATH.join(path,name);
        
        log("DIRREN",dirent ,filename )
      }
    }



  }


}

module.exports = new UTILS()
