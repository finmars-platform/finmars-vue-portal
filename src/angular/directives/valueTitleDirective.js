export default function ($timeout) {
	return {
		link: function (scope, element) {
			$timeout(function () {
				element[0].title = element[0].value
			})
		},
	}
}
