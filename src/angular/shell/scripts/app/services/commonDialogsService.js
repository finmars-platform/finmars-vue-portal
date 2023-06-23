/**
 * Created by mevstratov on 27.05.2021
 */

'use strict';

/** @module commonDialogsService */
export default function ($mdDialog) {

	const getMdDialogOptions = (controller, templateUrl, locals, options) => {

		let dialogOptionsObj = {
			controller: controller,
			templateUrl: templateUrl,
			clickOutsideToClose: false,
			multiple: true,
			locals: locals
		};

		if (options) dialogOptionsObj = {...dialogOptionsObj, ...options};

		return dialogOptionsObj;

	};

	/**
	 * Opens general warning dialog.
	 *
	 * @memberOf module:commonDialogsService
	 * @param locals {Object} - locals for dialog settings
	 * @param [options] {Object}
	 * 	@param {HTMLElement} [options.parent] - element that will be parent of dialog element
	 * 	@param {Object} [options.targetEvent] - event object
	 * @returns {Promise<Object|null>} - response after dialog closes
	 */
	function warning (locals, options) {

		const dialogOptionsObj = getMdDialogOptions('WarningDialogController as vm', 'views/dialogs/warning-dialog-view.html', locals, options);

		return $mdDialog.show(dialogOptionsObj);

	}

	/**
	 * Opens dialog with inputs that are set in option.
	 *
	 * @memberOf module:commonDialogsService
	 * @param locals {Object} - locals for dialog settings
	 * @param [options] {Object}
	 * 	@param {HTMLElement} [options.parent] - element that will be parent of dialog element
	 * 	@param {Object} [options.targetEvent] - event object
	 * @returns {Promise<Object>} - response after dialog closes
	 */
	function inputs (locals, options) {

		const dialogOptionsObj = getMdDialogOptions('InputsDialogController as vm', 'views/dialogs/inputs-dialog-view.html', locals, options);

		return $mdDialog.show(dialogOptionsObj);

	}

	/**
	 * Opens import configuration manager dialog.
	 *
	 * @memberOf module:commonDialogsService
	 * @param locals {Object} - locals for dialog settings
	 * @param options {=Object}
	 * 	@param {=HTMLElement} options.parent - element that will be parent of dialog element
	 * 	@param {=Object} options.targetEvent - event object
	 * @returns {Promise<Object|null>} - response after dialog closes
	 */
	function importConfigurationManager (locals, options) {

		const dialogOptionsObj = getMdDialogOptions('ConfigurationImportDialogController as vm', 'views/dialogs/configuration-import/configuration-import-dialog-view.html', locals, options);

		return $mdDialog.show(dialogOptionsObj);

	}

	return {
		warning: warning,
		inputs: inputs,
		importConfigurationManager: importConfigurationManager
	}
}