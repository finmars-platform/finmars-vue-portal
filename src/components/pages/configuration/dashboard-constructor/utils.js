import { VERBOSE_NAME_BY_TYPE } from './constants';

const COLUMNS_COUNT_BY_TYPE = {
	desktop: 10,
	tablet: 6,
	mobile: 4
};

export function getColumnsCount(layoutType) {
	return COLUMNS_COUNT_BY_TYPE[layoutType] || 10;
}

export function getComponentItemVerboseType(item) {
	return VERBOSE_NAME_BY_TYPE[item.type] || 'Unknown';
}
