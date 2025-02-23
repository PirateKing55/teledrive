export const addToBin = async (req, res, next) => {
    try {
        const { file } = req.body;
        const user = req.user;

        const index = user.files.findIndex(x => x.id === file.id);
        if (index === -1) {
            return res.status(404).json({ message: "File not found" });
        }
        user.files[index].deleted = true;

        user.collections.forEach(collection => {
            const fileIndex = collection.files.findIndex(x => x.id === file.id);
            if (fileIndex !== -1) {
                collection.files[fileIndex].deleted = true;
            }
        });

        await user.save();
        res.json({ message: "File added to bin" });
    } catch (error) {
        next(error);
    }
};

export const restoreFromBin = async (req, res, next) => {
    try {
        const { file } = req.body;
        const user = req.user;

        const index = user.files.findIndex(x => x.id === file.id);
        if (index === -1) {
            return res.status(404).json({ message: "File not found" });
        }
        user.files[index].deleted = false;

        user.collections.forEach(collection => {
            const fileIndex = collection.files.findIndex(x => x.id === file.id);
            if (fileIndex !== -1) {
                collection.files[fileIndex].deleted = false;
            }
        });

        await user.save();
        res.json({ message: "File restored from bin" });
    } catch (error) {
        next(error);
    }
};

export const permanentlyDelete = async (req, res, next) => {
    try {
        const { file } = req.body;
        const user = req.user;

        const index = user.files.findIndex(x => x.id === file.id);
        if (index === -1) {
            return res.status(404).json({ message: "File not found" });
        }
        user.files.splice(index, 1);

        user.collections.forEach(collection => {
            const fileIndex = collection.files.findIndex(x => x.id === file.id);
            if (fileIndex !== -1) {
                collection.files.splice(fileIndex, 1);
            }
        });

        await user.save();
        res.json({ message: "File permanently deleted" });
    } catch (error) {
        next(error);
    }
};

export const emptyBin = async (req, res, next) => {
    try {
        const user = req.user;
        user.files = user.files.filter(file => !file.deleted);
        user.collections.forEach(collection => {
            collection.files = collection.files.filter(file => !file.deleted);
        });
        await user.save();
        res.json({ message: "Bin emptied successfully" });
    } catch (error) {
        next(error);
    }
};

export const restoreAll = async (req, res, next) => {
    try {
        const user = req.user;
        user.files.forEach(file => (file.deleted = false));
        user.collections.forEach(collection =>
            collection.files.forEach(file => (file.deleted = false))
        );
        await user.save();
        res.json({ message: "All files restored from bin" });
    } catch (error) {
        next(error);
    }
}; 