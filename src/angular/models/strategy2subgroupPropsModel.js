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
		/*{
                "key": "group",
                "name": "Group",
                "value_type": "field",
                "value_entity": "strategy-2-group",
                "value_content_type": "strategies.strategy2group",
                "code": "user_code"
            },*/
	]
}

export default {
	getAttributes: getAttributes,
}
