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
 *
 * 用法:
 *   window.CqError = [];
 *   CqError.push(['_init', {
 *      callback: (err) => {},
 *   }]);
 *   CqError.push(['_trackCatched', error]);
 *   CqError.push(['_trackGolbal']);
 *
 */

// 全局变量
const LOG = 'log';

// 用于缓存识别同一个异常。
const ERROR_CACHE = {};

// 错误栈深度
const MAX_STACKTRACE_DEEP = 20;

const Err = {
    datas: [],
    options: {
        callback: () => {}
    }
};

/**
   * 初始化配置
   * @param  {Function} callback 回调函数
   * @return {undefined}
   */
Err._init = function(options) {
    if (!_isObjByType(options)) {
        throw new Error('_init config should be object');
    }

    Object.assign(this.options, options);
}

/**
   * 监控接口
   * @param  {Object, String} detail  监控信息详情
   * @param  {String} type 监控类型
   * @return {Object}
   */
Err._log = function(detail, type) {
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
    Err.options.callback(data);
    return data;
};

/**
   * JavaScript 异常接口，用于监控 `try/catch` 中被捕获的异常。
   * @param  {Error} err JavaScript 异常对象
   * @return {Object}
   */
Err._trackCatched = function(err, fn) {
    if (!(err instanceof Error))
        return;

    return error(
        'catched',
        err.message || err.description,
        err.filename || err.fileName || err.sourceURL,
        err.lineno || err.lineNumber || err.line,
        err.colno || err.columnNumber,
        fn ? stacktrace(fn) : err.stack || err.stacktrace,
    );
};

Err._trackGolbal = function() {
    window.onerror = function(message, file, line, column) {
        // 过滤浏览器的跨域问题不能获得外链 javascript 的错误
        if (/Script error/i.test(message))
            return false;

        error('global', message, file, line, column);

        // 返回 `false` 则不捕获异常，浏览器控制台显示异常信息。
        return false;
    };
};

/* ------------------------------------
  * 主程序
  * ------------------------------------ */

(function () {
    if (!_isObjByType(CqError, 'Array')) {
        throw new Error('CqError is not Array.');
    }

    for (let i = 0; i < CqError.length; i++) {
        executeErr(CqError[i]);
    }

    // 重写CqError.push方法
    CqError.push = function (params) {
        Array.prototype.push.call(CqError, params);
        executeErr(params);
    };

    function executeErr(value) {
        if (_isObjByType(value, 'Array')) {

            // 如果传过来的是数组
            const [methodName, ...args] = value;
            if (Err[methodName]) {
                Err[methodName](...args);
            }
        } else if (_isObjByType(value, 'String')) {
            // 如果传过来的是字符串
            if (!Err[value]) {
                Err[value](...args);
            }
        }
    }
}());

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
    stack.push('at ' + function_name(call));
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
    const data = {
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

    return Err._log(data);
}

function _isObjByType(o, type) {
    return Object.prototype.toString.call(o) === '[object ' + (type || 'Object') + ']';
}
