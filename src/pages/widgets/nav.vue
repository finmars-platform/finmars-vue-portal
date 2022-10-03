<template>
	<div class="card_view">
		<div class="card_wrap">
			<div class="card"
				v-for="(item, prop) in stats"
				:key="prop"
				:class="{active: item[0] == active}"
			>
				<div class="card_name">{{ STATS[item[0]] }}</div>
				<div class="card_value">{{ Math.round(item[1]) }}</div>
			</div>
		</div>
	</div>

</template>

<script setup>

	definePageMeta({
		layout: 'auth'
	});

	let route = useRoute()
	let wId = route.query.wId
	let portfolioId = route.query.portfolioId
	let client = route.query.workspace
	let date_to = route.query.date_to

	const STATS = {
		"portfolio":2,"nav":7517531.61778312,"total":4302192.5800554305,"cumulative_return":-1.0,"annualized_return":-1.0,"portfolio_volatility":39.26645467629845,"annualized_portfolio_volatility":136.0229890648989,"sharpe_ratio":-0.007351698465638649,"max_annualized_drawdown":-379.97930904551254,"betta":0.0,"alpha":0.0,"correlation":0.0
	}

	let res = await useApi('widgetsStats.get', {
		params: {
			client
		},
		filters: {
			portfolio: portfolioId,
			date: date_to,
		},
		headers: {
			Authorization: 'Token ' + route.query.token
		}
	})
	delete res.date
	delete res.portfolio
	delete res.benchmark

	let statsCurrent = ref(0)
	let stats = computed(() => {
		let arr = Object.entries(res)

		return arr
	})

	let active = ref('nav')

	onMounted(() => {
		initPostMessageBus()
	})

	function initPostMessageBus() {
		if ( window == top ) return false

		send({
			action: 'init'
		})

		window.addEventListener("message", (e) => {
		});
	}
	function send( data, source = window.parent ) {
		let dataObj = Object.assign(data, {
			wId,
		})
		source.postMessage( dataObj, "*" )
	}
</script>

<style lang="scss" scoped>
	.card_view {
		width: 100%;
	}
	.card_wrap {
		display: flex;
	}
	.card {
		border-radius: 5px;
		border: 1px solid $border;
		border-left: 10px solid #DFEAFF;
		min-width: 154px;
		height: 90px;
		padding: 10px;
		flex-shrink: 0;
		cursor: pointer;

		&.active {
			border-left-color: $primary;
		}

		& + & {
			margin-left: 30px;
		}
	}
	.card_name {
		margin-bottom: 10px;
		text-transform: uppercase;
		color: $text-lighten;
	}
	@media only screen and (max-width: 767px) {
		.card + .card {
			margin-left: 15px;
		}
	}
</style>
