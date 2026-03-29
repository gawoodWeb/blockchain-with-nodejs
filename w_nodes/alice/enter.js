const BLOCK = require("./core/block.js")
let stop  = false

async function BUILD (params) {
  return console.log(0)
}

async function BLOCKING () {
  try {
    await new Promise(r=>setTimeout(r,3000));
    await BUILD()
    stop = false
  } catch (error) {
    console.log(error); 
    stop = true
  }
}


  
(async ()=>{
  //  setInterval( BLOCKING, 5000)
  //await BLOCKING() 
  while(!stop){
    await BLOCKING()
  }
})()


