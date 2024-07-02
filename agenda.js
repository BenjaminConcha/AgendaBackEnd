const express = require('express')
const morgan = require('morgan')
const cors = require('cors')
const dotenv = require('dotenv');

dotenv.config();

const Person = require('./models/person')
// const path = require('path')

// const fs = require('fs')


const app = express()

app.use(express.static('dist'));

app.use(express.json());

// const accessLogStream = fs.createWriteStream(path.join(__dirname, 'access.log'), { flags: 'a' });
morgan.token('type', function (req, res) {
  return req.headers['content-type'];
});

app.use(morgan(':method :url :status :res[content-length] - :response-time ms :type'));

app.use(cors())
// // Configura Morgan para usar el flujo de escritura
// app.use(morgan('tiny', { stream: accessLogStream }));

const requestLogger = (request, response, next) => {
  console.log('Method:', request.method)
  console.log('Path:  ', request.path)
  console.log('Body:  ', request.body)
  console.log('---')
  next()
}

app.use(requestLogger)

let persons = [
]

app.get('/api/people', (request, response) => {
  Person.find({}).then(people => {
    response.json(people)
  })
})


app.get('/info', (request, response) => {
  const currentDate = new Date();
    response.send(`<p>Phonebook has info for ${persons.length} people</p> <p>${currentDate}</p>`)
  })

  app.get('/api/persons/:id', (request, response) => {
    const id = Number(request.params.id)
    console.log(id)
    const person = persons.find(person => {
        console.log(person.id, typeof person.id, id, typeof id, person.id === id)
        return person.id === id
      })
    console.log(person)
    if (person) {
        response.json(person)
      } else {
        response.status(404).end()
      }
  })

  app.delete('/api/persons/:id', (request, response) => {
    const id = Number(request.params.id)
    persons = persons.filter(person => person.id !== id)
  
    response.status(204).end()
  })
  
  const generateId = () => {
    let newId;
    do {
        newId = Math.floor(Math.random() * 999);
    } while (persons.some(person => person.id === newId));
    return newId;
}
  
  app.post('/api/persons', (request, response) => {
    console.log(request.body)
    const body = request.body
  
    if (!body.name) {
      return response.status(400).json({ 
        error: 'name is required'
      })
    }

    const nameExists = persons.some(person => person.name === body.name);
    if (nameExists) {
        return response.status(400).json({ 
            error: 'name must be unique'
        });
    }
  
    const person = {
      name: body.name,
      number: body.number,
      id: generateId(),
    }

    console.log(person)
  
    persons = persons.concat(person)
  
    response.json(person)
  })


  const PORT = process.env.PORT || 3001
app.listen(PORT)
console.log(`Server running on port ${PORT}`)