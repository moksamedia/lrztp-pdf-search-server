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

app.get('/elasticsearch-health', cors(corsOptions), async (req, res) => {

  try {

    const result = await client.healthReport()

    console.log("HEALTH RESULT=:"+JSON.stringify(result,null,2))

    res.send({ result: result })
  }
  catch (e){
    console.error(e)
    res.status(500).send("ERROR: " + e)
  }
})

app.post('/', cors(corsOptions), async (req, res) => {

  try {

    const query = req.body.query

    console.log("query="+JSON.stringify(query, null, 2))

    const result = await client.search(query)

    //console.log("RESULT=:"+JSON.stringify(result,null,2))

    res.send({ result: result })
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
    const from = req.body.from
    const highlight = req.body.highlight;
    const index = req.body.index;

    console.log("index="+index)
    console.log("query="+JSON.stringify(query))
    console.log("highlight="+JSON.stringify(highlight))
    console.log(`from=${from}, size=${size}`)

    const params = {
      index: index,
      highlight: highlight,
      query: query,
      size: size,
      from: from
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
