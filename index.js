const express = require('express')
const ethSign = require('./api/auth')
const read = require('./api/read')
const cors = require('cors')
const MongoClient = require('./utils/mongoClient')
const Assembler = require('./assembler.js')

// auth0 setup
const { auth } = require('express-openid-connect')
require('dotenv').config()

const config = {
    authRequired: false,
    auth0Logout: true,
    secret: process.env.SECRET,
    baseURL: process.env.BASEURL,
    clientID: process.env.CLIENTID,
    issuerBaseURL: process.env.ISSUER,
};

global.globalMongoClient = new MongoClient();
setTimeout(() => {
    global.globalAssembler = new Assembler();
}, 3000);

const app = express()

var corsOptions = {
    origin: 'https://wavefront.hashwave.io',
}
app.use(cors(corsOptions));
app.use(auth(config));
// req.isAuthenticated is provided from the auth router
app.get('/', (req, res) => {
    res.redirect('https://ample.hashwave.io')
});
app.get('/loginCheck', (req, res) => {
    res.send(req.oidc.isAuthenticated() ? true : false);
});

app.use('/auth', ethSign);
app.use('/read', read);

const port = 5005

app.listen(port, () => {
    console.log(`Ample-server listening on port ${port}`)
})