// const mongoose = require('mongoose')

// if (process.argv.length<3) {
//   console.log('give password as argument')
//   process.exit(1)
// }

// let password = process.argv[2]

// const url =
//   `mongodb+srv://BenjaminConcha:${password}@cluster0.wcvg3kj.mongodb.net/PhonebookApp?retryWrites=true&w=majority&appName=Cluster0`

// mongoose.set('strictQuery',false)

// mongoose.connect(url)

// const personSchema = new mongoose.Schema({
//   name: String,
//   number: String, 
// })

// const Person = mongoose.model('Person', personSchema)

// const person = new Person({
//   name: 'Farna Medka',
//   number: 3525684,
// })

// person.save().then(result => {
//   console.log('Person saved!')
  
// })

// Person.find({}).then(persons => {
//     persons.forEach(person => {
//     console.log(person)
//     mongoose.connection.close()
//   })
  
// })