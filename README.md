create `.env` file and add required information

PORT=8000

DATABASE=your mongoDB URL

JWT_SECRET=add your JWT secret

SENDGRID_API_KEY=add sendgrid api key for email notification

CLOUDINARY_CLOUD_NAME=

CLOUDINARY_API_KEY=

CLOUDINARY_API_SECRET=


API Link: [https://app.theneo.io/0950402d-a24c-49c4-9f69-4571eec54c7b/e-learning](https://app.theneo.io/0950402d-a24c-49c4-9f69-4571eec54c7b/e-learning)


# `Live Demo: ` [https://e-learning-hf54.onrender.com](https://e-learning-hf54.onrender.com)

You can test any api by refering `API Link` provided above 

open Postman API and select GET or PUT or POST or DELETE request and copy `Live Demo` link and add endpoint and add data in body 
and required information in Header

Ex: For Login ====>  POST | https://e-learning-hf54.onrender.com/api/auth/login

In Body add : 
{
  "email": "your email@gmail.com",
  "password": "Your Password"
}
Then send the Request.

Don't forget to copy the generated token, because it is required for user profile update, course registration, logout
