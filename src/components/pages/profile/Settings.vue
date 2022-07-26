<template>
	<div class="fm_container databases">
		<FmCard class="settings_block" title="Personal data" controls>
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
			<BaseCheckbox
				:label="'Autosave mode'"
				v-model="formUser.data.autosave_layouts"
			/>

			<template #controls>
				<div class="flex jcfe">
					<FmBtn @click="saveUser()">save</FmBtn>
				</div>
			</template>
		</FmCard>

		<FmCard class="settings_block" title="Password" controls>
			<BaseInput
				label="Old password"
				v-model="formUser.password"
				:type="showPass ? 'text' : 'password'"
			>
				<template #button>
					<FmIcon
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
					<FmIcon
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
					<FmIcon
						:icon="showPass ? 'visibility' : 'visibility_off'"
						@click="showPass = !showPass"
					/>
				</template>
			</BaseInput>

			<template #controls>
				<div class="flex jcfe">
					<FmBtn @click="savePass()">save</FmBtn>
				</div>
			</template>
		</FmCard>

		<FmCard class="settings_block" title="Two-factor authentication">
			<div>
				{{ formUser.two_factor_verification ? 'Device connected'	: 'No connected devices' }}
			</div>

			<template #controls>
				<div class="flex jcfe">
					<FmBtn @click="formUser.two_factor_verification ? dasableTwoFA() : dialog = true">
						{{ formUser.two_factor_verification ? 'Remove device' : 'Add device'}}
					</FmBtn>
				</div>

				<PagesProfileTwoFAModal
					v-model="dialog"
					@close="enableTwoFA($event)"
				/>
			</template>
		</FmCard>
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
.settings_block {
	width: 360px;
}
</style>
