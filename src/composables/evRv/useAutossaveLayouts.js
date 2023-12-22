export const getAutosaveLayoutUserCode = function (contentType) {
	const formattedContentType = contentType.replace('.', '_');
	return 'system_autosave_' + formattedContentType;
};
