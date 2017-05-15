import * as express from 'express';
import * as logger from 'morgan';
import * as bodyParser from 'body-parser';
import * as path from 'path';
import * as mongoose from  'mongoose';
import * as cors from  'cors';
import index from './routes/index';
import { authRoutes } from './auth/auth.routes';
import cookieParser = require('cookie-parser'); // this module doesn't use the ES6 default export yet

const app: express.Express = express();

mongoose.connect('mongodb://localhost/eti');
mongoose.connection.once('open', function connectionOpen() {
  console.log('Database connection open');
});

app.use(cors())
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());

app.use('/api', index);
app.use('/auth', authRoutes);
// Point static path to dist
app.use(express.static(path.join(__dirname, '../../client/dist')));
app.use(express.static(path.join(__dirname, '../uploads')));
app.get('/resources', (req,res) => {
  res.sendFile(path.join(__dirname, '../uploads/' + req.param('file')));
})
app.use('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../../client/dist/index.html'));
});


// catch 404 and forward to error handler
app.use((req, res, next) => {
  var err = new Error('Not Found');
  err['status'] = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {

  app.use((error: any, req, res, next) => {
    res.status(error['status'] || 500);
    res.end('error', {
      message: error.message,
      error
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use((error: any, req, res, next) => {
  res.status(error['status'] || 500);
  res.end('error');
  return null;
});


export default app;
