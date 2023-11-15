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
            key: 'notes',
            name: 'Notes',
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
        },
        {
            key: 'value_content_types',
            name: 'Content Types',
            value_type: 'mc_field',
        },
    ]
}

export default {
    getAttributes: getAttributes,
}
