/**
 * Created by shxx_ on 2017/3/22.
 */
/**
 * Admin/Searches.js
 */
module.exports = {
    tableName: 'Web_searches',
    autoCreatedAt: false,
    autoUpdatedAt: false,
    attributes: {
        user: {
            type: 'string',
            unique: true,
            primaryKey: true,
            columnName: 'user'
        },
        search0: {
            type: 'text',
            columnName: 'search0'
        },
        search1: {
            type: 'text',
            columnName: 'search1'
        },
        search2: {
            type: 'text',
            columnName: 'search2'
        },
        search3: {
            type: 'text',
            columnName: 'search3'
        },
        search4: {
            type: 'text',
            columnName: 'search4'
        },
        search5: {
            type: 'text',
            columnName: 'search5'
        },
        search6: {
            type: 'text',
            columnName: 'search6'
        },
        search7: {
            type: 'text',
            columnName: 'search7'
        },
        search8: {
            type: 'text',
            columnName: 'search8'
        },
        search9: {
            type: 'text',
            columnName: 'search9'
        },
        iterator: {
            type: 'integer',
            columnName: 'iterator'
        }
    }
};