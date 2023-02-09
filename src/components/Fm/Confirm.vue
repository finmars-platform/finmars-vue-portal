<template>
	<BaseModal :title="settings.title" v-model="settings.isOpen">
		<div class="content">
			<div class="p-b-16">{{ settings.text }}</div>

			<BaseInput v-if="settings.check" v-model="checkedValue" label="Value" />
		</div>

		<template #controls>
			<div class="flex-row fc-space-between">
				<FmBtn type="basic" @click="cancel()">CANCEL</FmBtn>

				<FmBtn @click="ok()">ok</FmBtn>
			</div>
		</template>
	</BaseModal>
</template>

<script setup>
	defineProps({
		title: String,
		controls: Boolean
	})

	let checkedValue = ref('')
	let settings = useState('confirmSettings', () => {
		return {
			isOpen: false,
			title: 'Confirm',
			text: 'Are you sure?',
			result: null
		}
	})

	function cancel() {
		settings.value.result = false
		settings.value.isOpen = false
	}
	function ok() {
		if ( settings.value.check ) {
			if ( settings.value.check != checkedValue.value ) {
				useNotify({
					type: 'warn',
					title: 'Value not confirm',
				})
				return false
			}
		}
		settings.value.result = true
		settings.value.isOpen = false

		checkedValue.value = ''
	}
</script>

<style lang="scss" scoped>
	.content {
		max-width: 400px;
	}
</style>
