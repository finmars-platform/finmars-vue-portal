/**
 * Created by mevstratov on 29.01.2020.
 */

export default function () {
	var DnDScrollElem
	var DnDScrollTimeOutId
	var scrollSize = null

	function DnDWheelScroll(event) {
		event.preventDefault()

		var scrolled = DnDScrollElem.scrollTop

		if (scrollSize === null) {
			scrollSize = scrolled
		}

		if (event.deltaY > 0) {
			scrollSize = scrollSize + 100
		} else {
			scrollSize = scrollSize - 100
		}

		clearTimeout(DnDScrollTimeOutId)

		DnDScrollTimeOutId = setTimeout(function () {
			// timeout needed for smoother scroll

			DnDScrollElem.scroll({
				top: Math.max(0, scrollSize),
			})

			scrollSize = null
		}, 30)
	}

	function setDnDScrollElem(htmlElement) {
		DnDScrollElem = htmlElement
	}

	function enableDnDWheelScroll() {
		document.addEventListener('wheel', DnDWheelScroll, { passive: false })
	}

	function disableDnDWheelScroll() {
		document.removeEventListener('wheel', DnDWheelScroll)
	}

	return {
		setDnDScrollElem: setDnDScrollElem,
		DnDWheelScroll: DnDWheelScroll,

		enableDnDWheelScroll: enableDnDWheelScroll,
		disableDnDWheelScroll: disableDnDWheelScroll,
	}
}
