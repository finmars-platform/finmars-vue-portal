<template>
	<div class="card_view">
		<div class="card_wrap"
			v-if="status == 100"
			@mousedown="dragStart"
		>
			<div class="card"
				v-for="(item) in stats"
				:class="{active: item[0] == active}"
				@click="item.id == 'nav' || item.id == 'total' ? setActive(item[0]) : false"
			>
				<div class="card_name">{{ item.name }}</div>
				<div class="card_value">{{ item.value }}</div>
			</div>
		</div>

		<div class="content flex-column aic jcc" v-else>
			<div class="flex aic">
				<FmIcon v-if="status > 100" class="m-r-8" icon="report_problem" />
				{{ STATUSES[status] }}
			</div>

			<FmLoaderData v-if="status < 100" />
		</div>
	</div>
</template>

<script setup>

	let props = defineProps({
		wid: String
	})

	let dashStore = useStoreDashboard()

	let scope = dashStore.getScope(props.wid)

	const STATUSES = {
		0: 'Loading data',
		101: 'Data are not available',
	}
	let status = ref(0)

	let stats = ref(null)
	let statsCurrent = ref(0)
	let active = ref('nav')

	init()

	async function init() {
		let apiOpts = {
			filters: {
				portfolio: scope.portfolio,
				date: scope.date,
			}
		}
		if ( props.client ) apiOpts.params = { client }
		if ( props.token ) apiOpts.headers = { Authorization: 'Token ' + props.token }

		let res = await useApi('widgetsStats.get', apiOpts)

		if ( res.error ) {
			status.value = 101

			return false
		}

		stats.value = res
		status.value = 100
	}
	async function setActive( item ) {
		active.value = item

		// send({
		// 	action: 'changeHistoryType',
		// 	type: item
		// })
	}
	function formatCurency(val) {
		return new Intl.NumberFormat('en-EN', {
			style: 'currency',
			currency: 'USD',
		}).format(val)
	}
	function formatPercent(val) {
		return Math.round(val * 100) + '%'
	}
	function dragStart(e) {
		let elem = e.target.closest('.card_wrap')
		let shiftX = e.clientX + elem.parentNode.scrollLeft

		document.ondragstart = function() {
			return false;
		};

		function onmousemove(e) {
			elem.parentNode.scrollLeft = -(e.clientX - shiftX)
		}

		document.addEventListener('mousemove', onmousemove)

		document.onmouseup = function() {
			document.removeEventListener('mousemove', onmousemove);
			elem.onmouseup = null;
		};
	}
</script>

<style lang="scss" scoped>
	.content {
		height: 100%;
	}
	.card_view {
		width: 100%;
		overflow: auto;
	}
	.card_wrap {
		display: flex;
		cursor: grab;
		user-select: none;
	}
	.card {
		position: relative;
		border-radius: 5px;
		border: 1px solid $border;
		border-left: 10px solid #DFEAFF;
		min-width: 154px;
		max-width: 180px;
		height: 90px;
		padding: 10px;
		flex-shrink: 0;

		&.active {
			border-left-color: $primary;
		}

		& + & {
			margin-left: 30px;
		}
	}
	.card_name {
		margin-bottom: 10px;
		color: $text-lighten;
	}
	.card_value {
		text-align: center;
		position: absolute;
		bottom: 10px;
		left: 0;
		width: 100%;
	}
	@media only screen and (max-width: 767px) {
		.card + .card {
			margin-left: 15px;
		}
	}
</style>
