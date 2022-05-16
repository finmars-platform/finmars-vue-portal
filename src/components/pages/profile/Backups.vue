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

			<v-btn
				size="x-small"
				height="auto"
				variant="text"
				stacked
				class="text-lowercase"
			>
				<v-icon start size="16" icon="mdi-refresh"></v-icon>
				refresh
			</v-btn>
		</v-container>

		<v-divider></v-divider>

		<v-container fluid class="databases bg-grey-lighten-5">
			<v-card max-width="360">
				<v-card-title>Polina 2022-05-04-10-28</v-card-title>
				<v-card-subtitle>File size: 1 MB</v-card-subtitle>

				<v-spacer></v-spacer>
				<v-card-actions class="justify-space-between d-flex">
					<v-btn icon="mdi-lock" color="primary"></v-btn>
					<v-btn color="primary">restore</v-btn>
				</v-card-actions>
			</v-card>
			<v-card max-width="360">
				<v-card-title>Polina 2022-05-04-10-28</v-card-title>
				<v-card-subtitle>File size: 1 MB</v-card-subtitle>

				<v-spacer></v-spacer>
				<v-card-actions class="justify-space-between d-flex">
					<v-btn icon="mdi-lock" color="primary"></v-btn>
					<v-btn color="primary">restore</v-btn>
				</v-card-actions>
			</v-card>
		</v-container>
	</div>
</template>

<script>
export default defineComponent({
	async setup() {},
	data() {
		return {
			menus: [{ title: "test" }, { title: "test2" }],
		};
	},
	created() {},
	methods: {},
});
</script>

<style lang="scss" scoped>
.databases {
	display: grid;
	grid-template-columns: repeat(3, auto);
	grid-gap: 30px;
	justify-content: flex-start;
}
</style>
