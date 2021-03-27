//  file_path.js
//
//
//  Created by JohnnyB0Y on 2021/03/27.
//  Copyright © 2021 JohnnyB0Y. All rights reserved.

const os = require('os');
const path = require('path')
const fs = require('fs')
const printer = require('./tools').printer;

/**
 * 文件模式字符串 -----------------------
 * - 指定写文件时，如何使用文件描述符。
 * 
 * 'w' 
 * - 为写入打开
 * 
 * 'w+'
 * - 为写入和读取打开
 * 
 * 'wx'
 * - 为创建新文件打开。如果指定的文件存在则失败。
 * 
 * 'wx+'
 * - 为创建文件打开，也允许读取。如果指定的文件存在则失败。
 * 
 * 'a'
 * - 为追加数据打开。援用内容不会被重写。
 * 
 * 'a+'
 * - 为追加数据打开，但也允许读取。
 * 
 * 'r'
 * - 默认状态，只读
 * 
 * 
 * 举例：
 * // 通过一次调用写入文件，但在原有内容基础上追加（ 这就像 fs.appendFileSync() ）
 * fs.writeFileSync('messages.log', 'hello', { flag: 'a'});
 * 
 * // 打开一个写入流，如果文件存在则抛出错误 ❌ 我们不想意外重写任何文件
 * // 注意：上面的选项 是 ‘flag’，这里是 ‘flags’
 * fs.createWriteStream('messages.log', {flags: 'wx'});
 * 
 */


{
  // 重要路径
  process.cwd() // 当前工作目录的绝对路径
  __filename // 保存当前代码的文件的绝对路径
  __dirname // 保存 __filename 的目录的绝对路径
  os.homedir() // 用户主目录

  // path 模块提供了简单
  const filePath = 'src/pkg/test.js';

  printer.all([
    path.basename(filePath),
    path.extname(filePath),
    path.dirname(filePath),
    path.basename(path.dirname(filePath)),
    path.dirname(path.dirname(filePath)),
  ]);

  printer.divider();

  // normalize() 清理路径
  printer.all([
    path.normalize('a/b/c/../d/'),
    path.normalize('a/./b'),
    path.normalize('//a//b//'),
  ]);

  printer.divider();
  // join 组合路径片段、添加分隔符，然后规范化
  printer.all([path.join('src', 'pkg', 't.js')]);

  printer.divider();

  // resolve() 接收一个或多个路径片段，返回一个绝对路径
  // 从最后一个参数开始，反向处理，直到构建起绝对路径或者相对于 process.cwd() 解析得到绝对路径
  printer.all([
    path.resolve(),
    path.resolve('tt.js'),
    path.resolve('/tmp', 'tt.js'),
    path.resolve('/a', '/b', 'tt.js'),
  ]);

}

{
  // 文件描述符，是操作系统级的整数引用，可以用来打开、关闭文件。
  const buffer = fs.readFileSync('test.data'); // 同步，返回缓冲区
  const text = fs.readFileSync('data.csv', 'utf8'); // 同步，返回字符串

  // 异步读取文件的字节
  fs.readFile('test.data', (err, buffer) => {
    if (err) {
      ;
    }
  });

  // 基于期约的异步读取
  fs.promises.readFile('data.csv', 'utf8').then(data => {
    console.log(data);
  }).catch(err => {
    console.log(err);
  });

  // async await 异步读取
  async function processText(filename, encoding='utf8') {
    const text = await fs.promises.readFile(filename, encoding);
    console.log(text);
  }

  // 控制要读取文件的哪些字节
  fs.open('data', (err, fd) => {
    if (err) {
      return;
    }

    try {
      // 把字节 20 到 420 读到新分配的缓冲区
      fs.read(fd, Buffer.alloc(400), 0, 400, 20, (err, n, b) => {
        // err 错误；n 是实际读取的字节数；b 是读入字节的缓冲区
        console.log(err, n, b);
      });
    }
    finally {
      fs.close(fd);
    }
  });

  // 从文件中，读取多个数据块
  function readData(filename) {
    const fd = fs.openSync(filename);
    try {
      // 读取文件的头部
      const header = Buffer.alloc(12); // 12 字节缓冲区
      fs.readSync(fd, header, 0, 12, 0);

      // 验证文件的魔法数值
      const magic = header.readInt32LE(0);
      if (magic !== 0xDADAFEED) {
        throw new Error('File is of wrong type.');
      }

      // 现在从头部取得数据的偏移和长度
      const offset = header.readInt32LE(4);
      const length = header.readInt32LE(8);

      // 并从文件中读取相应长度的字节
      const data = Buffer.alloc(length);
      fs.readSync(fd, data, 0, length, offset);
      return data;
    }
    finally {
      fs.closeSync(fd);
    }
  }

}

