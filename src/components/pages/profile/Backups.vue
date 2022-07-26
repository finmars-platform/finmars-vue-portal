<template>
	<div>

		<FmTopRefresh @refresh="refresh()">
			<template #action>
				<div class="flex-row flex-i-center width-50">
					<div class="flex-column flex-c-center">
						<FmIcon icon="search" class="p-r-16 gray-icon"></FmIcon>
					</div>

					<div class="flex-1-1-100">
						<BaseInput type="text"
											 v-model="muNameTerms"
											 placeholder="Search"
											 class="bi_no_borders"></BaseInput>
					</div>
				</div>

			</template>
		</FmTopRefresh>

		<div v-if="data.results.length" class="p-16 databases bg-grey-lighten-5">
			<PagesProfileBackupsItem max-width="360"
															 v-for="backup in data.results"
															 :backup="backup"
															 :key="backup.id"
															 @refresh="refresh()"
			/>
		</div>

		<div v-else class="text-h4">No backups found</div>

	</div>
</template>

<script setup>

	/* let { data, refresh } = await useAsyncData("masterBackups", () =>
		useApi("masterBackups.get")
	); */
	let data = await useApi("masterBackups.get");
	let muNameTerms = ref("");

	async function refresh() {

		const opts = {
			filters: "?name=" + muNameTerms.value
		}

		data = await useApi("masterBackups.get", opts);
	}

</script>

<style lang="scss" scoped>
.databases {
	display: grid;
	grid-template-columns: repeat(3, auto);
	grid-gap: 30px;
	justify-content: flex-start;
}
</style>
