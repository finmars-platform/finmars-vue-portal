<template>
	<div>
		<v-container class="justify-space-between d-flex py-3" fluid>
			<v-text-field
				class="py-0"
				label="Search"
				placeholder="Search"
				variant="plain"
				prepend-icon="mdi-magnify"
				hide-details="auto"
				density="compact"
			/>

			<v-spacer></v-spacer>

			<v-btn color="#737373"
				size="small"
				height="auto"
				variant="text"
				stacked
				class="text-capitalize"
				@click="refresh()"
			>
				<v-icon start size="24" icon="mdi-refresh"></v-icon>
				refresh
			</v-btn>
		</v-container>
		<v-divider></v-divider>
		<div class="d-flex align-start">
			<v-container fluid class="py-6 px-7 cards">
				<v-card width="360"
					v-for="(item) in procedures"
					:key="item.id"
				>
					<v-card-title>
						{{ item.user_code }}
					</v-card-title>

					<v-card-subtitle class="text-subtitle-2">
						Provider: <b>{{ item.provider_object.name }}</b>
					</v-card-subtitle>

					<v-card-subtitle class="text-subtitle-2">
						Scheme: <b> {{ item.scheme_user_code }}</b>
					</v-card-subtitle>

					<v-card-text>
						{{ item.notes }}
					</v-card-text>

					<v-card-actions class="justify-space-between d-flex">
						<v-btn color="primary" :to="`/settings/data-procedures/${item.id}`">edit</v-btn>

						<v-btn variant="contained" color="primary" :disabled="processing" @click="execute(item)">execute</v-btn>
					</v-card-actions>
				</v-card>
			</v-container>
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
				disabled: false
			}
		],
	});

	const store = useStore()

	let procedures = ref(null)
	let statuses = ref(null)
	let processing = ref(false)

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
	grid-template-columns: repeat(2, auto);
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
