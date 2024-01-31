require('dotenv').config()
const Fastify = require('fastify')
const cors = require('@fastify/cors')

const fastify = Fastify({ logger: true })

const { Client } = require('@elastic/elasticsearch')
const client = new Client({
  node: process.env.ELASTIC_SEARCH_URI
})

const INDEX = 'lrztp'

const opts = {
  schema: {
   querystring: {
    searchTerm: { type: 'string' }
   }
  }
}

const start = async () => {

  await fastify.register(cors, {
    origin:true,
    methods:['GET']
  })

  fastify.route({
    method: 'OPTIONS',
    url: '/',
    handler: function (request, reply) {
      reply.header('Access-Control-Allow-Origin','*').send()
    }
  })

  fastify.get('/', opts, async function handler (request, reply) {

    const searchTerm = request.query.searchTerm

    console.log("searchTerm="+searchTerm)

    const result = await client.search({
      index: INDEX,
      highlight: {
        "fields": {
          "text": {}
        }
      },
      query: {
        match: {
          text: searchTerm
        }
      }
    })
    reply.header("Access-Control-Allow-Origin", "*")
    reply.header("Access-Control-Allow-Methods", "GET")
    reply.send({ result: result, searchTerm:searchTerm })
  })

  try {
    await fastify.listen({ port: 3000 })
  } catch (err) {
    fastify.log.error(err)
    process.exit(1)
  }
}
start()
