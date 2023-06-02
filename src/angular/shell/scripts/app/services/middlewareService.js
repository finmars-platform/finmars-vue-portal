/**
 * Created by mevstratov on 08.03.2019
 *
 * Used to perform global communication between modules
 */
// (function () {

'use strict';

export default function () {

	/* COMMITTED: 2021-07-19

	function setNewEntityViewerLayoutName(layoutName) {
		data.newEntityViewerLayoutName = layoutName;
	}

	function getNewEntityViewerLayoutName() {

		const newLayout = data.newEntityViewerLayoutName;
		data.newEntityViewerLayoutName = false;

		return newLayout;

	}

	function setNewSplitPanelLayoutName(layoutName) {
		data.newSplitPanelLayoutName = layoutName;
	}

	function getNewSplitPanelLayoutName() {
		return data.newSplitPanelLayoutName;
	} */
	let data = {
		/* newEntityViewerLayoutName: false,
		newSplitPanelLayoutName: false, */
		warnOnLayoutChangeFn: false,
		onAutosaveLayoutToggle: false,
		masterUserChangeEvents: [],
		logOutEvents: []
	};

	function setWarningOfLayoutChangesLossFn(callbackFn) {
		data.warnOnLayoutChangeFn = callbackFn;
	}

	function getWarningOfLayoutChangesLossFn() {
		var callbackFn = data.warnOnLayoutChangeFn;
		data.warnOnLayoutChangeFn = false;
		return callbackFn;
	}
	/**
	 *
	 * @param callback {Function} - to be called on log out
	 * @returns {number} - index of added callback inside list of callbacks
	 */
	function onMasterUserChanged(callback) {

		if (callback) {
			data.masterUserChangeEvents.push(callback);
			return data.masterUserChangeEvents.length - 1;
		}

	}

	function removeOnUserChangedListeners (callbackIndex) {

		if (callbackIndex < 0) {
			throw "Index is 0 or lesser";
		}

		if (callbackIndex > data.masterUserChangeEvents.length) {
			throw "Index is greater then listeners count";
		}

		data.masterUserChangeEvents.splice(callbackIndex, 1);

	}

	function masterUserChanged() {

		data.masterUserChangeEvents.forEach(function (callback) {
			callback();
		});

	}

	/**
	 *
	 * @param callback {Function} - to be called on log out
	 * @returns {number} - index of added callback inside list of callbacks
	 */
	function addListenerOnLogOut(callback) {

		if (callback) {
			data.logOutEvents.push(callback);
			return data.logOutEvents.length - 1;
		}

	}

	function removeOnLogOutListener (callbackIndex) {

		if (callbackIndex < 0) {
			throw "Index is 0 or lesser";
		}

		if (callbackIndex > data.logOutEvents.length) {
			throw "Index is greater then listeners count";
		}

		data.logOutEvents.splice(callbackIndex, 1);

	}

	function initLogOut() {

		data.logOutEvents.forEach(function (callback) {
			callback();
		});

	}

	function onAutosaveLayoutToggle(callback) {
		data.onAutosaveLayoutToggle = callback;
	}

	function autosaveLayoutToggle() {
		if (data.onAutosaveLayoutToggle) {
			data.onAutosaveLayoutToggle();
		}
	}

	function onToggleWarningsSideNav(callback) {
		data.onToggleWarningsSideNav = callback;
	}

	function toggleWarningsSideNav() {
		if (data.onToggleWarningsSideNav) {
			data.onToggleWarningsSideNav();
		}
	}



	function clearEvents() {
		data.masterUserChangeEvents = [];
		data.logOutEvents = [];
	}

	function resetData() {
		data = {
			warnOnLayoutChangeFn: false,
			onAutosaveLayoutToggle: false,
			masterUserChangeEvents: [],
			logOutEvents: []
		};
	}

	/** @module: middlewareService */
	return {
		setWarningOfLayoutChangesLossFn: setWarningOfLayoutChangesLossFn,
		getWarningOfLayoutChangesLossFn: getWarningOfLayoutChangesLossFn,

		onMasterUserChanged: onMasterUserChanged,
		removeOnUserChangedListeners: removeOnUserChangedListeners,
		masterUserChanged: masterUserChanged,

		addListenerOnLogOut: addListenerOnLogOut,
		removeOnLogOutListener: removeOnLogOutListener,
		initLogOut: initLogOut,

		onAutosaveLayoutToggle: onAutosaveLayoutToggle,
		autosaveLayoutToggle: autosaveLayoutToggle,

		onToggleWarningsSideNav: onToggleWarningsSideNav,
		toggleWarningsSideNav: toggleWarningsSideNav,

		clearEvents: clearEvents,
		resetData: resetData
	};
};

// }());