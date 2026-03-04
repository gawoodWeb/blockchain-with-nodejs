const utils = require("../class/util.js");

class MEMEPOOL {
  constructor () {
    this.store = "../store/memestore.json"

  }

  async InsertTransaction (tr) {
    try {
      let array = []
      array.push(tr);
      let {data} = await this.getTransactions();
      console.log(data, typeof data);
      data = data ? data : [];
      array = [...array, ...data]
      await utils.write(this.store, tr);
      return {ok: true, msg: ""}
    } catch (e) {
      console.log(e)
      return {ok: false, msg: e}
    }
  }

  async getTransactions () {
    try {
      let r = await utils.read(path)
      let data = JSON.parse(r);
      console.log(r, data);
      return {ok: true, msg: "", data}
    } catch (e) {
      console.log("Cant get Tr from memestore");
      return {ok: false, msg: e}
      //throw e
    }
  }

  async getLastTransaction () {
    try {
      let { ok, data }= await this.getTransactions();
      if(ok){
        data.pop()
        return {ok, msg: "", data}
      }
    } catch (e) {
      return {ok: false, msg: e}
    }
  }


}

module.exports = new MEMEPOOL();


