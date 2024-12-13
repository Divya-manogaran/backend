const express = require('express');
const axios = require('axios');
const jwt = require('jsonwebtoken');
const City = require('../models/weather');
const User = require('../models/user');
const router = express.Router();

// Middleware to protect routes (JWT authentication)
const authenticate = (req, res, next) => {
const token = req.headers['authorization']?.split(' ')[1];
if (!token) return res.status(403).json({ error: 'Access denied' });

jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
if (err) return res.status(403).json({ error: 'Invalid token' });
req.userId = decoded.userId;
next();
});
};
router.get('/forecast', async (req, res) => {
  const { city } = req.query;
  if (!city) {
      return res.status(400).json({ message: 'City is required' });
  }
  try {
      const apiKey = 'd8a4245c451335b27fa5665cc474bbd2'; // Use a valid API key
      const weatherData = await axios.get(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}`);
      res.status(200).json(weatherData.data);
  } catch (error) {
      res.status(500).json({ message: 'Error fetching weather data' });
  }
});

// Export the router
module.exports = router;

// Add a city to favorites
router.post('/favorite', authenticate, async (req, res) => {
const { name, country } = req.body;
const city = new City({ name, country });
await city.save();

const user = await User.findById(req.userId);
user.favoriteCities.push(city._id);
await user.save();

res.status(201).json(city);
});

// Get all favorite cities
router.get('/favorites', authenticate, async (req, res) => {
const user = await User.findById(req.userId).populate('favoriteCities');
res.json(user.favoriteCities);
});

// Delete a city from favorites
router.delete('/favorite/:id', authenticate, async (req, res) => {
const { id } = req.params;
await City.findByIdAndDelete(id);

const user = await User.findById(req.userId);
user.favoriteCities = user.favoriteCities.filter(cityId => cityId.toString() !== id);
await user.save();

res.json({ message: 'City removed from favorites' });
});

module.exports = router;