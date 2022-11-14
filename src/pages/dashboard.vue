<template>
	<div>
		<FmHorizontalPanel>
			<template #leftActions>
				Test bar: {{ clickData }}
			</template>

			<template #rightActions>
				<FmCheckbox v-model="isEdit" label="Edit mode" />
			</template>
		</FmHorizontalPanel>

		<div class="drag_container grid">

		</div>

		<FmTabs v-model="activeTab" :tabs="tabs" />

		<div class="drag_container">
			<div class="shadow_grid"
				v-if="isEdit"
			>
				<div class="shadow_grid_item"
					v-for="(item, key) in mainShadowCells"
					:key="key"
				></div>
			</div>

			<div class="drag_zone grid">
				<div class="board_widget"
					v-for="(item, i) of dashStore.components"
					:key="i"
					:style="{
						'grid-column': 'span ' + item.colls,
						'grid-row': 'span ' + item.rows,
					}"
					:data-name="item.name"
				>
					<component
						class="widget_wrap"
						style="height: 100%;"
						:is="'Widgets' + item.name"
						v-bind="item.props"
					/>

					<div class="board_widget_controls"
						v-if="isEdit"
					>
						<div class="bwc_top flex sb aic">
							<FmIcon
								icon="drag_indicator"
								@mousedown="drag"
							/>
							<FmIcon icon="gear" />
						</div>

						<div class="bwc_right" @mousedown="resizeX"></div>
						<div class="bwc_bottom" @mousedown="resizeY"></div>
					</div>
				</div>
			</div>

			<FmBtn @click="isOpenAddComponents = true">Add components</FmBtn>

			<BaseModal title="Choose component" v-model="isOpenAddComponents" no_padding>
				<h3>System components</h3>
				<div class="fm_list">
					<div class="fm_list_item">Group component</div>
				</div>
				<h3>Common</h3>
				<div class="fm_list">
					<div class="fm_list_item"
						v-for="item in componentsList"
						:class="{active: activeComponent == item.id}"
						@click="activeComponent = item.id"
					>
						{{ item.name }}
					</div>
				</div>

				<template #controls>
					<div class="flex sb">
						<FmBtn type="text">Cancel</FmBtn>
						<FmBtn @click="addComponent()">Done</FmBtn>
					</div>
				</template>
			</BaseModal>
		</div>
	</div>
</template>

