module.exports = {
    tableName: 'Web_requests',
    autoCreatedAt: false,
    autoUpdatedAt: false,
    attributes: {
        id: {
            type: 'integer',
            unique: true,
            primaryKey: true,
            columnName: 'id'
        },
        requester: {
            type: 'string',
            columnName: 'requester'
        },
        case: {
            type: 'integer',
            columnName: 'case'
        },
        status: {
            type: 'string',
            columnName: 'status'
        }
    }
};