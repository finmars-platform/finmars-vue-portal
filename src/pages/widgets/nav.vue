<template>
	<div class="card_view scrollable">
		<div class="card_wrap" v-if="status == 100" @mousedown="dragStart">
			<div
				class="card"
				v-for="(item, prop) in stats"
				:key="prop"
				:class="{ active: item[0] == active }"
				@click="
					item[0] == 'nav' || item[0] == 'total'
						? setActive(item[0])
						: false
				"
			>
				<div class="card_name">{{ STATS[item[0]] }}</div>
				<div class="card_value">
					{{
						STATS_FORMAT[item[0]]
							? STATS_FORMAT[item[0]](item[1])
							: ''
					}}
				</div>

				<FmMenu
					v-if="STATS_INFO[item[0]]"
					class="card_info"
					open-on-hover
					:offsetX="24"
					:offsetY="-24"
				>
					<template #btn>
						<FmIcon
							class="card_info_icon"
							icon="info_outlined"
							size="14"
						/>
					</template>

					<div class="card_tooltip">
						<div class="card_tooltip_h">
							{{ STATS_INFO[item[0]].h }}
						</div>
						<div
							class="card_tooltip_t"
							v-html="STATS_INFO[item[0]].t"
						></div>
					</div>
				</FmMenu>
			</div>
		</div>
		<div class="error_wrap flex-column aic jcc" v-else>
			<div class="flex aic">
				<FmIcon
					v-if="status > 100"
					class="m-r-8"
					icon="report_problem"
				/>
				{{ STATUSES[status] }}
			</div>
		</div>
	</div>
</template>

