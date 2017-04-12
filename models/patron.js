'use strict';
module.exports = function (sequelize, DataTypes) {
  var Patron = sequelize.define('Patron', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true
    },
    first_name: {
      type: DataTypes.STRING,
      validate: {
        notEmpty: {
          msg: 'First Name is a required'
        }
      }
    },
    last_name: {
      type: DataTypes.STRING,
      validate: {
        notEmpty: {
          msg: 'Last Name is required'
        }
      }
    },
    address: {
      type: DataTypes.STRING,
      validate: {
        notEmpty: {
          msg: 'Address is required'
        }
      }
    },
    email: {
      type: DataTypes.STRING,
      validate: {
        notEmpty: {
          msg: 'Email is required'
        }
      }
    },
    library_id: {
      type: DataTypes.STRING,
      validate: {
        notEmpty: {
          msg: 'Library ID is required'
        }
      }
    },
    zip_code: {
      type: DataTypes.INTEGER,
      validate: {
        notEmpty: {
          msg: 'Zip Code is required'
        },
        isNumeric: {
          msg: 'Zip Code has to be a number'
        }
      }
    }
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