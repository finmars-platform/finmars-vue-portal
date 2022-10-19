<template>
	<div class="card_view">
		<div class="card_wrap"
			v-if="stats"
			@mousedown="dragStart"
		>
			<div class="card"
				v-for="(item, prop) in stats"
				:key="prop"
				:class="{active: item[0] == active}"
				@click="item[0] == 'nav' || item[0] == 'total' ? setActive(item[0]) : false"
			>
				<div class="card_name">{{ STATS[item[0]] }}</div>
				<div class="card_value">{{ STATS_FORMAT[item[0]](item[1])  }}</div>
			</div>
		</div>
		<div v-else>No data</div>
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
		"nav": 'NAV',
		"total": 'Total P&L',
		"cumulative_return": 'Cumulative return',
		"annualized_return": 'Annualized return',
		"portfolio_volatility": 'Ann. Volatility',
		"annualized_portfolio_volatility": 'Annualized portfolio volatility',
		"sharpe_ratio": 'Sharpe ratio (rf=0%)',
		"max_annualized_drawdown": 'Max annualized drawdown',
		"betta": 'Beta',
		"alpha": 'Alpha vs Index, ann.',
		"correlation": 'Correlation (vs. Index)',
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

	const STATS_FORMAT = {
		"nav": formatCurency,
		"total": formatCurency,
		"cumulative_return": formatPercent,
		"annualized_return": formatPercent,
		"portfolio_volatility": formatPercent,
		"annualized_portfolio_volatility": formatPercent,
		"sharpe_ratio": (val) => Math.round(val * 100) / 100,
		"max_annualized_drawdown": formatPercent,
		"betta": (val) => Math.round(val * 100) / 100,
		"alpha": formatPercent,
		"correlation": (val) => Math.round(val * 100) / 100
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

	async function setActive( item ) {
		active.value = item

		send({
			action: 'changeHistoryType',
			type: item
		})
	}

	let statsCurrent = ref(0)
	let stats = computed(() => {
		if ( res && !res.error ) {
			let arr = Object.entries(res)
			return arr

		} else return null

	})
	console.log('stats:', stats)

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
