"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var express = require("express");
var logger = require("morgan");
var bodyParser = require("body-parser");
var path = require("path");
var mongoose = require("mongoose");
var cors = require("cors");
var index_1 = require("./routes/index");
var auth_routes_1 = require("./auth/auth.routes");
var cookieParser = require("cookie-parser"); // this module doesn't use the ES6 default export yet
var app = express();
mongoose.connect('mongodb://localhost/eti');
mongoose.connection.once('open', function connectionOpen() {
    console.log('Database connection open');
});
app.use(cors());
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use('/api', index_1.default);
app.use('/auth', auth_routes_1.authRoutes);
// Point static path to dist
app.use(express.static(path.join(__dirname, '../../client/dist')));
app.use('*', function (req, res) {
    res.sendFile(path.join(__dirname, '../../client/dist/index.html'));
});
// catch 404 and forward to error handler
app.use(function (req, res, next) {
    var err = new Error('Not Found');
    err['status'] = 404;
    next(err);
});
// error handlers
// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function (error, req, res, next) {
        res.status(error['status'] || 500);
        res.end('error', {
            message: error.message,
            error: error
        });
    });
}
// production error handler
// no stacktraces leaked to user
app.use(function (error, req, res, next) {
    res.status(error['status'] || 500);
    res.end('error');
    return null;
});
exports.default = app;
//# sourceMappingURL=app.js.map