<template>
	<div
		class="board_widget"
		:style="{
			'grid-column': 'span ' + component.colls,
			'grid-row': 'span ' + component.rows,
		}"
		:data-name="component.uid"
	>
		<component
			class="widget_wrap"
			:is="compRegisteredName"
			:uid="component.uid"
		/>
		<div class="board_widget_controls" v-if="dashStore.isEdit">
			<div class="bwc_top flex sb aic">
				<div>{{ component.name }}</div>
				<div class="flex aic">
					<FmMenu anchor="bottom right">
						<template #btn>
							<FmIcon size="24" icon="settings" />
						</template>

						<div class="fm_list">
							<div class="fm_list_item" @click="isEditWidget = true">
								Settings
							</div>
							<div class="fm_list_item" @click="remove(component.uid)">
								Remove
							</div>
						</div>
					</FmMenu>
				</div>
			</div>
			<div class="bwc_content aic center" @mousedown="drag">
				<FmIcon icon="drag_indicator" />Drag and Drop
			</div>
			<div class="bwc_right" @mousedown="resizeX"></div>
			<div class="bwc_bottom" @mousedown="resizeY"></div>
		</div>

		<PagesDashboardEditCompM
			v-if="isEditWidget"
			v-model="isEditWidget"
			:uid="component.uid"
		/>
	</div>
</template>

<script setup>
	let props = defineProps({
		component: {
			type: Object,
			required: true,
		},
	})
	const emits = defineEmits(['sorted'])

	// console.log("testing1090 component.componentName", props.component.componentName);
	const dashStore = useStoreDashboard()
	let isEditWidget = ref(false)

	const widgetsList = [
		'DateControl',
		'PortfolioControl',
		'BundleControl',
		'CurrencyControl',
		'DebugComponent',
		'CardsIndicators',
		'ChartBalancePeriod',
		'ChartBalanceDate',
		'ChartPnlDate',
		'PerformanceBundles',
		'PerformanceDetail',
		'PerformanceChart',
	]
	const isAWidget = widgetsList.includes(props.component.componentName)
	// console.log("testing1090 isAWidget", isAWidget);
	const compRegisteredName = computed(() => {
		return isAWidget
			? 'Widgets' + props.component.componentName
			: props.component.componentName
	})

	function resizeX(e) {
		let elem = e.target.closest('.board_widget')
		let grid = e.target.closest('.grid')
		let rect = grid.getBoundingClientRect()
		let halfColl = (rect.width - 11 * 20) / 12 + 20
		let startX = e.clientX

		document.ondragstart = function () {
			return false
		}

		let component = dashStore.components.find(
			(item) => item.uid == elem.dataset.name
		)
		let startColls = component.colls

		function onmousemove(e) {
			let addedColls = startColls + Math.round((e.clientX - startX) / halfColl)

			component.colls =
				addedColls > component.minColls ? addedColls : component.minColls
		}

		document.addEventListener('mousemove', onmousemove)

		document.onmouseup = function () {
			document.removeEventListener('mousemove', onmousemove)
			elem.onmouseup = null
		}
	}
	function resizeY(e) {
		let elem = e.target.closest('.board_widget')
		let grid = e.target.closest('.grid')

		let halfRow = 70
		let startY = e.clientY

		document.ondragstart = function () {
			return false
		}

		let component = dashStore.components.find(
			(item) => item.uid == elem.dataset.name
		)
		let startRows = component.rows

		function onmousemove(e) {
			let rows = startRows + Math.round((e.clientY - startY) / halfRow)

			component.rows = rows > component.minRows ? rows : component.minRows
		}

		document.addEventListener('mousemove', onmousemove)

		document.onmouseup = function () {
			document.removeEventListener('mousemove', onmousemove)
			elem.onmouseup = null
		}
	}
	//# region Drag and drop
	function drag(e) {
		// console.log('Drag start')

		let elem = e.target.closest('.board_widget')
		let shiftX = e.clientX - elem.getBoundingClientRect().left
		let shiftY = e.clientY - elem.getBoundingClientRect().top
		let shadow = createShadowElem(elem)

		elem.after(shadow)

		makeAvatarFromElem(elem, shiftX, shiftY)

		document.ondragstart = () => false

		function onmousemove(e) {
			elem.hidden = true
			let elemBelow = document.elementFromPoint(e.clientX, e.clientY)
			elem.hidden = false
			elem.style.top = e.clientY - shiftY + 'px'
			elem.style.left = e.clientX - shiftX + 'px'

			if (!elemBelow) return false
			if (!elemBelow.closest('.board_widget')) return false

			elemBelow.closest('.board_widget').after(shadow)
		}

		document.addEventListener('mousemove', onmousemove)
		document.onmouseup = function () {
			document.onmouseup = null
			makeElementFromAvatar(elem, shadow)
			shadow.replaceWith(elem)

			let prevIndex = dashStore.components.findIndex(
				(item) => item.uid == elem.previousSibling.dataset.name
			)
			let index = dashStore.components.findIndex(
				(item) => item.uid == elem.dataset.name
			)

			let cuted = JSON.parse(JSON.stringify(dashStore.components[prevIndex]))
			dashStore.components[prevIndex] = JSON.parse(
				JSON.stringify(dashStore.components[index])
			)
			dashStore.components[index] = cuted
			console.log('dashStore.components:', dashStore.components)

			document.removeEventListener('mousemove', onmousemove)
		}
	}
	function createShadowElem(elem) {
		let div = document.createElement('div')

		div.style.gridArea = elem.style.gridArea
		div.dataset.name = elem.dataset.name
		div.style.background = '#e6e6e6'
		div.style.zIndex = '12'
		div.style.opacity = '.5'
		div.className = 'shadow_widget'

		return div
	}
	function makeAvatarFromElem(elem) {
		let rect = elem.getBoundingClientRect()

		elem.style.width = rect.width + 'px'
		elem.style.height = rect.height + 'px'
		elem.style.top = rect.top + 'px'
		elem.style.left = rect.left + 'px'
		elem.style.opacity = 0.5
		elem.style.position = 'fixed'
		elem.style.zIndex = '9999'
	}
	function makeElementFromAvatar(elem) {
		elem.style.top = ''
		elem.style.left = ''
		elem.style.width = ''
		elem.style.height = ''
		elem.style.position = ''
		elem.style.zIndex = ''
		elem.style.opacity = ''
	}
	//# endregion Drag and drop

	function remove(id) {
		dashStore.removeComponent(id)
	}
