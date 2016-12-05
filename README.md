# CQASO前端错误捕获工具

## 目的

- 前端报错后，收集错误到开发前端监控平台


## 功能

- 记录错误的摘要、调用栈及其他上下文
- 记录前端catch捕获到的错误，主动上报
- 记录前端未捕获的错误 `window.onerror()`

## 使用

工具使用umd模块格式，可在`amd`, `commonjs`模块环境下使用

初始化:

```javascript
window.CqError = [];
CqError.push(['_init', {
    callback: (err) => {
        console.log(err);
    },
}]);
```


记录前端catch捕获到的错误:

```javascript
CqError.push(['_trackCatched', error]);
// 或
CqError.push(['_trackCatched', error, arguments.callee]);
```


捕获全局错误:

```javascript
CqError.push(['_trackGolbal']);
```
## 提示
- `CqError.push(['_trackGolbal']);` 的方案会采集到全面的浏览器报错，但是太全了，这里过滤了`script error` 问题(跨域的js出错问题捕获不到，都是`script error`)
- 建议异步加载js，和谷歌统计的js api风格一样
