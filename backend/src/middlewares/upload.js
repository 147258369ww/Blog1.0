const multer = require('multer');
const path = require('path');
const fs = require('fs');
const config = require('../config');

// 确保上传目录存在
const ensureDirectoryExists = (dirPath) => {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
};

// 配置存储
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    let uploadPath;
    
    // 根据文件类型确定存储路径
    if (file.mimetype.startsWith('image/')) {
      uploadPath = path.join(process.cwd(), 'uploads', 'images');
    } else {
      uploadPath = path.join(process.cwd(), 'uploads', 'files');
    }
    
    ensureDirectoryExists(uploadPath);
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    // 生成唯一文件名: timestamp-randomstring.ext
    // 不保留原始文件名，避免中文编码问题
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 15);
    const ext = path.extname(file.originalname);
    const uniqueFilename = `${timestamp}-${randomString}${ext}`;
    
    cb(null, uniqueFilename);
  },
});

// 文件类型验证
const fileFilter = (req, file, cb) => {
  const allowedImageTypes = config.upload.allowedImageTypes;
  
  if (file.mimetype.startsWith('image/')) {
    // 验证图片类型
    if (allowedImageTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('只允许上传 JPG、JPEG、PNG、GIF 格式的图片'), false);
    }
  } else {
    // 普通文件，允许上传
    cb(null, true);
  }
};

// 创建上传中间件
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: config.upload.maxFileSize, // 默认使用最大文件大小限制
  },
});

// 图片上传中间件（5MB 限制）
const uploadImage = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    const allowedImageTypes = config.upload.allowedImageTypes;
    
    if (allowedImageTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('只允许上传 JPG、JPEG、PNG、GIF 格式的图片'), false);
    }
  },
  limits: {
    fileSize: config.upload.maxImageSize, // 5MB
  },
});

// 普通文件上传中间件（10MB 限制）
const uploadFile = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: config.upload.maxFileSize, // 10MB
  },
});

module.exports = {
  upload,
  uploadImage,
  uploadFile,
};
