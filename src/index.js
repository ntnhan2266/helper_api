require('./db/mongoose');
require('./db/firebase');
const express = require('express');
const path = require('path');
const bodyParser = require("body-parser");
const cors = require('cors');

const userRouter = require('./routers/user');
const authRouter = require('./routers/auth');
const fileRouter = require('./routers/file');
const maidRouter = require('./routers/maid');
const bookingRouter = require('./routers/booking');
const reviewRouter = require('./routers/review');

// Config global path
global.appRoot = path.resolve(__dirname + '/..');

const app = express();
const port = process.env.PORT || 4000;

app.use("/public", express.static(path.join(__dirname + '/..', '/public')));
app.use(bodyParser.urlencoded({ extended: true, limit: "50mb" }));
app.use(express.json({ limit: '50mb' }));
app.use(cors());

app.use('/api', userRouter);
app.use('/api', authRouter);
app.use('/api', fileRouter);
app.use('/api', maidRouter);
app.use('/api', bookingRouter);
app.use('/api', reviewRouter);

app.listen(port, () => {
    console.log('Server is up on port ' + port)
});
