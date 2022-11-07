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

		<!-- <div class="fm_container grid"
			:style="topAreaGrid">
			<FmCard class="test_w_9" title="Scope 1 - Widget 9"></FmCard>
			<FmCard class="test_w_10" title="Scope 1 - Widget 10"></FmCard>
		</div> -->

		<FmTabs v-model="activeTab" :tabs="tabs" />

		<div class="fm_container">
			<div class="drag_zone grid">
				<div class="board_widget"
					v-for="item in components"
					:style="{
						'grid-column': 'span ' + item.colls,
						'grid-row': 'span ' + item.rows,
					}"
					:data-name="item.name"
				>
					<component :is="item.name" style="height: 100%;" />

					<div class="settings_top" @mousedown="drag"></div>
					<div class="rs_right" @mousedown="resize"></div>
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
					<div class="fm_list_item">Nav(Stats)</div>
					<div class="fm_list_item">Barchart(History)</div>
					<div class="fm_list_item">Balance</div>
					<div class="fm_list_item">P&L</div>
				</div>

				<template #controls>
					<div class="flex sb">
						<FmBtn type="text">Cancel</FmBtn>
						<FmBtn>Done</FmBtn>
					</div>
				</template>
			</BaseModal>
		</div>
	</div>
</template>

<script setup>

	let componentsList = [
		{id: 'nav', name: 'Nav(Stats)', min_colls: 12, min_rows: 1},
		{id: 'nav', name: 'Barchart(History)', min_colls: 12, min_rows: 1},
		{id: 'nav', name: 'Nav(Stats)', min_colls: 12, min_rows: 1},
		{id: 'nav', name: 'Nav(Stats)', min_colls: 12, min_rows: 1},
	]

	let components = reactive([
		{name: 'Nav', colls: 12, rows: 1},
		{name: 'Balance', colls: 4, rows: 4},
	])
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

	let tabs = ['Test_1', 'Test_2']
	let activeTab = ref('Test_1')
	let clickData = ref('no clicks')

	let topAreaGrid = {
		'grid-template-areas': `
			"A A A A   B B B B   B B B B"
		`,
		'grid-template-rows': 'repeat(1, 100px)'
	}
	let mainAreaGrid = reactive({
	})

	function resize(e) {
		let elem = e.target.closest('.board_widget')
		let grid = e.target.closest('.grid')
		let rect = grid.getBoundingClientRect();
		let halfColl = rect.width / 12
		let shiftX = e.clientX

		document.ondragstart = function() {
			return false;
		};

		let startColls = components.find((item) => item.name == elem.dataset.name).colls

		function onmousemove(e) {
			if ( Math.abs(e.clientX - shiftX) > halfColl ) {
				let shift = Math.abs(e.clientX - shiftX)
				if ( e.clientX - shiftX > 0) {
					components.find((item) => item.name == elem.dataset.name).colls =
						startColls + Math.floor( shift / halfColl )
				} else {

					components.find((item) => item.name == elem.dataset.name).colls =
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
		div.className = 'shadow_widget'

		elem.after(div)

		elem.style.position = 'fixed'
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
			elem.style.position = 'static'

			div.replaceWith(elem)
			document.removeEventListener('mousemove', onmousemove);
			elem.onmouseup = null;
		};
	}
</script>

<style lang="scss" scoped>
	.grid {
		display: grid;
		gap: 20px;
		grid-template-columns: repeat(12, 1fr);
		grid-template-rows: repeat(12, 50px);
	}
	.shadow_widget {
		background: #000;
	}
	.board_widget {
		position: relative;
		user-select: none;
	}
	.rs_right {
		position: absolute;
		top: 0;
		right: -10px;
		width: 10px;
		height: 100%;
		background: $primary;
	}

</style>
