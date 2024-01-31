require('dotenv').config()
const express = require('express')
var cors = require('cors')
const app = express()
const port = 3000

let corsOptions = {
  origin: ['http://127.0.0.1:5173','http://localhost:5173','http://localhost:5173/'],
  optionsSuccessStatus: 200
};

const INDEX = 'lrztp'
const { Client } = require('@elastic/elasticsearch')
const client = new Client({
  node: process.env.ELASTIC_SEARCH_URI
})

app.use(cors(corsOptions))

app.options('*', cors(corsOptions))

app.get('/', cors(corsOptions), async (req, res) => {

  const searchTerm = req.query.searchTerm

  console.log("searchTerm="+searchTerm)

  const result = await client.search({
    index: INDEX,
    highlight: {
      "fields": {
        "text": {}
      },
      boundary_chars:".,!? \t\n།་"
    },
    query: {
      match: {
        text: searchTerm
      }
    }
  })

  res.send({ result: result, searchTerm:searchTerm })
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
