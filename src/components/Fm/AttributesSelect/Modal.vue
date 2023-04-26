<template>
	<BaseModal :modelValue="modelValue"
						 @update:modelValue="newVal => emit('update:modelValue', newVal)">

		<FmAttributesSelectMain
			:attributes="attributes"
			:favoriteAttributes="store.favorites.attributes"
			:selectedAttributes="selectedAttributes"
			@save="attrs => emit('save', attrs)"
			@favoritesChanged="saveFavorites"
			@cancel="emit('update:modelValue', false)"
		/>

	</BaseModal>
</template>

<script setup>

	const store = useStore();

	let props = defineProps({
		modelValue: Boolean,
		title: String,
		contentType: String,
		attributes: {
			type: Array,
			default: [],
		},
		selectedAttributes: {
			type: Array,
			default: [],
		},
	});

	let emit = defineEmits(['update:modelValue', 'save']);

	function saveFavorites(favAttrs) {
		store.member.data.favorites.attributes[props.contentType] = favAttrs;
		store.updateMember();
	}

</script>

<style lang="scss" scoped>

</style>
