<template>
	<div>
		<BaseInput
			class="ms_wrap"
			:label="title"
			@click="modalIsOpen = true"
			modelValue=" "
		>
			<template #button><FmIcon icon="menu" /></template>

			<div class="flex aic" style="height: inherit;">

				<div
					class="flex-row fi-center"
					v-for="item in modelValue"
					:key="item.key"
				>
					<FmIcon
						v-if="item.error_data"
						error
						icon="info"
						size="16"
						class="m-r-8"
						style="height: 16px;"
					/>
					<span>{{ item.name }}</span>
				</div>

			</div>
		</BaseInput>

		<FmAttributesSelectModal
			v-model="modalIsOpen"
			:title="title"
			:contentType="contentType"
			:attributes="attributes"
		/>
	</div>
</template>

<script setup>

	import useEvAttributesStore from "~/stores/useEvAttributesStore";

	let props = defineProps({
		modelValue: {
			type: Array,
			default: [],
		},
		title: String,
		contentType: String,
		valueType: Number,
		/*attributes: {
			type: Array,
			default: [],
		},*/
	});

	let emit = defineEmits(['update:modelValue']);

	let attributes = ref([]);

	let evAttrsStore = useEvAttributesStore();

	watch(
		() => evAttrsStore.$state,
		() => {

		},
		{deep: true}
	)

	if ( props.valueType && ![10, 20, 30, 40].includes(props.valueType) ) {
		throw new Error("Not valid value_type was provided: " + props.value_type )
	}

	let modalIsOpen = ref(false);

</script>

<style lang="scss" scoped>

</style>
