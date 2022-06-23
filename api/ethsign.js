const express = require('express');
const bodyParser = require('body-parser');
const ethers = require ('ethers');
const router = express.Router();
const CONFIG = require('../utils/config');

var jwtAuthz = require('express-jwt-authz');
var scopeCheck = jwtAuthz(['read_write:ethsign'], { customUserKey: 'auth' })

var jsonParser = bodyParser.json()
let massageToSignMap = new Map()

function verifySignature(user, address, signature) {
    if (massageToSignMap.has(address)) {
        let msg = massageToSignMap.get(address)
        let recoveredAddress = ethers.utils.verifyMessage(msg, signature)
        if (recoveredAddress === user.address) {
            return true
        } else {
            return false
        }
    } else {
        return false
    }
}

router.get('/msg', scopeCheck, (req, res) => {
    let user = CONFIG.users.find(user => {
        return user.address == req.query.address
    })
    if (!user) {
        res.status(400).send("Get off dude!")
    } else {
        let message = "Signing to verify identity at " + new Date().toISOString()
        massageToSignMap.set(user.address, message)
        res.send(message)
    }
})

// this api does nothing and should never be used
router.post('/verify', (req, res) => {
    let user = CONFIG.users.find(user => {
        return user.address == req.body.address
    })
    if (!user) {
        res.status(400).send("Get off dude!")
    } else {
        let msg = massageToSignMap.get(req.body.address)
        if (msg != undefined) {
            let recoveredAddress = ethers.utils.verifyMessage(msg, req.body.signature)
            if (recoveredAddress === user.address) {
                // Success! go to next step.
                res.status(200).send("Success!")
            } else {
                res.status(400).send("Get off dude!")
            }
        } else {
            res.status(400).send("You haven't signed yet!")
        }
    }
})

router.post('/update/document', scopeCheck, jsonParser, async (req, res) => {
    try {
        let address = req.body.address
        let signature = req.body.signature
        let collectionName = req.body.collectionName
        let id = req.body.id
        let modDic = req.body.modDic
        if (
            address === undefined ||
            signature === undefined ||
            collectionName === undefined ||
            id === undefined ||
            modDic === undefined
        ) {
            res.status(400).send("Please check your arguments!")
        }
        let user = CONFIG.users.find(user => {
            return user.address == address
        })
        if (!user) {
            res.status(400).send("Get off dude!")
        } else {
            if (verifySignature(user, address, signature)) {
                let resCode = await globalAssembler.update(address, collectionName, id, modDic)
                res.status(resCode).send()
            } else {
                res.status(400).send()
            }
        }
    } catch (error) {
        console.log(error)
        res.status(400).send(error)
    }
})

// this api is currently not supported
router.post('/insert/collection', jsonParser, async (req, res) => {
    try {
        let address = req.body.address
        let signature = req.body.signature
        let collectionName = req.body.collectionName
        if (
            address === undefined ||
            signature === undefined ||
            collectionName === undefined
        ) {
            res.status(400).send("Please check your arguments!")
        }
        let user = CONFIG.users.find(user => {
            return user.address == req.body.address
        })
        if (!user) {
            res.status(400).send("Get off dude!")
        } else {
            if (verifySignature(user, address, signature)) {
                let resCode = await globalAssembler.insertCollection(collectionName)
                res.status(resCode).send()
            } else {
                res.status(400).send()
            }
        }   
    } catch (error) {
        console.log(error)
        res.status(400).send(error)
    }
})

router.post('/insert/document', scopeCheck, jsonParser, async (req, res) => {
    try {
        let address = req.body.address
        let signature = req.body.signature
        let collectionName = req.body.collectionName
        let modDic = req.body.modDic
        if (
            address === undefined ||
            signature === undefined ||
            collectionName === undefined ||
            modDic === undefined
        ) {
            res.status(400).send("Please check your arguments!")
        }
        let user = CONFIG.users.find(user => {
            return user.address == address
        })
        if (!user) {
            res.status(400).send("Get off dude!")
        } else {
            if (verifySignature(user, address, signature)) {
                let result = await globalAssembler.insertDocument(collectionName, modDic)
                res.status(result[0]).send(result[1])
            } else {
                res.status(400).send()
            }
        }
    } catch (error) {
        console.log(error)
        res.status(400).send(error)
    }
})

module.exports = router;