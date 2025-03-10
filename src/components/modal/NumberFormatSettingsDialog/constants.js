export const DEFAULT_REPORT_SETTINGS = {
	zero_format_id: 0,
	negative_format_id: 0,
	negative_color_format_id: 0,
	round_format_id: 0,
	thousands_separator_format_id: 0,
	percentage_format_id: 0,
	number_multiplier: null,
	number_suffix: '',
	number_prefix: ''
};

export const ZERO_FORMATS = [
	{ value: 0, title: '0' },
	{ value: 1, title: '-' },
	{ value: 2, title: '(empty)' }
];

export const NEGATIVE_FORMATS = [
	{ value: 0, title: '-100', color: 0 },
	{ value: 1, title: '-100', color: 1 },
	{ value: 2, title: '(100)', color: 0 },
	{ value: 3, title: '(100)', color: 1 }
];

export const ROUNDING_FORMATS = [
	{ value: 0, title: 'no rounding' },
	{ value: 1, title: '0' },
	{ value: 2, title: '0.0' },
	{ value: 3, title: '0.00' },
	{ value: 4, title: '0.0000' }
];

export const SEPARATION_FORMATS = [
	{ value: 0, title: 'No separation' },
	{ value: 1, title: 'Space' },
	{ value: 2, title: 'Apostrophe' }
];

export const PERCENTAGE_FORMATS = [
	{ value: 0, title: 'N/A' },
	{ value: 1, title: '0%' },
	{ value: 2, title: '0.0%' },
	{ value: 3, title: '0.00%' },
	{ value: 4, title: '0 bps' },
	{ value: 5, title: '0.0 bps' }
];

export const PRESET_SELECTOR_OPTIONS = [
	{ value: 'price', title: `Price (0)` },
	{ value: 'market_value', title: `Market Value (000'000)` },
	{ value: 'amount', title: `Amount (000'000.00)` },
	{ value: 'exposure', title: `Exposure (0.0%)` },
	{ value: 'return', title: `Return (0.00%)` }
];

export const PRESETS_SETTINGS = {
	price: {
		zero_format_id: 1,
		negative_color_format_id: 0,
		negative_format_id: 0,
		round_format_id: 1,
		percentage_format_id: 0,
		number_multiplier: null,
		number_suffix: '',
		number_prefix: ''
	},
	market_value: {
		zero_format_id: 1,
		negative_color_format_id: 1,
		negative_format_id: 1,
		thousands_separator_format_id: 2,
		round_format_id: 1,
		percentage_format_id: 0,
		number_multiplier: null,
		number_suffix: '',
		number_prefix: ''
	},
	amount: {
		zero_format_id: 1,
		negative_color_format_id: 1,
		negative_format_id: 0,
		thousands_separator_format_id: 2,
		round_format_id: 3,
		percentage_format_id: 0,
		number_multiplier: null,
		number_suffix: '',
		number_prefix: ''
	},
	exposure: {
		zero_format_id: 1,
		negative_color_format_id: 1,
		negative_format_id: 1,
		round_format_id: 0,
		percentage_format_id: 2,
		number_multiplier: 100,
		number_suffix: '',
		number_prefix: ''
	},
	return: {
		zero_format_id: 1,
		negative_color_format_id: 1,
		negative_format_id: 0,
		percentage_format_id: 3,
		number_multiplier: 100,
		number_suffix: '',
		number_prefix: ''
	}
};
