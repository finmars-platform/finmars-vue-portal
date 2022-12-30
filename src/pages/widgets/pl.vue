<template>
	<div class="wrap">
		<div class="title flex aic sb">
			<div>P&L (USD)</div>
			<div>{{ total }}</div>
		</div>
		<div class="content" v-if="status == 100">
			<div class="chart_row header">
				<div class="chart_field">
					<div class="tick tick_min">-{{ precisionTick(maxTickStock) }}</div>
					<div class="tick tick_zero">0</div>
					<div class="tick tick_max">{{ precisionTick(maxTickStock) }}</div>
				</div>
				<div class="chart_total">Total P&L</div>
			</div>
			<div class="chart_row"
				v-for="(item, i) in instruments"
				:key="i"
				:style="{background: (inheritColors[item.name] || COLORS[Math.random(1, 20)])?.slice(0, 7) + '0f'}"
				:class="{minus: item.value < 0}"
			>
				<div class="chart_field">
					<div class="center_line"></div>
					<div class="chart_bar"
						:class="{minus: item.value < 0}"
						:style="{
							width: Math.abs(item.value / maxTickStock * 50) + '%',
							background: (inheritColors[item.name] || COLORS[Math.random(1, 20)])
						}"
					></div>
				</div>
				<div class="chart_label flex">
					<div class="chart_total">{{ precisionTick(item.value) }}</div>
					<div class="chart_inst">{{ item.name }}</div>
				</div>
			</div>
		</div>
		<div class="content flex-column aic jcc" v-else>
			<div class="flex aic">
				<FmIcon v-if="status > 100" class="m-r-8" icon="report_problem" />
				{{ STATUSES[status] }}
			</div>
		</div>
	</div>
</template>

