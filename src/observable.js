/**
 * Copyright (c) 2016-present, rainie, Inc.
 * All rights reserved.
 *
 */


let run_current_cb;

/* ------------------------------------
 * Observable
 * ------------------------------------ */

class Observable {
    constructor(object) {
        this.object = object;
        this.watcher = {};
        Object.keys(object).forEach(key => this.convert(key, object[key]));
        return this.object;
    }

    convert(key, value) {
        this.defineReactive(this.object, key, value);
    }

    defineReactive(obj, key, val) {
        let childOb = observable(val);

        Object.defineProperty(obj, key, {
            enumerable: true,
            configurable: true,
            get: () => {
                if (!Array.isArray(this.watcher.key)) {
                    this.watcher[key] = [];
                }

                if (run_current_cb) {
                    this.watcher[key].push(run_current_cb);
                }

                return val;
            },
            set: newVal => {
                if (newVal === val) {
                  return;
                }

                // 修改原先的值
                val = newVal;
                //如果新赋值的值是个复杂类型。再递归它，加上set/get。。
                childOb = observable(newVal);

                if (this.watcher[key]) {
                    this.watcher[key].forEach(func => func());
                }
            }
        });
    }
}

export function observable(value) {
    if (!value || typeof value !== 'object') {
        return value;
    }
    return new Observable(value);
}

export function autorun(callback) {
    run_current_cb = callback;
    callback();
    run_current_cb = null;
}
