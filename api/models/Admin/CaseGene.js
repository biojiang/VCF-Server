module.exports = {
    tableName: 'Web_cases_gene',
    autoCreatedAt: false,
    autoUpdatedAt: false,
    attributes: {
        id: {
            type: 'integer',
            unique: true,
            primaryKey: true,
            columnName: 'Patient_Id'
        },
        Patient: {
            type: 'string',
            columnName: 'Patient'
        },
        Gene: {
            type: 'string',
            columnName: 'Gene'
        }
    }
};