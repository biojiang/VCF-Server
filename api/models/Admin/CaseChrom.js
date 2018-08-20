module.exports = {
    tableName: 'Web_cases_chrom',
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
        Chrom: {
            type: 'string',
            columnName: 'Chrom'
        },
        Arm: {
            type: 'string',
            columnName: 'Arm'
        },
        Pos: {
            type: 'string',
            columnName: 'Pos'
        },
        Type: {
            type: 'string',
            columnName: 'Type'
        }
    }
};