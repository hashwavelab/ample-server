const express = require('express')
const ethsign = require('./api/ethsign')
const db = require('./api/db')
const cors = require('cors')
const MongoClient = require('./utils/mongoClient')
const Assembler = require('./assembler.js')

const { expressjwt: expressJwt } = require('express-jwt');
var jwksRsa = require('jwks-rsa');
// var jwtAuthz = require('express-jwt-authz');

const jwtCheck = expressJwt({
    secret: jwksRsa.expressJwtSecret({
        cache: true,
        rateLimit: true,
        jwksRequestsPerMinute: 5,
        jwksUri: 'https://dev-pmw60n9g.us.auth0.com/.well-known/jwks.json'
    }),
    audience: 'https://ample.hashwave.io/api',
    issuer: 'https://dev-pmw60n9g.us.auth0.com/',
    algorithms: ['RS256']
});

global.globalMongoClient = new MongoClient();
setTimeout(() => {
    global.globalAssembler = new Assembler();
}, 3000);

const app = express()

app.use(jwtCheck);

var corsOptions = {
    origin: 'https://wavefront.hashwave.io',
}
app.use(cors(corsOptions));

// var scopeCheck = jwtAuthz(['read:db'], { customUserKey: 'auth' })

// app.get('/test', scopeCheck, async (req, res) => {
//     res.status(200).send("ok");
// })

app.use('/ethsign', ethsign);
app.use('/db', db);

const port = 5005

app.listen(port, () => {
    console.log(`Ample-server listening on port ${port}`)
})