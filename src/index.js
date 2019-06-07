const fastify = require('fastify')()
const SQLite = require('better-sqlite3')
const crypto = require('crypto')

const port = process.env.PORT || 3004

const db = new SQLite('keyruler.db')
db.prepare("CREATE TABLE IF NOT EXISTS 'keys' ('kid' TEXT NOT NULL," +
  "'key' TEXT NOT NULL, 'context' TEXT NOT NULL, PRIMARY KEY ('kid'))").run()

fastify.post('/newKey', (req, reply) => {
  const kid = crypto.randomBytes(5).toString('base64')

  // TODO: Change to unique and more secure key?
  // TODO: Use Shamirs Secret Sharing for multi keys?
  const key = crypto.randomBytes(32).toString('base64')

  try {
    db.prepare("INSERT INTO 'keys' (kid, key, context) VALUES (?, ?, ?)").run(kid, key, req.query.context)
    reply.send({ kid, key })
  } catch (e) {
    reply.code(500).send()
  }
})

fastify.get('/getKey', (req, reply) => {
  try {
    const row = db.prepare("SELECT * FROM 'keys' WHERE (kid=?)").get(req.query.kid)
    if (row !== null && row !== undefined) {
      reply.send({ key: row.key })
    } else {
      reply.code(500).send()
    }
  } catch (e) {
    reply.code(500).send()
  }
})

fastify.delete('/deleteKey', (req, reply) => {
  try {
    const info = db.prepare("DELETE FROM 'keys' WHERE (kid=?)").run(req.query.kid)
    if (info.changes) {
      reply.code(200).send()
    } else {
      reply.code(500).send()
    }
  } catch (err) {
    reply.code(500).send()
  }
})

fastify.listen(port, () => console.log(`Running keyruler on port ${port}`))
