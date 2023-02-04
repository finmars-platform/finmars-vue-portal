<template>
	<div class="card_view">
		<div class="card_wrap"
			v-if="status == 100"
			@mousedown="dragStart"
		>
			<div class="card"
				v-for="(item) in stats"
				:class="{active: item.id == active}"
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


	let props = defineProps({
		wid: String
	})

	let dashStore = useStoreDashboard()
	let widget = dashStore.getWidget(props.wid)

	let scope = computed(() => {
		return dashStore.scopes[widget.scope]
	})

	const STATUSES = {
		0: 'Loading data',
		101: 'Data are not available',
	}
	let status = ref(0)


	let stats = ref(null)
	let active = ref('nav')

	let portfolio
	let date

	for ( let prop in scope.value ) {
		if ( typeof scope.value[prop] != 'object' ) continue

		let value = scope.value[prop].value

		if ( prop == 'portfolio' ) portfolio = scope.value[prop].value
		if ( prop == 'date_to' ) date = typeof scope.value[prop] == 'string'
						? scope.value[prop]
						: scope.value[prop].value

		if ( value.includes('WATCH') ) {
			let [scope, watchProp] = value.split(':')[1].split('.')

			if ( prop == 'portfolio' ) portfolio = dashStore.scopes[scope][watchProp].value
			if ( prop == 'date_to' ) date = typeof dashStore.scopes[scope][watchProp] == 'string'
						? dashStore.scopes[scope][watchProp]
						: dashStore.scopes[scope][watchProp].value

			watch(
				() => dashStore.scopes[scope][watchProp],
				() => {
					if ( prop == 'portfolio' ) portfolio = dashStore.scopes[scope][watchProp].value
					if ( prop == 'date_to' ) date = typeof dashStore.scopes[scope][watchProp] == 'string'
						? dashStore.scopes[scope][watchProp]
						: dashStore.scopes[scope][watchProp].value
					console.log('dsdddd', 'WATCH')
					loadData()
				}
			)
		} else {

			watch(
				() => scope.value[prop],
				() => {
					if ( prop == 'portfolio' ) portfolio = scope.value[prop].value
					if ( prop == 'date_to' ) date = scope.value[prop].value

					loadData()
				}
			)
		}
	}

	loadData()

	async function loadData() {
		if ( dayjs(scope.value.date_to.value).diff(dayjs(), 'day') >= 0 ) {
			status.value = 101
			return false
		}
		let apiOpts = {
			filters: {
				portfolio: portfolio,
				date: date,
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
		if (item.id == 'nav' || item.id == 'total') {
			active.value = item.id
			scope.value._cbp_type = item.id == 'total' ? 'pl' : item.id
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
