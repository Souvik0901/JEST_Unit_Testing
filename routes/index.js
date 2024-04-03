/* Importing the express module and the auth module. */
import express from 'express';
import core from './router';

/* Creating a new router object. */
const router = express.Router();

/* Using the auth router for all routes that begin with `/auth`. */
router.use('/core', core);

/* Exporting the router object so that it can be used in other files. */
export default router;
