'use strict';

var isValidDateFormat = require('../utilities/tools').validations.isValidDateFormat;

module.exports = function (sequelize, DataTypes) {
  var Loan = sequelize.define('Loan', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true
    },
    book_id: {
      type: DataTypes.INTEGER,
      validate: {
        notEmpty: {
          msg: 'A book is required'
        }
      }
    },
    patron_id: {
      type: DataTypes.INTEGER,
      validate: {
        notEmpty: {
          msg: 'A patron is required'
        }
      }
    },
    loaned_on: {
      type: DataTypes.DATEONLY,
      validate: {
        notEmpty: {
          msg: 'Loaned On date is required'
        },
        isDate: {
          msg: 'Loaned On date invalid format. Accepted format: YYYY-MM-DD (e.g., 2016-03-15)'
        },
        isValidDateFormat: isValidDateFormat
      }
    },
    return_by: {
      type: DataTypes.DATEONLY,
      validate: {
        notEmpty: {
          msg: 'Return by date is required'
        },
        isDate: {
          msg: 'Return by date invalid format. Accepted format: YYYY-MM-DD (e.g., 2016-03-15)'
        },
        isValidDateFormat: isValidDateFormat
      }
    },
    returned_on: {
      type: DataTypes.DATEONLY,
      validate: {
        notEmpty: {
          msg: 'Returned on date is required'
        },
        isDate: {
          msg: 'Returned On is not a date'
        },
        isValidDateFormat: isValidDateFormat
      }
    }
  }, {
    classMethods: {
      associate: function (models) {
        // A loan belongs to a specific book (only one per each entry)
        this.belongsTo(models.Book, {
          foreignKey: 'book_id'
        });
        // A loan belongs to a specific patron (only one per each entry)
        this.belongsTo(models.Patron, {
          foreignKey: 'patron_id'
        });
      },
    },
    timestamps: false
  });
  return Loan;
};