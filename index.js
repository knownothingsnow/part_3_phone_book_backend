require('dotenv').config()
const express = require('express')
const morgan = require('morgan')
const cors = require('cors')
const Person = require('./models/mongo')

const app = express()
app.use(express.json())
morgan.token('body', (req, res) => JSON.stringify(req.body))
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :body - :req[content-length]'))
app.use(cors())
app.use(express.static('build'))

let persons = [
  {
    name: 'Arto Hellas',
    number: '040-123456',
    id: 1
  },
  {
    name: 'Ada Lovelace',
    number: '39-44-5323523',
    id: 2
  },
  {
    name: 'n',
    number: '12-43-234345',
    id: 3
  },
  {
    name: 'Mary Poppendieck',
    number: '39-23-6423122',
    id: 4
  }
]

app.get('/', (req, res) => {
  res.send('<h1>Hello World!</h1>')
})

app.get('/api/persons', (req, res) => {
  Person.find({}).then((persons) => {
    res.json(persons)
  })
})

app.get('/api/persons/:id', (req, res) => {
  // const id = parseInt(req.params.id)
  const id = req.params.id
  Person.findById(id).then(p => {
    if (p) {
      res.json(p).send()
    } else {
      res.status(404).end()
    }
  })
})

app.delete('/api/persons/:id', (req, res) => {
  const id = Number(req.params.id)
  persons = persons.filter((note) => note.id !== id)
  res.status(204).end()
})

// function getRandomInt (min, max) {
//   min = Math.ceil(min)
//   max = Math.floor(max)
//   return Math.floor(Math.random() * (max - min) + min)
// }

app.post('/api/persons', (req, res) => {
  const aPerson = req.body
  if (!aPerson.name) {
    res.status(403).send({ error: 'name is required' })
    return
  }
  if (!aPerson.number) {
    res.status(403).send({ error: 'number is required' })
    return
  }
  Person.find({}).then((persons) => {
    if (persons.find(p => p.name === aPerson.name)) {
      res.status(403).send({ error: 'name must be unique' })
    }
  }).then(res => new Person(aPerson).save())
    .then(result => {
      // console.log(`add ${person.name} number ${person.number} to phonebook`)
      res.json(result)
    })
})

app.get('/info', (req, res) => {
  Person.find({}).then(result => {
    res.send(`
      <div>Phonebook has info for ${result.length} people</div>
      <div>${new Date()}</div>
    `)
  })
})

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
