// test.js

const MyPromise = require("./index");
const promise = new MyPromise((resolve, reject) => {
    resolve("success");
    // throw new Error("执行器错误");
});

// 第一个then方法中的错误要在第二个then方法中捕获到
promise
    .then(
        (value) => {
            console.log(1);
            console.log("resolve", value);
            queueMicrotask(() => {
                console.log("1中的mcroTask");
            });
        },
        (reason) => {
            console.log(2);
            console.log(reason.message);
        }
    )
    .then(
        (value) => {
            console.log(3);
            console.log(value);
        },
        (reason) => {
            console.log(4);
            console.log(reason.message);
        }
    );
