const console = require("console");
let   fs      = require("fs");
let   fsp     = require("fs/promises");
let   {exec, spawn, spawnSync }    = require("child_process");
const { default : bs58 } = require("bs58");
const path    = require("path");
const UTIL    = require("../class/util.js")
const crypto  = require("crypto")
const { init_db, client : db } = require("../class/redis.db.js")




async function START (){
  await init_db();
}




class ADRESS {

  constructor () {
    this.port = 5000;
    this.addMapPath = path.resolve(__dirname, "../store/addressmap.txt");
    this.called = [];
  }

  AnexAdd (){
    let file = fs.readFileSync("add_list.json", "utf8")
    let data =  file.trim() !== "" ? JSON.parse(file) : null;
    data = [...data, this.address ]
    fs.writeFileSync("add_list.json", JSON.stringify(data), "utf8")
  }



  /**
  * @param {String} path
  */
  setPubKey (pubKey){
    this.pubKey = pubKey;
    return this;
  }

  pathPubKey (path) {
    let key = fs.readFileSync( path , "utf8");
    this.pubKey = crypto.createPublicKey({
      key,
      type: "spki",
      format: "pem"
    });
    return this
  }

  getPubKey (key){
    //let key = fs.readFileSync( this.path_publicKey , "utf8")
    let jwk = key.export({
      type: "spki", format: "jwk"
    });

    let x = Buffer.from(jwk.x, "base64url");
    let y = Buffer.from(jwk.y, "base64url");

    let prefix = (y[y.length - 1] % 2 === 0 ? 0x02 : 0x03 );

    let pk = Buffer.concat([
      Buffer.from([prefix]), x
    ]);
    
    console.log("This is what the pubkey : \n ", key, x,y,prefix,pk)
    this.publicKey = pk;
  }



  create(){

    this.getPubKey(this.pubKey);

    let hash = crypto.createHash("sha256")
    .update(this.publicKey)
    .digest();

    let ripemd = crypto.createHash("ripemd160")
      .update(hash)
      .digest();

    let prefix = new Buffer.from([0x00])

    let payload = Buffer.concat([prefix, ripemd]);

    let checksum = crypto.createHash("sha256")
      .update(
        crypto.createHash("sha256").update(payload)
        .digest()
      ).digest()
      .slice(0,4);

    let address = Buffer.concat([payload, checksum]);
    let readable = bs58.encode(address);
    console.log(bs58, "add",address.length, readable )
    this.address = readable;
    return readable; 
  }



  verify (address){
    let decode = bs58.decode(address);
    let pubkeyhash = decode.slice(1,21);
    console.log(decode, Buffer.from(pubkeyhash));
  }



  getPubKeyHash (address){
    let decode = bs58.decode(address);
    let pubkeyhash = decode.slice(1,21);
    console.log("PUBKEYHASH : ",decode, Buffer.from(pubkeyhash));
    return pubkeyhash;
  }


  async isMapExist () {
    try {
      await fsp.access(this.addMapPath);
      // console.log("Yes ", this.addMapPath + " Exist!");
    } catch (err) {
      console.log(err);
      try {
        await this.createMapFile()
      } catch (error) {
        console.log(error)
      }
    }
  }

  async createMapFile() {
    try {
      return await new Promise((r,j)=>{
        let m = spawnSync(`touch`, [this.addMapPath]);
        console.log(m)
        setTimeout(r, 300)
      })
    } catch (error) {
      console.log("Parser init!");
    }
  }

  async getList () {
    try {
      await this.isMapExist();
      let file = fs.readFileSync( this.addMapPath , "utf8");
      //console.log("File", file);
      let data = file
        .split("\n")
        .map(i=>i.toString().trim())
        .filter(e=>e !== "")
        .filter(e=>e !== this.port.toString());
      
      // console.log("jkk", file, data);

      return {ok: true , msg: "", data}
    } catch (error) {
      console.log("tt" ,error)
      return {ok: false, msg: ""}
    }
  }

  async getOnly(nodes = []){
    try {
      let list = await this.getList();
      list = list.data
      list.push(this.port);


      //list = [...new Set([...list, ...nodes])];
      let n = []
      for (const elem of list){
        if(!nodes.includes(elem)){
          n.push(elem)
        }
      }

      console.log(n, "nnnnn", list)
      return {ok: true , msg: "", data: n}
    } catch (e) {
      return {ok: false , msg: "", data: []}
    }
  }

  async buildList(size, nodes){
    let list = await this.getOnly(nodes);
    if(list.data.length <= 0) return false

    list = list.data || []

    let time = Math.ceil(list.length / size);
    let newList = [];
    
    console.log( list, "nodes", nodes )

    for (let i = 0; i < time; i++){
      let tab = []
      for(let o = 0; o < size; o++){
        let elem = list.shift()
        elem ? tab.push(elem) : null ;
      }
      //let tab = [list.shift(), list.shift()]
      tab.filter(i=> i !== undefined );
      newList.push(tab)
    }

    this.called = newList;
    console.log(newList)
    return true
  }

  async get(size = 5, nodes){
    if(this.called.length <= 0) {
      if(await this.buildList(size, nodes)){

        console.log(this.called, "NODE-------" )
        return [...this.called.shift()];
      }else {
        console.log("ALL NODE CALLED" )
        return []
      }
    }else{
      console.log( this.called, 'nodesss', nodes, size)
      return [...this.called.shift()];
    }
  }


  async Insert (add){
    try {

      let list = await   this.getList();
      list = list.data;
      if(list.includes(add)) {
        console.log("Aready in!")
        return {ok : true, msg: "Already in!"}
      }
      
      await fsp.appendFile(this.addMapPath, 
          `\n${add}`, "utf8", "a");

      console.log(`${add} added to ${this.addMapPath} !`);
      
      return {ok : true, msg: "True "}
    } catch (error) {

     console.log(error)
     return {ok : true, msg: e}
    }
  }

  async InsertList(list){
    try { 
      for (const add of list){
        await this.Insert(add)
      }
    } catch (error) {
      console.log("There is an error insert all add") 
    }
    return
  }




}

/*
let a = new ADRESS()
a.pathPubKey("./peers/alice/key/public.pem")
let address = a.create();
a.verify(address)

console.log("This is my crypto :",address)

*/

module.exports = ADRESS;