<script setup>

	let dashStore = useStoreDashboard()

	let componentsList = [
		{id: 'Nav', name: 'Nav(Stats)', min_colls: 12, min_rows: 1},
		{id: 'Barchart', name: 'Barchart(History)', min_colls: 12, min_rows: 2},
		{id: 'Balance', name: 'Balance', min_colls: 6, min_rows: 3},
		{id: 'Pl', name: 'P&L', min_colls: 12, min_rows: 1},
	]
	let activeComponent = ref(null)

	function addComponent() {
		let component = componentsList.find((item) => item.id == activeComponent.value)

		let new_component = {
			name: component.id,
			colls: component.min_colls,
			rows: component.min_rows,
		}

		dashStore.components.push(new_component)

		isOpenAddComponents.value = false
	}

	let isOpenAddComponents = ref(false)

	definePageMeta({
		// middleware: 'auth',
		bread: [
			{
				text: 'Dashboard',
				disabled: true
			},
		],
	});

	let isEdit = ref(true)

	let tabs = ['Test_1', 'Test_2', '+']
	let activeTab = ref('Test_1')
	let clickData = ref('no clicks')

	let countRows = computed(() => {
		let allColls = 0
		let allRows = 0

		dashStore.components.forEach((item) => {
			allColls += item.colls
			allRows += item.rows
		})
		return Math.ceil(allColls / 12) + allRows - dashStore.components.length
	})
	let mainShadowCells = computed(() => {
		return new Array(countRows.value * 12)
	})

	function resizeX(e) {
		console.log('Resize start')
		let elem = e.target.closest('.board_widget')
		let grid = e.target.closest('.grid')
		let rect = grid.getBoundingClientRect();
		let halfColl = rect.width / 12
		let shiftX = e.clientX

		document.ondragstart = function() {
			return false;
		};

		let startColls = dashStore.components.find((item) => item.name == elem.dataset.name).colls

		function onmousemove(e) {
		console.log('Resize onmousemove')
			if ( Math.abs(e.clientX - shiftX) > halfColl ) {
				let shift = Math.abs(e.clientX - shiftX)
				if ( e.clientX - shiftX > 0) {
					dashStore.components.find((item) => item.name == elem.dataset.name).colls =
						startColls + Math.floor( shift / halfColl )
				} else {

					dashStore.components.find((item) => item.name == elem.dataset.name).colls =
						startColls - Math.floor( shift / halfColl )
				}

			}
		}

		document.addEventListener('mousemove', onmousemove)

		document.onmouseup = function() {
			document.removeEventListener('mousemove', onmousemove);
			elem.onmouseup = null;
		};
	}
	function resizeY(e) {
		console.log('Resize y start')
		let elem = e.target.closest('.board_widget')
		let grid = e.target.closest('.grid')
		let rect = grid.getBoundingClientRect();
		let halfColl = 50
		let shiftY = e.clientY

		document.ondragstart = function() {
			return false;
		};

		let startColls = dashStore.components.find((item) => item.name == elem.dataset.name).rows

		function onmousemove(e) {
		console.log('Resize onmousemove')
			if ( Math.abs(e.clientY - shiftY) > halfColl ) {
				let shift = Math.abs(e.clientY - shiftY)
				if ( e.clientY - shiftY > 0) {
					dashStore.components.find((item) => item.name == elem.dataset.name).rows =
						startColls + Math.floor( shift / halfColl )
				} else {

					dashStore.components.find((item) => item.name == elem.dataset.name).rows =
						startColls - Math.floor( shift / halfColl )
				}

			}
		}

		document.addEventListener('mousemove', onmousemove)

		document.onmouseup = function() {
			document.removeEventListener('mousemove', onmousemove);
			elem.onmouseup = null;
		};
	}
	function drag(e) {
		console.log('Drag start')
		let elem = e.target.closest('.board_widget')

		let div = document.createElement('div')
		div.style.gridArea = elem.style.gridArea
		div.style.background = '#e6e6e6'
		elem.style.zIndex = '12'
		div.style.opacity = '.5'
		div.className = 'shadow_widget'

		elem.after(div)

		elem.style.position = 'fixed'
		elem.style.zIndex = '9999'
		elem.style.top = e.clientY + 'px'
		elem.style.left = e.clientX + 'px'

		document.ondragstart = function() {
			return false;
		};

		function onmousemove(e) {
			elem.hidden = true;
			let elemBelow = document.elementFromPoint(e.clientX, e.clientY);
			elem.hidden = false;
			elem.style.top = e.clientY + 'px'
			elem.style.left = e.clientX + 'px'

			if ( !elemBelow ) return false
			if ( !elemBelow.closest('.board_widget') ) return false
			console.log(elemBelow)


			elemBelow.closest('.board_widget').after(div)
		}

		document.addEventListener('mousemove', onmousemove)

		document.onmouseup = function() {
			elem.style.top = ''
			elem.style.left = ''
			elem.style.position = ''
			elem.style.zIndex = ''

			div.replaceWith(elem)
			document.removeEventListener('mousemove', onmousemove);
			elem.onmouseup = null;
		};
	}
</script>

<style lang="scss" scoped>
	.drag_container {
		position: relative;
		margin: 20px 30px;
	}
	.grid {
		display: grid;
		gap: 20px;
		grid-template-columns: repeat(12, 1fr);
		grid-auto-rows: 50px;
	}
	.shadow_grid {
		position: absolute;
		display: grid;
		width: 100%;
		gap: 20px;
		grid-template-columns: repeat(12, 1fr);
		grid-template-rows: repeat(6, 50px);
		z-index: 0;

		&_item {
			border: 1px solid #ecded2;
			background: $primary-lighten-2;
			border-radius: 4px;
		}
	}
	.board_widget {
		position: relative;
		user-select: none;
		background: $separ;

		&:hover {
			.bwc_top {
				top: -20px;
			}
		}
	}
	.widget_wrap {
		position: relative;
		z-index: 2;
		overflow: auto;
	}
	.board_widget_controls {
		position: absolute;
		top: 0;
		bottom: 0;
		left: 0;
		right: 0;
		z-index: 1;
	}
	.bwc_right {
		position: absolute;
		top: 0;
		right: -7px;
		width: 7px;
		height: 100%;
		background: rgb(255 182 122);
		border-radius: 4px;
		cursor: ew-resize;
	}
	.bwc_bottom {
		position: absolute;
		left: 0;
		bottom: -7px;
		height: 7px;
		width: 100%;
		background: rgb(255 182 122);
		border-radius: 4px;
		border: 1px solid $border;
		cursor: n-resize;
	}
	.bwc_top {
		position: absolute;
		left: 0;
		top: 0px;
		height: 20px;
		width: 100%;
		background: #eee;
		border-radius: 4px;
		border: 1px solid $border;
		transition: 0.3s;
	}

</style>
