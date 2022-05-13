const mongoose = require('mongoose');
const cities = require('./cities')
const Campground = require('../models/campground');
const {places, descriptors} = require('./seedHelpers')

mongoose.connect('mongodb://localhost:27017/yelp-camp', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error'));
db.once('open', () => {
  console.log('Database connected!')
});

const sample = array => array[Math.floor(Math.random() * array.length)];

const seedDB = async () => {
  await Campground.deleteMany();
  for(let i = 0; i < 300; i++){
    const random1000 = Math.floor(Math.random() * 1000)
    const price = Math.floor(Math.random() * 20) + 10
    const camp = new Campground({
      author: '627d6adb135190e2f21c7a92',
      location: `${cities[random1000].city}, ${cities[random1000].state}`,
      title: `${sample(descriptors)} ${sample(places)}`,
      description: 'Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.',
      price: price,
      geometry: {
        type: 'Point',
        coordinates: [
          cities[random1000].longitude,
          cities[random1000].latitude
        ]
      },
      images: [
    {
      url: 'https://res.cloudinary.com/dhyb9k5rb/image/upload/v1652410249/YelpCamp/mo3hsugvplmjwirvvhil.jpg',
      filename: 'YelpCamp/mo3hsugvplmjwirvvhil',
    },
    {
      url: 'https://res.cloudinary.com/dhyb9k5rb/image/upload/v1652410249/YelpCamp/odlq42ffh3kgw2psekzh.jpg',
      filename: 'YelpCamp/odlq42ffh3kgw2psekzh',
    },
    {
      url: 'https://res.cloudinary.com/dhyb9k5rb/image/upload/v1652410252/YelpCamp/aplotiurruz5rrudfeui.jpg',
      filename: 'YelpCamp/aplotiurruz5rrudfeui',
    }
  ]
    })
    await camp.save()
  }
}

seedDB().then(() => {
  mongoose.connection.close()
})
