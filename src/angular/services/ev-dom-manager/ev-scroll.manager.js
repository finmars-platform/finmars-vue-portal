export default function () {
	var viewportElem
	var viewportHeight
	var viewportWidth

	var rootWrapElem
	var rootWrapElemHeight
	var rootWrapElemWidth

	var contentElem
	var contentElemHeight
	var contentElemPaddingTop

	var contentWrapElem
	var contentWrapElemHeight
	var contentWrapElemWidth
	// Entity viewer exclusive
	var leftPanelElem

	function setViewportElem(elem) {
		viewportElem = elem
	}

	function getViewportElem() {
		return viewportElem
	}

	function setViewportHeight(height) {
		viewportHeight = height
		viewportElem.style.height = height + 'px'
	}

	function getViewportHeight() {
		return viewportHeight
	}

	function setViewportWidth(width) {
		viewportWidth = width
		viewportElem.style.width = width + 'px'
	}

	function getViewportWidth() {
		return viewportWidth
	}

	function setContentElem(elem) {
		contentElem = elem
	}

	function getContentElem() {
		return contentElem
	}

	function setContentElemHeight(height) {
		contentElemHeight = height
		contentElem.style.height = height + 'px'
	}

	function getContentElemHeight() {
		return contentElemHeight
	}

	function setContentElemPaddingTop(padding) {
		contentElemPaddingTop = padding
		contentElem.style.paddingTop = padding + 'px'
	}

	function getContentElemPaddingTop() {
		return contentElemPaddingTop
	}

	function setContentWrapElem(elem) {
		contentWrapElem = elem
		contentWrapElemHeight = elem.clientHeight
		contentWrapElemWidth = elem.clientWidth
	}

	function getContentWrapElem() {
		return contentWrapElem
	}

	function setContentWrapElemHeight(height) {
		contentWrapElemHeight = height
		contentWrapElem.style.height = `calc(100vh - ${height})`
	}

	function getContentWrapElemHeight() {
		return contentWrapElemHeight
	}

	function setContentWrapElemWidth(width) {
		contentWrapElemWidth = width
		contentWrapElem.style.width = width + 'px'
	}

	function getContentWrapElemWidth() {
		return contentWrapElemWidth
	}

	// root wrapper elem

	function setRootWrapElem(elem) {
		// console.log('setContentWrapElem elem.clientWidth', elem.clientWidth);

		rootWrapElem = elem
		rootWrapElemHeight = elem.clientHeight
		rootWrapElemWidth = elem.clientWidth
	}

	function getRootWrapElem() {
		return rootWrapElem
	}

	function setRootWrapElemHeight(height) {
		rootWrapElemHeight = height
		rootWrapElem.style.height = height + 'px'
	}

	function getRootWrapElemHeight() {
		return rootWrapElemHeight
	}

	function setRootWrapElemWidth(width) {
		rootWrapElemWidth = width
		rootWrapElem.style.width = width + 'px'
	}

	function getRootWrapElemWidth() {
		return rootWrapElemWidth
	}

	function setLeftPanelElem(elem) {
		leftPanelElem = elem
	}

	function setLeftPanelElemHeight(height) {
		leftPanelElem.style.height = height + 'px'
	}

	return {
		// viewport elem

		setViewportElem: setViewportElem,
		getViewportElem: getViewportElem,

		setViewportHeight: setViewportHeight,
		getViewportHeight: getViewportHeight,

		setViewportWidth: setViewportWidth,
		getViewportWidth: getViewportWidth,

		// content elem

		setContentElem: setContentElem,
		getContentElem: getContentElem,

		setContentElemHeight: setContentElemHeight,
		getContentElemHeight: getContentElemHeight,

		setContentElemPaddingTop: setContentElemPaddingTop,
		getContentElemPaddingTop: getContentElemPaddingTop,

		// content wrap elem

		setContentWrapElem: setContentWrapElem,
		getContentWrapElem: getContentWrapElem,

		setContentWrapElemHeight: setContentWrapElemHeight,
		getContentWrapElemHeight: getContentWrapElemHeight,

		setContentWrapElemWidth: setContentWrapElemWidth,
		getContentWrapElemWidth: getContentWrapElemWidth,

		// root wrapper elem

		setRootWrapElem: setRootWrapElem,
		getRootWrapElem: getRootWrapElem,

		setRootWrapElemHeight: setRootWrapElemHeight,
		getRootWrapElemHeight: getRootWrapElemHeight,

		setRootWrapElemWidth: setRootWrapElemWidth,
		getRootWrapElemWidth: getRootWrapElemWidth,

		// left panel elem
		setLeftPanelElem: setLeftPanelElem,
		setLeftPanelElemHeight: setLeftPanelElemHeight,
	}
}
