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

app.get('/', (req, res) => {
  res.send('<h1>Hello World!</h1>')
})

app.get('/api/persons', (req, res) => {
  Person.find({}).then((persons) => {
    res.json(persons)
  })
})

app.get('/api/persons/:id', (req, res, next) => {
  const id = req.params.id
  Person.findById(id).then(p => {
    if (p) {
      res.json(p).send()
    } else {
      res.status(404).end()
    }
  }).catch(err => next(err))
})

app.delete('/api/persons/:id', (req, res, next) => {
  const id = req.params.id
  Person.findByIdAndRemove(id).then(result => {
    res.status(204).end()
  })
    .catch(error => next(error))
})

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

app.put('/api/persons/:id', (req, res) => {
  const id = req.params.id
  const aPerson = req.body
  if (!aPerson.name) {
    res.status(403).send({ error: 'name is required' })
    return
  }
  if (!aPerson.number) {
    res.status(403).send({ error: 'number is required' })
    return
  }
  Person.find({})
    .then((persons) => Person.findByIdAndUpdate(id, aPerson, { new: true }))
    .then(result => {
      console.log(`add ${aPerson.name} number ${aPerson.number} to phonebook`)
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

const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: 'unknown endpoint' })
}

app.use(unknownEndpoint)

const errorHandler = (error, request, response, next) => {
  console.error(error.message)

  if (error.name === 'CastError' && error.kind == 'ObjectId') {
    return response.status(400).send({ error: 'malformatted id' })
  }

  next(error)
}

app.use(errorHandler)

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
