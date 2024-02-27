// 先定义三个常量表示状态
const PENDING = "pending";
const FULFILLED = "fulfilled";
const REJECTED = "rejected";
class MyPromise {
    // 传入一个函数里面含有两个参数resolve和reject
    constructor(executor) {
        executor(this.resolve, this.reject);
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
        // 判断状态
        if (this.status === FULFILLED) {
            // 调用成功回调，并且把值返回
            onFulfilled(this.value);
        } else if (this.status === REJECTED) {
            // 调用失败回调，并且把原因返回
            onRejected(this.reason);
        } else if (this.status === PENDING) {
            // ==== 新增 ====
            // 因为不知道后面状态的变化情况，所以将成功回调和失败回调存储起来
            // 等到执行成功失败函数的时候再执行
            this.onFulfilledCallbacks.push(onFulfilled);
            this.onRejectedCallbacks.push(onRejected);
        }
    }
}

module.exports = MyPromise;
