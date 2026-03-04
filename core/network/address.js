const console = require("console");
let fs    = require("fs");
let fsp   = require("fs/promises");
let {exec, spawn, spawnSync }    = require("child_process");
const path = require("path")


class ADRESS {
  constructor () {
    this.port = process.env.PORT
    this.addMapPath = path.resolve(__dirname, "../store/addressmap.txt");
    console.log(this.addMapPath);
    this.called = []

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


module.exports = ADRESS
