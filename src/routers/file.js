const express = require('express');
var fs = require("fs");
const router = new express.Router();
const authMiddleware = require('../middleware/auth');
const path = require('path');

const saveFile = (filePath, realFile, publicPath, res) => {
    fs.writeFile(filePath, realFile, (err) => {
        if (err) {
            res.send({
                errorCode: 1,
                errorMessage: 'Unexpected error'
            });
        } else {
            res.send({ path: publicPath });
        }
    });
}

router.post('/file/upload', authMiddleware, (req, res) => {
    try {
        const now = new Date();
        // Random name
        const name =  Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
        const img = req.body.image;
        const fileName = req.body.name;
        const ext = path.extname(fileName);
        const realFile = Buffer.from(img, "base64");
        let dirPath = appRoot + '/public/upload/images/' + now.getFullYear() + '/' + now.getMonth() + '/' + now.getDate() + '/';
        let filePath = dirPath + '/' + name + ext;
        const publicPath = '/public/upload/images/' + now.getFullYear() + '/' + now.getMonth() + '/' + now.getDate() + '/' + name + ext;
        if (!fs.existsSync(dirPath)) {
            fs.mkdir(dirPath, { recursive: true }, (err) => {
                if (!err) {
                    saveFile(filePath, realFile, publicPath, res);
                } else {
                    res.send({
                        errorCode: 1,
                        errorMessage: 'Unexpected error'
                    });
                }
            });
        } else {
            saveFile(filePath, realFile, publicPath, res);
        }
    } catch (e) {
        res.send({
            errorCode: 1,
            errorMessage: 'Unexpected error'
        });
        console.log(e);
    }
});

module.exports = router;