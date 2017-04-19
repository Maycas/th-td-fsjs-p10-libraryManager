'use strict';

var moment = require('moment');

/**
 * Tools module with useful functions for the app
 * @exports Tools
 * @namespace Tools
 */
var Tools = {
    /**
     * @name validations
     * @memberof Tools
     * @type {Object}
     * @namespace Tools.validations
     */
    validations: {
        /**
         * @name isValidDateFormat
         * @memberof Tools.validations
         * @type {function}
         * @desc Validates if an introduced date is of format 'YYYY-MM-DD'
         * @param {string} value    - String introduced as a date
         */
        isValidDateFormat: function (value) {
            if (!moment(value, 'YYYY-MM-DD', true).isValid()) {
                throw new Error('Returned On date invalid format. Accepted format: YYYY-MM-DD (e.g., 2016-03-15)');
            }
        }
    },
    /**
     * @name pagination
     * @memberof Tools
     * @type {Object}
     * @namespace Tools.pagination
     */
    pagination: {
        resultsLimit: 5,
        /**
         * @name getPaginationLinks
         * @memberof Tools.pagination
         * @type {function}
         * @desc Returns the link information for the pagination 
         * @param {Integer} resultCount     - Count of all the different objects that are required to paginate
         * @param {String}  filter          - Filter parameter to add into the URL
         * @param {String}  search          - Search query string to add into the URL
         */
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
        /**
         * @name buildLink
         * @memberof Tools.pagination
         * @type {function}
         * @desc Builds the href attribute of the pagination links
         * @param {String}  filter          - Filter parameter to add into the URL
         * @param {String}  search          - Search query string to add into the URL
         * @param {Integer} page            - Page number
         */
        buildLink: function (filter, search, page) {
            var link = '?';

            // Concatenate the filter parameter in the link URL
            if (filter) {
                link += 'filter=' + filter;
            }

            // Concatenate the search parameter in the link URL
            if (search) {
                link += '&search=' + search;
            }

            // Concatenate the page parameter in the link URL
            if (page) {
                link += '&page=' + page;
            }

            return link;
        }
    }
};

module.exports = Tools;