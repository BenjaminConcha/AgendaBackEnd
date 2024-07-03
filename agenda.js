const express = require("express");
const morgan = require("morgan");
const cors = require("cors");
const dotenv = require("dotenv");

dotenv.config();

const Person = require("./models/person");
// const path = require('path')

// const fs = require('fs')

const app = express();

app.use(express.static("dist"));

app.use(express.json());

// const accessLogStream = fs.createWriteStream(path.join(__dirname, 'access.log'), { flags: 'a' });
morgan.token("type", function (req, res) {
  return req.headers["content-type"];
});

app.use(
  morgan(":method :url :status :res[content-length] - :response-time ms :type")
);

app.use(cors());
// // Configura Morgan para usar el flujo de escritura
// app.use(morgan('tiny', { stream: accessLogStream }));

const requestLogger = (request, response, next) => {
  console.log("Method:", request.method);
  console.log("Path:  ", request.path);
  console.log("Body:  ", request.body);
  console.log("---");
  next();
};

app.use(requestLogger);

let people = [];

app.get("/api/people", (request, response) => {
  Person.find({}).then((people) => {
    response.json(people);
  });
});

app.get("/info", (request, response) => {
  Person.countDocuments({}).then((count) => {
    const currentDate = new Date();
    response.send(
      `<p>Phonebook has info for ${count} people</p> <p>${currentDate}</p>`
    );
  });
});

app.get("/api/people/:id", (request, response, next) => {
  const id = request.params.id;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return response.status(400).send({ error: "Invalid ID format" });
  }

  people.findById(id)
    .then((person) => {
      if (person) {
        response.json(person);
      } else {
        response.status(404).send({ error: "Person not found" });
      }
    })
    .catch((error) => next(error));
});

app.delete("/api/people/:id", (request, response) => {
  const id = request.params.id;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return response.status(400).send({ error: "Invalid ID format" });
  }

  Person.findByIdAndRemove(id)
    .then((result) => {
      if (result) {
        response.status(204).end();
      } else {
        response.status(404).json({ error: "Person not found" });
      }
    })
    .catch((error) => {
      console.error("Error deleting person:", error);
      response.status(500).json({ error: "Internal server error" });
    });
});

//   const generateId = () => {
//     let newId;
//     do {
//         newId = Math.floor(Math.random() * 999);
//     } while (persons.some(person => person.id === newId));
//     return newId;
// }

app.post("/api/people", (request, response, next) => {
  const body = request.body;

  if (!body.name) {
    return response.status(400).json({
      error: "name is required",
    });
  }

  Person.findOne({ name: body.name }).then((existingPerson) => {
    if (existingPerson) {
      return response.status(400).json({
        error: "name must be unique",
      });
    }

    const person = new Person({
      name: body.name,
      number: body.number,
    });

    person
      .save()
      .then((savedPerson) => {
        response.json(savedPerson);
      })
      .catch((error) => next(error));
  });
});


app.put("/api/people/:name", (request, response, next) => {
  const name = request.params.name;
  const body = request.body;

  Person.findOneAndUpdate(
    { name: name },
    { number: body.number },
    { new: true, runValidators: true, context: 'query' }
  )
    .then((updatedPerson) => {
      if (updatedPerson) {
        response.json(updatedPerson);
      } else {
        response.status(404).send({ error: "Person not found" });
      }
    })
    .catch((error) => next(error));
});

const errorHandler = (error, request, response, next) => {
  console.error(error.message);

  if (error.name === "CastError") {
    return response.status(400).send({ error: "malformatted id" });
  }

  next(error);
};

// este debe ser el último middleware cargado, ¡también todas las rutas deben ser registrada antes que esto!
app.use(errorHandler);

const PORT = process.env.PORT || 3001;
app.listen(PORT);
console.log(`Server running on port ${PORT}`);
