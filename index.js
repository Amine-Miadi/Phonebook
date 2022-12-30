require('dotenv').config()
const Person = require('./models/mongo.js')
const { json } = require('express')
const express = require('express')
const morgan = require('morgan')
const cors = require('cors')



const app = express()
const PORT = process.env.PORT


var persons = 
[
    { 
      "id": 1,
      "name": "Arto Hellas", 
      "number": "040-123456"
    },
    { 
      "id": 2,
      "name": "Ada Lovelace", 
      "number": "39-44-5323523"
    },
    { 
      "id": 3,
      "name": "Dan Abramov", 
      "number": "12-43-234345"
    },
    { 
      "id": 4,
      "name": "Mary Poppendieck", 
      "number": "39-23-6423122"
    }
]
app.use(express.static('build'))
app.use(express.json())

morgan.token('data', function getData (req) {
    const body = JSON.stringify(req.body);
    return body})


app.use(morgan(' :method :url :status :res[content-length] - :response-time ms :data'))
app.use(cors())

app.get('/api/persons',(req,res)=>{
    Person.find({})
        .then(ppl => {
            console.log(ppl)
            res.json(ppl)
        })
})

app.get('/info',(req,res)=>{
    const date = new Date();
    var people = null
    Person.find({})
        .then(ppl => {
            people = ppl
            res.send(
                `Phonebook has info for ${people.length} people <br />
                ${date}`
            )
        })
})

app.get('/api/persons/:id',(req,res,next)=>{
    Person.findById(req.params.id)
        .then(person => {
            if(person){
                res.json(person)
            }
            else{res.status(404).end()}
        })
        .catch(error => next(error))
})

app.delete('/api/persons/:id',(req,res)=>{
    Person.findByIdAndRemove(req.params.id)
        .then(person => res.json(person))
})

app.post('/api/persons',(req,res)=>{
    const body = req.body
    var people = null
    Person.find({}).then(ppl => {
        people = ppl
        if (!body.name) {
            return res.status(400).json({ 
            error: 'name is missing' 
            })
        }else if (!body.number){
            return res.status(400).json({ 
                error: 'number is missing' 
            })
        }else if(people.find(person => person.name === body.name)){
            return res.status(400).json({ 
                error: 'name must be unique' 
            })
        }
        const person = new Person ({ 
            "name": body.name, 
            "number": body.number
        })
        person.save().then(person => 
            res.json(person)
        )
    })
})

app.put('/api/persons/:id', (req, res, next) => {
    const body = req.body
  
    const person = {
      name: body.name,
      number: body.number,
    }
  
    Person.findByIdAndUpdate(req.params.id, person, { new: true })
      .then(updatedPerson => {
        res.json(updatedPerson)
      })
      .catch(error => next(error))
})


const unknownEndpoint = (req, res) => {
    res.status(404).send({ error: 'unknown endpoint' })
}
  

app.use(unknownEndpoint)



const errorHandler = (error, req, res, next) => {
    console.error(error.message)
  
    if (error.name === 'CastError') {
      return res.status(400).send({ error: 'malformatted id' })
    } 
  
    next(error)
}
app.use(errorHandler)


app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})