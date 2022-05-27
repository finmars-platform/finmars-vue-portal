<template>
	 <v-container fluid>
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

		<div class="table">
			<div class="table-row">
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
			</div>
		</div>
	 </v-container>
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

<style lang="sass" scoped>

</style>
