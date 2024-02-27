// 先定义三个常量表示状态
const PENDING = "pending";
const FULFILLED = "fulfilled";
const REJECTED = "rejected";
class MyPromise {
    // 传入一个函数里面含有两个参数resolve和reject
    constructor(executor) {
        // ==== 新增 ====
        // executor 是一个执行器，进入会立即执行
        // 并传入resolve和reject方法
        try {
            executor(this.resolve, this.reject);
        } catch (error) {
            // 如果有错误，就直接执行 reject
            this.reject(error);
        }
    }

    status = PENDING;

    // 成功之后的值
    value = null;
    // 失败之后的原因
    reason = null;

    // 存储成功回调函数
    // onFulfilledCallback = null;
    onFulfilledCallbacks = [];
    // 存储失败回调函数
    // onRejectedCallback = null;
    onRejectedCallbacks = [];

    // resolve和reject在调用的时候执行
    // 更改成功后的状态
    resolve = (value) => {
        // 只有状态是等待，才执行状态修改
        if (this.status === PENDING) {
            // 状态修改为成功
            this.status = FULFILLED;
            // 保存成功之后的值
            this.value = value;
            // ==== 新增 ====
            // 判断成功回调是否存在，如果存在就调用
            while (this.onFulfilledCallbacks.length) {
                this.onFulfilledCallbacks.shift()(value);
            }
        }
    };
    // 更改失败后的状态
    reject = (reason) => {
        // 只有状态是等待，才执行状态修改
        if (this.status === PENDING) {
            // 状态修改为成功
            this.status = REJECTED;
            // 保存成功之后的值
            this.reason = reason;

            // ====== 新增 ======
            // 判断失败回调是否存在，如果存在就调用
            while (this.onRejectedCallbacks.length) {
                this.onRejectedCallbacks.shift()(reason);
            }
        }
    };

    then(onFulfilled, onRejected) {
        // 为了链式调用这里直接创建一个 MyPromise，并在后面 return 出去
        const promise2 = new MyPromise((resolve, reject) => {
            // 判断状态
            if (this.status === FULFILLED) {
                // 创建一个微任务等待 promise2 完成初始化
                queueMicrotask(() => {
                    // ==== 新增 ====
                    try {
                        // 获取成功回调函数的执行结果
                        const x = onFulfilled(this.value);
                        // 传入 resolvePromise 集中处理
                        resolvePromise(promise2, x, resolve, reject);
                    } catch (error) {
                        reject(error);
                    }
                });
            } else if (this.status === REJECTED) {
                // ==== 新增 ====
                // 创建一个微任务等待 promise2 完成初始化
                queueMicrotask(() => {
                    try {
                        // 调用失败回调，并且把原因返回
                        const x = onRejected(this.reason);
                        // 传入 resolvePromise 集中处理
                        resolvePromise(promise2, x, resolve, reject);
                    } catch (error) {
                        reject(error);
                    }
                });
            } else if (this.status === PENDING) {
                // 等待
                // 因为不知道后面状态的变化情况，所以将成功回调和失败回调存储起来
                // 等到执行成功失败函数的时候再传递
                // this.onFulfilledCallbacks.push(onFulfilled);
                // this.onRejectedCallbacks.push(onRejected);

                this.onFulfilledCallbacks.push(() => {
                    // ==== 新增 ====
                    queueMicrotask(() => {
                        try {
                            // 获取成功回调函数的执行结果
                            const x = onFulfilled(this.value);
                            // 传入 resolvePromise 集中处理
                            resolvePromise(promise2, x, resolve, reject);
                        } catch (error) {
                            reject(error);
                        }
                    });
                });
                this.onRejectedCallbacks.push(() => {
                    // ==== 新增 ====
                    queueMicrotask(() => {
                        try {
                            // 调用失败回调，并且把原因返回
                            const x = onRejected(this.reason);
                            // 传入 resolvePromise 集中处理
                            resolvePromise(promise2, x, resolve, reject);
                        } catch (error) {
                            reject(error);
                        }
                    });
                });
            }
        });

        return promise2;
    }
}

function resolvePromise(promise2, x, resolve, reject) {
    // 如果相等了，说明return的是自己，抛出类型错误并返回
    if (promise2 === x) {
        return reject(new TypeError("Chaining cycle detected for promise #<Promise>"));
    }
    if (x instanceof MyPromise) {
        x.then(resolve, reject);
    } else {
        resolve(x);
    }
}

module.exports = MyPromise;
