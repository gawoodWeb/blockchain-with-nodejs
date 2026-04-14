const API = require("../api/api.js")
const ADDRESS = require("./address.js")


class NETWORK {

  constructor(port){
    this.adress = `http://localhost:${port}/`
    this.port = process.env.PORT
    this.api = new API()
    this.add = new ADDRESS();
  }
  
  setAddress(address, route){
    return `http://localhost:${address}/${route}`
  }



  async sendData ({transaction, to}) {
    
    try{
      await this.api
        .POST( 
          this.setAddress( to, "nodes/transaction"), 
          transaction 
        );
      return {msg: "Successfully sended!", ok : true}
    } catch (err) {
      console.log(err)
      return {msg: "Sorry brodcast errro", ok : false}
    }
    
  }

  
  async syncronize () {
    try{
      let list = this.add.get(2);
      let allAddress = this.add.getList()
      console.log("firs", list, allAddress)
      for(const add of list ){
        let resp = await this.api
          .POST( this.setAddress( add, "nodes/address"), allAddress);
        if (resp.ok !== true ) {
          console.log("Sorry")
          return false ///{ err: "Server error" };
        }
        let newAdd = await resp.json();
        console.log( "Response : ",  newAdd);
      }
      return {ok: true, msg: "All sended"}
    }
    catch (e){
      console.log("Dom")
      return {ok: false, msg: e}
    }
  };






  async broadcast (transaction){
    return 
    let from = transaction.data.from || "";
    let to = transaction.data.to || "";
    let nodes = transaction.nodes || [];
    

    try {
      await this.add.Insert(from);
      await this.add.Insert(to);
     // let {data: list} =
      let list = await this.add.get(6, nodes);
      
      console.log("Send to  All ", list, nodes);

      if(list.length > 0){

        transaction.nodes = [...list, ...nodes];

        for(const add of list ){
          console.log("Broadcasted");

          let resp = await this.sendData({ transaction, to: add });

          if(resp.ok){
            console.log("Ok from ", add );
          }
        }

        return {msg: "Everthing fine!", ok : true};

      }else{
        console.log("Everthing fine already called all nodes !")
        return {msg: "Everthing fine already called all nodes !", ok : true};
      }

    } catch(e) {
      console.log(e)
      return {msg: "Error sorry try again!", ok : false}
    }

  }


}


module.exports = new NETWORK();