</script>

<style lang="scss" scoped>
	.board_widget {
		position: relative;
		user-select: none;
		background: $separ;

		&:hover {
		}
	}
	.widget_wrap {
		position: relative;
		z-index: 1;
		overflow: auto;
		height: 100%;
	}
	.board_widget_controls {
		position: absolute;
		top: 0;
		bottom: 0;
		left: 0;
		right: 0;
		display: grid;
		grid-template-areas:
			'A A'
			'B C'
			'D C';
		grid-template-columns: 1fr auto;
		grid-template-rows: auto 1fr auto;
		z-index: 2;
	}
	.bwc_right {
		position: relative;
		width: 10px;
		height: 100%;
		background: #b1b1b1;
		grid-area: C;
		cursor: ew-resize;

		&:after {
			content: '';
			display: block;
			position: absolute;
			top: 50%;
			left: 2px;
			margin-top: -15px;
			width: 2px;
			height: 30px;
			border-left: 2px solid #fff;
			border-right: 2px solid #fff;
		}
		&:before {
			content: '';
			display: block;
			position: absolute;
			bottom: 0;
			left: 0px;
			width: 15px;
			height: 9px;
			border-top: 2px solid #fff;
			transform: rotate(45deg);
			transform-origin: top left;
		}
	}
	.bwc_bottom {
		position: relative;
		grid-area: D;
		height: 10px;
		width: 100%;
		background: #b1b1b1;
		cursor: n-resize;

		&:after {
			content: '';
			display: block;
			position: absolute;
			left: 50%;
			top: 2px;
			margin-left: -15px;
			height: 2px;
			width: 30px;
			border-top: 2px solid #fff;
			border-bottom: 2px solid #fff;
		}
	}
	.bwc_top {
		height: 36px;
		width: 100%;
		background: #fff;
		transition: 0.3s;
		grid-area: A;
		border-top: 1px solid $border;
		border-bottom: 1px solid $border;
		padding: 0 15px;
		padding-right: 10px;
	}
	.bwc_content {
		height: 100%;
		grid-area: B;
		background: rgb(218 218 218 / 76%);
		color: #535353;
		cursor: move;
	}
</style>
