<template>
	<BaseModal no_padding title="Workspace Provising Log" @update:model-value="cancel()">
		<template>

			<div
				class="provision-log">
			<div>{{data}}</div>
			</div>

		</template>
		<template #controls>
			<div class="flex sb">
				<FmBtn type="text" @click="cancel()">close</FmBtn>

			</div>
		</template>
	</BaseModal>
</template>

<script setup>

	let emit = defineEmits(['update:modelValue'])
	let props = defineProps({baseApiUrl: String})

	let data = ref('')

	async function getData() {

		data.value = await useApi("masterLog.get", {
			params: {baseApi: props.baseApiUrl}
		})

	}

	setInterval(() => {
		getData()
	}, 2 * 1000)

	function cancel() {
		emit('update:modelValue', false)
	}

</script>

<style lang="scss" scoped>
	.provision-log {
		padding: 4px;
		color: #fff;
		background: #000;
		font-size: 14px;
		width: 1024px;

	}

</style>
