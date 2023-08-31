<template>
	<BaseModal :title="title">

		<div style="padding: 5px 0 20px;">
			<FmInputText label="File Name " />
		</div>

		<template #controls="{ cancel }">

			<slot name="controls" :cancel="cancel">
				<div class="btn-wrapp" >
					<FmBtn type="basic" @click="cancel">Close</FmBtn>
                    <FmBtn type="primary" @click="cancel">Export</FmBtn>
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
.btn-wrapp{
    display: flex;
    justify-content: flex-end;
}
</style>
