import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import sharp from 'sharp';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create uploads directory if it doesn't exist
const uploadDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Temp storage for processing
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        const ext = path.extname(file.originalname);
        cb(null, `listing-${uniqueSuffix}${ext}`);
    },
});

// File filter — images only
const fileFilter = (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Only JPEG, PNG, and WebP images are allowed'), false);
    }
};

const upload = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB max
        files: 5, // max 5 files
    },
});

// Image compression middleware — runs AFTER multer
export const compressImages = async (req, res, next) => {
    if (!req.files || req.files.length === 0) return next();

    try {
        const compressedFiles = [];

        for (const file of req.files) {
            const inputPath = file.path;
            const outputName = `compressed-${file.filename}`;
            const outputPath = path.join(uploadDir, outputName);

            await sharp(inputPath)
                .resize(1200, 1200, { fit: 'inside', withoutEnlargement: true })
                .jpeg({ quality: 80 })
                .toFile(outputPath);

            // Remove original, keep compressed
            fs.unlinkSync(inputPath);

            // Rename compressed to original name
            const finalPath = path.join(uploadDir, file.filename);
            fs.renameSync(outputPath, finalPath);

            compressedFiles.push({
                ...file,
                path: finalPath,
                size: fs.statSync(finalPath).size,
            });
        }

        req.files = compressedFiles;
        next();
    } catch (error) {
        console.error('Image compression error:', error);
        // Continue without compression if it fails
        next();
    }
};

export default upload;
