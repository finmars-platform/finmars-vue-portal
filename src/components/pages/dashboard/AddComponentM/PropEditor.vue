<template>
	<div class="row">
		<LazySelectorsPortfolio
			v-if="prop.view && prop.view.type == 'portfolio'"
			class="prop_row"
			v-model="prop.default_value"
			:label="prop.name"
		/>
		<LazySelectorsCurrency
			v-if="prop.view && prop.view.type == 'currency'"
			class="prop_row"
			v-model="prop.default_value"
			:label="prop.name"
		/>
		<LazySelectorsBundle
			v-if="prop.view && prop.view.type == 'bundle'"
			class="prop_row"
			v-model="prop.default_value"
			:label="prop.name"
		/>
		<FmInputDate
			class="bi_no_margins prop_row"
			v-if="prop.view && prop.view.type == 'date'"
			v-model="prop.default_value"
			:label="prop.name"
		/>

		<FmSelect
			class="prop_row"
			v-if="prop.view && prop.view.type == 'select'"
			v-model="prop.default_value"
			:label="prop.name"
			:items="prop.view.items"
		/>

		<FmBtn
			class="sub_btn"
			:disabled="!oppositeProps.length"
			@click="isOpen = true"
		>
			{{ type == 'inputs' ? 'Listen outputs' : 'broadcast in inputs' }} [{{
				propRelation.length
			}}]
		</FmBtn>

		<BaseMultiSelectModal
			v-if="isOpen"
			v-model:opened="isOpen"
			v-model="propRelation"
			:title="prop.name"
			:items="oppositeProps"
			:item_id="'id'"
			@cancel="isOpen = false"
			@save=";(propRelation = $event), (isOpen = false)"
		/>
	</div>
</template>

<script setup>
	const props = defineProps({
		prop: Object,
		type: {
			type: String,
			required: true,
		},
	})
	const dashStore = useStoreDashboard()

	const propRelation = computed({
		get() {
			if (props.type == 'inputs') return props.prop.subscribedTo
			return props.prop._children
		},
		set(newVal) {
			if (props.type == 'inputs') props.prop.subscribedTo = newVal
			else props.prop._children = newVal
		},
	})

	let isOpen = ref(false)
	let oppositeTypeMap = {
		inputs: 'outputs',
		outputs: 'inputs',
	}

	const oppositeProps = computed(() => {
		let oppositeType = oppositeTypeMap[props.type]

		let oppositeProps = dashStore.props[oppositeType]
			.filter(
				(prop) =>
					prop.type == props.prop.type &&
					prop.component_id != props.prop.component_id
			)
			.map((prop) => {
				return {
					id: prop.uid,
					name: `${
						dashStore.components.find((comp) => comp.uid == prop.component_id)
							.user_code
					}/${prop.name}`,
				}
			})

		return JSON.parse(JSON.stringify(oppositeProps))
	})
</script>

<style lang="scss" scoped>
	.row {
		& + & {
			margin-top: 20px;
		}
	}
	.prop_row {
		margin-bottom: 0;
	}
	.sub_btn {
		margin-top: 6px;
		width: 100%;
	}
</style>
