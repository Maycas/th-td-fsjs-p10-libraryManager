'use strict';

/**
 * API DESCRIPTION
 * 
 * /loans                   - GET   | Lists all loans
 * /loans?filter=overdue    - GET   | Lists all loans filtered by the ones that are overdue
 * /loans?filter=checked    - GET   | Lists all loans filtered by the ones that were checked out
 * /loans/add               - GET   | Generate an empty form to add a new loan
 * /loans/add               - POST  | Adds a new loan entry
 * /loans/:id               - GET   | Shows the information of a loan and allows the user to input a returned book date
 * /loans/:id               - POST  | Updates the returned_on date of a loan 
 */

// Required app modules
var express = require('express');
var router = express.Router();

// Database Models
var Book = require('../models').Book;
var Patron = require('../models').Patron;
var Loan = require('../models').Loan;

// Moment.js library to handle Updates
var moment = require('moment');


/**
 * GET all loans
 * Route: /loans
 * 
 * Gets all the list of loans. It also allows filtering by loans that are overdue or checked out books.
 */
router.get('/', function (req, res) {
    var title;
    var filter = req.query.filter; // GET parameter 'filter' in the query URL

    switch (filter) {
        case 'overdue':
            // GET params: filter=overdue
            title = 'Overdue Loans';
            Loan.findAll({
                    include: [Book, Patron],
                    where: {
                        return_by: {
                            $lt: moment().format('YYYY-MM-DD') // return by date was time ago
                        },
                        returned_on: null // book not returned yet
                    }
                })
                .then(function (loans) {
                    res.render('loans/loans', {
                        title: title,
                        loans: loans
                    });
                });
            break;
        case 'checked':
            // GET params: filter=checked
            title = 'Checked Out Loans';
            Loan.findAll({
                    include: [Book, Patron],
                    where: {
                        returned_on: null //book not returned yet
                    }
                })
                .then(function (loans) {
                    res.render('loans/loans', {
                        title: title,
                        loans: loans
                    })
                });
            break;
        default:
            // No GET params
            title = 'Loans';
            Loan.findAll({
                    include: [Book, Patron]
                })
                .then(function (loans) {
                    res.render('loans/loans', {
                        title: title,
                        loans: loans
                    });
                })
            break;
    }
});


/**
 * GET form to add a new loan entry
 * Route: /loans/add
 * 
 * Loads a form to introduce a new loan entry
 */
router.get('/add', function (req, res) {

    // Build a mock loan
    var loan = Loan.build({
        loaned_on: moment().format('YYYY-MM-DD'),
        return_by: moment().add(7, 'days').format('YYYY-MM-DD')
    });

    console.log(loan.loaned_on);

    // Render the form for a new loan
    renderNewLoanForm(res, loan);
});

/**
 * POST new entry in the loans database
 * Route: /loans/add
 * 
 * Creates a new loan entry in the loan database
 */
router.post('/add', function (req, res) {
    Loan.create(req.body)
        .then(function (loan) {
            res.redirect('/loans');
        })
        .catch(function (err) {
            if (err.name === 'SequelizeValidationError') {
                var loan = Loan.build(req.body);
                renderNewLoanForm(res, loan, err);
            } else {
                throw err;
            }
        })
        .catch(function (err) {
            res.send(500);
        });
});

/**
 * GET information of a specific loan
 * Route: /loans/:id
 * 
 * Gets the details of a loan, specified by its id
 */
router.get('/:id', function (req, res) {
    renderReturnLoanForm(req, res);
});

/**
 * POST Update loan details
 * Route: /loans/:id
 * 
 * Updates the details of a loan
 */
router.post('/:id', function (req, res) {
    Loan.findById(req.params.id)
        .then(function (loan) {
            if (loan) {
                return loan.update(req.body);
            } else {
                res.send(404);
            }
        })
        .then(function (loan) {
            res.redirect('/loans');
        })
        .catch(function (err) {
            if (err.name === 'SequelizeValidationError') {
                renderReturnLoanForm(req, res, err);
            } else {
                throw err;
            }
        })
        .catch(function (err) {
            res.send(500);
        });
});

/**
 * @name renderNewLoanForm
 * @description Renders the 'Add New Form' page with the information of a given loan
 * 
 * @param {Object} res  - Express' response object 
 * @param {Object} loan - Loan object to render
 * @param {Array} err   - Errors occurred during the request to the database
 */
function renderNewLoanForm(res, loan, err) {
    var booksList;
    var patronsList;

    // In case the function is called without errors, set a blank list of errors so it doesn't break the template
    if (!err) {
        err = [];
    }

    // Perform requests to get the booksList, the patronsList and render the page
    Book.findAll() // Get all the books list
        .then(function (books) {
            booksList = books;
            return Patron.findAll(); // Once the books are found, get the patrons list
        })
        .then(function (patrons) {
            patronsList = patrons;
            res.render('loans/loans_addNew', {
                title: 'New Loan',
                loan: loan,
                books: booksList,
                patrons: patronsList,
                errors: err.errors
            });
        });
}

/**
 * @name renderReturnLoanForm
 * @description Renders the 'Return Book' page with all the information needed
 * 
 * @param {Object} res  - Express' response object 
 * @param {Object} loan - Loan object to render
 * @param {Array} err   - Errors occurred during the request to the database
 */
function renderReturnLoanForm(req, res, err) {
    // In case the function is called without errors, set a blank list of errors so it doesn't break the template
    if (!err) {
        err = [];
    }

    // Call for loan information and render the template
    Loan.findById(req.params.id, {
            include: [Book, Patron]
        })
        .then(function (loan) {
            // Pre-set the loan returned on date with the current date
            loan.returned_on = moment().format('YYYY-MM-DD');

            // Render the page
            res.render('loans/loans_return', {
                title: 'Patron: Return Book',
                loan: loan,
                errors: err.errors
            });
        });
}

module.exports = router;