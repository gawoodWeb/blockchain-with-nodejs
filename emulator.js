const { spawnSync, spawn } = require('child_process');
const path = require('path');

class SERVER {
  constructor() {
    this.prop = ""
  }
  start(peer) {
    console.log(`Démarrage du serveur pour ${peer}...`);
    
    const serverProcess = spawn('node', [
      path.join(__dirname, 'server.js'),
      `--node=${peer}`
    ], {
      stdio: 'inherit', // Pour voir les logs du serveur
      detached: true     // Permet au processus de continuer après la sortie du parent
    });
    
    serverProcess.unref(); // Détache le processus enfant
    
    serverProcess.on('error', (err) => {
      console.error(`Erreur pour ${peer}:`, err);
    });
    
    console.log(`Serveur ${peer} démarré avec PID: ${serverProcess.pid}`);
    return serverProcess;
  }


  onstart(peer){
    console.log("Yes lers start the server");
    let result = spawnSync(`node`,[ `server.js`,`--node=${peer}`],{
      encoding: "utf8", stdio: "pipe"
    });
    if (result.error) {
      console.error(`Erreur pour ${peer}:`, result.error);
      return result;
    }
    
    if (result.status !== 0) {
      console.error(`Commande échouée pour ${peer} avec code ${result.status}`);
      console.error('stderr:', result.stderr);
    }
    
    console.log(`stdout pour ${peer}:`, result.stdout);
  }


}

module.exports = new SERVER();


