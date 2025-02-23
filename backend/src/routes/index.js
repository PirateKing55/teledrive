import { Router } from "express";
import multer from "multer";
import { authMiddleware } from "../middleware/authorize.js";

import {
    test,
    errorTest,
    signUpHandler,
    loginHandler,
} from "../controllers/common.js";
import { sendCodeHandler, teleLoginHandler } from "../controllers/auth.js";
import {
    getAllFiles,
    getAllCollections,
    createCollection,
    addToCollection,
    removeFromCollection,
    handleFavourite,
    removeAllFavourites,
    renameCollection,
    renameFile,
} from "../controllers/collections.js";
import {
    addToBin,
    restoreFromBin,
    permanentlyDelete,
    emptyBin,
    restoreAll,
} from "../controllers/bin.js";
import { FileHandler, fileDownloadHandler } from "../controllers/sendFile.js";

const router = Router();

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "files/");
    },
    filename: (req, file, cb) => {
        const fileName = Date.now() + "-" + file.originalname;
        req.fileName = fileName;
        req.fileOrgName = file.originalname;
        cb(null, fileName);
    },
});

const upload = multer({ storage });

// Public routes
router.get("/test", test);
router.get("/error", errorTest);
router.post("/signup", signUpHandler);
router.post("/login", loginHandler);

// Protected routes (require valid token)
router.post("/sendCode", authMiddleware, sendCodeHandler);
router.post("/loginTelegram", authMiddleware, teleLoginHandler);
router.post("/uploadFile", authMiddleware, upload.single("file"), FileHandler);
router.get("/files", authMiddleware, getAllFiles);
router.get("/collections", authMiddleware, getAllCollections);
router.post("/createCollection", authMiddleware, createCollection);
router.post("/addToCollection", authMiddleware, addToCollection);
router.post("/removeFromCollection", authMiddleware, removeFromCollection);
router.put("/handleFavourite", authMiddleware, handleFavourite);
router.put("/removeAllFavourites", authMiddleware, removeAllFavourites);
router.put("/renameCollection", authMiddleware, renameCollection);
router.put("/renameFile", authMiddleware, renameFile);

router.put("/addToBin", authMiddleware, addToBin);
router.put("/restoreFromBin", authMiddleware, restoreFromBin);
router.delete("/permanentlyDelete", authMiddleware, permanentlyDelete);
router.delete("/emptyBin", authMiddleware, emptyBin);
router.put("/restoreAll", authMiddleware, restoreAll);

router.post("/download", authMiddleware, fileDownloadHandler);

export { router }; 