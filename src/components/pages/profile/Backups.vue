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

		<v-container fluid class="databases bg-grey-lighten-5" v-if="data.results.length">
			<PagesProfileBackupsItem max-width="360"
				v-for="backup in data.results"
				:backup="backup"
				:key="backup.id"
				@refresh="refresh()"
			/>
		</v-container>
		<v-container fluid class="text-h4" v-else>No backups found</v-container>
	</div>
</template>

<script setup>

	let { data, refresh } = await useAsyncData("masterBackups", () =>
		useApi("masterBackups.get")
	);
</script>

<style lang="scss" scoped>
.databases {
	display: grid;
	grid-template-columns: repeat(3, auto);
	grid-gap: 30px;
	justify-content: flex-start;
}
</style>
