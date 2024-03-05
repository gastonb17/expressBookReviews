const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];


const isValid = (username)=>{ //returns boolean

    let userswithsamename = users.filter((user)=>{
      return user.username === username
    });
    if(userswithsamename.length > 0){
      return true;
    } else {
      return false;
    }
}

const authenticatedUser = (username,password)=>{ //returns boolean
    let validusers = users.filter((user)=>{
      return (user.username === username && user.password === password)
    });
    if(validusers.length > 0){
      return true;
    } else {
      return false;
    }
  }

//only registered users can login
regd_users.post("/login", (req,res) => {
  const username = req.body.username;
  const password = req.body.password;
  if (!username || !password) {
      return res.status(404).json({message: "Error logging in"});
  }
 if (authenticatedUser(username,password)) {
    let accessToken = jwt.sign({
      data: password
    }, 'access', { expiresIn: 60 * 60 });
    req.session.authorization = {
      accessToken,username
  }
  return res.status(200).send("User successfully logged in");
  } else {
    return res.status(208).json({message: "Invalid Login. Check username and password"});
  }});

// Add a book review
// En auth_users.js

regd_users.put("/auth/review/:isbn", (req, res) => {
  const username = req.session.authorization?.username; // Obtén el nombre de usuario desde la sesión
  const isbn = req.params.isbn;
  const reviewText = req.body.review;

  if (!username || !isbn || !reviewText) {
    return res.status(400).json({ message: "Missing required parameters" });
  }

  // Busca si el usuario ya tiene una reseña para el mismo ISBN
  const existingReviewIndex = users.findIndex(user => user.username === username && user.reviews && user.reviews.some(review => review.isbn === isbn));

  if (existingReviewIndex !== -1) {
    // Si existe una reseña del mismo usuario para el mismo ISBN, actualiza la reseña
    const existingReview = users[existingReviewIndex].reviews.find(review => review.isbn === isbn);
    if (existingReview) {
      existingReview.text = reviewText;
    } else {
      return res.status(500).json({ message: "Unexpected error updating review" });
    }
  } else {
    // Si no existe una reseña del mismo usuario para el mismo ISBN, agrega una nueva reseña
    const userIndex = users.findIndex(user => user.username === username);
    if (userIndex !== -1) {
      if (!users[userIndex].reviews) {
        users[userIndex].reviews = [];
      }
      const newReview = { isbn, text: reviewText };
      users[userIndex].reviews.push(newReview);
    } else {
      // Si el usuario no existía en el array, agrégalo
      const user = { username, reviews: [{ isbn, text: reviewText }] };
      users.push(user);
    }
  }

  return res.status(200).json({ message: "Review successfully added or modified" });
});


regd_users.delete("/auth/review/:isbn", (req, res) => {
  const username = req.session.authorization?.username;
  const isbn = req.params.isbn;

  if (!username || !isbn) {
    return res.status(400).json({ message: "Missing required parameters" });
  }

  // Busca si el usuario tiene una reseña para el mismo ISBN
  const userIndex = users.findIndex(user => user.username === username && user.reviews && user.reviews.some(review => review.isbn === isbn));

  if (userIndex !== -1) {
    // Filtra las reseñas del usuario para el mismo ISBN y elimina la reseña
    const user = users[userIndex];
    user.reviews = user.reviews.filter(review => review.isbn !== isbn);

    return res.status(200).json({ message: "Review successfully deleted" });
  } else {
    return res.status(404).json({ message: "Review not found or user not authorized to delete" });
  }
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
