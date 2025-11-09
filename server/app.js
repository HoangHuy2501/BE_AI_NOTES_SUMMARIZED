var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var Summarized = require('./config/ConnectData');
// middleware
const errorHandler = require("./middleware/errorHandler");
const reponseHandler = require("./middleware/SuccessHandle.js");
const authenticate = require("./middleware/authenticate");
// phân router
var indexRouter = require('./routes/index');
var authRouter=require('./routes/auth');
var noteRouter=require('./routes/notes');
var flashcardsRouter=require('./routes/flashcard');
var InformationPointRouter=require('./routes/InformationPointRoute.js');
// cho phép kết nối
var cors = require('./config/cors.js');
// tự động cron
var cron = require('node-cron')
var app = express();
// text
// const {handlePdfSmart}=require('./config/Ai_handle');

app.use(cors);
Summarized.query('SELECT NOW()')
  .then(res => console.log('✅ DB connected:', res.rows[0]))
  .catch(err => console.error('❌ DB connection error:', err));

  cron.schedule("*/14 * * * *", async () => {
    console.log("running a task every 14 minutes");
});
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
// parse application/json
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
// Route health để ping server
app.get('/health', (req, res) => {
  res.send('Server is alive ✅');
});
//đường dẫn auth
app.use('/api/auth', authRouter);


app.use(reponseHandler); 
//dùng tất cả router bằng middleware
app.use(authenticate);
// đường dẫn router
app.use('/', indexRouter);
app.use('/api/notes', noteRouter);
app.use('/api/flashcards', flashcardsRouter);
app.use('/api/InformationPoint', InformationPointRouter);
// middleware bắt toàn bộ lỗi
app.use(errorHandler);
// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
