const fastify = require('fastify')();
const SQLite = require('sqlite3').verbose();
const crypto = require('crypto');

const port = process.env.PORT || 3004;

const db = new SQLite.Database('keyruler');
db.run("CREATE TABLE IF NOT EXISTS 'keys' ('keyId' TEXT NOT NULL, 'key' TEXT NOT NULL, 'context' TEXT NOT NULL, PRIMARY KEY ('keyId'))");

fastify.get('/newKey', (req, reply) => {
    const keyId = crypto.randomBytes(5).toString('hex');

    // TODO: Change to unique and more secure key?
    // Use Shamirs Secret Sharing for multi keys?
    const key = crypto.randomBytes(32).toString('hex');

    db.run("INSERT INTO 'keys' (keyId, key, context) VALUES (?, ?, ?)", [keyId, key, req.query.context], (err) => {
        if (!err) {
            reply.send({ keyId, key })
        } else {
            reply.code(500).send()
        }
    });
});


fastify.get('/getKey', (req, reply) => {
    db.get("SELECT * FROM 'keys' WHERE (keyId=?)", req.query.keyId, (err, row) => {
        if (!err && row !== undefined) {
            reply.send({ key: row.key })
        } else {
            reply.code(500).send()
        }
    });
});


fastify.get('/doHMAC', (req, reply) => {
    reply.code(500).send()
});

fastify.listen(port, () => console.log(`Running keyruler on port ${port}`));