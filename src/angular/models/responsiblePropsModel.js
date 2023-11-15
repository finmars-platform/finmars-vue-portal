/**
 * Created by szhitenev on 03.04.2017.
 */

var getAttributes = function () {
    return [
        {
            key: 'name',
            name: 'Name',
            value_type: 10,
        },
        {
            key: 'short_name',
            name: 'Short name',
            value_type: 10,
        },
        {
            key: 'user_code',
            name: 'User code',
            value_type: 10,
        },
        {
            key: 'public_name',
            name: 'Public name',
            value_type: 10,
            allow_null: true,
        },
        {
            key: 'notes',
            name: 'Notes',
            value_type: 10,
        },
        {
            key: 'group',
            name: 'Group',
            value_content_type: 'counterparties.responsiblegroup',
            value_entity: 'responsible-group',
            code: 'user_code',
            value_type: 'field',
        },
        {
            key: 'portfolios',
            name: 'Portfolios',
            value_content_type: 'portfolios.portfolio',
            value_entity: 'portfolio',
            code: 'user_code',
            value_type: 'mc_field',
        },
        {
            key: 'object_permissions',
            name: 'Object permissions',
            value_type: 'mc_field',
        },
    ]
}

export default {
    getAttributes: getAttributes,
}
