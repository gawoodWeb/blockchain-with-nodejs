const { createClient } = require("redis");
const client = createClient();


async function init_db () {
  if(!client.isOpen){

    await client.connect();
  }
  //await client.set("ok", "true")
  console.log("Connected");
}


//
module.exports = {
  init_db, client
};





   
