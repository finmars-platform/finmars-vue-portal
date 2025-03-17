export function entityPluralToSingular(key) {
	switch (key) {
		case 'instruments':
			return 'instrument';
		case 'accounts':
			return 'account';
		case 'portfolios':
			return 'portfolio';
		case 'responsibles':
			return 'responsible';
		case 'counterparties':
			return 'counterparty';
		case 'content_types':
			return 'content_type';
		default:
			return key;
	}
}
