//  stream.js
//
//
//  Created by JohnnyB0Y on 2021/03/27.
//  Copyright © 2021 JohnnyB0Y. All rights reserved.
//
//  摘抄自 JavaScript 权威指南，备忘

const fs = require('fs')
const zlib = require('zlib')
const crypto = require('crypto')
const stream = require('stream')

{
  /**
   * Node 支持 4种基本的流
   * 
   * 可读流 readable
   * - 可读流是数据源。比如，fs.createReadStream() 就返回一个指定的文件的流，可以通过它读取文件的内容。
   * - process.stdin 也是一个可读流，可以从标准输入返回数据。
   * 
   * 可写流 writable
   * - 可写流是数据的接收地或目的地。比如，fs.createWriteStream() 返回的值是可写流，允许分块写入数据，并将所有数据输出到指定文件。
   * 
   * 双工流 duplex
   * - 双工流把可读流和可写流组合为一个对象。比如，net.connect() 和其他 Node 网络API 返回的 Socket对象就是双工流。
   * - 如果写入套接口，你的数据就会通过网络发送到套接口连接的计算机上。
   * - 如果你读取套接口，则可以访问由其他计算机写入的数据。
   * 
   * 转换流 transform
   * - 转换流也是可读可写的，但与双工流有一个重要区别：写入转换流的数据在同一个流会变成可读的（通常是某种转换后的形式）
   * - 比如，zlib.createGzip() 函数返回一个转换流，可以（使用gzip 算法）对写入其中的数据进行压缩。
   * - 类似地，crypto.createCipheriv() 函数也返回一个转换流，可以对写入其中的数据进行加密或解密。
   * 
   * 背压 backpressure
   * - 背压是一种消息，表示你想流中写入的数据的速度超过它的处理能力。
   * - 对这种背压的正确处理方式是，停止调用 write(), 直到流发出 ‘drain‘（耗尽）事件，表明缓冲区又有空间了。
   * - 使用 pipe() 时，Node 会自动为你处理背压问题。
   * 
   */

  // 管道

  // 从文件输入流读取数据，再将数据写入网络套接字
  function pipeFileToSocket(filename, socket) {
    fs.createReadStream(filename).pipe(socket);
  }

  // 通过管道，把一个流导向另一个流，并在完成或错误时调用一个回调
  function pipe(readable, writable, callback) {
    function handleError(err) {
      readable.close();
      writable.close();
      callback(err);
    }

    readable
      .on('error', handleError)
      .pipe(writable)
      .on('error', handleError)
      .on('finish', callback);
  }

  // 文件压缩
  function gzip(filename, callback) {
    // 创建流
    const source = fs.createReadStream(filename);
    const destination = fs.createWriteStream(filename + '.gz');
    const gzipper = zlib.createGzip();

    // 设置管道
    source
      .on('error', callback)
      .pipe(gzipper)
      .pipe(destination)
      .on('error', callback)
      .on('finish', callback);
  }

}

{
  // 自定义转换流

  class GrepStream extends stream.Transform {
    constructor(pattern) {
      super({decodeStrings: false}); // 不把字符串转换回缓冲区
      this.pattern = pattern; // 要匹配的正则表达式
      this.incompleteLine = ''; // 最后一个数据块的剩余数据
    }

    // 在一个字符串准备好可以转换时会调用这个方法
    _transform(chunk, encoding, callback) {
      if ( typeof chunk !== 'string' ) {
        callback( new Error('Expected a string but got a buffer'));
      }

      // 字符串切分成数组
      const lines = (this.incompleteLine + chunk).split('\n');

      // 数组最后一个元素是新的不完整行
      this.incompleteLine = lines.pop();

      // 查找所以匹配的行
      const output = lines.filter(l => {
        return this.pattern.test(l);
      }).join('\n');

      // 如果匹配成功，最后添加一个换行符
      if (output) {
        output += '\n';
      }

      // 始终调用回调，即便没有输出
      callback(null, output);
    }

    // 这里，会在流关闭前被调用
    _flush(callback) {
      // 如果还有不完整的行而且匹配，则把它传出去
      if ( this.pattern.test(this.incompleteLine)) {
        callback(null, this.incompleteLine + '\n');
      }
    }
  }

  // grep 程序
  const pattern = new RegExp(process.argv[2]);  // 从命令行取得正则表达式
  const grepStream = new GrepStream(pattern);   // 初始化 grep流

  process.stdin                                 // 以标准输入作为七点
    .setEncoding('utf8')                        // 将内容作为 Unicode字符串读取
    .pipe(grepStream)                           // 通过管道把它传给我们的 GrepStream
    .pipe(process.stdout)                       // 再用管道把结果传给标准输出
    .on('error', () => process.exit());         // 如果标准输出关闭，则退出
}

