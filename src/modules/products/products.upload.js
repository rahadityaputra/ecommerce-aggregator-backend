const path = require("path");
const multer = require("multer");
const { Storage } = require("@google-cloud/storage");
const ApiError = require("../../utils/ApiError");
const env = require("../../config/env");

const allowedExtensions = new Set([".jpg", ".jpeg", ".png", ".webp"]);
const allowedMimeTypes = new Set(["image/jpeg", "image/png", "image/webp"]);

// Initialize GCP Storage. It will use application default credentials.
const storageClient = new Storage();
const bucketName = env.gcpBucketName;
const bucket = storageClient.bucket(bucketName);

// Use memory storage for GCS uploads
const storage = multer.memoryStorage();

function fileFilter(_req, file, callback) {
    const extension = path.extname(file.originalname).toLowerCase();

    if (
        !allowedExtensions.has(extension) ||
        !allowedMimeTypes.has(file.mimetype)
    ) {
        return callback(
            new ApiError(
                400,
                "Only jpg, jpeg, png, and webp files are allowed",
            ),
        );
    }

    return callback(null, true);
}

const upload = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024,
        files: 5,
    },
});

function wrapUpload(middleware) {
    return (req, res, next) => {
        middleware(req, res, (error) => {
            if (!error) {
                return next();
            }

            if (error instanceof multer.MulterError) {
                return next(new ApiError(400, error.message));
            }

            return next(error);
        });
    };
}

async function uploadImagesToGCP(files = []) {
    const uploadPromises = files.map((file) => {
        return new Promise((resolve, reject) => {
            const safeBaseName = file.originalname
                .toLowerCase()
                .replace(/[^a-z0-9.]+/g, "-");
            const uniquePrefix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
            const fileName = `products/${uniquePrefix}-${safeBaseName}`;
            
            const blob = bucket.file(fileName);
            const blobStream = blob.createWriteStream({
                resumable: false,
                contentType: file.mimetype,
            });

            blobStream.on("error", (err) => {
                reject(err);
            });

            blobStream.on("finish", () => {
                // Return the public URL for the file
                const publicUrl = `https://storage.googleapis.com/${bucketName}/${fileName}`;
                resolve(publicUrl);
            });

            blobStream.end(file.buffer);
        });
    });

    return Promise.all(uploadPromises);
}

async function removeUploadedImage(imageUrl) {
    if (!imageUrl || !imageUrl.startsWith(`https://storage.googleapis.com/${bucketName}/`)) {
        return Promise.resolve();
    }

    try {
        const fileName = imageUrl.replace(`https://storage.googleapis.com/${bucketName}/`, "");
        await bucket.file(fileName).delete();
    } catch (error) {
        // Ignore 404 errors (file already deleted or doesn't exist)
        if (error.code !== 404) {
            throw error;
        }
    }
}

const uploadProductImages = wrapUpload(upload.array("images", 5));

module.exports = {
    uploadProductImages,
    uploadImagesToGCP, // Formerly productImagePaths
    removeUploadedImage,
};