<script setup>
	/* eslint-disable */
	import dayjs from 'dayjs';

	definePageMeta({
		layout: 'auth'
	});

	let route = useRoute();
	let wId = route.query.wId;
	let portfolioId = route.query.portfolioId;
	let client = route.query.workspace;
	let date_to = route.query.date_to;

	const STATS = {
		nav: 'NAV',
		total: 'Total P&L',
		cumulative_return: 'Cumulative return',
		annualized_return: 'Annualized return',
		portfolio_volatility: 'Portfolio Volatility',
		annualized_portfolio_volatility: 'Annualized portfolio volatility',
		sharpe_ratio: 'Sharpe ratio (rf=0%)',
		max_annualized_drawdown: 'Max annualized drawdown',
		betta: 'Beta',
		alpha: 'Alpha vs Index, ann.',
		correlation: 'Correlation (vs. Index)'
	};

	const STATS_INFO = {
		cumulative_return: {
			h: 'Cumulative Return (CR)',
			t: 'Time-weighted total portfolio performance since inception date'
		},
		annualized_return: {
			h: 'Annualized Return (AR)',
			t: `AR = (CR)^(1/N), <br>
				N - number of years since inception <br>
				CR -cumulative return`
		},
		portfolio_volatility: {
			h: 'Portfolio Volatility (PV)',
			t: 'the standard deviation of portfolio performance (taken monthly values of performance)'
		},
		annualized_portfolio_volatility: {
			h: 'Annualized Volatility (AV)',
			t: 'AV = PV * √(12)'
		},
		sharpe_ratio: {
			h: 'Sharpe Ratio (ShR)',
			t: `ShR = CR/AV <br>
					CR - cumulative return <br>
					AV - annualized volatility`
		},
		max_annualized_drawdown: {
			h: 'Max  DrawDown Annualized',
			t: 'MAX by absolute value negative performance taken within any 12 consecutive months since inception.'
		},
		correlation: {
			h: 'Correlation vs. Index',
			t: 'The correlation of performances between the portfolio and benchmark  index (S&P 500)'
		},
		alpha: {
			h: 'Alpha',
			t: 'The alpha of a portfolio is the excess return it produces compared to a benchmark index (S&P 500)'
		},
		betta: {
			h: 'Beta',
			t: 'Portfolio beta measures its relative volatility, expressed as the weighted average of the betas of each individual security within it.'
		}
	};

	const STATUSES = {
		0: 'Loading data',
		101: 'Data are not available'
	};
	let status = ref(0);

	function formatCurency(val) {
		return new Intl.NumberFormat('en-EN', {
			style: 'currency',
			currency: 'USD'
		}).format(val);
	}

	function formatPercent(val) {
		return Math.round(val * 100) + '%';
	}

	const STATS_FORMAT = {
		nav: formatCurency,
		total: formatCurency,
		cumulative_return: formatPercent,
		annualized_return: formatPercent,
		portfolio_volatility: formatPercent,
		annualized_portfolio_volatility: formatPercent,
		sharpe_ratio: (val) => Math.round(val * 100) / 100,
		max_annualized_drawdown: formatPercent,
		betta: (val) => Math.round(val * 100) / 100,
		alpha: formatPercent,
		correlation: (val) => Math.round(val * 100) / 100
	};

	let stats = ref(null);

	loadData();

	async function loadData() {
		if (dayjs(date_to).diff(dayjs(), 'day') >= 0) {
			status.value = 101;
			return false;
		}

		let res = await useApi('widgetsStats.get', {
			params: {
				client
			},
			filters: {
				portfolio: portfolioId,
				date: date_to
			},
			headers: {
				Authorization: 'Token ' + route.query.token
			},
			provider: null
		});

		if (res._$error) {
			status.value = 101;

			return false;
		}

		delete res.date;
		delete res.portfolio;
		delete res.benchmark;

		if (res) {
			let arr = Object.entries(res);
			stats.value = arr;
			status.value = 100;
		}
	}

	async function setActive(item) {
		active.value = item;

		send({
			action: 'changeHistoryType',
			type: item
		});
	}

	let statsCurrent = ref(0);
	let active = ref('nav');

	onMounted(() => {
		initPostMessageBus();
	});

	function initPostMessageBus() {
		if (window == top) return false;

		send({
			action: 'init'
		});

		window.addEventListener('message', async (e) => {
			if ('updateOpts' == e.data.action) {
				portfolioId = e.data.data.portfolioId;
				date_to = e.data.data.date_to;

				let res = await useApi('widgetsStats.get', {
					params: {
						client
					},
					filters: {
						portfolio: portfolioId,
						date: date_to
					},
					headers: {
						Authorization: 'Token ' + route.query.token
					},
					provider: null
				});
				delete res.date;
				delete res.portfolio;
				delete res.benchmark;

				if (res && !res._$error) {
					let arr = Object.entries(res);
					stats.value = arr;
					status.value = 100;
				} else {
					status.value = 101;
				}
			}
		});
	}

	function dragStart(e) {
		let elem = e.target.closest('.card_wrap');
		let shiftX = e.clientX + elem.parentNode.scrollLeft;

		document.ondragstart = function () {
			return false;
		};

		function onmousemove(e) {
			elem.parentNode.scrollLeft = -(e.clientX - shiftX);
		}

		document.addEventListener('mousemove', onmousemove);

		document.onmouseup = function () {
			document.removeEventListener('mousemove', onmousemove);
			elem.onmouseup = null;
		};
	}

	function send(data, source = window.parent) {
		let dataObj = Object.assign(data, {
			wId
		});
		source.postMessage(dataObj, '*');
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
		border: 1px solid var(--table-border-color);
		border-left: 10px solid #dfeaff;
		min-width: 154px;
		max-width: 180px;
		height: 90px;
		padding: 13px;
		flex-shrink: 0;

		&.active {
			border-left-color: var(--primary-color);
		}

		& + & {
			margin-left: 30px;
		}
	}

	.card_name {
		margin-bottom: 5px;
		color: var(--card-secondary-text-color);
		height: 30px;
		font-size: 13px;
		text-align: center;
		vertical-align: middle;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.card_value {
		text-align: center;
		width: 100%;
	}

	.card_tooltip {
		z-index: 100;
		font-size: 12px;
		padding: 5px 12px;
		max-width: 350px;

		&_h {
			font-weight: 500;
			color: var(--primary-color);
			margin-bottom: 3px;
		}

		&_t {
			color: var(--card-secondary-text-color);
		}
	}

	.card_info {
		position: absolute;
		top: 5px;
		right: 5px;
	}

	.card_info_icon {
	}

	.error_wrap {
		height: 90px;
	}

	@media only screen and (max-width: 767px) {
		.card + .card {
			margin-left: 15px;
		}
	}

	@media only screen and (min-width: 1920px) {
		.card {
			padding-top: 20px;
		}
		.card_name {
			font-size: 15px;
		}
		.card_info {
			width: 16px;
			top: 3px;

			.icon {
				font-size: 16px !important;
			}
		}
		.card_tooltip {
			font-size: 14px;
		}
	}
</style>
