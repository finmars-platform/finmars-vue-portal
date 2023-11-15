var getAttributes = function () {
    return [
        {
            key: 'mismatch',
            name: 'Mismatch',
            value_type: 20,
        },
        {
            key: 'mismatch_portfolio',
            name: 'Mismatch Portfolio',
            value_type: 'field',
        },
        {
            key: 'mismatch_account',
            name: 'Mismatch Account',
            value_type: 'field',
        },
    ]
}

export default {
    getAttributes: getAttributes,
}
