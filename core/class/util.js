const fsp = require("fs/promises")
const fs = require('fs')
class UTILS {
  constructor () {

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
    try {
      let msg = "Realized writed file!"
      let res = await fsp.writeFile(path, data, "utf8");
      return {msg, ok: true}
    } catch (error) {
      return {ok: false, msg: error}
    }
  }

  async read (path ) {
    let msg = "Yes, read file and data sent!"
    let data = null
    try {
      let res = await this.fileExist(path)
      console.log("ooooo", res)
      if(res.ok){
        data = await fsp.readFile(path, "utf8");
      }
      
      console.log(msg, data)

      return {msg, ok: true, data}
    } catch (error) {
      msg = "No file does not read!"
      console.log( msg, error);
      return {msg, ok: false}
    }
  }

}

module.exports = new UTILS
