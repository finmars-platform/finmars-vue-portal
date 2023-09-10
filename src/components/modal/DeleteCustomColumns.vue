<template>
	<BaseModal :title="title">

		<div style="padding: 5px 0 20px;">
			<slot>
				<div>{{ description }}</div>
			</slot>
		</div>

		<template #controls="{ cancel }">

			<slot name="controls" :cancel="cancel">
				<div>
					<FmBtn type="basic" @click="cancel">CANCEL</FmBtn>
				</div>
			</slot>

		</template>
	</BaseModal>
</template>

<script setup>
	let props = defineProps({
		title: String,
		description: String,
	})
</script>

<style lang="scss" scoped>

</style>
