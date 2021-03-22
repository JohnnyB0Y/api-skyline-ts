# api-skyline-ts
###### 基于 TypeScript 和 Node.js 的 API 开发的脚手架。

## API操作资源的有限步骤
#### ① HTTP 方法：GET, POST, PUT, DELETE, PATCH, HEAD, OPTIONS
- ###### GET、PUT、DELETE、HEAD 是幂等的，指服务器要确保同样的请求，执行一次或多次的效果是一样的。
- ###### POST、PATCH 是非幂等的，指服务器不需要确保同样的请求，执行一次或多次的效果是一样的。
- ###### 其中 POST 是新增资源；PATCH 是更新资源的部分内容；PUT 是更新整个资源(用在音视频等资源比较合适）。

```JS
GET 	/device-management/devices      : Get all devices
GET 	/device-management/devices/{id} : Get the device information identified by "id"

POST 	/device-management/devices      : Create a new device
DELETE	/device-management/devices/{id} : Delete device by "id"

PUT 	/device-management/devices/{id} : Update the device identified by "id"
PATCH 	/device-management/devices/{id} : Update the device information identified by "id"
```


#### ② HTTP 头部信息（可自定义）

#### ③ HTTP 响应状态码（可自定义）

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
// 客户端需要一个抽象层去处理这些结构统一的数据。
```

#### ⑤ 一套标准的缓存机制

#### ⑥ 一套标准的客户端身份认证机制
###### 安全性原则
- 有调用者身份🆔
- 请求具有唯一性
- 请求参数不能被篡改
- 请求有效时间

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