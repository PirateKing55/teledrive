import { StringSession } from "telegram/sessions/index.js";
import { apiCred, CONNECTION_RETRIES } from "../config/index.js";
import { TelegramClient, Api } from "telegram";
import { saveStringSession } from "../model/db.js";

export const sendCodeHandler = async (req, res, next) => {
    try {
        const user = req.user;
        const phoneNumber = user.phoneNo;
        const stringSession = new StringSession("");
        const teleClient = new TelegramClient(
            stringSession,
            apiCred.apiId,
            apiCred.apiHash,
            { connectionRetries: CONNECTION_RETRIES }
        );
        await teleClient.connect();

        const { phoneCodeHash } = await teleClient.invoke(
            new Api.auth.SendCode({
                ...apiCred,
                phoneNumber,
                settings: new Api.CodeSettings({
                    allowFlashcall: true,
                    currentNumber: true,
                    allowAppHash: true,
                }),
            })
        );

        const sessionStr = teleClient.session.save();
        await saveStringSession(phoneNumber, sessionStr);
        res.json({ phoneCodeHash });
    } catch (error) {
        next(error);
    }
};

export const teleLoginHandler = async (req, res, next) => {
    try {
        const { phoneCode, phoneCodeHash } = req.body;
        const user = req.user;
        const phoneNumber = user.phoneNo;
        const stringSession = new StringSession(user.session);
        const teleClient = new TelegramClient(
            stringSession,
            apiCred.apiId,
            apiCred.apiHash,
            { connectionRetries: CONNECTION_RETRIES }
        );
        await teleClient.connect();

        await teleClient.invoke(
            new Api.auth.SignIn({
                phoneNumber,
                phoneCode,
                phoneCodeHash,
            })
        );
        const sessionStr = teleClient.session.save();
        await saveStringSession(phoneNumber, sessionStr);
        res.json({ message: "Telegram login successful" });
    } catch (error) {
        next(error);
    }
}; 