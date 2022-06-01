<template>
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
	<div class="d-flex">
		<v-container fluid class="py-6 px-7">
			<v-card width="360"
				v-for="(item) in procedures"
				:key="item.id"
			>
				<v-card-title>
					{{ item.user_code }}
				</v-card-title>

				<v-card-text>
					{{ item.notes }}
				</v-card-text>

				<v-card-title class="text-subtitle-2">
					Date range
				</v-card-title>

				<v-card-content class="d-flex">
					<v-text-field
						type="date"
						label="Date from"
						placeholder="Date from"
						variant="outlined"
						density="comfortable"
						v-model="item.price_date_from_calculated"
						hide-details="auto"
					/>
					<v-text-field
						type="date"
						label="Date to"
						placeholder="Date to"
						variant="outlined"
						density="comfortable"
						v-model="item.price_date_to_calculated"
						hide-details="auto"
					/>
				</v-card-content>

				<v-card-actions class="justify-space-between d-flex">
					<v-btn color="primary" :to="`/valuations/run-pricing/${item.id}`">edit</v-btn>

					<v-btn variant="contained" color="primary" >execute</v-btn>
				</v-card-actions>
			</v-card>
		</v-container>
		<div class="table">
			<div class="table-row header">
				<div class="table-cell">Procedure</div>
				<div class="table-cell">Date</div>
				<div class="table-cell">Status</div>
			</div>

			<div class="table-row"
				v-for="(item) in statuses"
				:key="item.id"
			>
				<div class="table-cell">{{ item.procedure_object.name }}</div>
				<div class="table-cell">{{ item.created }}</div>
				<div class="table-cell">{{ item.name }}</div>

				<div class="sub_procedure">
					<div class="sp_item d-flex">
						<div>Procedure</div>
						<div>Bloomberg data test super</div>
					</div>
				</div>
			</div>
		</div>
	</div>
</template>

<script setup>
	definePageMeta({
		title: "Valuations: Run Pricing ",
	});
	const store = useStore()
	let procedures = ref(null)
	let statuses = ref(null)

	if ( store.current.base_api_url ) {
		let resProc = await useApi('pricingProc.get')
		procedures.value = resProc.results

		let resStatus = await useApi('pricingProcInstance.get')
		statuses.value = resStatus.results
	}

	watch( () => store.current, async () => {
		let res = await useApi('pricingProc.get')
		procedures.value = res.results

		let resStatus = await useApi('pricingProcInstance.get')
		statuses.value = resStatus.results
	})
</script>

<style lang="scss" scoped>
.table {
	border: 1px solid $border;
	width: 100%;
	font-size: 14px;
}
.table-row {
	display: grid;
	grid-template-columns: 1fr 1fr 1fr;
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
	padding: 0 14px;
}
.sp_item {
	padding-top: 10px;
}
</style>
