# CQASO前端错误捕获工具

## 目的

- 前端报错后，收集错误到开发前端监控平台


## 功能

- 记录错误的摘要、调用栈及其他上下文
- 记录前端catch捕获到的错误
- 记录前端未捕获的错误 `window.onerror()`

## 使用

工具使用umd模块格式，可在`amd`, `commonjs`模块环境下使用

> CqError.error()

记录前端catch捕获到的错误

> CqError.watch(callback)

捕获异常后，自动触发回调
