const express = require('express');
const router = express.Router();

router.get('/sourceList', async (req, res) => {
    res.status(200).send(globalAssembler.getSourceList())   
})

router.get('/db', async (req, res) => {
    res.status(200).send(globalAssembler.getDB())
})

module.exports = router;