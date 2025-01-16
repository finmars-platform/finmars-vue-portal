function required(item, fieldName) {
	return !item[fieldName] ? 'This field may not blank' : '';
}

export const validators = {
	required
};
