const mongoose = require('mongoose')

if (process.argv.length < 3) {
  console.log('Please provide the password as an argument: node mongo.js <password>')
  process.exit(1)
}

const password = process.argv[2]

const url =
  `mongodb://yang:${encodeURIComponent(password)}@cluster0-shard-00-01.lh9w3.mongodb.net:27017/phone-book?ssl=true&replicaSet=Main-shard-0&authSource=admin&retryWrites=true`
// https://stackoverflow.com/questions/55499175/how-to-fix-error-querysrv-erefused-when-connecting-to-mongodb-atlas
mongoose.connect(url, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useFindAndModify: false,
  useCreateIndex: true
})

const phonebookSchema = new mongoose.Schema({
  name: String,
  number: String,
  id: Number
})

const Person = mongoose.model('Person', phonebookSchema)

const person = new Person({
  name: process.argv[3],
  number: process.argv[4]
  // id: true
})

person.save().then(result => {
  console.log(`add ${person.name} number ${person.number} to phonebook`)
  mongoose.connection.close()
})
