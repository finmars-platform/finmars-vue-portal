/**
 * Created by szhitenev on 24.01.2017.
 */

export default function () {
	return function (items, props) {
		var out = []

		if (angular.isArray(items)) {
			var keys = Object.keys(props)

			items.forEach(function (item) {
				var itemMatches = false

				for (var i = 0; i < keys.length; i++) {
					var prop = keys[i]
					var text = props[prop].toLowerCase()
					if (item[prop].toString().toLowerCase().indexOf(text) !== -1) {
						itemMatches = true
						break
					}
				}

				if (itemMatches) {
					out.push(item)
				}
			})
		} else {
			// var the output be the input untouched
			out = items
		}

		return out
	}
}
