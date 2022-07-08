<template>
	<v-window class="d-flex center" v-model="step">
		<v-window-item value="create">
			<v-card width="320" class="d-flex flex-column" variant="text">
				<br>
				<v-card-title>Setup your new Database</v-card-title>

				<v-card-text>
					<v-form>
						<v-text-field
							v-model="form.name"
							label="Name"
							placeholder="Name"
							variant="outlined"
							density="comfortable"
						/>
						<v-text-field
							v-model="form.license_key"
							label="License key"
							placeholder="License key"
							variant="outlined"
							density="comfortable"
						/>
						<v-select
							:items="configs"
							label="Init configuration"
							variant="outlined"
							density="comfortable"
						/>
						<v-text-field
							v-model="form.description"
							label="Description"
							placeholder="Description"
							variant="outlined"
							density="comfortable"
							hide-details="auto"
						/>

						<v-card-text class="center">
							<v-btn variant="text" color="primary" @click="isShow = !isShow">Show details</v-btn>
						</v-card-text>

						<template v-if="isShow">
							<v-text-field
								v-model="form.base_api_url"
								label="Base API URL"
								placeholder="Base API URL"
								variant="outlined"
								density="comfortable"
							/>
							<v-text-field
								v-model="form.db_host"
								label="Database host"
								placeholder="Database host"
								variant="outlined"
								density="comfortable"
							/>
							<v-text-field
								v-model="form.db_name"
								label="Database name"
								placeholder="Database name"
								variant="outlined"
								density="comfortable"
							/>
							<v-text-field
								v-model="form.db_user"
								label="Database user"
								placeholder="Database user"
								variant="outlined"
								density="comfortable"
							/>
							<v-text-field
								v-model="form.db_password"
								label="Database user password"
								placeholder="Database user password"
								variant="outlined"
								density="comfortable"
							/>
						</template>
					</v-form>
				</v-card-text>

				<v-card-actions class="justify-space-between d-flex">
					<v-btn color="primary" @click="$router.push('/profile')">cancel</v-btn>
					<v-btn variant="contained" :disabled="processing" color="primary" @click="createDb()">
						<v-progress-circular v-if="processing"
							class="mr-2"
							indeterminate
							color="white"
							size="24"
						/>
						finish
					</v-btn>
				</v-card-actions>
			</v-card>
		</v-window-item>

		<!-- <v-window-item value="config">
			<div class="d-flex flex-column" v-if="step == 'config'">
				<v-card-title >Select init configuration</v-card-title>

				<v-card-content>
					<v-item-group class="databases" mandatory>
						<v-item v-slot="{ isSelected, toggle }">
							<v-card width="320" class="d-flex flex-column" @click="toggle" :color="isSelected ? 'rgba(240, 90, 34, 0.1)' : ''">
								<v-card-title>Blank</v-card-title>

								<v-card-text>Empty Ecosystem. Configure all forms, layouts and tables by myself</v-card-text>
							</v-card>
						</v-item>
						<v-item v-slot="{ isSelected, toggle }">
							<v-card width="320" class="d-flex flex-column" @click="toggle" :color="isSelected ? 'rgba(240, 90, 34, 0.1)' : ''">
								<v-card-title>test</v-card-title>

								<v-card-text>Empty Ecosystem. Configure all forms, layouts and tables by myself</v-card-text>
							</v-card>
						</v-item>
					</v-item-group>
				</v-card-content>

				<v-card-actions class="justify-space-between d-flex">
					<v-btn color="primary" @click="step = 'create'">back</v-btn>
					<v-btn variant="contained" color="primary" @click="createDb()">finish</v-btn>
				</v-card-actions>
			</div>
		</v-window-item> -->
	</v-window>
</template>

<script setup>

	definePageMeta({
		bread: [
			{
				text: 'Profile',
				to: '/profile',
				disabled: false
			},
			{
				text: 'Create New Database',
				disabled: true
			},
		],
	});
	useState('isOpenSidbar').value = false

	let router = useRouter()

	let step = ref('create')
	let isShow = ref(false)
	let processing = ref(false)

	let form = reactive({
		description: ''
	})
	let configs = ['Blank']

	async function createDb() {
		processing.value = true

		let res = await useApi('masterCreate.post', { body: form })

		if ( res.id ) router.push('/profile')

		processing.value = false
	}
</script>

<style lang="scss" scoped>
.databases {
	display: grid;
	grid-template-columns: repeat(2, auto);
	grid-gap: 30px;
	justify-content: flex-start;
}
</style>
