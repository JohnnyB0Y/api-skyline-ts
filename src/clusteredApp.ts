import cluster from 'cluster';
import os from 'os';
import { startHttpServer } from './index';
const numCPUs = os.cpus().length;

if (cluster.isMaster) {
  console.log(`Master ${process.pid} is running`);

  // Fork workers.
  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }

  // 进程保活
  cluster.on('exit', (worker, code, signal) => {
    console.log(`worker ${worker.process.pid} died`);
    if (worker.isDead()) {
      cluster.fork();
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
        if (!worker.isDead()) {
          return;
        }
        const newWorker = cluster.fork();
        newWorker.on('listening', () => {
          restartWorker(i + 1);
        });
      });
    }

    restartWorker(0);
  });

} else {
  // Workers can share any TCP connection
  // In this case it is an HTTP server
  startHttpServer();
}
