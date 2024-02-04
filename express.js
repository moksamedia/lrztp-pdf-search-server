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

app.use(cors())
app.use(express.json()) // for parsing application/json
app.use(express.urlencoded({ extended: true })) // for parsing application/x-www-form-urlencoded


app.options('*', cors(corsOptions))

app.get('/', cors(corsOptions), async (req, res) => {
  res.status(200).send('OK');
})

app.post('/', cors(corsOptions), async (req, res) => {

  try {
    const searchTerm = req.body.searchTerm
    const highlight = req.body.highlight ? req.body.highlight : {
      fields: {
        text: {}
      },
      boundary_chars:".,!? \t\n།",
      fragment_size: 70
    };

    console.log("searchTerm="+searchTerm)
    console.log("highlight="+JSON.stringify(highlight))

    const result = await client.search({
      index: INDEX,
      highlight: highlight,
      query: {
        match_phrase: {
          text: searchTerm
        }
      }
    })

    //console.log("RESULT=:"+JSON.stringify(result,null,2))

    res.send({ result: result, searchTerm:searchTerm })
  }
  catch (e){
    console.error(e)
    res.status(500).send("ERROR: " + e)
  }
})

app.post('/colloquial', cors(corsOptions), async (req, res) => {

  try {
    const query = req.body.query
    const size = req.body.size
    const highlight = req.body.highlight;

    console.log("query="+JSON.stringify(query))
    console.log("highlight="+JSON.stringify(highlight))

    const params = {
      index: 'all_colloquial_dicts',
      highlight: highlight,
      query: query,
      size: size
    }

    console.log(params)

    const result = await client.search(params)

    //console.log("RESULT=:"+JSON.stringify(result,null,2))

    res.send({ result: result })
  }
  catch (e){
    console.error(e)
    res.status(500).send("ERROR: " + e)
  }
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
