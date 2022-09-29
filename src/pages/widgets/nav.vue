<template>
	<div class="card_view">
		<div class="card_wrap">
			<div class="card"
				v-for="(item, prop) in stats"
				:key="prop"
				:class="{active: item[0] == active}"
				@click="active = item[0]"
			>
				<div class="card_name">{{ item[0] }}</div>
				<div class="card_value">{{ Math.round(item[1]) }}</div>
			</div>
		</div>
	</div>

</template>

<script setup>

	definePageMeta({
		layout: 'auth'
	});

	let wId = useRoute().query.wId

	let res = await useApi('widgetsStats.get')
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
