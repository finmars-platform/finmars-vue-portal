<template>
	<BaseModal :title="title">

		<div style="padding: 5px 0 20px;">
			Are you sure to delete attribute Client group ?
		</div>

		<template #controls="{ cancel }">

			<slot name="controls" :cancel="cancel">
				<div class="btn-wrapp" >
					<FmBtn type="basic" @click="cancel">CANCEL</FmBtn>
                    <FmBtn type="basic" @click="cancel">OK</FmBtn>
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
