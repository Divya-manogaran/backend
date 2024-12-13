const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const authRoutes = require('./routes/authRoutes'); // Make sure file name is correct
const weatherRoutes = require('./routes/weatherRoutes'); // Make sure file name is correct

// Load environment variables from .env file
dotenv.config();

const app = express();

// Middleware
app.use(cors());                      // Enable Cross-Origin Resource Sharing (CORS)
app.use(express.json());               // Parse incoming JSON requests

// Connect to MongoDB using the URI from .env file

const dbURI = 'mongodb+srv://mmdivya2572005:8TrvGWcRGHswVMcf@cluster0.96kdl.mongodb.net/';  // Replace with your MongoDB URI if using a cloud service like MongoDB Atlas

mongoose.connect(dbURI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
.then(() => {
    console.log('Connected to MongoDB');
})
.catch((err) => {
    console.error('Error connecting to MongoDB:', err);
});

// Use routes for user authentication and weather
app.use('/api/auth', authRoutes);          // User auth routes (login, register)
app.use('/api/weather', weatherRoutes);    // Weather-related routes (get weather, manage favorites)

// Global error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send({ message: 'Something went wrong on the server.' });
});

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
