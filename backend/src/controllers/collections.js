export const getAllFiles = (req, res, next) => {
    try {
        const user = req.user;
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        res.json(user.files);
    } catch (error) {
        next(error);
    }
};

export const getAllCollections = (req, res, next) => {
    try {
        const user = req.user;
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        res.json(user.collections);
    } catch (error) {
        next(error);
    }
};

export const createCollection = async (req, res, next) => {
    try {
        const { collectionName } = req.body;
        const user = req.user;

        if (user.collections.some(col => col.collectionName === collectionName)) {
            return res.status(400).json({ message: "Collection already exists" });
        }

        user.collections.push({ collectionName, files: [] });
        await user.save();
        res.json(user.collections);
    } catch (error) {
        next(error);
    }
};

export const addToCollection = async (req, res, next) => {
    try {
        const { collectionName, file } = req.body;
        const user = req.user;

        const targetCollection = user.collections.find(col => col.collectionName === collectionName);
        if (!targetCollection) {
            return res.status(404).json({ message: "Collection not found" });
        }
        targetCollection.files.push(file);
        await user.save();
        res.json({ message: "File added to collection successfully" });
    } catch (error) {
        next(error);
    }
};

export const removeFromCollection = async (req, res, next) => {
    try {
        const { collectionName, file } = req.body;
        const user = req.user;

        const targetCollection = user.collections.find(col => col.collectionName === collectionName);
        if (!targetCollection) {
            return res.status(404).json({ message: "Collection not found" });
        }
        targetCollection.files = targetCollection.files.filter(x => x.id !== file.id);
        await user.save();
        res.json({ message: "File removed from collection successfully" });
    } catch (error) {
        next(error);
    }
};

export const handleFavourite = async (req, res, next) => {
    try {
        const { file } = req.body;
        const user = req.user;

        const targetFile = user.files.find(x => x.id === file.id);
        if (!targetFile) {
            return res.status(404).json({ message: "File not found" });
        }
        targetFile.isFavourite = !targetFile.isFavourite;

        const favCollection = user.collections.find(col => col.collectionName === "Favourites");
        if (favCollection) {
            if (targetFile.isFavourite) {
                favCollection.files.push(file);
            } else {
                favCollection.files = favCollection.files.filter(x => x.id !== file.id);
            }
        }

        // Also update in all collections where the file exists
        user.collections.forEach(collection =>
            collection.files.forEach(f => {
                if (f.id === targetFile.id) {
                    f.isFavourite = targetFile.isFavourite;
                }
            })
        );

        await user.save();
        res.json({
            file: targetFile,
            message: targetFile.isFavourite ? "Added to Favourites" : "Removed from Favourites",
        });
    } catch (error) {
        next(error);
    }
};

export const removeAllFavourites = async (req, res, next) => {
    try {
        const user = req.user;
        user.files.forEach(file => (file.isFavourite = false));

        const favCollection = user.collections.find(col => col.collectionName === "Favourites");
        if (favCollection) {
            favCollection.files = [];
        }
        // Update isFavourite in all collections as well
        user.collections.forEach(collection =>
            collection.files.forEach(file => (file.isFavourite = false))
        );

        await user.save();
        res.json({ message: "Removed all favourites" });
    } catch (error) {
        next(error);
    }
};

export const renameCollection = async (req, res, next) => {
    try {
        const { collectionName, newName } = req.body;
        const user = req.user;

        const targetCollection = user.collections.find(col => col.collectionName === collectionName);
        if (!targetCollection) {
            return res.status(404).json({ message: "Collection not found" });
        }
        targetCollection.collectionName = newName;
        await user.save();
        res.json({ message: "Collection renamed successfully" });
    } catch (error) {
        next(error);
    }
};

export const renameFile = async (req, res, next) => {
    try {
        const { file, newName } = req.body;
        const user = req.user;

        const targetFile = user.files.find(x => x.id === file.id);
        if (!targetFile) {
            return res.status(404).json({ message: "File not found" });
        }
        targetFile.name = newName;

        // Update the file name in all collections where it exists
        user.collections.forEach(collection =>
            collection.files.forEach(f => {
                if (f.id === targetFile.id) {
                    f.name = newName;
                }
            })
        );

        await user.save();
        res.json({ message: "File renamed successfully" });
    } catch (error) {
        next(error);
    }
}; 