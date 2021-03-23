# api-skyline-ts
###### 基于 TypeScript 和 Node.js 的 API 开发的脚手架。

## API操作资源的有限步骤
#### ① HTTP 方法：GET, POST, PUT, DELETE, PATCH, HEAD, OPTIONS
- ###### GET、PUT、DELETE、HEAD 是幂等的，服务器要确保同样的请求，执行一次或多次的效果是一样的。
- ###### POST、PATCH 是非幂等的，服务器不需要确保同样的请求，执行一次或多次的效果一样。
- ###### 其中 POST 是新增资源；PATCH 是更新资源的部分内容；PUT 是更新整个资源(用在音视频等资源比较合适）。

```JS
GET 	/device-management/devices      : Get all devices
GET 	/device-management/devices/{id} : Get the device information identified by "id"

POST 	/device-management/devices      : Create a new device
DELETE	/device-management/devices/{id} : Delete device by "id"

PUT 	/device-management/devices/{id} : Update the device identified by "id"
PATCH 	/device-management/devices/{id} : Update the device information identified by "id"
```


#### ② HTTP 头部信息
```JS
【Accept         】用户代理期望的 MIME类型列表；
【Accept-Encoding】用户代理支持的压缩算法；
【Authorization  】用户身份校验的凭证信息；

【Content-Length 】数据体大小；
【Content-Type   】数据体的 MIME类型；

【Cookie         】存储在客户端的状态信息；
【Etag           】服务端返回的数据散列值；
【If-None-Match  】客户端提供给服务端校验的数据散列值，判断客户端的数据缓存是否仍然有效；
```
[更多信息](https://en.wikipedia.org/wiki/List_of_HTTP_header_fields)

#### ③ HTTP 响应状态码

```JavaScript
200【OK】请求成功完成。

201【Created】新建资源成功。例如，POST 新建资源成功返回。

202【Accepted】已接受请求进行处理，但处理尚未完成。

204【No Content】表示服务器已经成功地满足了请求，响应有效负载体中没有要发送的内容。

304【Not Modified】没有最新内容，客户端仍然可以使用本地缓存。

400【Bad Request】请求无效。

401【Unauthorized】请求不包含身份验证令牌或身份验证令牌已过期。

403【Forbidden】客户端没有访问所请求资源的权限。例如，超级管理员、VIP用户、普通用户等。

404【Not Found】未找到请求的资源。例如，文章被删除了，查找的时候返回未找到文章资源。

405【Method Not Allowed】该资源不支持请求中的HTTP方法。例如，DELETE方法不能与代理API一起使用。

409【Conflict】由于冲突，请求无法完成。例如防抖节流，重复发送验证码被拒绝、重复提交相同内容。

500【Internal Server Error】由于服务器端的内部错误，请求未完成。

503【Service Unavailable】服务器不可用。
```

#### ④ 一套标准的内容协商机制
###### 返回的JSON 数据格式
```JS
const result = {
  code: 0, // 业务细节处理结果的 code。
  msg: 'ok', // 对 code 的描述或解释。
  data: data, // 如果请求的是多个资源，data为数组；如果是单个资源，data为字典。
}
// 补充
- HTTP 状态码主要针对的是API操作结果，可以让客户端进行响应操作；
- 如，Token过期，可以跳转到登录页面，权限不够可以让用户去升级VIP 等；
- JSON 里的 code 针对的是具体业务的操作结果，一般弹个消息提示；
- 可以用 0 表示成功的操作，其他错误按业务分类，A业务 10000，B业务 20000 等；
- 如，下单成功 0，下单失败 10000，库存不足 10001，活动结束 10002 等；

```
- [客户端需要一个抽象层去处理这些结构统一的数据。](https://github.com/JohnnyB0Y/api_skyline/blob/main/demo/lib/network_request/demo_service.dart)

#### ⑤ 一套标准的缓存机制
###### 状态缓存 - 会话
```JS
// 常用库
const session = require('koa-generic-session');
// 提示
- 需要和数据库一起使用，例如，Redis、MongoDB 等；
- Session 和 Token 很像，但 Token 不需要存储而需要实时解密。session 更像是用空间换时间；
- Cookie 存放在客户端，session 存放在服务端。
```

###### 数据缓存 - ETag
```JS
// 常用库
const conditional = require('koa-conditional-get');
const etag = require('koa-etag');
// 补充
- conditional 和 etag 一起使用；
// 流程
- 客户端向服务器请求资源，请求头带上If-None-Match: "6d82cb..."(如果有的话)；
- 服务端取出If-None-Match 进行比较；
- 无修改返回 304状态码，带上ETag: "6d82cb..."，无数据体；
- 有修改返回 200状态码，更新ETag: "89dls2..."，完整的数据体；
- 客户端收到 304状态码，使用缓存数据；
- 客户端收到 200状态码，解析使用新数据；并更新缓存信息；
```

#### ⑥ 一套标准的客户端身份认证机制
###### 安全性原则
- 有调用者身份🆔
- 请求具有唯一性
- 请求参数不能被篡改
- 请求有效时间

###### 用户身份验证
- JWT
```JS
// 常用的库
const jwt = require('jsonwebtoken');
const jwt = require('koa-jwt');
// 流程
- 客户端向服务端申请令牌；
- 服务端把用户的必要信息、秘钥、时间等，通过 jwt 进行签名，并将签名结果返回客户端；
- 客户端发起API时，携带令牌；
- 服务端通过 jwt 验证令牌通过后，返回数据。
```

- OAuth
```JS
// 常用的库
const oauth = require('oauth2-server')
// 流程
- 客户端向用户提出授权请求；
- 用户同意客户端的授权请求；
- 客户端使用用户的授权，向认证服务器申请令牌；
- 认证服务器对客户端进行认证，如无意外，同意发放令牌；
- 客户端使用令牌向资源服务器请求资源；
- 资源服务器验证令牌合法，同意向客户端开放资源。
```

###### API 访问权限
- Scope
```JS
// 补充
- 访问级别可能有：游客、普通用户、管理员、超级管理员等；
- 用户表有一个 auth 字段，表明用户账号级别；
- 每个API 针对不同的 auth 级别，进行访问控制；
- 可以用数据库记录、用一个Scope类集中处理 或 离散到每个 API控制器中。
```

###### API 访问频率
- Redis
```JS
// 常用库
const ratelimit = require('koa-ratelimit');
const redis = require('redis');
// 补充
- 防止用户登录的频率，账号安全问题；
- 手机验证码发送频率，降低成本问题；
```

## 参考资料
##### 项目配置
[Node.js and TypeScript Tutorial: Build a CRUD API](https://auth0.com/blog/node-js-and-typescript-tutorial-build-a-crud-api/)

[TypeScript-Node-Starter](https://github.com/microsoft/TypeScript-Node-Starter)

##### 数据库
[Node-orm2: Object Relational Mapping](https://github.com/dresende/node-orm2)

##### 缓存
[Caching with Entity Tags](https://www.w3.org/2005/MWI/BPWG/techs/CachingWithETag.html)

[If-None-Match](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/If-None-Match#browser_compatibility)

##### HTTP
[HTTP 响应代码](https://developer.mozilla.org/zh-CN/docs/Web/HTTP/Status)

[HTTP Status](https://restfulapi.net/tutorial/http-status/)

##### 文档
[Node.js v15.12.0 Documentation](https://nodejs.org/api/errors.html)