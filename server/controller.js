const redis = require('redis');
const moment = require('moment');

// Create Redis client
const client = redis.createClient(6379);

// Function to check if Redis contains data, and to return correct response
const getData = (request, response) => {
  console.log('requested data')
  // Retrieve date from POST request
  const date = (JSON.parse(request.params.date))
    return client.get(date, (err, data) => {
      if (data) {
        console.log('sending client cached data')
        // If the data exists in the Redis DB, then return it
        return response.json({ source: 'cache', data: JSON.parse(data) });
      }
      // If data doesn't exist, return a 404. 
      console.log('data not found')
      response.sendStatus(404)
    });
}

// Function to post data to Redis
const postData = (request, response) => {
  console.log('received data')
  // Format date to act as the key
  const date = moment().format('L')
  .split("")
  .filter((n) => n !== '/' )
  .join("")
  // Set body of request to key in db
  client.setex(date, 3600, JSON.stringify(request.body));
  response.sendStatus(201)
}

module.exports = { getData, postData }