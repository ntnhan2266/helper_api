require('./db/mongoose');
require('./db/firebase');
const express = require('express');
const userRouter = require('./routers/user');
const authRouter = require('./routers/auth');

const app = express();
const port = process.env.PORT || 4000;

app.use(express.json());
app.use('/api', userRouter);
app.use('/api', authRouter);

app.listen(port, () => {
    console.log('Server is up on port ' + port)
});
