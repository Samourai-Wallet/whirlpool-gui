import {exec} from 'child_process'

class BackendService {

  startLocal () {
    console.log('Starting local backend...')

    const args = "--listen --debug --network=test --pool=0.01btc --server=pool.whirl.mx:8081 --seed-passphrase=foo --seed-words='all all all all all all all all all all all all' --tor=false"

    const backendProc = exec('java -jar /zl/workspaces/whirlpool/whirlpool-client-cli/target/whirlpool-client-cli-develop-SNAPSHOT-run.jar '+args, undefined,
      (error, stdout, stderr) => {
        console.log('Backend stdout: ' + stdout);
        console.log('Backend stderr: ' + stderr);
        if(error !== null){
          console.log('Backend exec error: ' + error);
        }
      }
    )
    console.log('Backend started...')
    backendProc.on('exit', (code, sig) => {
      // finishing
      console.log('Backend exiting...')
    })
    backendProc.on('error', (error) => {
      // error handling
      console.log('Backend error...')
    })
  }

}
export const backendService = new BackendService()
