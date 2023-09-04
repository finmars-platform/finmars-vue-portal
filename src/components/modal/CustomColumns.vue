<template>
	<BaseModal :title="title">
		<div style="padding: 5px 0 20px">
			<div class="header">
				<FmBtn type="text" @click="cancel">Add New</FmBtn>

				<FmBtn type="primary" @click="save">RETURN TO VIEW</FmBtn>
			</div>
			<div class="content">
				<div class="card">
					<div class="card__inner">
						<h3 class="card__title"></h3>
						<div class="card__btn">
							<div class="card__edit">
								<FmIcon class="m-l-4" icon="edit" />
							</div>
							<div class="card__delete">
								<FmIcon class="m-l-4" icon="delete" />
							</div>
						</div>
					</div>
				</div>
			</div>
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
	var vm = this

	vm.attributeDataService = attributeDataService
	vm.entityViewerEventService = entityViewerEventService
	vm.customFields = []
	vm.entityType = data.entityType

	vm.readyStatus = { customFields: false, attributes: false }

	vm.getList = function () {
		customFieldService.getList(vm.entityType).then(function (data) {
			vm.customFields = data.results

			console.log('vm.customFields', vm.customFields)

			vm.readyStatus.customFields = true

			$scope.$apply()
		})
	}

	async function init() {
		let res = await Promise.all([evAttrsStore.getFetchCustomFields()])
	}

	init()
</script>

<style lang="scss" scoped>
	.header {
		display: flex;
		justify-content: space-between;
		margin-bottom: 20px;
	}
	.card__btn {
		display: flex;
	}
	.card__inner {
		display: flex;
		justify-content: space-between;
	}
</style>
