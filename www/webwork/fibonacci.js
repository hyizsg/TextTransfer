var i = 0;

//fibonacci.js
var fibonacci =function(n) {
    return n <2? n : arguments.callee(n -1) + arguments.callee(n -2);
};
onmessage =function(event) {
    var n = parseInt(event.data, 10);
//    fibonacci(n);
    postMessage(i++);
};