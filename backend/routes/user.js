const express = require('express');
const cors = require('cors');
const router = express.Router();
const { signupUser, loginUser } = require('../controllers/userController');

const allowedOrigins = ['https://spenny.reeflink.org', 'http://localhost:3000'];

router.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      const message =
        'The CORS policy for this site does not allow access from the specified Origin.';
      return callback(new Error(message), false);
    },
  })
);

router.post('/login', loginUser);
router.post('/signup', signupUser);

module.exports = router;
