var ObjectId = require('mongodb').ObjectId;

class Document {
    constructor(collectionName, sourceName, rawDoc) {
        this.collectionName = collectionName
        this.sourceName = sourceName;
        this.rawDoc = rawDoc
    }

    async modifyDoc(_userAddress, modDic) {
        return new Promise(async (resolve, reject) => {
            // TODO: check if this user is authorized to modify this document
            const collection = globalMongoClient.getCollection(this.collectionName)
            var filter = { _id: new ObjectId(this.rawDoc._id) };
            var updateDoc = {
                $set: modDic
            }
            await collection.updateOne(filter, updateDoc, function (err, res) {
                if (err) {
                    cosnole.log(err)
                    resolve(400)
                } else {
                    console.log("Value updated !");
                    resolve(200)
                }
            });
        })
    }

    updateDocument(updatedFields, removedFields) {
        for (let i in updatedFields) {
            this.rawDoc[i] = updatedFields[i]
        }
        for (let j of removedFields) {
            delete this.rawDoc[j]
        }
    }
}

module.exports = Document