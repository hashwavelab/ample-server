const express = require('express')
const auth = require('./api/auth')
const read = require('./api/read')
const cors = require('cors')
const MongoClient = require('./utils/mongoClient')
const Assembler = require('./assembler.js')

global.globalMongoClient = new MongoClient();
setTimeout(() => {
    global.globalAssembler = new Assembler();
}, 3000);

const app = express()

var corsOptions = {
    origin: 'http://localhost:3000',
}
app.use(cors(corsOptions))
app.use('/api/auth', auth)
app.use('/api/read', read)

const port = 5005

app.listen(port, () => {
    console.log(`Ample-server listening on port ${port}`)
})