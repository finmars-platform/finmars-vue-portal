/**
 * Created by szhitenev on 20.02.2017.
 */

var controller = function ($scope, $mdDialog) {


	var vm = this

	//vm.range = {
	//    before: {
	//        date: '',
	//        format: '',
	//        name: ''
	//    },
	//    after: {
	//        date: '',
	//        format: '',
	//        name: ''
	//    }
	//};

	vm.dateFormats = [
		{ id: 5, caption: '-', value: '' },
		{ id: 1, caption: 'dd.mm.yyyy', value: '%d.%m.%Y' },
		{ id: 2, caption: 'dd.mm.yy', value: '%d.%m.%y' },
		{ id: 3, caption: "mmmm'yy", value: "%B'%y" },
		{ id: 4, caption: 'dd-mmm-yy', value: '%d-%b-%y' },
	]

	//vm.frequencies = [
	//    {id: 1, caption: "Daily"},
	//    {id: 2, caption: "Weekly (+7d)"},
	//    {id: 3, caption: "Weekly (EoW)"},
	//    {id: 4, caption: "Bi-weekly (+14d)"},
	//    {id: 5, caption: "Bi-weekly (EoW)"},
	//    {id: 6, caption: "Monthly"},
	//    {id: 7, caption: "Monthly (EoM)"},
	//    {id: 8, caption: "Monthly (Last business day)"},
	//    {id: 9, caption: "Quarterly (Calendar)"},
	//    {id: 10, caption: "Quarterly (+3m)"},
	//    {id: 11, caption: "Yearly (+12m)"},
	//    {id: 12, caption: "Yearly (EoY)"}];

	vm.frequencies = [
		{ id: 13, caption: '-', step: '' },
		{ id: 1, caption: 'Daily', step: 'timedelta(days=1)' },
		{ id: 2, caption: 'Weekly (+7d)', step: 'timedelta(weeks=1)' },
		//{id: 3, caption: "Weekly (EoW)"},
		{ id: 4, caption: 'Bi-weekly (+14d)', step: 'timedelta(weeks=2)' },
		//{id: 5, caption: "Bi-weekly (EoW)"},
		{ id: 6, caption: 'Monthly', step: 'timedelta(months=1)' },
		//{id: 7, caption: "Monthly (EoM)""},
		//{id: 8, caption: "Monthly (Last business day)"},
		//{id: 9, caption: "Quarterly (Calendar)"},
		{ id: 10, caption: 'Quarterly (+3m)', step: 'timedelta(months=3)' },
		{ id: 11, caption: 'Yearly (+12m)', step: 'timedelta(years=1)' },
		//{id: 12, caption: "Yearly (EoY)"}
	]

	vm.addRange = function (item, $index) {
		vm.items.splice($index + 1, 0, {})
	}

	vm.removeRange = function ($index) {
		vm.items.splice($index, 1)
	}

	vm.openExpressionDialog = function ($event, item, options) {
		$mdDialog
			.show({
				controller: 'ExpressionEditorDialogController as vm',
				templateUrl: 'views/dialogs/expression-editor-dialog-view.html',
				parent: angular.element(document.body),
				targetEvent: $event,
				preserveScope: true,
				autoWrap: true,
				skipHide: true,
				locals: {
					item: { expression: item[options.key] },
				},
			})
			.then(function (res) {
				if (res.status === 'agree') {
					item[options.key] = res.data.item.expression
				}
				// ;
			})
	}
}

export default {
	bindings: {
		items: '=',
		range: '=',
	},
	templateUrl:
		'views/components/date-range-custom-field-control-component.html',
	controller: controller,
}
