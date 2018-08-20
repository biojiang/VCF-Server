module.exports = {
    tableName: 'Web_cases',
    autoCreatedAt: false,
    autoUpdatedAt: false,
    autoPK: false,
    attributes: {
        id: {
            type: 'integer',
            unique: true,
            primaryKey: true,
            autoIncrement: true,
            columnName: 'Patient_Id'
        },
        CaseOrigin: {
            type: 'string',
            columnName: 'CaseOrigin'
        },
        PatientName: {
            type: 'string',
            columnName: 'PatientName'
        },
        Sex: {
            type: 'string',
            columnName: 'Sex'
        },
        Age: {
            type: 'string',
            columnName: 'Age'
        },
        Phenotype: {
            type: 'string',
            columnName: 'Phenotype'
        },
        Owner: {
            type: 'string',
            columnName: 'Owner'
        },
        View: {
            type: 'string',
            columnName: 'View'
        },
        Disease: {
            type: 'string',
            columnName: 'Disease'
        },
        Comment: {
            type: 'string',
            columnName: 'Comment'
        },
        Picture: {
            type: 'string',
            columnName: 'Picture'
        },
        PictureTag: {
            type: 'string',
            columnName: 'PictureTag'
        }
    }
};