{
  // 文件操作

  // 参数可以是，字符串、URL 或 Buffer对象
  // 同步复制文件
  fs.copyFileSync('ch15.txt', 'ch15.bak');

  // COPYFILE_EXCL 参数表示 只在 新文件 不存在 时复制
  // 这个参数可以防止赋值操作重写已有文件
  fs.copyFile('ch15.txt', 'ch16.txt', fs.constants.COPYFILE_EXCL, err => {
    console.log(err);
  });

  // 期约版本
  // COPYFILE_EXCL | COPYFILE_FICLONE 表示已有文件不会被重写，而且如果文件系统支持，副本将是原始文件的一个‘写时复制’的副本，
  // 这意味着如果原始内容或副本未被修改，则不需要占用额外的存储空间。
  fs.promises.copyFile(
    'Important data', 
    `Important data ${new Date().toString()}`, 
    fs.constants.COPYFILE_EXCL | fs.constants.COPYFILE_FICLONE)
    .then(() => {
      console.log('Backup complete');
    })
    .catch(err => {
      console.log('Backup failed', err);
    });

    /**
     * 文件移动或重命名
     * fs.rename()
     * 
     * 
     * fs.link()、fs.symlink() 行为类似于 fs.copyFile()
     * 只是它们将分别创建硬链接和符号链接，而非创建一个副本。
     * 
     * 
     * fs.unlink()、fs.unlinkSync()、fs.promises.unlink()
     * 是 Node 用来删除文件的函数（继承自 Unix）
     * 
     */
}

{
  // 文件元数据
  const stats = fs.statSync('book/ch15.md');
  stats.isFile()          // 是否是普通文件
  stats.isDirectory()     // 是否是一个目录
  stats.size              // 文件大小（字节）
  stats.atime             // 访问时间：最后读取的日期 
  stats.mtime             // 修改时间：最后写入的日期
  stats.uid               // 文件所有者的用户 ID
  stats.gid               // 文件所有者的组 ID
  stats.mode.toString(8)  // 八进制字符串形式的文件权限

  // 用于设置 文件或目录的权限
  const filePath = 'ch15.md';
  fs.chmod(filePath, 0o400, err => {
    console.log(err);
  });
  fs.lchmod(filePath, 0o400);
  fs.fchmod(filePath, 0o400);
  fs.chmodSync(filePath, 0o400);

  // 操作目录 -------------------------
  // 创建目录
  fs.mkdir()
  fs.mkdirSync()

  // 删除目录
  fs.rmdir()
  fs.rmdirSync()

  // 获取目录 --------------------------

  // 同步获取目录下，所有子目录，返回字符串数组
  const tempFields = fs.readdirSync('/tmp');

  // 流的方式，获取目录
  async function listDirectory(dirpath) {
    const dir = await fs.promises.opendir(dirpath);
    for await (const entry of dir) {
      const name = entry.name;
      if (entry.isDirectory()) {
        name += '/'; // 在子目录末尾添加一个斜杠
      }
      const stats = await fs.promises.stat(path.join(dirpath, name));
      const size = stats.size;
      console.log(String(size).padStart(10), name);
    }
  }
}
