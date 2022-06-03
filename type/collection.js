const Document = require("./document")

class Collection {
    constructor(collectionName) {
        this.collection = globalMongoClient.getCollection(collectionName);
        this.collectionName = collectionName
        this.collectionMap = new Map() // a map from _id to the document object
        this.saveCollectionsData()
        this.subscribeCollectionChange()
    }

    async saveCollectionsData() {
        let res = await this.collection.aggregate([],
            { allowDiskUse: true }
        ).toArray()
        for (let rawDoc of res) {
            let source
            // different collection has different naming conventions for the field sourceName
            switch (this.collectionName) {
                case "chain_evm_configs":
                    source = rawDoc.chainName
                    break;
                case "evm_sgm_configs":
                case "sources":
                    source = rawDoc.name
                    break;
                case "evm_workers":
                    source = rawDoc.chain
                    break;
                case "obex_trading_pairs":
                    source = rawDoc.exchangeName
                    break;
                case "source_position_controls":
                    source = rawDoc.sourceName
                    break;
                default:
                    source = rawDoc.source
                    break;
            }
            let document = new Document(this.collectionName, source, rawDoc)
            this.collectionMap[rawDoc._id.toString()] = document
        }
    }

    subscribeCollectionChange() {
        let changeStream = this.collection.watch()
        changeStream.on('change', next => {
            switch (next.operationType) {
                case "insert":
                    let source
                    // different collection has different naming conventions for the field sourceName
                    switch (this.collectionName) {
                        case "chain_evm_configs":
                            source = next.fullDocument.chainName
                            break;
                        case "evm_sgm_configs":
                        case "sources":
                            source = next.fullDocument.name
                            break;
                        case "evm_workers":
                            source = next.fullDocument.chain
                            break;
                        case "obex_trading_pairs":
                            source = next.fullDocument.exchangeName
                            break;
                        case "source_position_controls":
                            source = next.fullDocument.sourceName
                            break;
                        default:
                            source = next.fullDocument.source
                            break;
                    }
                    let document = new Document(this.collectionName, source, next.fullDocument)
                    this.collectionMap[next.fullDocument._id.toString()] = document
                    break;
                case "update":
                    this.collectionMap[next.documentKey._id.toString()].updateDocument(next.updateDescription.updatedFields, next.updateDescription.removedFields)
                    break;
                case "replace":
                    this.collectionMap[next.documentKey._id.toString()].rawDoc = next.fullDocument
                    switch (this.collectionName) {
                        case "chain_evm_configs":
                            this.collectionMap[next.documentKey._id.toString()].sourceName = next.fullDocument.chainName
                            break;
                        case "evm_sgm_configs":
                        case "sources":
                            this.collectionMap[next.documentKey._id.toString()].sourceName = next.fullDocument.name
                            break;
                        case "evm_workers":
                            this.collectionMap[next.documentKey._id.toString()].sourceName = next.fullDocument.chain
                            break;
                        case "obex_trading_pairs":
                            this.collectionMap[next.documentKey._id.toString()].sourceName = next.fullDocument.exchangeName
                            break;
                        case "source_position_controls":
                            this.collectionMap[next.documentKey._id.toString()].sourceName = next.fullDocument.sourceName
                            break;
                        default:
                            this.collectionMap[next.documentKey._id.toString()].sourceName = next.fullDocument.source
                            break;
                    }
                    break;
                case "delete":
                    this.collectionMap.delete(next.documentKey._id.toString())
                    break;
                default:
                    break;
            }
        })
    }

    InsertDocument(rawDoc) {
        let document = new Document(this.collectionName, rawDoc.sourceName, rawDoc)
        this.collectionMap[rawDoc._id.toString()] = document
    }

    GetRawCollection() {
        let array = new Array()
        for (let [key, value] of Object.entries(this.collectionMap)) {
            array.push(value.rawDoc)
        }
        return array
    }
}

module.exports = Collection