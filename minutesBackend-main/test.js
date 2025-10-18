// const http = require('http');

// const options = {
//   hostname: 'mongodb',
//   port: 27017,
//   path: '/',
//   method: 'GET'
// };

// const req = http.request(options, (res) => {
//   console.log(`Status: ${res.statusCode}`);
//   res.setEncoding('utf8');
//   res.on('data', (chunk) => {
//     console.log(`Body: ${chunk}`);
//   });
// });

// req.on('error', (e) => {
//   console.error(`Problem with request: ${e.message}`);
// });

// req.end();

const mongoose = require('mongoose');
console.log(process.env.MONGODB_URI)

// mongoose.connect("mongodb://root:password@localhost:27017/minutesdb", {
mongoose.connect("mongodb://root:password@localhost:27017/minutesdb?authSource=admin", {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {
  console.log('MongoDB connected')

  // Create schema for 'authentication' collection
  const UserSchema = new mongoose.Schema({
    email: String,
    password: String
  });

  const User = mongoose.model('User', UserSchema, 'authentication');

  // Create and save a document (this will create the DB and collection if not exist)
  const sampleMeeting = new User({
    email: "abdullahcheema.macmads@gmail.com",
    password: "password123"
  });

  sampleMeeting.save()
    .then(doc => {
      console.log('User saved:', doc);
      mongoose.connection.close(); // Optional: close connection after save
    })
    .catch(err => console.error('Error saving meeting:', err));


}).catch(err => console.error(err));

