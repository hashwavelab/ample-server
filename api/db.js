const express = require('express');
const router = express.Router();
var jwtAuthz = require('express-jwt-authz');
var scopeCheck = jwtAuthz(['read:db'], { customUserKey: 'auth' })

router.get('/sourceList', scopeCheck, async (req, res) => {
    res.status(200).send(globalAssembler.getSourceList())   
})

router.get('/db', scopeCheck, async (req, res) => {
    res.status(200).send(globalAssembler.getDB())
})

module.exports = router;