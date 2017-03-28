'use strict';
module.exports = function (sequelize, DataTypes) {
  var Loan = sequelize.define('Loan', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true
    },
    book_id: DataTypes.INTEGER,
    patron_id: DataTypes.INTEGER,
    loaned_on: DataTypes.DATE,
    return_by: DataTypes.DATE,
    returned_on: DataTypes.DATE
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
      }
    },
    timestamps: false
  });
  return Loan;
};