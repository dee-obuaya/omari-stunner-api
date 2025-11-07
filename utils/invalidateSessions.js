module.exports.invalidateUserSessions = async (store, userId) => {
    if (store?.collectionP) {
        const sessionsCollection = await store.collectionP;
        const sessions = await sessionsCollection.find({}).toArray();

        for (const sess of sessions) {
            try {
            const data = JSON.parse(sess.session);
            const sessUser = data.passport?.user;

            if (sessUser && sessUser == userId.toString()) {
                const invalidated = await sessionsCollection.deleteOne({ _id: sess._id });
                console.log(`✅ Destroyed session for user ${userId}`);
                return invalidated;
            }
            } catch (err) {
                console.error('Error parsing session:', err);
            }
        }
    }
};
