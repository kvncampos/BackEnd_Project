# BackEnd MicroServices
This project consists of a set of microservices built using Node.js and Express.js. Below is an overview of the project structure and functionality of each microservice:

## Project Structure
The project consists of the following files and directories:

- DB: Contains database-related files.
- uploads: Directory for file uploads.
- views: Contains HTML files for the microservice landing pages.
- index.js: Entry point for the application.
- .env: Configuration file for environment variables.
- README.md: This file.

## Microservices Overview

1. Timestamp Microservice
Routes:
/timestamp: HTML router.
/timestamp/api/: API endpoints for timestamp functionality.
/timestamp/api/: Returns current UTC and UNIX timestamp.
/timestamp/api/:date: Returns UTC and UNIX timestamp for the provided date.
2. Request Header Parser Microservice
Routes:
/requestHeaderParser/api/whoami: Returns IP address, user agent (software), and preferred language.
3. URL Shortener Microservice
Routes:
/urlShortenerMicroservice: HTML router.
/api/shorturl/all: Get all short URLs stored in the database.
/api/shorturl: POST endpoint to shorten a URL.
/api/shorturl/:code: GET endpoint to redirect to the original URL using the short code.
/api/shorturl/:shortcode: PUT and DELETE endpoints to update or delete a short URL.
4. Exercise Tracker Microservice
Routes:
/exerciseTrackerMicroservice: HTML router.
/exerciseTrackerMicroservice/api/users: GET all users or CREATE a new user.
/exerciseTrackerMicroservice/api/users/:_id/logs: GET logs for a specific user.
/exerciseTrackerMicroservice/api/users/:_id/exercises: POST a new exercise for a user.
/exerciseTrackerMicroservice/api/users/:_id/delete: DELETE a user.
5. File Metadata Microservice
Routes:
/fileMetadataMicroservice: HTML router.
/fileMetadataMicroservice/api/fileanalyse: POST endpoint to upload a file and retrieve metadata.
Setting Up the Project
Install dependencies: Run npm install.
Configure environment variables: Create a .env file and set up necessary variables.
Start the server: Run npm start.

## Notes
- The project utilizes Express.js for routing and middleware handling.
- Multer is used for file uploads in the File Metadata Microservice.
- MongoDB is used as the database for storing short URLs and exercise tracker data.
