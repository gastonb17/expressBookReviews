const express = require('express');
const jwt = require('jsonwebtoken');
const session = require('express-session')
const customer_routes = require('./router/auth_users.js').authenticated;
const genl_routes = require('./router/general.js').general;

const app = express();

app.use(express.json());

app.use("/customer",session({secret:"fingerprint_customer",resave: true, saveUninitialized: true}))

app.use("/customer/auth/*", function auth(req, res, next) {
    // ... tu código existente
    if (req.session.authorization && req.session.authorization.accessToken) {
        const token = req.session.authorization.accessToken;
    
        console.log("Token recibido en middleware:", token); // Agrega este log
    
        jwt.verify(token, "access", (err, decoded) => {
          if (!err) {
            req.user = decoded;  // Almacena la información del usuario en req.user
            next();
          } else {
            console.log("Error al verificar el token:", err); // Agrega este log
            return res.status(403).json({ message: "User not authenticated" });
          }
        });
      } else {
        return res.status(403).json({ message: "User not logged in" + token });
      }
});
 
const PORT =5000;

app.use("/customer", customer_routes);
app.use("/", genl_routes);

app.listen(PORT,()=>console.log("Server is running"));
