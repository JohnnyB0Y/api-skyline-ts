//  tools.js
//
//
//  Created by JohnnyB0Y on 2021/03/27.
//  Copyright © 2021 JohnnyB0Y. All rights reserved.

// - 私有方法
function printTrue(condition, mseeage) {
  if (condition) {
    console.log(mseeage + ' ✅');
  }
  else {
    console.log(mseeage + ' ❌');
  }
}

function printDivider() {
  console.log('-----------------------------------------------------')
  console.log('')
}

exports.printer = new function() {
  this.true = printTrue
  this.divider = printDivider
}
