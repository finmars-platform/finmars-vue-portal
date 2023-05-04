<template>
	<BaseModal :modelValue="modelValue"
						 :title="title"
						 no_padding
						 @update:modelValue="newVal => emit('update:modelValue', newVal)"
						 @close="isAdvanced = false">

		<template #modalTop>
			<div style="flex-grow: 1;">
				<BaseInput type="text"
									 class="small bi_no_borders bi_border_bottom m-l-20"
									 style="width: 280px;"
									 placeholder="Search"
									 :modelValue="searchParams"
									 @update:modelValue="newVal => searchParams = newVal"
				>
					<template #button>
						<FmIcon icon="search" />
					</template>
					<template #rightBtn>
						<FmIcon size="16" icon="close" @click="searchParams = ''" />
					</template>
				</BaseInput>
			</div>
		</template>

		<div class="attr_select_wrap">
			<FmAttributesSelectMain
				:modelValue="selAttrsKeysList"
				:attributes="attributes"
				:disabledAttributes="disabledAttributes"
				:favoriteAttributes="store.favorites.attributes[contentType]"
				:multiselect="multiselect"
				:searchParameters="searchParams"
				:isAdvanced="isAdvanced"

				@update:modelValue="newVal => newSelAttrs = newVal"
				@favoritesChanged="saveFavorites"
			/>
		</div>

		<template #controls="{ cancel }">
			<div class="flex space-between">
				<div class="flex aic">
					<FmBtn
						type="text"
						@click="cancel()"
					>
						Cancel
					</FmBtn>

					<FmIcon
						class="m-l-24"
						primary
						:icon="isAdvanced ? 'lock_open' : 'lock'"
						@click="isAdvanced = !isAdvanced"
					/>
				</div>

				<FmBtn @click="save(cancel)">OK</FmBtn>
			</div>
		</template>

	</BaseModal>
</template>

<script setup>

	const store = useStore();

	let props = defineProps({
		modelValue: Boolean,
		title: String,
		contentType: {
			type: String,
			required: true,
		},
		attributes: {
			type: Array,
			default: [],
		},
		disabledAttributes: {
			type: Array,
			default: [],
		},
		selected: [Array, String],
		multiselect: Boolean,
	});

	let emit = defineEmits(['update:modelValue', 'save']);

	let selAttrsKeysList = ref([]);
	let isAdvanced = ref(false);

	let searchParams = ref('');
	let newSelAttrs = ref([]);

	watch(
		() => props.selected,
		() => {

			if ( Array.isArray(props.modelValue) ) selAttrsKeysList.value = props.selected;

			if (typeof props.selected === 'string') {
				selAttrsKeysList.value = props.selected ? [props.selected] : []

			} else {
				throw new Error("Wrong format of modelValue: " + typeof props.selected)
			}

		}
	)

	function saveFavorites(favAttrs) {
		store.member.data.favorites.attributes[props.contentType] = favAttrs;
		store.updateMember();
	}

	function save(cancelCallback) {
		emit('save', newSelAttrs.value);
		cancelCallback();
	}

</script>

<style lang="scss" scoped>
	.attr_select_wrap {
		min-height: 340px;
		min-width: 400px;
		height: calc(80vh - $modal-header-height - $modal-footer-height);
		width: 80vw;
		max-width: 1000px;
	}

</style>
