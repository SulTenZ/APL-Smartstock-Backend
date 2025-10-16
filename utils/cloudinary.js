// utils/cloudinary.js
import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import multer from "multer";
import dotenv from "dotenv";
import path from "path";

dotenv.config();

// Konfigurasi Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Storage untuk produk
const productStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "apl-shoes/products",
    allowed_formats: ["jpg", "jpeg", "png", "webp"],
    transformation: [{ width: 1000, crop: "limit" }],
  },
});

// Storage untuk brand
const brandStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "apl-shoes/brands",
    allowed_formats: ["jpg", "jpeg", "png", "webp"],
    transformation: [{ width: 500, crop: "limit" }],
  },
});

// File filter universal (bisa dipakai ulang)
const imageFileFilter = (req, file, cb) => {
  const isImage = file.mimetype?.startsWith("image/");
  const validExt = /\.(jpg|jpeg|png|webp)$/i.test(file.originalname);

  if (isImage && validExt) {
    cb(null, true);
  } else {
    cb(new Error("Hanya file gambar yang diperbolehkan (jpg, jpeg, png, webp)"));
  }
};

// Upload untuk produk
const uploadProduct = multer({
  storage: productStorage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: imageFileFilter,
});

// Upload untuk brand
const uploadBrand = multer({
  storage: brandStorage,
  limits: { fileSize: 2 * 1024 * 1024 },
  fileFilter: imageFileFilter,
});

// Hapus gambar dari Cloudinary
const deleteImage = async (imageUrl) => {
  try {
    const urlParts = imageUrl.split("/");
    const fileName = urlParts.pop();
    const folderPath = urlParts.pop();
    const publicId = `${folderPath}/${fileName.split(".")[0]}`;

    const versionMatch = imageUrl.match(/\/v\d+\//);
    if (versionMatch) {
      const afterVersion = imageUrl.split(versionMatch[0])[1];
      return await cloudinary.uploader.destroy(afterVersion.replace(/\.[^/.]+$/, ""));
    }

    return await cloudinary.uploader.destroy(publicId);
  } catch (error) {
    console.error("Error deleting image from Cloudinary:", error);
    throw error;
  }
};

// Upload buffer image (opsional)
const uploadBuffer = async (buffer, folder = "apl-shoes/products") => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      { folder, resource_type: "image" },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      }
    );

    uploadStream.end(buffer);
  });
};

export { uploadProduct, uploadBrand, deleteImage, uploadBuffer, cloudinary };
