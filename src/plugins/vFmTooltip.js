function calculatePosition(targetElem, tooltipElem, direction) {
	const activatorRect = targetElem.getBoundingClientRect()

	let tooltipHeight = tooltipElem.clientHeight
	let tooltipWidth = tooltipElem.clientWidth

	let positionX
	let positionY

	const spaceBetween = 2 // space between tooltip and anchor element

	positionX = activatorRect.left + (activatorRect.width - tooltipWidth) / 2

	if (direction === 'bottom') {
		positionY = activatorRect.bottom + spaceBetween
	} else {
		positionY = activatorRect['top'] - tooltipHeight - spaceBetween
	}

	//#region Prevents tooltip from creeping out of window
	const windowHeight = document.body.clientHeight
	const windowWidth = document.body.clientWidth

	if (tooltipHeight > windowHeight) tooltipHeight = windowHeight

	if (positionX + tooltipWidth > windowWidth) {
		tooltipElem.style.right = '0'
		tooltipElem.style.left = ''
	} else {
		tooltipElem.style.left = positionX + 'px'
		tooltipElem.style.right = ''
	}

	if (positionY + tooltipHeight > windowHeight) {
		tooltipElem.style.bottom = '0'
		tooltipElem.style.top = ''
	} else {
		tooltipElem.style.top = positionY + 'px'
		tooltipElem.style.bottom = ''
	}
	//# endregion Prevents popup from creeping out of window
}

export default defineNuxtPlugin((nuxtApp) => {
	nuxtApp.vueApp.directive('fm-tooltip', {
		mounted(el, binding) {
			const errorMode = !!binding.modifiers.error
			const direction = binding.modifiers.bottom ? 'bottom' : 'top'

			const body = document.body
			const tooltipElem = document.createElement('div')

			tooltipElem.classList.add('fm_tooltip')
			tooltipElem.style.position = 'absolute'
			tooltipElem.style.zIndex = 999
			tooltipElem.innerHTML = binding.value

			if (errorMode) tooltipElem.classList.add('error')

			el.addEventListener('mouseover', function () {
				if (!binding.value) return
				body.appendChild(tooltipElem)

				calculatePosition(el, tooltipElem, direction)
			})

			el.addEventListener('mouseleave', function () {
				if (!binding.value) return
				body.removeChild(tooltipElem)
			})
		},

		unmounted() {
			const tooltipElem = document.querySelector('.fm_tooltip')

			if (tooltipElem) tooltipElem.remove()
		},
	})
})
