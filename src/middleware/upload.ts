import multer from "multer";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

// Create upload directory if it doesn't exist
//const uploadDir = path.join(__dirname, "../../uploads/providers");
const __filename = /* fileURLToPath(import.meta.url); */"";
const __dirname = /* path.dirname(__filename); */"";

const uploadDir = "";

export const upload = multer({
  storage: multer.memoryStorage(),
});

/* if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
} */

// Configure storage
/* const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadDir);
  },
  filename: (_req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
  },
});
 */
// Filter allowed file types
/* const fileFilter = (_req: any, file: Express.Multer.File, cb: any) => {
  if (file.mimetype.startsWith("image/")) {
    cb(null, true);
  } else {
    cb(new Error("Only image files are allowed"), false);
  }
}; */

// Limit file size to 2MB
/* export const upload = multer({
  storage,
  //fileFilter,
  limits: { fileSize: 2 * 1024 * 1024 },
}); */
