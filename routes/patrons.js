'use strict';

/**
 * API DESCRIPTION
 * 
 * /patrons                   - GET  | Lists all patrons
 * /patrons/add               - GET  | Generates an empty form to add a new patron 
 * /patrons/add               - POST | Adds a new patron form
 * /patrons/:id               - GET  | Returns the results of a patron
 * /patrons/:id               - POST | Edits new information of a patron
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
 * GET all patrons
 * Route: /patrons
 * 
 * Renders all patrons
 */
router.get('/', function (req, res) {
    var search = req.query.search; // GET parameter 'search in the query URL

    // Set a blank search string in case it didn't exist in the request as a parameter
    if (!search) {
        search = '';
    }

    Patron.findAll({
            where: {
                $or: [{
                    first_name: {
                        like: '%' + search + '%'
                    }
                }, {
                    last_name: {
                        like: '%' + search + '%'
                    }
                }, {
                    library_id: {
                        like: '%' + search + '%'
                    }
                }, {
                    email: {
                        like: '%' + search + '%'
                    }
                }]
            }
        })
        .then(function (patrons) {
            res.render('patrons/patrons', {
                title: 'Patrons',
                patrons: patrons,
                search: search
            });
        });
});

/**
 * GET form to add a new patron
 * Route: /patrons/add
 * 
 * Loads a form to introduce a new patron entry
 */
router.get('/add', function (req, res) {
    res.render('patrons/patrons_addNew', {
        title: 'New Patron',
        patron: Patron.build()
    });
});

/**
 * POST new entry in the patrons database
 * Route: /patrons/add
 * 
 * Adds a new patron entry in the database
 */
router.post('/add', function (req, res) {
    Patron.create(req.body)
        .then(function (patron) {
            res.redirect('/patrons');
        })
        .catch(function (err) {
            if (err.name === 'SequelizeValidationError') {
                res.render('patrons/patrons_addNew', {
                    title: "New Patron",
                    patron: Patron.build(),
                    errors: err.errors
                });
            } else {
                throw err;
            }
        })
        .catch(function (err) {
            res.send(500);
        });
});

/**
 * GET patron details
 * Route: /patrons/:id
 * 
 * Renders the details of a patron, specified by its id
 */
router.get('/:id', function (req, res) {
    var patronData;
    Patron.findById(req.params.id)
        .then(function (patron) {
            patronData = patron;
            return Loan.findAll({
                include: [Book, Patron],
                where: {
                    patron_id: patron.id
                }
            });
        })
        .then(function (loans) {
            res.render('patrons/patrons_details', {
                title: patronData.first_name + " " + patronData.last_name,
                patron: patronData,
                loans: loans
            });
        });
});

/**
 * POST patron details
 * Route: /patrons/:id
 * 
 * Updates a patron record 
 */
router.post('/:id', function (req, res) {
    var editedPatron;
    Patron.findById(req.params.id)
        .then(function (patron) {
            if (patron) {
                editedPatron = patron;
                return patron.update(req.body);
            } else {
                res.send(404);
            }
        })
        .then(function (patron) {
            res.redirect('/patrons');
        })
        .catch(function (err) {
            if (err.name === 'SequelizeValidationError') {
                Loan.findAll({
                        include: [Book, Patron],
                        where: {
                            patron_id: editedPatron.id
                        }
                    })
                    .then(function (loans) {
                        res.render('patrons/patrons_details', {
                            title: editedPatron.first_name + " " + editedPatron.last_name,
                            patron: editedPatron,
                            loans: loans,
                            errors: err.errors
                        });
                    });
            } else {
                throw err;
            }
        })
        .catch(function (err) {
            res.send(500);
        });
});

module.exports = router;