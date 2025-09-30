// function handleAsync (fn) {
//     return function (req, res, next) {
//         fn(req, res, next).catch(e => next(e));
//     };
// };

// module.exports = handleAsync;

module.exports = func => {
    return (req, res, next) => {
        func(req, res, next).catch(next);
    }
}