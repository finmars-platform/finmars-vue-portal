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
			key: 'subgroup',
			name: 'Group',
			value_type: 'field',
			value_entity: 'strategy-1-subgroup',
			value_content_type: 'strategies.strategy1subgroup',
			code: 'user_code',
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
