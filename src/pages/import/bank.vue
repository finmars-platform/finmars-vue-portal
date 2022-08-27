<template>
	<div>
		<FmTopRefresh @refresh="refresh()">
			<template #action>
				<BaseInput type="text"
					v-model="searchParam"
					placeholder="Search"
					class="bi_no_borders"
				>
					<template #button>
						<FmIcon icon="search" />
					</template>
				</BaseInput>
			</template>
		</FmTopRefresh>

		<div class="flex align-start">
			<div class="fm_container cards">
				<FmCard
					v-for="(item) in procedures"
					:key="item.id"
					:title="item.user_code"
					controls
				>
					<div class="fm_card_subtitle">
						Provider: <b>{{ item.provider_object.name }}</b>
						<br>
						Scheme: <b> {{ item.scheme_user_code }}</b>
					</div>

					<div class="fm_card_content">
						{{ item.notes }}
					</div>

					<template #controls>
						<div class="flex sb">
							<FmBtn type="action" :to="`/settings/data-procedures/${item.id}`">edit</FmBtn>

							<FmBtn :disabled="processing" @click="execute(item)">execute</FmBtn>
						</div>
					</template>
				</FmCard>
			</div>
			<div class="table">
				<div class="table-row header">
					<div class="table-cell">Procedure</div>
					<div class="table-cell">Date</div>
					<div class="table-cell">Status</div>
				</div>

				<PagesRunPricesItemBank
					v-for="(item) in statuses"
					:key="item.id"
					:item="item"
				/>
			</div>
		</div>
	</div>
</template>

<script setup>
	import moment from 'moment'

	definePageMeta({
		bread: [
			{
				text: 'Import: Import from bank ',
				to: '/import/bank',
				disabled: true
			}
		],
	});

	const store = useStore()

	let procedures = ref(null)
	let statuses = ref(null)
	let processing = ref(false)

	let searchParam = ref('')

	const mapSratuses = {
		P: 'Processing',
		D: 'Done',
	}

	if ( store.current.base_api_url ) {
		init()
	} else {
		watch( () => store.current, async () => {
			init()
		})
	}
	async function init() {
		let res = await useApi('importBankProc.get')
		procedures.value = res.results

		let resStatus = await useApi('dataInstance.get')
		statuses.value = resStatus.results
	}
	async function execute( body ) {
		processing.value = true
		useNotify({title: 'Procedure is processing'})

		let res = await useApi('pricingProc.post', {body, params: {id: body.id}})

		if ( res ) {
			processing.value = false
			useNotify({type: 'success', title: 'Success. Procedure is being processed'})

			let resStatus = await useApi('pricingProcInstance.get')
			statuses.value = resStatus.results
		}
	}
	function fromatDate( date ) {
		return moment( date ).format('DD.MM.YYYY LT')
	}
</script>

<style lang="scss" scoped>
.cards {
	display: grid;
	grid-template-columns: repeat(2, 360px);
	grid-gap: 30px;
	justify-content: flex-start;
}
.table {
	border: 1px solid $border;
	width: 100%;
	font-size: 14px;
}
.table-row {
	display: grid;
	grid-template-columns: 1fr 1fr 100px;
	align-items: center;
	background: #Fff;
	border-bottom: 1px solid $border;
	padding: 5px 0;
	// height: 26px;
	&.header {
		background: #F2F2F2;
		height: 50px;
	}
}
.table-cell {
	white-space: nowrap;
	padding: 0 14px;
}
.sub_procedure {
	grid-column: 1 / -1;
	padding: 5px 18px;
}
.sp_item {
	padding-top: 10px;
}
.date_item {
	width: 48%;
}
.sp_item_h {
	width: 120px;
}
</style>
