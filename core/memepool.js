const BLOCK = require("./block.js")
const UTILS = require("./../class/util.js");
const path = require("path");
//const { log } = require("console");
const UTXO = require("./utxo.js")

class MEMEPOOL {
  constructor () {
    this.mempool = new Map();
    this.byId    = new Map();
    this.byFees  = new Map();
    this.byTime  = new Map();
    this.byHash  = new Map();
    this.stop   = false;
    this.BLOCK = BLOCK;
    this.store = path.resolve(__dirname,"../store/memestore");
    //this.loop()
  }

  async loop(){
    setInterval(async ()=>{
      if( ! this.mempool.size <= 0){
        this.stop = true;
        console.log('Cant Mining... Memory empty!');
      }else {
        this.stop = false
        console.log('Mining... START!');
        await this.initMining();
        //await new Promise(r=>setTimeout(r,2000));
        console.log('Mining... END!');
      }
    }, 10000)
  }



  async wko (){
    let msg, ok;
    try {
      
      console.log(msg)
      return {ok, msg}
    } catch (e) {
      msg = ""
      console.log(msg, e);
      return {ok, msg}
    }
  }



  async initMining(){
    try {
      if( true || this.mempool.size > 0){
        let list = this.listForMinning(5);
        //let list = [...this.mempool.values()]
        this.mempool.clear()
        let block = new this.BLOCK({list});
        await block.init();
        //console.log("Minning...");
      } 
      else {
        console.log("Menory size under 4")
      }
    } catch (e) {
      console.log(e)
    }
  }

  listForMinning(by = "byTime"){
    let keys = this.byTime.keys();
    let keylist = this.sortbyTime(keys).slice(0,5);
    let datalist = new Array();

    for (const key of keylist) {
      let hash = this.byTime.get(key);
      let tx   = this.mempool.get(hash);
      datalist.push(tx)
    }

    console.log(keylist);
    return datalist;
  }

  sortbyTime(list){
    return Array.from(list)
      .sort((a,b)=> Number(a) - Number(b))
  
  }


  /*  amount   120
   * 63 56 34 22 13 10 9 7 4 3  2 .5 
   * 0  1  2 3 4 5  6 7 8 9 10 11 12            
   * 
   * save index comb 0. , 1.7, 2.5, 3.4
   * not i 8, 
   * 
   * for 80
   *  34, 15.13 best 
   *  63.34 -- 3n11 out
   *  56.34 work
   *
   *  for 120
   *  63.x 1n11 out
   * 63.56.2 work so .5 out
   * 63.34.22 work
   *
   */


  async InsertTransaction (tran){
    try {
      let {id, timestamp} = tran;
      let hash = UTILS.hash(tran);

      // console.log(tran);
      this.mempool.set(hash, tran);

      //this.byFees.set(tran.i<F11>d, tran);
      //this.byHash.set(, tran);
      this.byId.set( id, hash);
      this.byTime.set(timestamp, hash);

     // console.log(this.byId, this.byTime );
      if(this.mempool.size > 10){
        // this.archiveTransaction();
        //console.log("memeory size exede!")
      }
      // this.mempool.set(tran.id, tran);

      //console.log( "Transaction", "The memeory pool!") 
    } catch (e) {
      throw e
    }
  } 











  








  async createStore(){
    try {
      let is = await UTILS.fileExist(this.store);
      if(!is.ok){
        await UTILS.write(this.store, "[]");
        console.log("We created ", this.store)
      } 
    } catch (e) {
      console.log(e)
    }
  }

  async reloadMemory () {
    try { 
      if(this.mempool.size > 3){
        for(const [key, value] of this.mempool ){
          await this.archiveTransaction(value)
        }
        this.mempool.clear();
      }
    } catch (e) {
      console.log(e)
    }
  }

  async archiveTransaction (tr) {
    try {
      let array = []
      array.push(tr);
      let {data} = await this.getTransactions();
      data = data !== '' ? data : [];
      array = JSON.stringify([...array, ...data]);
      await UTILS.write(this.store, array);
      console.log( array, "Merci ...");
      return {ok: true, msg: ""}
    } catch (e) {
      console.log(e)
      return {ok: false, msg: e}
    }
  }

  async archiveList( path, list){
    try {
      let stringList = JSON.stringify(list);
    } catch (error) {
      
    }

  }

  async getTransactions () {
    try {
      await this.createStore();
      let r = await UTILS.read(this.store);
      let array = r.data || []
      let data = JSON.parse(array) ;
      data = data ? data : [];
      console.log("opj", r, array);
      return {ok: true, msg: "", data}
    } catch (e) {
      console.log("Cant get Tr from memestore", e);
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
      console.log(e)
      return {ok: false, msg: e}
    }
  }

}

module.exports = new MEMEPOOL();


