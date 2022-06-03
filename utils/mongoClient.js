const mongodb = require('mongodb');
const CONFIG = require('./config')

class MongoClient {
    constructor() {
        this.initConnection()
    }

    async initConnection() {
        this.client = await mongodb.MongoClient.connect(
            CONFIG.dbinfo,
            {
                useNewUrlParser: true,
                useUnifiedTopology: true
            }
        );
    }

    createCollection(collectionName) {
        this.client.db('ample').createCollection(collectionName, function (err, res) {
            if (err) throw err
            console.log(collectionName, "is already created!")
        })
    }

    getDatabase() {
        return this.client.db('ample')
    }

    async getCollectionList() {
        return await this.client.db('ample').listCollections().toArray()
    }

    getCollection(collection) {
        return this.client.db('ample').collection(collection)
    }

    async getCollectionData(collection) {
        let ample = this.client.db('ample').collection(collection)
        return (await ample.aggregate([],
            { allowDiskUse: true }
        ).toArray())
    }
}

module.exports = MongoClient