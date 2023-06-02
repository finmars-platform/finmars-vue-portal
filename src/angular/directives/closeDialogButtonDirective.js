'use strict';

export default function closeDialogButtonDirective () {

	return {
		scope: {
			onClick: '&',
			isDisabled: "="
		},
		template: `<button ng-click="onClick()" ng-disabled="isDisabled" class="close-dialog-btn">
				   		<span class="material-icons">close</span>
				   </button>`,
		link: function (scope, elem, attr) {}
	}

};