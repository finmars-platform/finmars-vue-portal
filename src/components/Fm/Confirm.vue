<template>
	<BaseModal title="Confirm" @cancel="cancel()" v-model="settings.isOpen">
		<div class="p-b-16">{{ settings.text }}</div>

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

	let settings = useState('confirmSettings', () => {
		return {
			isOpen: false,
			text: 'Are you sure?',
			result: null
		}
	})

	function cancel() {
		settings.value.result = false
		settings.value.isOpen = false
	}
	function ok() {
		settings.value.result = true
		settings.value.isOpen = false
	}
</script>

<style lang="scss" scoped>

</style>
