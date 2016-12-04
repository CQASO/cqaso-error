# CQASO前端错误捕获工具

## 目的

- 前端报错后，收集错误到开发前端监控平台


## 功能

- 记录错误的摘要、调用栈及其他上下文
- 记录前端catch捕获到的错误，主动上报
- 记录前端未捕获的错误 `window.onerror()`

## 使用

工具使用umd模块格式，可在`amd`, `commonjs`模块环境下使用

> CqError.error()

记录前端catch捕获到的错误

> CqError.watch(callback)

捕获异常后，自动触发回调

> CqError.catchGlobal()

捕获全局错误

注意：`catchGlobal` 的方案会采集到全面的浏览器报错，但是太全了，出了`script error` 问题，还会采集到。谨慎使用
