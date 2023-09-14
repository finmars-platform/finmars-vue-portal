<template>
	<BaseModal :title="title">
		<div class="wrapp">
			<FmInputText label="Custom Column Name" />
			<FmInputText label="Custom Column Reference Code (use programming language naming rules)" />
			<FmSelect label="Value type"></FmSelect>
			<textarea name="" id="" cols="30" rows="10"></textarea>
			<FmInputText label="Custom Column Expression" />
			<!-- 	:modelValue="name"
						:errorData="errors.name"
						@update:modelValue="emit('update:name', $event)"
						@update:errorData="(newVal) => onErrorDataChange('name', newVal)" -->
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
.wrapp{
	padding: 0px 15px;
	min-width: 500px;

}</style>
