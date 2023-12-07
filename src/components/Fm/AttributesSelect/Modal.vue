<template>
	<BaseModal :modelValue="modelValue"
						 :title="title"
						 no_padding
						 @update:modelValue="newVal => emit('update:modelValue', newVal)"
						 @close="onClose">

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
				:attributes="filteredAttrs"
				:disabledAttributes="disabledAttributes"
				:favoriteAttributes="favoriteAttrs"
				:multiselect="multiselect"
				:searchParameters="searchParams"
				v-model:isAdvanced="isAdvanced"

				@update:modelValue="applySelAttrs"
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
    content_type: {
      type: String,
      required: true,
    },
    valueType: Number, // used to filter attributes
    attributes: {
      type: Array,
      default() { return [] },
    },
    disabledAttributes: { // Array of Strings (attribute's keys)
      type: Array,
      default() { return [] },
    },
    selected: [Array, String], // Array of Strings (keys) for multiselect, String (key) and null for select
    multiselect: Boolean,
  });
  /*
   * save - returns key or array of keys of selected attributes
   * selectedAttributesChanged - returns object or array of objects of selected attributes
   */
  let emit = defineEmits([
    'update:modelValue',
    'save',
    'selectedAttributesChanged',
    'favoritesChanged'
  ]);

  let searchParams = ref('');
  let selAttrsKeysList = ref([]);
  let isAdvanced = ref(false);

  /**
   * Contains array of keys or a key of the selected attribute(s)
   * @type {{value: Array|String}}
   */
  let newSelAttrs = ref( props.multiselect ? [] : '' );

  watch(
    () => props.multiselect,
    () => { newSelAttrs.value = props.multiselect ? [] : ''; }
  )

  function getSelAttrsKeysList() {

	  if ( Array.isArray(props.selected) ) {

		  return props.selected;

	  } else if (typeof props.selected === 'string') {

		  return props.selected ? [props.selected] : []

	  } else if (props.selected || props.selected === 0) {
		  throw new Error("Wrong format of modelValue: " + typeof props.selected)
	  }

  }

  watch(
    () => props.selected,
    () => {
        selAttrsKeysList.value = getSelAttrsKeysList();
    }
  )

  const filteredAttrs = computed(() => {

    if (props.valueType) {
      return props.attributes.filter(attr => attr.value_type === props.valueType);
    }

    return props.attributes;

  });

  const favoriteAttrs = computed(() => {

    if (props.valueType) {

      const favAttrs = store.favorites.attributes[props.content_type] || [];

      return favAttrs.filter(fAttr => {

        const fAttrData = props.attributes.find(attr => attr.key === fAttr.key);

        /*
        !fAttrData here because favorite attribute
        without matching attribute should be shown and marked
        */
        return !fAttrData || fAttrData.value_type === props.valueType;

      })

    }

    return store.favorites.attributes[props.content_type] || [];

  })

  function saveFavorites(favAttrs) {
    store.memberLayout.data.favorites.attributes[props.content_type] = favAttrs;
    store.updateMemberLayout();
    emit( 'favoritesChanged', structuredClone(favAttrs) );
  }

  function applySelAttrs(newVal) {

    if (props.multiselect) {

      newSelAttrs.value = newVal.filter(
          attrKey => !selAttrsKeysList.value.includes(attrKey)
      )

    } else {
      newSelAttrs.value = newVal;
    }

  }

  function onClose() {
    newSelAttrs.value = props.multiselect ? [] : '';
    isAdvanced.value = false;
    searchParams.value = '';
  }

  function getSelAttrData(key) {

    let attrData = props.attributes.find(attr => attr.key === key);
    attrData = JSON.parse(JSON.stringify( attrData ));

    const favData = favoriteAttrs.value.find(attr => attr.key === key);
    if (favData) attrData.layout_name = favData.customName;

    return attrData;

  }

  function save(cancelCallback) {

    let val;

    let val2; // contains full data of selected attributes
    let selKeysList;

    if ( props.multiselect ) { // emit array

      val = JSON.parse(JSON.stringify( newSelAttrs.value )) || [];

      if ( !Array.isArray(val) ) {
        throw new Error("Component FmAttributesSelectModal return value with wrong format. Expected array got " + typeof val);
      }

      val2 = val.map( key => getSelAttrData(key) );

    }
    else { // emit string and Object of selected attribute

      val = newSelAttrs.value || null;

      if (!val) { // forbid selection of emptiness for selector of single attribute
        cancelCallback();
        return;
      }

      if ( typeof val !== 'string' ) {
        throw new Error("Component FmAttributesSelectModal return value with wrong format. Expected string or null got a " + typeof val);
      }

      val2 = getSelAttrData(val);

    }

    emit('save', val);

    emit('selectedAttributesChanged', val2);

    cancelCallback();

  }

  function init() {
	  selAttrsKeysList.value = getSelAttrsKeysList();
  }

  init();

</script>

<style lang="scss" scoped>
  .attr_select_wrap {
    min-height: 340px;
    min-width: 400px;
    height: calc(80vh - $modal-header-height - $modal-footer-height);
    width: 70vw;
    max-width: 800px ;
  }

</style>
