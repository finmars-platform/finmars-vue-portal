<template>
	<div>
		<v-container fluid class="databases bg-grey-lighten-5 pa-7">
			<v-card width="360" class="d-flex flex-column">
				<v-card-title>Personal data</v-card-title>

				<v-card-text>
					<v-form ref="form" v-model="valid" lazy-validation>
						<v-text-field
							label="First name"
							placeholder="First name"
							variant="outlined"
							density="comfortable"
						/>
						<v-text-field
							label="Last name"
							placeholder="Last name"
							variant="outlined"
							density="comfortable"
						/>
						<v-select
							label="Language"
							variant="outlined"
							density="comfortable"
						/>
						<v-select
							label="Time zone"
							variant="outlined"
							density="comfortable"
						/>
					</v-form>
				</v-card-text>

				<v-card-actions class="justify-end d-flex">
					<v-btn variant="contained" color="primary">save</v-btn>
				</v-card-actions>
			</v-card>

			<v-card width="360" class="d-flex flex-column">
				<v-card-title>Password</v-card-title>

				<v-card-text>
					<v-form ref="form" v-model="valid" lazy-validation>
						<v-text-field
							label="Old password"
							placeholder="Old password"
							variant="outlined"
							density="comfortable"
						/>
						<v-text-field
							label="New password"
							placeholder="New password"
							variant="outlined"
							density="comfortable"
						/>
						<v-text-field
							label="New password (confirm)"
							placeholder="New password (confirm)"
							variant="outlined"
							density="comfortable"
						/>
					</v-form>
				</v-card-text>

				<v-card-actions class="justify-end d-flex">
					<v-btn variant="contained" color="primary">save</v-btn>
				</v-card-actions>
			</v-card>

			<v-card width="360" class="d-flex flex-column">
				<v-card-title>Two-factor authentication</v-card-title>

				<v-card-subtitle>
					<v-switch :label="`Enabled`" hide-details="auto" />
				</v-card-subtitle>

				<v-card-text>No connected devices</v-card-text>

				<v-card-actions class="justify-end d-flex">
					<v-btn variant="contained" color="primary">Add device</v-btn>
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
