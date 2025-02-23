import { StringSession } from "telegram/sessions/index.js";
import { apiCred, CONNECTION_RETRIES } from "../config/index.js";
import { Api, TelegramClient } from "telegram";

export const FileHandler = async (req, res, next) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: "No file was provided" });
        }
        const fileName = req.fileName;
        const originalFileName = req.fileOrgName;
        const user = req.user;
        const sessionString = user.session;
        const session = new StringSession(sessionString);
        const client = new TelegramClient(session, apiCred.apiId, apiCred.apiHash, {
            connectionRetries: CONNECTION_RETRIES,
        });
        await client.connect();

        const uploadDetails = await client.sendFile("me", {
            file: `files/${fileName}`,
            caption: "Uploaded Automatically",
        });

        user.files.push({
            id: uploadDetails.id.toString(),
            name: originalFileName,
            isFavourite: false,
            deleted: false,
        });

        await user.save();
        await client.disconnect();

        res.json({
            id: uploadDetails.id,
            name: originalFileName,
            isFavourite: false,
        });
    } catch (err) {
        next(err);
    }
};

export const fileDownloadHandler = async (req, res, next) => {
    try {
        const { fileId } = req.body;
        const user = req.user;
        const sessionString = user.session;
        const session = new StringSession(sessionString);
        const client = new TelegramClient(session, apiCred.apiId, apiCred.apiHash, {
            connectionRetries: CONNECTION_RETRIES,
        });
        await client.connect();

        const buffer = await client.downloadMedia(
            new Api.Message({ id: Number(fileId) }),
            { progressCallback: (progress) => console.log(`Downloaded: ${progress}%`) }
        );
        await client.disconnect();

        res.setHeader("Content-Type", "application/pdf");
        res.send(buffer);
    } catch (error) {
        next(error);
    }
}; 