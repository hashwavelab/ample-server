const Collection = require("./type/collection")

class Assembler {
    constructor() {
        this.ampleDataMap = new Map() // a map from name of the collection to collection map
        this.initAssembler()
    }

    async initAssembler() {
        let collectionList = await globalMongoClient.getCollectionList()
        for (let collection of collectionList) {
            this.ampleDataMap[collection.name] = new Collection(collection.name)
        }
    }

    getSourceList() {
        let sourceList = new Array()
        for (let [key, value] of Object.entries(this.ampleDataMap["sources"].collectionMap)) {
            sourceList.push(value.sourceName)
        }
        return sourceList
    }

    // Read
    getDB() {
        let returnDic = {}
        for (let [key, value] of Object.entries(this.ampleDataMap)) {
            returnDic[key] = value.GetRawCollection()
        }
        return returnDic
    }

    // Create/Insert
    async insertCollection(collectionName) {
        const db = globalMongoClient.getDatabase()
        return new Promise(async (resolve, _reject) => {
            await db.createCollection(collectionName, function (err, res) {
                if (err) {
                    console.log('Error occurred while creating');
                    resolve(400)
                } else {
                    this.ampleDataMap[collectionName] = new Collection(collectionName)
                    console.log(collectionName, "is already created!");
                    resolve(200)
                }
            })
        })
    }

    async insertDocument(collectionName, rawDoc) {
        const collection = globalMongoClient.getCollection(collectionName);
        return new Promise(async (resolve, _reject) => {
            await collection.insertOne(rawDoc, function (err, res) {
                if (err) {
                    console.log('Error occurred while inserting');
                    resolve(400)
                } else {
                    console.log('Document Inserted!');
                    resolve(200)
                }
            })
        })
    }

    // Update
    // exactly same as insertField()
    async update(user, collectionName, documentId, modDic) {
        return await this.ampleDataMap[collectionName].collectionMap[documentId].modifyDoc(user, modDic)
    }
}

module.exports = Assembler