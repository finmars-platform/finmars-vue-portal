<template>
	<div>
		<FmTopRefresh @refresh="refresh()">
			<template #action>
				<BaseInput type="text"
					v-model="muNameTerms"
					placeholder="Search"
					class="bi_no_borders"
				>
					<template #button>
						<FmIcon icon="search" />
					</template>
				</BaseInput>
			</template>
		</FmTopRefresh>

		<div v-if="data && data.results.length" class="fm_container backups">
			<PagesProfileBackupsItem
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

	let muNameTerms = ref("");

	let { data, refresh } = await useAsyncData("masterBackups", () =>
		useApi("masterBackups.get", {
			filters: { name: muNameTerms.value }
		})
	);

</script>

<style lang="scss" scoped>
.backups {
	display: grid;
	grid-template-columns: repeat(3, auto);
	grid-gap: 30px;
	justify-content: flex-start;
}
</style>
