### JavaScript 代码是如何执行的？
###### 准备阶段
```JS
- 准备阶段，可以理解为JS引擎启动，并初始化好解析JavaScript代码的运行环境。
  - 初始化管理执行上下文的栈（JS调用栈）。
  - ...
```

###### 编译阶段
```JS
- 什么代码会被 Js引擎编译？
  - 当执行全局代码时，会编译并创建全局执行上下文；
  - 当调用函数时，函数体内的代码会被编译，并创建函数执行上下文；
  - 当使用 eval 函数时，会把JS字符串编译并创建执行上下文；

- 创建执行上下文
  - 如果当前的执行上下文是全局执行上下文，那么 它的 'outer' 属性指向 NULL；
  - 如果是函数执行上下文，那么 它的 'outer' 属性指向函数定义时的环境；换句话说，当它被存入堆中的时候就指定了。

- 进行变量提升
  - 对于 var声明的变量 和 函数声明，存入 变量环境对象中；
  - 对 let const声明的变量，包裹并存入 词法环境对象中；

- 代码编译成 JS字节码
```

###### 执行阶段
```JS
- 执行阶段，就是按顺序一行一行地执行，操作有：调用函数、执行赋值语句、创建执行上下文、入栈、出栈等；
  - 每调用一个函数，JS引擎会为其创建一个执行上下文，并把该执行上下文压入栈中，然后开始执行函数代码；
  - 如，函数A 调用了 函数B，JS引擎首先给 函数B 创建执行上下文，然后把该上下文压入调用栈的栈顶；

- 当函数执行完成后，JS引擎会将该函数的执行上下文从栈顶弹出；（不一定销毁，看情况，如，生成器函数）

- 执行函数时，先在当前执行上下文的变量环境对象查找该函数定义的引用，如果存在就执行该函数。
  - 如果不存在，就沿着 'outer' 指向的外部执行上下文的变量环境对象继续找。（最终找不到就报错）

- 执行语句包含变量时，就需要查找该变量，先在当前执行上下文的词法环境对象查找，从栈顶查到栈底；
  - 不存在就去变量环境对象查找；
  - 还不存在就沿着 'outer' 指向的外部执行上下文 按同样的次序查找。
```

###### 调试技巧
```JS
- console.trace() 可以打印出函数调用关系；
- chrome devTool，在 source标签页给代码打断点然后刷新页面，可以在右边看到调用堆栈信息；
- 浏览器环境 anonymous 是全局函数入口，NodeJS 会有不同。
- 浏览器等环境，可能有缓存，试验的时候最好新开一个页面调式。
```

###### 过程伪代码
```JS
who()
console.log(name)
var name = 'Kobe Bryant'
function who() {
  var name = 'JavaScript'
  console.log('Black Mamba')
  console.log(name)
}

// 变量提升过程 1️⃣
- JavaScript引擎 先创建执行上下文对象，里面大概包含变量环境对象、词法环境对象、可执行代码（优化后）；
- 对于变量声明，引擎会在变量环境对象（Variable Environment）中创建 'name' 属性，并使用 undefined 或其他值 对其初始化；
- 对于函数声明，引擎会把函数定义存储到堆（Heap）中，并在变量环境对象中创建一个 'who' 属性，并指向堆中的函数位置；
- 如果遇到同名的函数声明，JS引擎 会选择最后声明的那个覆盖前面的。
- 如果变量声明和函数声明同名，那么 JS引擎会忽略变量的声明，而采用函数的声明。

// ------------ 变量提升后的内存结构伪代码（可能是错的）

executionContext: {               // 当前执行上下文
  variableEnvironment: {          // 变量环境对象
    name: undefined,
    who: function() { 
      var name = 'JavaScript'
      console.log('Black Mamba')
      console.log(name)
    },
    outer: externalExecutionContext // 外部的执行上下文对象
  },
  lexicalEnvironment: [],         // 词法环境对象
  excutionCode: function() {      // 可执行代码
    who()
    console.log(name)
    name = 'Kobe Bryant'
  },
}

whoExcCtx {                       // who函数的执行上下文对象
  varEnv: {                       // 变量环境对象
    name: undefined,
    outer: executionContext       // 外部的执行上下文对象
  },
  lexEnv: [],                     // 词法环境对象
  excCode: function() {           // 可执行代码
    name = 'JavaScript'
    console.log('Black Mamba')
    console.log(name)
  },
}

// 执行代码过程 2️⃣
- JS引擎做完编译工作后（包括变量提升等内容），执行代码前，会先把当前执行上下文压入栈顶；

- 当执行 who() 语句时，先在当前执行上下文的变量环境对象查找该函数定义的引用，找到并执行 who函数；
- 此时，会走一遍 1️⃣  2️⃣ 的流程。创建 whoExeCtx对象，并设置 whoExeCtx.varEnv.name = undefined；
- 然后执行 name = 'JavaScript' 语句，相当于 whoExeCtx.varEnv.name = 'JavaScript'；
- 接着执行 console.log('Black Mamba') 语句，console.log 在Global变量环境对象中找到，输出 'Black Mamba'；
- 再接着执行 console.log(name) 语句，在 whoExeCtx.varEnv 中找到 'name'的值，输出 'JavaScript'；
- who函数执行完毕，返回执行权给上一级函数，引擎把whoExeCtx 从栈顶弹出；

- 调用完 who函数，回到当前上下文继续执行 console.log(name)语句，变量'name'在当前执行上下文变量环境对象中找到。
- 但变量'name'还没有执行我们指定的赋值语句，处于系统默认初始化的值，所以最终输出 'undefined或其他值'；
- 接着执行 name = 'Kobe Bryant' 语句，把当前执行上下文中的变量环境对象的 'name'属性的值修改为 'Kobe Bryant'；
- 当前上下文执行完毕，返回执行权给上一级函数，从调用栈弹出；

- !结束 - ✿✿ヽ(°▽°)ノ✿

- !补充 let const 的块级作用域
  - 以 let const 声明的变量，会被存到词法环境变量中；
  - 这里的词法环境对象是类似栈的数据结构；
  - 当前代码块的 let const声明的变量会被包裹起来并压到词法环境对象的栈底；（如果有的话，发生在执行语句之前）
  - 环境内嵌套的代码块，按照嵌套关系，在执行具体代码块的时候，才会创建包裹 let const声明的变量，并压入栈顶；
  - 执行代码块内的代码时，才对变量进行赋值初始化，执行完当前代码块，就把包裹对象从栈顶弹出。
  - !!!提示:
  - let const声明的变量有语法限制，同一个块级中，不能先使用后声明。（暂时性死区）

```


### NodeJS 进程、CPU 和操作系统细节
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
