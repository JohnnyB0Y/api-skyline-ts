#### 进程、CPU 和操作系统细节
###### 摘抄自《JavaScript 权威指南》
```JS
const os = require('os');

process.argv                    // 包含命令行参数的数组
rocess.arch                     // CPU架构:如x64
process.cwd()                   // 返回当前工作目录
process.chdir()                 // 设置当前工作目录
process. cpuUsage()             // 报告CPU使用情况
process.env                     //环境变量对象
process.execPath                // Node可执行文件的绝对路径
process.exit()                  // 终止当前程序
process.exitCode;               // 程序退出时报告的整数编码
process.getuid()                // 返回当前用户的Unix用户ID
process. hrtime. bigint()       // 返回“高分辨率”纳秒级时间戮
process.kill()                  // 向另一个进程发送信号
process.memoryUsage()           // 返回一个包含内存占用细节的对象
process.nextTick()              // 类似于setImmediate() 立刻调用一个函数
process.pid                     // 当前进程的进程ID
process.ppid                    // 父进程ID
process.platform                // 操作系统:如 Linux、 Darwin或Win32
process. resourceUsage()        // 返回包含资源占用细节的对象
process.setuid()                // 通过ID或名字设置当前用户
process.title                   // 出现在ps列表中的进程名
process.umask()                 // 设置或返回新文件的默认权限
process.uptime()                // 返回Node正常运行的时间（秒）
process.verston                 // Node的版本字符串
process.versions                // node依赖库的版本字符串

os.arch()                       // 返回CPU架构:如x64或arm
os.constants                    // 有用的常量，如os. constants. signals. SIGINT
os.cpus()                       // 关于系统CPU核心的数据，包括使用时间
os.endianness()                 // CPU的原生字节序:BE或LE
os.EOL                          // 操作系统原生的行终止符:＼n或r＼n
os. freemem()                   // 返回自由RAM数量（字节）
os.getPriority()                // 返回操作系统调度进程的优先级
os.homedir()                    // 返回当前用户的主目录
os.hostname()                   // 返回计算机的主机名
os.loadavg()                    // 返回1、5和15分钟的平均负载
os.networkInterfaces()          // 返回可用网络连接的细节
os.platform()                   // 返回操作系统:例如Linux、 Darwin或Win32
os.release()                    // 返回操作系统的版本号
os.setPriority()                // 尝试设置进程的调度优先级
os.tmpdir()                     // 返回默认的临时目录
os.totalmem()                   // 返回RAM的总数（字节）
os.type()                       // 返回操作系统: Linux、 Darwin或 Windows＿NT等
os.uptime()                     // 返回系统正常运行的时间（秒）
os.userInfo()                   // 返回当前用户的uid、 username、home和 shell程序

```
