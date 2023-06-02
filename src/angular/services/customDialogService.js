/**
 * Created by szhitenev on 06.11.2019.
 */

var lastId = 1

function CustomDialogService(
	$rootScope,
	$templateCache,
	$compile,
	$controller
) {
	this.rootElement = document.body

	var _this = this

	this._id = 'root'

	this.state = {}

	this.show = function (options) {
		return new Promise(function (resolve, reject) {
			var tpl
			var templateScope
			var ctrl

			tpl = $templateCache.get(options.templateUrl)

			templateScope = $rootScope.$new()

			var defaultLocals = {
				$scope: templateScope,
				$customDialog: Object.assign({}, _this, { _id: lastId }),
			}

			var locals = Object.assign(defaultLocals, options.locals)

			ctrl = $controller(options.controller, locals)

			var elem = document.createElement('div')

			$(elem).html(tpl)
			$(elem).children().data('$ngControllerController', ctrl)

			var firstChild = $(elem).contents()[0]

			$(firstChild).addClass('custom-dialog-id-' + lastId)

			$compile($(elem).contents())(templateScope)

			$(_this.rootElement).append($(elem).contents())

			_this.state[lastId] = resolve

			lastId = lastId + 1
		})
	}

	this.hide = function (data) {
		var elem = _this.rootElement.querySelector('.custom-dialog-id-' + this._id)
		elem.remove()

		var resolve = _this.state[this._id]

		resolve(data)
	}
}

export default function ($rootScope, $templateCache, $compile, $controller) {
	var service = new CustomDialogService(
		$rootScope,
		$templateCache,
		$compile,
		$controller
	)

	return {
		show: service.show,
		hide: service.hide,
	}
}
