class API {
  constructor (){

  }

  async POST(url,data){
    try {
      let resp = await fetch( url , {
        method : "POST",
        headers : {
          "Content-Type" : "application/json"
        },
        body : JSON.stringify({...data})
      });

      if (resp.ok !== true) {
        console.log("Sorry server not responding!")
        return {msg: "Server error", ok: false};
      }

      let rep = await resp.json();

      return {msg: rep.msg, ok: true}
    }catch(e){

      console.log(e)
      return {msg: "Sorry errror post ", ok : false}
    }
  }

  async GET(url,data){
    try {
      let resp = await fetch( url );

      if (resp.ok !== true) {
        console.log("Sorry server not responding!")
        return {msg: "Server error", ok: false};
      }

      let rep = await resp.json();

      return {msg: rep.msg, ok: true}
    }catch(e){
      console.log(e)
      return {msg: "Sorry errror get", ok : false}
    }
  }


}



module.exports = API;
