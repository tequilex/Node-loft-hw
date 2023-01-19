require('dotenv').config()
const express = require('express')

const app = express()

const LIMIT = process.env.LIMIT || 5;
const DELAY = process.env.DELAY || 1000;
const PORT = process.env.PORT || 3000;

let date
let connections = [];

app.get('/date', (req, res, next) => {
  res.setHeader('Content-Type', 'text/html; charset=utf-8')
  res.setHeader('Transfer-Encoding', 'chunked')
  connections.push(res)
})

let tick = 0;

setTimeout(function run() {
  date = new Date().toTimeString()
  console.log(tick, '--- ', date);
  if(++tick > LIMIT) {
    connections.map(res => {
      res.write(`Время завершения ${date}`)
      res.end()
    })
    connections = []
    tick = 0;
  }
  connections.map((res, i) => {
    res.write(`${date}\n`)
  })
  setTimeout(run, DELAY)
}, DELAY)



app.listen(PORT, () => {
  console.log(`Server is running on ${PORT} port`);
})

// curl http://localhost:3000/date