const mongoose = require('mongoose')

mongoose.connect('mongodb://127.0.0.1:27017/smart_rabbit', {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false
}).catch(err => {
    console.log('Can not connect to MongoDB')
    consoloe.log(err)
});