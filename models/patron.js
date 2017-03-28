'use strict';
module.exports = function (sequelize, DataTypes) {
  var Patron = sequelize.define('Patron', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true
    },
    first_name: DataTypes.STRING,
    last_name: DataTypes.STRING,
    address: DataTypes.STRING,
    email: DataTypes.STRING,
    library_id: DataTypes.STRING,
    zip_code: DataTypes.INTEGER
  }, {
    classMethods: {
      associate: function (models) {
        // A patron can be associated with many loans
        this.hasMany(models.Loan, {
          foreignKey: 'patron_id'
        });
      }
    },
    timestamps: false
  });
  return Patron;
};