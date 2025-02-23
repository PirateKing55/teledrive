import { Schema, connect, model } from "mongoose";
import { createHash } from "crypto";
import { dbUri } from "../config/index.js";

const fileSchema = new Schema({
    id: { type: String, required: true },
    name: { type: String, required: true },
    isFavourite: { type: Boolean, default: false },
    deleted: { type: Boolean, default: false },
});

const collectionSchema = new Schema({
    collectionName: { type: String, required: true },
    files: { type: [fileSchema], default: [] },
});

const userSchema = new Schema({
    name: { type: String, required: true },
    phoneNo: { type: String, required: true, unique: true },
    session: { type: String },
    password: { type: String, required: true },
    files: { type: [fileSchema], default: [] },
    collections: { type: [collectionSchema], default: getDefaultCollections() },
});

function getDefaultCollections() {
    return [{ collectionName: "Favourites", files: [] }];
}

connect(dbUri)
    .then(() => console.log("Connected to database"))
    .catch((err) => console.error("Database connection error:", err));

const User = model("User", userSchema);

export const signUpUser = async (name, phoneNo, password) => {
    const existingUser = await User.findOne({ phoneNo });
    if (existingUser) {
        throw new Error("User already exists, please login");
    }
    const passHash = createHash("sha256").update(password).digest("hex");
    const user = new User({ name, phoneNo, password: passHash });
    await user.save();
    return user;
};

export const loginUser = async (phoneNo, password) => {
    const user = await User.findOne({ phoneNo });
    if (!user) {
        throw new Error("User does not exist, please signup");
    }
    const passHash = createHash("sha256").update(password).digest("hex");
    if (user.password !== passHash) {
        throw new Error("Invalid credentials");
    }
    return user;
};

export const tokenDb = async (token) => {
    try {
        const user = await User.findById(token);
        return user;
    } catch (error) {
        throw new Error("Error occurred while fetching user");
    }
};

export const saveStringSession = async (phoneNo, session) => {
    try {
        await User.findOneAndUpdate({ phoneNo }, { session });
    } catch (error) {
        throw new Error("Error occurred while saving session");
    }
}; 