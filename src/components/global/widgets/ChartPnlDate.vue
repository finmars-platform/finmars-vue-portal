<template>
	<div class="wrap">
		<div class="title flex aic sb">
			<div>P&L (USD)</div>
			<div>{{ total }}</div>
		</div>

		<div v-if="status == 100" class="content">
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
				:style="{background: dashStore.instrColors['Asset Types' + item[0]]?.slice(0, 7) + '0f'}"
				:class="{minus: item[1] < 0}"
			>
				<div class="chart_field">
					<div class="center_line"></div>
					<div class="chart_bar"
						:class="{minus: item[1] < 0}"
						:style="{
							width: Math.abs(item[1] / maxTickStock * 50) + '%',
							background: dashStore.instrColors['Asset Types' + item[0]]
						}"
					></div>
				</div>
				<div class="chart_label flex">
					<div class="chart_total">{{ precisionTick(item[1]) }}</div>
					<div class="chart_inst">{{ item[0] }}</div>
				</div>
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
	import dayjs from 'dayjs'

	let props = defineProps({
		wid: {
			type: String,
			required: true
		}
	})

	const STATUSES = {
		0: 'Waiting data',
		101: 'Data are not available',
		201: 'No [Category type] property',
	}
	let status = ref(0)

	let dashStore = useStoreDashboard()
	let widget = dashStore.getWidget(props.wid)

	let total = ref('0 USD')
	let instruments = ref(null)
	let maxTickStock = ref(null)

	let inputs = computed(() => {
		let props = dashStore.scope.filter((prop) => prop.cid == widget.id && prop.direct == 'input')
		let obj = {}

		props.forEach((prop) => {
			obj[prop.name] = prop.__val
		})
		return obj
	})

	let outputs = {}
	let propsTest = dashStore.scope.filter((prop) => prop.cid == widget.id && prop.direct == 'output')
	propsTest.forEach((prop) => {
		outputs[prop.name] = prop
	})

	if ( dayjs(inputs.value.date).diff(dayjs(), 'day') >= 0 ) {
			status.value = 101
		}

	watch(
		inputs,
		() => prepareData()
	)

	async function prepareData() {
		if ( dayjs(inputs.value.date).diff(dayjs(), 'day') >= 0 ) {
			status.value = 101
			return false
		}

		if ( !inputs.value.category_type ) {
			status.value = 201
			return false
		}
		let pl = await dashStore.getHistoryPnl({
			date: inputs.value.date,
			category: inputs.value.category_type
		})

		if ( pl.error ) {
			status.value = 101

			return false
		}

		if ( !pl.items ) {
			status.value = 102

			return false
		}

		total.value = new Intl.NumberFormat('en-US', {
			maximumFractionDigits: 2
		}).format(pl.total) + ' USD';

		let items = Object.entries(pl.items)
		items = items
			.filter((item) => item[1] != 0 && item[1] != null)
			.sort( (a, b) => b[1] - a[1])

		instruments.value = items

		let arr = instruments.value.map(item => item[1])
		let tickMax = Math.max(...arr)
		let tickMin = Math.min(...arr)
		let tickTo = Math.abs(tickMax) > Math.abs(tickMin) ? Math.abs(tickMax) : Math.abs(tickMin)
		let countZerro = Math.floor(( ""+ Math.round(tickTo)).length / 3)
		maxTickStock.value = Math.ceil(tickTo / Math.pow( 1000, countZerro )) * Math.pow( 1000, countZerro )

		status.value = 100
	}

	function precisionTick(value) {
		return new Intl.NumberFormat('en-US', {
				notation: "compact",
				maximumFractionDigits: 2
			}).format(value);
	}
	onMounted(() => {
	})
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
		// min-height: calc(100vh - 38px);
		min-height: calc(100% - 36px);
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
