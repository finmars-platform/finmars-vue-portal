<template>
	<div class="card_view">
		<div class="card_wrap"
			v-if="status == 100"
			@mousedown="dragStart"
		>
			<div class="card"
				v-for="(item) in stats"
				:class="{active: stats_map[item.id] == outputs.type.__val}"
				@click="setActive(item)"
			>
				<div class="card_name">{{ item.name }}</div>
				<div class="card_value">{{ formatByType(item) }}</div>
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

	import dayjs from 'dayjs';

	const props = defineProps({
		uid: String
	})

	const dashStore = useStoreDashboard()
	let component = dashStore.getComponent(props.uid)

	const inputs = computed(() => {
		let props = dashStore.props.inputs.filter((prop) => prop.component_id == component.uid)
		let obj = {}

		props.forEach((prop) => {
			obj[prop.key] = prop.__val
		})
		return obj
	})
	const outputs = computed(() => {
		let props = dashStore.props.outputs.filter((prop) => prop.component_id == component.uid)
		let obj = {}

		props.forEach((prop) => {
			obj[prop.key] = prop
		})
		return obj
	})

	watch(inputs, () => loadData())

	const stats_map = {
		'nav': 'nav',
		'total': 'pl'
	}
	const STATUSES = {
		0: 'Loading data',
		101: 'Data are not available',
	}
	let status = ref(0)
	let stats = ref(null)

	loadData()

	async function loadData() {
		if ( dayjs(inputs.value.date).diff(dayjs(), 'day') >= 0 ) {
			status.value = 101
			return false
		}
		let apiOpts = {
			filters: {
				portfolio: inputs.value.portfolio,
				date: inputs.value.date,
			}
		}

		let res = await useApi('widgetsStats.get', apiOpts)

		if ( res.error ) {
			status.value = 101

			return false
		}

		stats.value = res
		status.value = 100
	}
	async function setActive( item ) {
		if (stats_map[item.id] == 'nav' || stats_map[item.id] == 'pl') {
			outputs.value.type.__val = stats_map[item.id]
		}
	}
	function formatByType( item ) {
		if ( item.type == 'currency' ) return formatCurency(item.value)
		if ( item.type == 'percent' ) return formatPercent(item.value)
		if ( item.type == 'ratio' ) return Math.round(item.value * 100) / 100
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
		color: var(--card-secondary-text-color);
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
