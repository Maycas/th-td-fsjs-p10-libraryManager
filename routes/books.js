'use strict';

/**
 * API DESCRIPTION
 * 
 * /books                   - GET   | Lists all books
 * /books?filter=overdue    - GET   | Lists all books filtered by the ones that are overdue
 * /books?filter=checked    - GET   | Lists all books filtered by the ones that were checked out
 * /books/add               - GET   | Generate an empty form to add a new book
 * /books/add               - POST  | Adds a new book entry
 * /book/:id                - GET   | Returns the results of a book
 * /book/:id                - POST  | Updates a book entry
 */

// Required app modules
var express = require('express');
var router = express.Router();

// Database Models
var Book = require('../models').Book;
var Patron = require('../models').Patron;
var Loan = require('../models').Loan;

// Other libraries used
var moment = require('moment');
var tools = require('../utilities/tools');

/**
 * GET all books
 * Route: /books
 * 
 * Renders a list of books. It also allows filtering by books that are overdue or checked out books.
 */
router.get('/', function (req, res) {
    var title; // Page title
    var filter = req.query.filter; // GET parameter 'filter' in the query URL
    var page = req.query.page; // GET parameter 'page' in the query URL
    var search = req.query.search; // GET parameter 'search in the query URL

    // Add a first page in case it didn't exist in the request as a parameter
    if (!page) {
        page = 1;
    }
    var offset = (page - 1) * tools.pagination.resultsLimit; // Offset calculation

    // Set a blank search string in case it didn't exist in the request as a parameter
    if (!search) {
        search = '';
    }

    switch (filter) {
        case 'overdue':
            // GET params: filter=overdue
            title = 'Overdue Books';
            Loan.findAndCountAll({
                    include: [Book, Patron],
                    limit: tools.pagination.resultsLimit,
                    offset: offset,
                    where: {
                        return_by: {
                            $lt: moment().format('YYYY-MM-DD') // return by date was time ago
                        },
                        returned_on: null // book not returned yet
                    }
                })
                .then(function (loans) {
                    // Get the books for each found loan
                    var books = loans.rows.map(function (loan) {
                        return loan.Book;
                    });
                    res.render('books/books', {
                        title: title,
                        books: books,
                        links: tools.pagination.getPaginationLinks(loans.count, filter, search)
                    });
                });
            break;

        case 'checked':
            // GET params: filter=checked
            title = 'Checked Out Books';
            Loan.findAndCountAll({
                    include: [Book, Patron],
                    limit: tools.pagination.resultsLimit,
                    offset: offset,
                    where: {
                        returned_on: null // book not returned yet
                    }
                })
                .then(function (loans) {
                    // Get the books for each found loan
                    var books = loans.rows.map(function (loan) {
                        return loan.Book;
                    });
                    res.render('books/books', {
                        title: title,
                        books: books,
                        links: tools.pagination.getPaginationLinks(loans.count, filter, search)
                    });
                });
            break;

        default:
            // No GET params applied
            title = 'Books';
            Book.findAndCountAll({
                    limit: tools.pagination.resultsLimit,
                    offset: offset,
                    where: {
                        $or: [{
                            title: {
                                like: '%' + search + '%'
                            }
                        }, {
                            author: {
                                like: '%' + search + '%'
                            }
                        }]
                    }
                })
                .then(function (books) {
                    res.render('books/books', {
                        title: title,
                        books: books.rows,
                        links: tools.pagination.getPaginationLinks(books.count, filter, search)
                    });
                });
            break;
    }
});


/**
 * GET form to add a new book
 * Route: /books/add
 * 
 * Loads a form to introduce a new book entry
 */
router.get('/add', function (req, res) {
    res.render('books/books_addNew', {
        title: "New Book",
        book: Book.build()
    });
});


/**
 * POST new entry in the book database
 * Route: /books/add
 * 
 * Adds a new book entry in the database
 */
router.post('/add', function (req, res) {
    Book.create(req.body)
        .then(function (book) {
            res.redirect('/books');
        })
        .catch(function (err) {
            if (err.name === 'SequelizeValidationError') {
                res.render('books/books_addNew', {
                    title: "New Book",
                    book: Book.build(),
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
 * GET book details
 * Route: /books/:id
 * 
 * Gets the details of a book, specified by its id
 */
router.get('/:id', function (req, res) {
    var editedBook;
    Book.findById(req.params.id)
        .then(function (book) {
            editedBook = book;
            return Loan.findAll({
                include: [Book, Patron],
                where: {
                    book_id: book.id
                }
            });

        })
        .then(function (loans) {
            res.render('books/books_details', {
                title: editedBook.title,
                book: editedBook,
                loans: loans
            });
        });
});


/**
 * POST Update book details
 * Route: /books/:id
 * 
 * Updates the details of a book
 */
router.post('/:id', function (req, res) {
    var editedBook;
    Book.findById(req.params.id)
        .then(function (book) {
            if (book) {
                editedBook = book;
                return book.update(req.body);
            } else {
                res.send(404);
            }
        })
        .then(function (book) {
            res.redirect('/books');
        })
        .catch(function (err) {
            if (err.name === 'SequelizeValidationError') {
                // In order to re-render the pages it is required to obtain all the loans for that specific book
                Loan.findAll({
                        include: [Book, Patron],
                        where: {
                            book_id: editedBook.id
                        }
                    })
                    .then(function (loans) {
                        res.render('books/books_details', {
                            title: editedBook.title,
                            book: editedBook,
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