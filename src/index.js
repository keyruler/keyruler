const fastify = require('fastify')();
const SQLite = require('sqlite3').verbose();
const crypto = require('crypto');

const port = process.env.PORT || 3004;

const db = new SQLite.Database('keyruler');
db.run("CREATE TABLE IF NOT EXISTS 'keys' ('kid' TEXT NOT NULL, 'key' TEXT NOT NULL, 'context' TEXT NOT NULL, PRIMARY KEY ('kid'))");

fastify.post('/newKey', (req, reply) => {
    const kid = crypto.randomBytes(5).toString('base64');

    // TODO: Change to unique and more secure key?
    // TODO: Use Shamirs Secret Sharing for multi keys?
    const key = crypto.randomBytes(32).toString('base64');

    db.run("INSERT INTO 'keys' (kid, key, context) VALUES (?, ?, ?)", [kid, key, req.query.context], (err) => {
        if (!err) {
            reply.send({ kid, key });
        } else {
            reply.code(500).send();
        }
    });
});


fastify.get('/getKey', (req, reply) => {
    db.get("SELECT * FROM 'keys' WHERE (kid=?)", req.query.kid, (err, row) => {
        if (!err && row !== undefined) {
            reply.send({ key: row.key });
        } else {
            reply.code(500).send();
        }
    });
});

fastify.delete('/deleteKey', (req, reply) => {
    db.run("DELETE * FROM 'keys' WHERE (kid=?)", req.query.kid, (err) => {
        if (!err && this.changes) {
            reply.code(200).send();
        } else {
            reply.code(500).send();
        }
    });
});

fastify.listen(port, () => console.log(`Running keyruler on port ${port}`));