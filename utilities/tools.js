'use strict';

var moment = require('moment');

/**
 * Tools module with useful functions for the app
 * @exports Tools
 * @namespace Tools
 */
var Tools = {
    validations: {
        isValidDateFormat: function (value) {
            // Validates if an introduced date is of format 'YYYY-MM-DD'
            if (!moment(value, 'YYYY-MM-DD', true).isValid()) {
                throw new Error('Returned On date invalid format. Accepted format: YYYY-MM-DD (e.g., 2016-03-15)');
            }
        }
    },
    pagination: {
        resultsLimit: 5,
        getPaginationLinks: function (resultCount, filter, search) {
            var links = [];
            var pages = Math.ceil(resultCount / this.resultsLimit);

            for (var i = 1; i <= pages; i++) {
                var link = this.buildLink(filter, search, i);
                links.push({
                    num: i,
                    href: link
                });
            }

            return links;
        },
        buildLink: function (filter, search, page) {
            var link = '?';

            if (filter) {
                link += 'filter=' + filter;
            }

            if (search) {
                link += '&search=' + search;
            }

            if (page) {
                link += '&page=' + page;
            }

            return link;
        }
    }
};

module.exports = Tools;