function getSubstringOccurrenceIndexes(str, substr) {
	if (!substr) return [];

	const indexes = [];
	let lastIndex = str.indexOf(substr);
	while (lastIndex !== -1) {
		indexes.push(lastIndex);
		lastIndex = str.indexOf(substr, lastIndex + 1);
	}
	return indexes;
}

export function highlightText(str, substr) {
	const processedStr = str.toLowerCase();
	const processedSubstr = substr.toLowerCase();
	const substrLength = substr.length;

	const substringOccurrenceIndexes = getSubstringOccurrenceIndexes(
		processedStr,
		processedSubstr
	);

	const strPart = substringOccurrenceIndexes.reduce((res, item, index) => {
		if (index === 0) {
			const currentSubstr = str.slice(item, item + substrLength);
			res = `${str.slice(0, item)}<span class="text-highlight">${currentSubstr}</span>`;
		} else {
			const prevItem = substringOccurrenceIndexes[index - 1];
			const strPart1 = str.slice(prevItem + substrLength, item);
			const currentSubstr = str.slice(item, item + substrLength);
			res += `${strPart1}<span class="text-highlight">${currentSubstr}</span>`;
		}

		return res;
	}, '');

	const lastIndex = substringOccurrenceIndexes.pop();
	return `${strPart}${str.slice(lastIndex + substrLength)}`;
}
