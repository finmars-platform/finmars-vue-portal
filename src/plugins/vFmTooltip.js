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

let tooltipText = {};

export default defineNuxtPlugin((nuxtApp) => {
	nuxtApp.vueApp.directive('fm-tooltip', {
		mounted(el, binding) {

			/* *
			 * Using 'error' as an argument instead of modifier
			 * allows to do
			 * v-fm-tooltip:[isMessageAnError()]="Hint or an error text"
			 * */
			const errorMode = binding.arg === 'error';
			const direction = binding.modifiers.bottom ? 'bottom' : 'top';

			const body = document.body
			const tooltipElem = document.createElement('div')

			tooltipElem.classList.add('fm_tooltip')
			tooltipElem.style.position = 'absolute'
			tooltipElem.style.zIndex = 99
			el.dataset["fmTooltipValue"] = binding.value
			// tooltipElem.innerHTML = binding.value

			if (errorMode) tooltipElem.classList.add('error')

			el.addEventListener('mouseover', function () {
				const tooltipVal = el.dataset["fmTooltipValue"];

				if (!tooltipVal) return;

				tooltipElem.innerHTML = tooltipVal;

				body.appendChild(tooltipElem)

				calculatePosition(el, tooltipElem, direction)
			})

			el.addEventListener('mouseleave', function () {
				if (!tooltipText) return
				body.removeChild(tooltipElem)
			})
		},

		updated(el, binding) {
			el.dataset["fmTooltipValue"] = binding.value;
		},

		unmounted() {
			const tooltipElem = document.querySelector('.fm_tooltip')

			if (tooltipElem) tooltipElem.remove()
		},
	})
})
