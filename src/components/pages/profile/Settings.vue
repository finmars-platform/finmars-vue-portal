<template>
	<div>
		<v-container fluid class="databases bg-grey-lighten-5 pa-7">
			<v-card width="360" class="d-flex flex-column">
				<v-card-title>Personal data</v-card-title>

				<v-card-text>
					<v-form ref="form">
						<BaseInput
							label="First name"
							v-model="formUser.first_name"
						/>
						<BaseInput
							label="Last name"
							v-model="formUser.last_name"
						/>
						<BaseInput
							label="E-mail"
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
						<v-checkbox
							:label="'Autosave mode'"
							v-model="formUser.data.autosave_layouts"
							color="rgb(239,108,0)"
							hide-details="auto"
						></v-checkbox>
					</v-form>
				</v-card-text>

				<v-card-actions class="justify-end d-flex px-4">
					<v-btn variant="elevated" color="primary" @click="saveUser()">save</v-btn>
				</v-card-actions>
			</v-card>

			<v-card width="360" class="d-flex flex-column">
				<v-card-title>Password</v-card-title>

				<v-card-text>
					<v-form>
						<BaseInput
							label="Old password"
							v-model="formUser.password"
							:type="showPass ? 'text' : 'password'"
						>
							<template #button>
								<BaseIcon
									:icon="showPass ? 'visibility' : 'visibility_off'"
									@click="showPass = !showPass"
								/>
							</template>
						</BaseInput>
						<BaseInput
							label="New password"
							v-model="formUser.new_password"
							:type="showPass ? 'text' : 'password'"
						>
							<template #button>
								<BaseIcon
									:icon="showPass ? 'visibility' : 'visibility_off'"
									@click="showPass = !showPass"
								/>
							</template>
						</BaseInput>
						<BaseInput
							label="New password (confirm)"
							v-model="formUser.new_password_check"
							:type="showPass ? 'text' : 'password'"
						>
							<template #button>
								<BaseIcon
									:icon="showPass ? 'visibility' : 'visibility_off'"
									@click="showPass = !showPass"
								/>
							</template>
						</BaseInput>
					</v-form>
				</v-card-text>

				<v-card-actions class="justify-end d-flex pa-4">
					<v-btn variant="elevated" color="primary" @click="savePass()">save</v-btn>
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
					<v-btn variant="elevated" color="primary" v-if="!formUser.two_factor_verification">
						Add device
						<PagesProfileTwoFAModal
							@close="enableTwoFA($event)"
							v-model="dialog"
							activator="parent"
						/>
					</v-btn>

					<v-btn variant="elevated" color="primary" v-else @click="dasableTwoFA()">
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

		if ( !res.error) {
			useNotify({
				type: 'success',
				title: 'Saved'
			})
		}
	}

	async function saveUser() {
		let res = await useApi('me.put', { body: formUser })

		if ( !res.error) {
			useNotify({
				type: 'success',
				title: 'Saved'
			})
		}
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
