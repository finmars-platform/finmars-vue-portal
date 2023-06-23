import md5Helper from '../helpers/md5.helper'
import toastNotificationService from '@/angular/shell/scripts/app/services/toastNotificationService.js'

function recursiveDeepCopy(o, saveFunctions) {
	var newO, i

	if (typeof o !== 'object') {
		return o
	}
	if (!o) {
		return o
	}

	if ('[object Array]' === Object.prototype.toString.apply(o)) {
		newO = []
		for (i = 0; i < o.length; i += 1) {
			newO[i] = recursiveDeepCopy(o[i])
		}
		return newO
	} else if (saveFunctions && {}.toString.call(o) === '[object Function') {
		return o
	}

	newO = {}
	for (i in o) {
		if (o.hasOwnProperty(i)) {
			newO[i] = recursiveDeepCopy(o[i])
		}
	}
	return newO
}

function setObjectNestedPropVal(obj, pathToProp, value) {
	var objPlace = obj
	var lastIndex = Math.max(0, pathToProp.length - 1) // needed to work with one item array

	pathToProp.forEach(function (prop, index) {
		if (lastIndex === index) {
			objPlace[prop] = value
		} else {
			objPlace = objPlace[prop]
		}
	})
}

const getObjectNestedPropVal = function (obj, pathToProp) {
	var objPlace = obj

	pathToProp.forEach(function (prop) {
		objPlace = objPlace[prop]
	})

	return objPlace
}

const deletePropertyByPath = function (obj, pathToProp) {
	if (pathToProp.length === 1) {
		if (Array.isArray(obj)) {
			const index = pathToProp[0]
			obj.splice(index, 1)
			return true
		}
		return delete obj[pathToProp[0]]
	} else {
		if (obj[pathToProp[0]])
			return deletePropertyByPath(obj[pathToProp[0]], pathToProp.slice(1))
		else return false
	}
}

// sorts array alphabetically but puts text that starts with '-' at the beginning
const textWithDashSort = (arr, field) => {
	const keys = ['name', 'user_code', 'short_name', 'public_name'] // preferred fields for sort
	const key =
		field || keys.find((key) => arr.every((item) => item.hasOwnProperty(key)))

	if (!key) {
		return arr
	}

	return arr.sort(function (a, b) {
		if (!a[key] || !b[key]) {
			return 0
		}

		const aStartsWithDash = a[key].startsWith('-')
		const bStartsWithDash = b[key].startsWith('-')

		if (!aStartsWithDash && bStartsWithDash) {
			return 1
		}

		if (aStartsWithDash && !bStartsWithDash) {
			return -1
		}

		if (aStartsWithDash && bStartsWithDash) {
			const aWithoutDash = a.name.slice(1)
			const bWithoutDash = b.name.slice(1)

			if (aWithoutDash > bWithoutDash) {
				return 1
			}

			if (aWithoutDash < bWithoutDash) {
				return -1
			}

			return 0
		}

		if (a[key] > b[key]) {
			return 1
		}

		if (a[key] < b[key]) {
			return -1
		}

		return 0
	})
}
/**
 *
 * @param {string} text - text to use as unique user code, name etc
 * @param {array<string>} [listOfTexts] - array of already existing strings
 * @param {string} textName - name to use in error
 */
const validateTextForUserCode = (text, listOfTexts, textName) => {
	if (!textName) textName = ''
	// let errorText = "";
	if (!text) {
		return `${textName ? textName + ' ' : ''}should not be empty.`
	} else if (text.match('[^1-9a-zA-Z_]')) {
		if (textName) textName = ' for ' + textName

		return `Only english letters and 1-9 numbers allowed${textName}.`
	} else if (text.match('^[0-9]')) {
		return `${textName ? textName + ' ' : ''}should not start with number.`
	} else if (listOfTexts && listOfTexts.length) {
		if (listOfTexts.includes(text)) {
			return `${textName ? textName + ' ' : ''}should be unique.`
		}
	}

	return false
}

const openLinkInNewTab = function (event) {
	event.preventDefault()
	let targetElem = event.target

	if (targetElem.classList.contains('openLinkInNewTab')) {
		let url = targetElem.href
		window.open(url)
	}
}

const closeComponent = function (openedIn, $mdDialog, $bigDrawer, response) {
	if (openedIn === 'big-drawer') {
		$bigDrawer.hide(response)
	} else {
		// opened in mdDialog
		$mdDialog.hide(response)
	}
}

const getDefaultFilterType = (valueType) => {
	const defaultTextFilterType = 'contains'
	const defaultNumberAndDateFilterType = 'equal'

	return [10, 30, 'field'].includes(valueType)
		? defaultTextFilterType
		: defaultNumberAndDateFilterType
}

const insertSpaceIntoElementText = function (elem) {
	var selStart = elem.selectionStart
	var firstStringPart = elem.value.substring(0, selStart)
	var selEnd = elem.selectionEnd
	var lastStringPart = elem.value.substring(selEnd, elem.value.length)
	var tabNewName = firstStringPart + ' ' + lastStringPart

	elem.value = tabNewName
	elem.selectionEnd = selStart + 1 // set text cursor after added space

	return tabNewName
}

/** @param key {*=} - can be usefull if multiple ids needed at once */
const generateUniqueId = (key) => {
	const currentDate = Date.now().toString()
	return md5Helper.md5(currentDate, key)
}

const clearFrontendOptions = function (object) {
	delete object.frontOptions

	for (const prop in object) {
		if (object[prop] && typeof object[prop] === 'object') {
			object[prop] = clearFrontendOptions(object[prop])
		}
	}

	return object
}

const copyToBuffer = function (content) {
	var listener = function (e) {
		e.clipboardData.setData('text/plain', content)

		e.preventDefault()
	}

	document.addEventListener('copy', listener, false)

	document.execCommand('copy')

	document.removeEventListener('copy', listener, false)

	toastNotificationService.info('Copied')
}

export default {
	recursiveDeepCopy: recursiveDeepCopy,
	setObjectNestedPropVal: setObjectNestedPropVal,
	getObjectNestedPropVal: getObjectNestedPropVal,
	deletePropertyByPath: deletePropertyByPath,
	textWithDashSort: textWithDashSort,
	validateTextForUserCode: validateTextForUserCode,
	openLinkInNewTab: openLinkInNewTab,

	closeComponent: closeComponent,
	getDefaultFilterType: getDefaultFilterType,

	insertSpaceIntoElementText: insertSpaceIntoElementText,

	generateUniqueId: generateUniqueId,

	clearFrontendOptions: clearFrontendOptions,

	copyToBuffer: copyToBuffer,
}
