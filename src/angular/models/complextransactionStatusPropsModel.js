/**
 * Created by szhitenev on 08.10.2021.
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
			key: 'public_name',
			name: 'Public name',
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
	]
}

export default {
	getAttributes: getAttributes,
}
