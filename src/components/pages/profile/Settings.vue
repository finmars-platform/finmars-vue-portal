<template>
	<div>
		<v-container fluid class="databases bg-grey-lighten-5 pa-7">
			<v-card width="360" class="d-flex flex-column">
				<v-card-title>Personal data</v-card-title>

				<v-card-text>
					<v-form ref="form">
						<v-text-field
							label="First name"
							placeholder="First name"
							variant="outlined"
							density="comfortable"
							v-model="formUser.first_name"
						/>
						<v-text-field
							label="Last name"
							placeholder="Last name"
							variant="outlined"
							density="comfortable"
							v-model="formUser.last_name"
						/>
						<v-text-field
							label="E-mail"
							placeholder="E-mail"
							variant="outlined"
							density="comfortable"
							v-model="formUser.email"
						/>
						<!-- <v-select
							label="Language"
							variant="outlined"
							density="comfortable"
						/>
						<v-select
							label="Time zone"
							variant="outlined"
							density="comfortable"
						/> -->
					</v-form>
				</v-card-text>

				<v-card-actions class="justify-end d-flex px-4">
					<v-btn variant="contained" color="primary" @click="saveUser()">save</v-btn>
				</v-card-actions>
			</v-card>

			<v-card width="360" class="d-flex flex-column">
				<v-card-title>Password</v-card-title>

				<v-card-text>
					<v-form>
						<v-text-field
							autocomplete="current-password"
							v-model="formPass.password"
							:append-inner-icon="showPass ? 'mdi-eye' : 'mdi-eye-off'"
							:type="showPass ? 'text' : 'password'"
							label="Old password"
							placeholder="Old password"
							variant="outlined"
							density="comfortable"
							@click:append-inner="showPass = !showPass"
						/>
						<v-text-field
							v-model="formPass.new_password"
							:append-inner-icon="showPass ? 'mdi-eye' : 'mdi-eye-off'"
							:type="showPass ? 'text' : 'password'"
							label="New password"
							hint="At least 8 characters"
							placeholder="New password"
							variant="outlined"
							density="comfortable"
							counter
							@click:append-inner="showPass = !showPass"
						/>
						<v-text-field
							v-model="formPass.new_password_check"
							:append-inner-icon="showPass ? 'mdi-eye' : 'mdi-eye-off'"
							:type="showPass ? 'text' : 'password'"
							label="New password (confirm)"
							hint="At least 8 characters"
							placeholder="New password (confirm)"
							variant="outlined"
							density="comfortable"
							counter
							@click:append-inner="showPass = !showPass"
						/>
					</v-form>
				</v-card-text>

				<v-card-actions class="justify-end d-flex pa-4">
					<v-btn variant="contained" color="primary" @click="savePass()">save</v-btn>
				</v-card-actions>
			</v-card>

			<v-card width="360" class="d-flex flex-column">
				<v-card-title>Two-factor authentication</v-card-title>

				<v-card-text v-if="!formUser.two_factor_verification">
					No connected devices
				</v-card-text>

				<v-card-text v-else>
					Device connected
				</v-card-text>

				<v-card-actions class="justify-end d-flex pa-4">
					<v-btn variant="contained" color="primary" v-if="!formUser.two_factor_verification">
						Add device
						<PagesProfileTwoFAModal
							@close="enableTwoFA($event)"
							v-model="dialog"
							activator="parent"
						/>
					</v-btn>

					<v-btn variant="contained" color="primary" v-else @click="dasableTwoFA()">
						Remove device
					</v-btn>
				</v-card-actions>
			</v-card>
		</v-container>
	</div>
</template>

<script setup>

	let showPass = ref(false)
	let formPass = reactive({})
	let dialog = ref(false)

	const store = useStore()

	let formUser = store.user

	let { data, refresh: refresh2FA } = await useAsyncData( '2fa', () => useApi('meTwoFactor.get') )

async function savePass() {
		let res = await useApi('meSetPassword.put', {body: formPass})

		formPass.password = ''
		formPass.new_password = ''
		formPass.new_password_check = ''
	}
	async function saveUser() {
		let res = await useApi('me.put', { body: formUser })
	}
	async function enableTwoFA( success ) {
		dialog.value = false
		if ( !success ) return false

		formUser.two_factor_verification = true

		await saveUser()
		await store.getUser()
		formUser = store.user

		refresh2FA()
	}
	async function dasableTwoFA() {
		console.log('data:', data)
		let res = await useApi('meTwoFactor.delete', { params: {id: data.value.results[0]?.id } })

		formUser.two_factor_verification = false

		await saveUser()
		await store.getUser()
		formUser = store.user

		refresh2FA()
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
