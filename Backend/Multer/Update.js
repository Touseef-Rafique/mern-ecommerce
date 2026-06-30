const multer = require('multer')

const newstorage = multer.diskStorage({
    destination : "Uploads/",
    filename : function(req , file , cb) {
        cb(null , file.originalname)
    }
})

const Upload = multer({storage: newstorage})

module.exports = Upload;