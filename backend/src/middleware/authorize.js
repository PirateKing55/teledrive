import { tokenDb } from "../model/db.js";

export const authMiddleware = async (req, res, next) => {
    const token = req.body.token || req.query.token || req.headers["x-access-token"];
    if (!token) {
        return res.status(401).json({ message: "No token provided" });
    }
    try {
        const user = await tokenDb(token);
        if (!user) {
            return res.status(401).json({ message: "Unauthorized: Invalid token" });
        }
        req.user = user;
        next();
    } catch (error) {
        next(error);
    }
}; 