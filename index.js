const express = require('express')
const ethsign = require('./api/ethsign')
const db = require('./api/db')
const cors = require('cors')
require('dotenv').config()
const MongoClient = require('./utils/mongoClient')
const Assembler = require('./assembler.js')

const { expressjwt: expressJwt } = require('express-jwt');
var jwksRsa = require('jwks-rsa');

const jwtCheck = expressJwt({
    secret: jwksRsa.expressJwtSecret({
        cache: true,
        rateLimit: true,
        jwksRequestsPerMinute: 5,
        jwksUri: process.env.JWKSURI
    }),
    audience: process.env.AUDIENCE,
    issuer: process.env.ISSUER,
    algorithms: [process.env.ALGORITHM],
});

global.globalMongoClient = new MongoClient();
setTimeout(() => {
    global.globalAssembler = new Assembler();
}, 3000);

const app = express()

app.use(jwtCheck);

var corsOptions = {
    origin: process.env.ORIGIN,
}
app.use(cors(corsOptions));

app.use('/ethsign', ethsign);
app.use('/db', db);

const port = 5005

app.listen(port, () => {
    console.log(`Ample-server listening on port ${port}`)
})