/**
 * Created by szhitenev on 01.06.2016.
 */

var getLayoutAttrs = function () {
	return [
		{
			key: 'layoutLine',
			name: 'Line',
			value_type: 'decoration',
		},
		{
			key: 'layoutLineWithLabel',
			name: 'Labeled Line',
			value_type: 'decoration',
		},
		{
			key: 'layoutPlainText',
			name: 'Plain Text',
			value_type: 'decoration',
		},
		{
			key: 'layoutCalculatedText',
			name: 'Calculated Text',
			value_type: 'decoration',
		},
	]
}

export default {
	getLayoutAttrs: getLayoutAttrs,
}
