import { loginUser, signUpUser } from "../model/db.js";

export const test = (req, res) => {
    res.send("Server is up and running");
};

export const errorTest = (req, res) => {
    throw new Error("Test error");
};

export const signUpHandler = async (req, res, next) => {
    try {
        const { name, phoneNo, password } = req.body;
        const user = await signUpUser(name, phoneNo, password);
        res.json({ token: user._id, name: user.name });
    } catch (error) {
        next(error);
    }
};

export const loginHandler = async (req, res, next) => {
    try {
        const { phoneNo, password } = req.body;
        const user = await loginUser(phoneNo, password);
        if (!user) {
            return res.status(401).json({ message: "Invalid credentials" });
        }
        res.json({ token: user._id, name: user.name });
    } catch (error) {
        next(error);
    }
}; 