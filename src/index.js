/**
 * Copyright (c) 2016-present, rainie, Inc.
 * All rights reserved.
 *
 * cqaso-error
 *
 * 功能：
 * 		- 收集cqaso前端未捕获的全局错误
 * 		- 业务逻辑中 catch 捕获住了抛出 JavaScript 异常
 *   	- 记录出错上下文的函数调用栈
 */

import {observable, autorun} from './observable.js';

// 全局变量
const LOG = 'log';
const Err = {
    datas: []
};

/* ------------------------------------
 * 主函数
 * ------------------------------------ */

 const observable_error = observable({data: null});

 /**
   * 监控接口
   * @param  {Object, String} detail  监控信息详情
   * @param  {String} type 监控类型
   * @return {Object}
   */
 Err.log = function(detail, type) {
     if (!detail)
         return;

     let data;
     if (Object.prototype.toString.call(detail) === '[object Object]') {
         data = detail;
         data.type = type || data.type || LOG;
     } else {
         data = {
             type: type || LOG,
             msg: detail
         };
     }

     Err.datas.push(data);
     observable_error.data = data;
     return data;
 };

 /**
   * JavaScript 异常接口，用于监控 `try/catch` 中被捕获的异常。
   * @param  {Error} err JavaScript 异常对象
   * @return {Object}
   */
 Err.error = function(err) {
     if (!(err instanceof Error))
         return;

     return error(
         'catched',
         err.message || err.description,
         err.filename || err.fileName || err.sourceURL,
         err.lineno || err.lineNumber || err.line,
         err.colno || err.columnNumber,
         err.number,
         err.stack || err.stacktrace
     );
 };

 /**
   * 注册错误发生后的回调函数
   * @param  {Function} callback 回调函数
   * @return {undefined}
   */
 Err.watch = function(callback) {
     let called = false;
     function cb() {
         const msg = observable_error.data;
         if (called) {
             callback(msg);
         } else {
             called = true;
         }
     }

     autorun(cb);
 }

 window.onerror = function(message, file, line, column) {
     error('global', message, file, line, column);
     // 返回 `false` 则不捕获异常，浏览器控制台显示异常信息。
     return false;
 };

export default Err;

/* ------------------------------------
 * 私有函数
 * ------------------------------------ */

/**
 * 获取函数名
 * @param  {Function} fn 函数对象
 * @return {String}      函数名
 */
function function_name(fn) {
    const func_name_regs = /^\s*function\b[^\)]+\)/;
    if (fn.name)
        return fn.name;

    const match = String(fn).match(func_name_regs);
    return match
        ? match[0]
        : 'anonymous';
}

const MAX_STACKTRACE_DEEP = 20;

/**
 * 函数调用堆栈
 * @param  {fn} fn function's caller
 * @return {String}      stack trace
 */

function stacktrace(fn) {
    const stack = [];
    let deep = 0;
    let call = fn;
    let caller = call.caller;
    while (caller) {
        try {
            call = call.caller;
            caller = call.caller;
            stack.push('at ' + function_name(call));

            // c.caller 有可能等于call
            if (call.caller === call) {
                break;
            }

            if ((deep++) > MAX_STACKTRACE_DEEP) {
                break;
            }
        } catch (err) {
            break;
        }
    }

    return stack.join('\n');
}

// 用于缓存识别同一个异常。
const ERROR_CACHE = {};

/**
 * JavaScript 异常统一处理函数
 * @param  {String} catchType 捕获异常的类型。
 * @param  {String} message   异常消息
 * @param  {String} file      所在文件
 * @param  {Number} line      所在行
 * @param  {Number} column    所在列
 * @param  {Object} stack     堆栈
 * @return {Object}
 */
function error(catchType, message, file, line, column, stack) {
    if (!stack && arguments.callee.caller) {
        stack = stacktrace(arguments.callee.caller);
    }

    const data = {
        profile: LOG,
        type: catchType,
        msg: message || '',
        file: file || '',
        line: line || 0,
        col: column || 0,
        stack: stack || ''
    };

    const key = file + ':' + line + ':' + message;
    if (!ERROR_CACHE.hasOwnProperty(key)) {
        ERROR_CACHE[key] = true;
    }

    return Err.log(data);
}
