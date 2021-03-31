import cluster from 'cluster';
import EventEmitter from 'node:events';
import os from 'os';
import { Safe } from './common/safe_access/safe';
import { heartbeatReq, heartbeatRes, startHttpServer } from './index';
const numCPUs = os.cpus().length;

if (cluster.isMaster) {
  console.log(`Master ${process.pid} is running`);

  // Fork workers.
  for (let i = 0; i < numCPUs - 7; i++) {
    forkNewWorker();
  }

  // 进程保活
  cluster.on('exit', (worker, code, signal) => {
    console.log(`worker ${worker.process.pid} died!`);
    const workers = Object.keys(cluster.workers);
    if (worker.isDead() && workers.length <= numCPUs) {
      setTimeout(() => {
        forkNewWorker();
      }, 1000);
    }
  });

  // 零停机重启
  // ps 找出 master进程号PID
  // 发送信号 kill -SIGUSR2 <PID>
  // 还可以使用 PM2 https://github.com/unitech/pm2
  process.on('SIGUSR2', () => {
    const workers = Object.keys(cluster.workers);
    function restartWorker(i: number) {
      if ( i >= workers.length ) {
        return;
      }

      const worker = cluster.workers[workers[i]];
      console.log(`Stoping worker: ${worker?.process.pid}`);
      worker?.disconnect();

      worker?.on('exit', () => {
        if (worker.isDead()) {
          const newWorker = forkNewWorker();
          newWorker.on('listening', () => {
            restartWorker(i + 1);
          });
        }
      });
    }

    restartWorker(0);
  });

} else {
  // Workers can share any TCP connection
  // In this case it is an HTTP server
  startHttpServer();
}

function forkNewWorker(): cluster.Worker {
  const worker = cluster.fork();
  // 发送心跳包，防假死
  let miss = 0
  const interval = setInterval(() => {
    worker.send?.(heartbeatReq);
    miss++;

    // 错过3次心跳检测，判为假死状态，杀掉进程。
    if (miss >= 3) {
      clearInterval(interval);
      console.log(`Miss ${miss} heartbeat!`);
      process.kill(worker.process.pid, 1);
    }

  }, 5000);

  worker.on('message', (msg) => {
    if ( Safe.stringEqual(msg, heartbeatRes) ) {
      // console.log(msg, worker.process.pid);
      miss--;
    }
  });

  return worker;
}
