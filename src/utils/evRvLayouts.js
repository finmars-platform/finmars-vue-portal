export function getLinkingToFilters(layout) {
	if (!layout.data) {
		console.error(`Broken layout: ${layout}`);
		return [];
	}

	return layout.data.filters.reduce((res, filter) => {
		if (!filter.options.use_from_above) {
			return res;
		}

		const filterObj = {
			key:
				typeof filter.options.use_from_above === 'object'
					? filter.options.use_from_above.key
					: filter.options.use_from_above,
			name: filter.name,
			filter_type: filter.options.filter_type,
			...(filter.layout_name && { layout_name: filter.layout_name })
		};
		res.push(filterObj);

		return res;
	}, []);
}

export function getDataForLayoutSelectorWithFilters(layouts) {
	return layouts.reduce((res, layout) => {
		if (!layout.data) {
			console.error(`Broken list layout: ${layout}`);
		}

		const layoutObj = {
			id: layout.id,
			name: layout.name,
			user_code: layout.user_code,
			content_type: layout.content_type,
			content: getLinkingToFilters(layout)
		};
		res.push(layoutObj);

		return res;
	}, []);
}
