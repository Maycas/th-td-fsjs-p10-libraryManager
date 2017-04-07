'use strict';

/**
 * API DESCRIPTION
 * 
 * /patrons                   - GET  | Lists all patrons
 * 
 * 
 * 
 * 
 */

// Required app modules
var express = require('express');
var router = express.Router();

// Database Models
var Book = require('../models').Book;
var Patron = require('../models').Patron;
var Loan = require('../models').Loan;

/**
 * GET all books
 * Route: /books
 * 
 * Gets all the list of books. It also allows filtering by books that are overdue or checked out books.
 */


module.exports = router;