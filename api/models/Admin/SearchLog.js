/**
 * Created by shxx_ on 2017/3/23.
 */
/**
 * Admin/SearchLog.js
 */
module.exports = {
    tableName: 'Web_searchLog',
    autoCreatedAt: true,
    autoUpdatedAt: false,
    attributes: {
        id: {
            type: 'integer',
            unique: true,
            primaryKey: true,
            columnName: 'id'
        },
        createdAt: {
            type: 'string',
            columnName: 'createdAt'
        },
        phenotype: {
            type: 'string',
            columnName: 'phenotype'
        },
        guid: {
            type: 'string',
            columnName: 'guid'
        },
        ip: {
            type: 'string',
            columnName: 'ip'
        }
    }
};