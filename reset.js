const {init_db, client: db} = require('./class/redis.db.js');
const { exec } = require('child_process');
const {promisify} = require('util');
const asyncExec = promisify(exec)

async function RESET() {
  await init_db();
  let keys = await db.keys("*");
  console.log(keys)
  for(let key of keys ){
     await db.del(key);
  }

  await asyncExec("rm -rf ./blockchain/*");
  await asyncExec("rm -rf ./peers/*");

  console.log("Finish")
}


(async () => {
  await RESET();
  process.exit(0);
})();