{
  // 对流进行 异步迭代 Node 12 支持
  async function grep(source, destination, pattern, encoding='utf8') {
    // 设置来源流以读取字符串，而非缓冲区
    source.setEncoding(encoding);

    // 在目标流上设置错误处理程序，以防标准输出意外关闭（比如，通过管道输出到 ‘head’ 等）
    destination.on('error', err => process.exit());

    // 我们读取的块不太可能以换行符结尾，因此，每个块都可能包含不完整的行。在这里记录📝
    const incompleteLine = '';

    for await (const chunk of source) {
      const lines = (incompleteLine + chunk).split('\n');
      incompleteLine = lines.pop();
      for (const line of lines) {
        if ( pattern.test(line) ) {
          destination.write(line + '\n', encoding);
        }
      }
    }

    // 最后检测末尾的文本
    if (pattern.test(incompleteLine)) {
      destination.write(incompleteLine + '\n', encoding);
    }
  }

  // 使用
  const pattern = new RegExp(process.argv[2]); // 从命令行取得正则表达式
  grep(process.stdin, process.stdout, pattern);
}

{
  // 使用期约解决背压
  // 如果不解决背压问题，缓冲区数据会越积越多，造成内存泄漏！！！！

  function write(stream, chunk) {
    // 将指定的块写入指定的流
    const hasMoreRoom = stream.write(chunk);

    if (hasMoreRoom) {
      // 如果缓冲区未满，返回一个解决的期约对象
      return Promise.resolve(null); 
    }
    else {
      // 否则，返回一个在‘耗尽’ 事件发生时解决的期约
      return new Promise(resolve => {
        stream.once('drain', resolve);
      });
    }
  }

  async function copy(source, destination) {
    // 在目标流上设置错误处理程序
    destination.on('error', err => process.exit());

    for await (const chunk of source) {
      // 写入块，并等待缓冲区有空间再继续
      await write(destination, chunk);
    }
  }
}

{
  // 流动模式

  function copyFile(sourceFilename, destinationFilename, callback) {
    const input = fs.createReadStream(sourceFilename);
    const output = fs.createWriteStream(destinationFilename);

    input.on('data', chunk => {
      if ( output.write(chunk) ) { // 写入并检测是否缓冲区溢出？
        input.pause(); // 缓冲区溢出就先暂停写入数据
      }
    })

    input.on('end', () => {
      output.end(); // 在到达输入末尾时，告知输出流结束
    })

    input.on('error', err => {
      // 如果输入流报错，以该错误调用回调，然后退出
      callback(err);
      process.exit();
    })

    output.on('drain', () => {
      // 如果输出流有空间，就恢复输入流的 ‘data’事件
      input.resume();
    })

    output.on('error', err => {
      // 如果输出流报错，以该错误调用回调，然后退出
      callback(err);
      process.exit();
    })

    output.on('finish', () => {
      // 完成
      callback(null);
    })
  }
  
  // 使用
  const [from, to] = process.argv.slice(2, 4);
  copyFile(from, to, err => {
    if (err) {
      console.log(err);
    }
    else {
      console.log('Done!')
    }
  })
  
}

{
  // 暂停模式（拉取模式）

  // 计算指定名字的文件内容的 sha256 散列值，并将散列值以字符串形式，传给指定的错误在先的回调函数
  function sha256(filename, callback) {
    const input = fs.createReadStream(filename);
    const hasher = crypto.createHash('sha256');

    input.on('readable', () => {      // 在可以读取数据时，
      let chunk;
      while( chunk = input.read() ) { // 读取一块，如果不返回 null
        hasher.update(chunk);         // 把它传被hasher，
      }                               // 继续循环，直到没有数据为止
    })

    input.on('end', () => {
      callback(
        null,                // 到达流的末尾，且无错误
        hasher.digest('hex') // 计算散列值
      );
    })

    input.on('error', callback); // 出错了，调用回调函数 -_-||
  }

  // 使用
  sha256(process.argv[2], (err, hash) => {
    if ( err ) {
      console.log(err.toString());
    }
    else {
      console.log(hash);
    }
  })

}