<script setup>
	import dayjs from 'dayjs'
	definePageMeta({
		layout: 'auth'
	});

	const STATUSES = {
		0: 'Waiting data',
		101: 'Data are not available',
		102: 'Data are missing',
		103: 'Bad/incomplete input data',
		104: 'Data display error',
	}
	let status = ref(0)

	let route = useRoute()
	let wId = route.query.wId
	let portfolioId = route.query.portfolioId
	let client = route.query.workspace
	let date_to = route.query.date_to

	const COLORS = [
		'#577590CC',
		'#43AA8BCC',
		'#F9AB4B',
		'#FA6769',
		'#F9C74F',
		'#979BFF',
		'#D9ED92',
		'#C8D7F9',
		'#96B5B4',
		'#AB7967',
		'#577590CC',
		'#43AA8BCC',
		'#F9AB4B',
		'#FA6769',
		'#F9C74F',
		'#979BFF',
		'#D9ED92',
		'#C8D7F9',
		'#96B5B4',
		'#AB7967',
	]
	let inheritColors = reactive({})
	let total = ref('0 USD')
	let instruments = ref(null)
	let maxTickStock = ref(null)

	function precisionTick(value) {
		return new Intl.NumberFormat('en-US', {
				notation: "compact",
				maximumFractionDigits: 2
			}).format(value);
	}
	onMounted(() => {
		initPostMessageBus()

		setTimeout(() => {
			if ( status.value == 0 ) status.value = 101
		}, 1000 * 5)
	})
	function initPostMessageBus() {
		if ( window == top ) return false

		send({
			action: 'init'
		})

		window.addEventListener("message", async (e) => {
			try {
				if ( 'clickOnChart' == e.data.action ) {
					if ( dayjs(e.data.date.date).diff(dayjs(), 'day') >= 0 ) {
						status.value = 101

						return false
					}
					let i = 0
					for ( let prop in e.data.data ) {
						inheritColors[prop] = COLORS[i]
						i++
					}

					let pl = await useApi('widgetsHistory.get', {
						params: {type: 'pl', client},
						filters: {
							portfolio: portfolioId,
							date_from: e.data.date.date,
							date_to: e.data.date.date,
						},
						headers: {
							Authorization: 'Token ' + route.query.token
						},
						provider: null
					})

					if ( pl.error ) {
						status.value = 101

						return false
					}

					if ( !pl.items || pl.items.length == 0  ) {
						status.value = 102

						return false
					}
					let active = ref(null)
					let currentDate = pl.items.find(item => item.date == e.data.date.date)

					if ( !currentDate ) return false
					total.value = new Intl.NumberFormat('en-US', {
						maximumFractionDigits: 2
					}).format(currentDate.total) + ' USD';

					let currentCategory = currentDate.categories.find(item => item.name == e.data.category)
					if ( !currentCategory ) return false
					let items = currentCategory.items
						.filter((item) => item.value != 0)
						.sort( (a, b) => b.value - a.value)

					instruments.value = items

					let arr = instruments.value.map(item => item.value)
					let tickMax = Math.max(...arr)
					let tickMin = Math.min(...arr)
					let tickTo = Math.abs(tickMax) > Math.abs(tickMin) ? Math.abs(tickMax) : Math.abs(tickMin)
					let countZerro = Math.floor(( ""+ Math.round(tickTo)).length / 3)
					maxTickStock.value = Math.ceil(tickTo / Math.pow( 1000, countZerro )) * Math.pow( 1000, countZerro )

					status.value = 100
				}
				if ( 'updateOpts' == e.data.action ) {

					if ( dayjs(e.data.date.date).diff(dayjs(), 'day') >= 0 ) {

						status.value = 101

						return false
					}
					portfolioId = e.data.data.portfolioId
					date_to = e.data.data.date_to

					for ( let prop in e.data.data ) {
						inheritColors[prop] = COLORS[i]
						i++
					}

					let pl = await useApi('widgetsHistory.get', {
						params: {type: 'pl', client},
						filters: {
							portfolio: portfolioId,
							date_from: date_to,
							date_to: date_to,
						},
						headers: {
							Authorization: 'Token ' + route.query.token
						},
						provider: null
					})

					if ( pl.error ) {
						status.value = 101

						return false
					}

					if ( !pl.items || pl.items.length == 0  ) {
						status.value = 102

						return false
					}
					let active = ref(null)
					let currentDate = pl.items.find(item => item.date == e.data.date.date)

					if ( !currentDate ) return false
					total.value = new Intl.NumberFormat('en-US', {
						maximumFractionDigits: 2
					}).format(currentDate.total) + ' USD';

					let currentCategory = currentDate.categories.find(item => item.name == e.data.category)
					if ( !currentCategory ) return false
					let items = currentCategory.items
						.filter((item) => item.value != 0)
						.sort( (a, b) => b.value - a.value)

					instruments.value = items

					let arr = instruments.value.map(item => item.value)
					let tickMax = Math.max(...arr)
					let tickMin = Math.min(...arr)
					let tickTo = Math.abs(tickMax) > Math.abs(tickMin) ? Math.abs(tickMax) : Math.abs(tickMin)
					let countZerro = Math.floor(( ""+ Math.round(tickTo)).length / 3)
					maxTickStock.value = Math.ceil(tickTo / Math.pow( 1000, countZerro )) * Math.pow( 1000, countZerro )

					status.value = 100
				}


			} catch(e) {
			console.log('e:', e)

				status.value = 104
			}

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
	.wrap {
		border-radius: 5px;
		border: 1px solid $border;
	}
	.title {
		height: 36px;
		line-height: 36px;
		background: $main-darken;
		padding: 0 20px;
	}
	.content {
		min-height: calc(100vh - 38px);
	}
	.chart_row {
		display: flex;
		border-bottom: 1px solid $border;
		height: 30px;

		&.header {
			height: 20px;

			.chart_field {
				border-right: none;
			}
			.chart_total {
				line-height: 20px;
				font-size: 12px;
			}
		}
	}
	.chart_field {
		width: 260px;
		height: 100%;
		position: relative;
		border-right: 1px solid $border;
	}
	.center_line {
		width: 1px;
		background: $border;
		height: 100%;
		position: absolute;
		left: 50%;
	}
	.chart_bar {
		background: $primary;
		height: 100%;
		border-radius: 0px 3px 3px 0px;
		position: absolute;
		left: 50%;
		margin-left: 1px;
		margin-right: 0;

		&.minus {
			border-radius: 3px 0px 0px 3px;
			left: auto;
			right: 50%;
			margin-left: 0;
		}
	}
	.chart_total {
		text-align: center;
		margin-left: 50px;
		width: 52px;
		height: 100%;
		line-height: 30px;
	}
	.chart_inst {
		height: 100%;
		line-height: 30px;
		margin-left: 30px;
	}
	.tick {
		position: absolute;
		width: 30px;
		font-size: 12px;
		text-align: center;
		height: 100%;
		line-height: 20px;
	}
	.tick_max {
		right: -15px;
	}
	.tick_zero {
		left: 50%;
		margin-left: -15px;
	}
	.tick_min {
		left: 0;
	}
	@media only screen and (min-width: 501px) {
		.chart_row {
			background: none !important;
		}
	}
	@media only screen and (max-width: 500px) {
		.chart_row.header {
			.chart_total {
				display: none;
			}
		}
		.tick_max {
			right: 0;
		}
		.chart_field {
			width: 100%;
		}
		.chart_row:not(.header) {
			flex-wrap: wrap;
			justify-content: flex-end;
			height: 60px;

			&:not(.minus) {
				.chart_total {
					order: 1;
					margin-left: 20px;
				}
			}

			.chart_field {
				height: 30px;
				border-bottom: 1px solid $border;
			}

			&.minus {
				justify-content: flex-start;
			}
		}

		.chart_total {
			margin-left: 0;
			height: 30px;
		}
		.chart_inst {
			height: 30px;
			margin-left: 20px;
		}
	}
</style>
