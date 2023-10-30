<template>
	<div class="container">
		<h1 class="title">User Attributes</h1>

		<FmExpansionPanel title="Portfolio Attributes">
			<div class="attributes-header">
				<FmBtn
					type="primary"
					class="btn-transaction mr-20"
					@click=";(editAttributBtn = true), close()"
					>Add New</FmBtn
				>
				<FmBtn
					type="primary"
					class="btn-transaction"
					@click="complexTransactionUserFieldCreate()"
					>SHOW HIDDEN ATTRIBUTES
				</FmBtn>
			</div>
			<div v-if="portfolioItems">
				<div
					class="layouts-card"
					v-for="(item, index) in portfolioItems"
					:key="index"
				>
					<div class="layouts-card__inner">
						<div class="layouts-card__name">
							<FmIcon btn icon="visibility" v-fm-tooltip="'Delete Attribute'" />
							<div class="layouts-card__text">
								<h3 class="layouts-card__title">
									{{ item?.name }}
								</h3>
								<div class="layouts-card__subtitle">
									{{ item?.user_code }}
								</div>
							</div>
						</div>

						<div class="layouts-card__setting">
							<div class="layouts-card__item layouts-card__rename">
								<FmIcon
									btn
									icon="file_download"
									v-fm-tooltip="'Export Classifier'"
									@click=";(exportClassifiersBtn = true), close()"
								/>
							</div>
							<div class="layouts-card__item layouts-card__default">
								<FmIcon
									btn
									icon="file_upload"
									v-fm-tooltip="'Import Classifiers from .csv file'"
								/>
							</div>
							<div class="layouts-card__item layouts-card__delete">
								<FmIcon
									btn
									icon="map"
									v-fm-tooltip="'Open Classifier Mappings'"
								/>
							</div>
							<div class="layouts-card__item layouts-card__delete">
								<FmIcon
									btn
									icon="format_align_right"
									v-fm-tooltip="'Edit Classifier tre'"
								/>
							</div>
							<div class="layouts-card__item layouts-card__delete">
								<FmIcon
									btn
									icon="edit"
									v-fm-tooltip="'Edit Attribute'"
									@click=";(editAttributBtn = true), close()"
								/>
							</div>
							<div class="layouts-card__item layouts-card__delete">
								<FmIcon
									btn
									icon="delete"
									v-fm-tooltip="'Delete Attribute'"
									@click=";(deleteAttributBtn = true), close()"
								/>
							</div>
						</div>
					</div>
				</div>
			</div>
			<span v-else class="not-atribute"
				>You could add new user attributes here</span
			>
		</FmExpansionPanel>
		<FmExpansionPanel title="Account Attributes">
			<div class="attributes-header">
				<FmBtn
					type="primary"
					class="btn-transaction mr-20"
					@click="complexTransactionUserFieldCreate()"
					>Add New</FmBtn
				>
				<FmBtn
					type="primary"
					class="btn-transaction"
					@click="complexTransactionUserFieldCreate()"
					>SHOW HIDDEN ATTRIBUTES
				</FmBtn>
			</div>
			<div v-if="accountItems">
				<div
					class="layouts-card"
					v-for="(item, index) in accountItems"
					:key="index"
				>
					<div class="layouts-card__inner">
						<div class="layouts-card__name">
							<FmIcon btn icon="visibility" v-fm-tooltip="'Delete Attribute'" />
							<div class="layouts-card__text">
								<h3 class="layouts-card__title">
									{{ item?.name }}
								</h3>
								<div class="layouts-card__subtitle">
									{{ item?.user_code }}
								</div>
							</div>
						</div>

						<div class="layouts-card__setting">
							<div class="layouts-card__item layouts-card__rename">
								<FmIcon
									btn
									icon="file_download"
									v-fm-tooltip="'Export Classifier'"
								/>
							</div>
							<div class="layouts-card__item layouts-card__default">
								<FmIcon
									btn
									icon="file_upload"
									v-fm-tooltip="'Import Classifiers from .csv file'"
								/>
							</div>
							<div class="layouts-card__item layouts-card__delete">
								<FmIcon
									btn
									icon="map"
									v-fm-tooltip="'Open Classifier Mappings'"
								/>
							</div>
							<div class="layouts-card__item layouts-card__delete">
								<FmIcon
									btn
									icon="format_align_right"
									v-fm-tooltip="'Edit Classifier tre'"
								/>
							</div>
							<div class="layouts-card__item layouts-card__delete">
								<FmIcon btn icon="edit" v-fm-tooltip="'Edit Attribute'" />
							</div>
							<div class="layouts-card__item layouts-card__delete">
								<FmIcon btn icon="delete" v-fm-tooltip="'Delete Attribute'" />
							</div>
						</div>
					</div>
				</div>
			</div>
			<span v-else class="not-atribute"
				>You could add new user attributes here</span
			>
		</FmExpansionPanel>
		<FmExpansionPanel title="Instruments Attributes">
			<div class="attributes-header">
				<FmBtn
					type="primary"
					class="btn-transaction mr-20"
					@click="complexTransactionUserFieldCreate()"
					>Add New</FmBtn
				>
				<FmBtn
					type="primary"
					class="btn-transaction"
					@click="complexTransactionUserFieldCreate()"
					>SHOW HIDDEN ATTRIBUTES
				</FmBtn>
			</div>
			<div v-if="instrumentItems">
				<div
					class="layouts-card"
					v-for="(item, index) in instrumentItems"
					:key="index"
				>
					<div class="layouts-card__inner">
						<div class="layouts-card__name">
							<FmIcon btn icon="visibility" v-fm-tooltip="'Delete Attribute'" />
							<div class="layouts-card__text">
								<h3 class="layouts-card__title">
									{{ item?.name }}
								</h3>
								<div class="layouts-card__subtitle">
									{{ item?.user_code }}
								</div>
							</div>
						</div>

						<div class="layouts-card__setting">
							<div class="layouts-card__item layouts-card__rename">
								<FmIcon
									btn
									icon="file_download"
									v-fm-tooltip="'Export Classifier'"
								/>
							</div>
							<div class="layouts-card__item layouts-card__default">
								<FmIcon
									btn
									icon="file_upload"
									v-fm-tooltip="'Import Classifiers from .csv file'"
								/>
							</div>
							<div class="layouts-card__item layouts-card__delete">
								<FmIcon
									btn
									icon="map"
									v-fm-tooltip="'Open Classifier Mappings'"
								/>
							</div>
							<div class="layouts-card__item layouts-card__delete">
								<FmIcon
									btn
									icon="format_align_right"
									v-fm-tooltip="'Edit Classifier tre'"
								/>
							</div>
							<div class="layouts-card__item layouts-card__delete">
								<FmIcon btn icon="edit" v-fm-tooltip="'Edit Attribute'" />
							</div>
							<div class="layouts-card__item layouts-card__delete">
								<FmIcon btn icon="delete" v-fm-tooltip="'Delete Attribute'" />
							</div>
						</div>
					</div>
				</div>
			</div>
			<span v-else>You could add new user attributes here</span>
		</FmExpansionPanel>
		<FmExpansionPanel title="Responsible Attributes">
			<div class="attributes-header">
				<FmBtn
					type="primary"
					class="btn-transaction mr-20"
					@click="complexTransactionUserFieldCreate()"
					>Add New</FmBtn
				>
				<FmBtn
					type="primary"
					class="btn-transaction"
					@click="complexTransactionUserFieldCreate()"
					>SHOW HIDDEN ATTRIBUTES
				</FmBtn>
			</div>
			<div v-if="responsibleAttrItems">
				<div
					class="layouts-card"
					v-for="(item, index) in responsibleAttrItems"
					:key="index"
				>
					<div class="layouts-card__inner">
						<div class="layouts-card__name">
							<FmIcon btn icon="visibility" v-fm-tooltip="'Delete Attribute'" />
							<div class="layouts-card__text">
								<h3 class="layouts-card__title">
									{{ item?.name }}
								</h3>
								<div class="layouts-card__subtitle">
									{{ item?.user_code }}
								</div>
							</div>
						</div>

						<div class="layouts-card__setting">
							<div class="layouts-card__item layouts-card__rename">
								<FmIcon
									btn
									icon="file_download"
									v-fm-tooltip="'Export Classifier'"
									@click=";(exportClassifiersBtn = true), close()"
								/>
							</div>
							<div class="layouts-card__item layouts-card__default">
								<FmIcon
									btn
									icon="file_upload"
									v-fm-tooltip="'Import Classifiers from .csv file'"
								/>
							</div>
							<div class="layouts-card__item layouts-card__delete">
								<FmIcon
									btn
									icon="map"
									v-fm-tooltip="'Open Classifier Mappings'"
								/>
							</div>
							<div class="layouts-card__item layouts-card__delete">
								<FmIcon
									btn
									icon="format_align_right"
									v-fm-tooltip="'Edit Classifier tre'"
								/>
							</div>
							<div class="layouts-card__item layouts-card__delete">
								<FmIcon
									btn
									icon="edit"
									v-fm-tooltip="'Edit Attribute'"
									@click=";(editAttributBtn = true), close()"
								/>
							</div>
							<div class="layouts-card__item layouts-card__delete">
								<FmIcon
									btn
									icon="delete"
									v-fm-tooltip="'Delete Attribute'"
									@click=";(deleteAttributBtn = true), close()"
								/>
							</div>
						</div>
					</div>
				</div>
			</div>
			<span v-else class="not-atribute"
				>You could add new user attributes here</span
			>
		</FmExpansionPanel>
		<FmExpansionPanel title="Counterparty Attributes">
			<div class="attributes-header">
				<FmBtn
					type="primary"
					class="btn-transaction mr-20"
					@click="complexTransactionUserFieldCreate()"
					>Add New</FmBtn
				>
				<FmBtn
					type="primary"
					class="btn-transaction"
					@click="complexTransactionUserFieldCreate()"
					>SHOW HIDDEN ATTRIBUTES
				</FmBtn>
			</div>
			<div v-if="counterpartyAttributeTypeItems">
				<div
					class="layouts-card"
					v-for="(item, index) in counterpartyAttributeTypeItems"
					:key="index"
				>
					<div class="layouts-card__inner">
						<div class="layouts-card__name">
							<FmIcon btn icon="visibility" v-fm-tooltip="'Delete Attribute'" />
							<div class="layouts-card__text">
								<h3 class="layouts-card__title">
									{{ item?.name }}
								</h3>
								<div class="layouts-card__subtitle">
									{{ item?.user_code }}
								</div>
							</div>
						</div>

						<div class="layouts-card__setting">
							<div class="layouts-card__item layouts-card__rename">
								<FmIcon
									btn
									icon="file_download"
									v-fm-tooltip="'Export Classifier'"
									@click=";(exportClassifiersBtn = true), close()"
								/>
							</div>
							<div class="layouts-card__item layouts-card__default">
								<FmIcon
									btn
									icon="file_upload"
									v-fm-tooltip="'Import Classifiers from .csv file'"
								/>
							</div>
							<div class="layouts-card__item layouts-card__delete">
								<FmIcon
									btn
									icon="map"
									v-fm-tooltip="'Open Classifier Mappings'"
								/>
							</div>
							<div class="layouts-card__item layouts-card__delete">
								<FmIcon
									btn
									icon="format_align_right"
									v-fm-tooltip="'Edit Classifier tre'"
								/>
							</div>
							<div class="layouts-card__item layouts-card__delete">
								<FmIcon
									btn
									icon="edit"
									v-fm-tooltip="'Edit Attribute'"
									@click=";(editAttributBtn = true), close()"
								/>
							</div>
							<div class="layouts-card__item layouts-card__delete">
								<FmIcon
									btn
									icon="delete"
									v-fm-tooltip="'Delete Attribute'"
									@click=";(deleteAttributBtn = true), close()"
								/>
							</div>
						</div>
					</div>
				</div>
			</div>
			<span v-else class="not-atribute"
				>You could add new user attributes here</span
			>
		</FmExpansionPanel>

		<FmExpansionPanel title="Currency Attributes">
			<div class="attributes-header">
				<FmBtn
					type="primary"
					class="btn-transaction mr-20"
					@click="complexTransactionUserFieldCreate()"
					>Add New</FmBtn
				>
				<FmBtn
					type="primary"
					class="btn-transaction"
					@click="complexTransactionUserFieldCreate()"
					>SHOW HIDDEN ATTRIBUTES
				</FmBtn>
			</div>
			<div v-if="counterpartyAttributeTypeItems">
				<div
					class="layouts-card"
					v-for="(item, index) in counterpartyAttributeTypeItems"
					:key="index"
				>
					<div class="layouts-card__inner">
						<div class="layouts-card__name">
							<FmIcon btn icon="visibility" v-fm-tooltip="'Delete Attribute'" />
							<div class="layouts-card__text">
								<h3 class="layouts-card__title">
									{{ item?.name }}
								</h3>
								<div class="layouts-card__subtitle">
									{{ item?.user_code }}
								</div>
							</div>
						</div>

						<div class="layouts-card__setting">
							<div class="layouts-card__item layouts-card__rename">
								<FmIcon
									btn
									icon="file_download"
									v-fm-tooltip="'Export Classifier'"
									@click=";(exportClassifiersBtn = true), close()"
								/>
							</div>
							<div class="layouts-card__item layouts-card__default">
								<FmIcon
									btn
									icon="file_upload"
									v-fm-tooltip="'Import Classifiers from .csv file'"
								/>
							</div>
							<div class="layouts-card__item layouts-card__delete">
								<FmIcon
									btn
									icon="map"
									v-fm-tooltip="'Open Classifier Mappings'"
								/>
							</div>
							<div class="layouts-card__item layouts-card__delete">
								<FmIcon
									btn
									icon="format_align_right"
									v-fm-tooltip="'Edit Classifier tre'"
								/>
							</div>
							<div class="layouts-card__item layouts-card__delete">
								<FmIcon
									btn
									icon="edit"
									v-fm-tooltip="'Edit Attribute'"
									@click=";(editAttributBtn = true), close()"
								/>
							</div>
							<div class="layouts-card__item layouts-card__delete">
								<FmIcon
									btn
									icon="delete"
									v-fm-tooltip="'Delete Attribute'"
									@click=";(deleteAttributBtn = true), close()"
								/>
							</div>
						</div>
					</div>
				</div>
			</div>
			<span v-else class="not-atribute"
				>You could add new user attributes here</span
			>
		</FmExpansionPanel>
		<FmExpansionPanel title="Strategy 1 Attributes">
			<div class="attributes-header">
				<FmBtn
					type="primary"
					class="btn-transaction mr-20"
					@click="complexTransactionUserFieldCreate()"
					>Add New</FmBtn
				>
				<FmBtn
					type="primary"
					class="btn-transaction"
					@click="complexTransactionUserFieldCreate()"
					>SHOW HIDDEN ATTRIBUTES
				</FmBtn>
			</div>

			<div v-if="strategy1AttrTypeItems">
				<div
					class="layouts-card"
					v-for="(item, index) in strategy1AttrTypeItems"
					:key="index"
				>
					<div class="layouts-card__inner">
						<div class="layouts-card__name">
							<FmIcon btn icon="visibility" v-fm-tooltip="'Delete Attribute'" />
							<div class="layouts-card__text">
								<h3 class="layouts-card__title">
									{{ item?.name }}
								</h3>
								<div class="layouts-card__subtitle">
									{{ item?.user_code }}
								</div>
							</div>
						</div>

						<div class="layouts-card__setting">
							<div class="layouts-card__item layouts-card__rename">
								<FmIcon
									btn
									icon="file_download"
									v-fm-tooltip="'Export Classifier'"
									@click=";(exportClassifiersBtn = true), close()"
								/>
							</div>
							<div class="layouts-card__item layouts-card__default">
								<FmIcon
									btn
									icon="file_upload"
									v-fm-tooltip="'Import Classifiers from .csv file'"
								/>
							</div>
							<div class="layouts-card__item layouts-card__delete">
								<FmIcon
									btn
									icon="map"
									v-fm-tooltip="'Open Classifier Mappings'"
								/>
							</div>
							<div class="layouts-card__item layouts-card__delete">
								<FmIcon
									btn
									icon="format_align_right"
									v-fm-tooltip="'Edit Classifier tre'"
								/>
							</div>
							<div class="layouts-card__item layouts-card__delete">
								<FmIcon
									btn
									icon="edit"
									v-fm-tooltip="'Edit Attribute'"
									@click=";(editAttributBtn = true), close()"
								/>
							</div>
							<div class="layouts-card__item layouts-card__delete">
								<FmIcon
									btn
									icon="delete"
									v-fm-tooltip="'Delete Attribute'"
									@click=";(deleteAttributBtn = true), close()"
								/>
							</div>
						</div>
					</div>
				</div>
			</div>
			<span v-else class="not-atribute"
				>You could add new user attributes here</span
			>
		</FmExpansionPanel>
		<FmExpansionPanel title="Strategy 2 Attributes">
			<div class="attributes-header">
				<FmBtn
					type="primary"
					class="btn-transaction mr-20"
					@click="complexTransactionUserFieldCreate()"
					>Add New</FmBtn
				>
				<FmBtn
					type="primary"
					class="btn-transaction"
					@click="complexTransactionUserFieldCreate()"
					>SHOW HIDDEN ATTRIBUTES
				</FmBtn>
			</div>
			<div v-if="strategy2AttrTypeItems">
				<div
					class="layouts-card"
					v-for="(item, index) in strategy2AttrTypeItems"
					:key="index"
				>
					<div class="layouts-card__inner">
						<div class="layouts-card__name">
							<FmIcon btn icon="visibility" v-fm-tooltip="'Delete Attribute'" />
							<div class="layouts-card__text">
								<h3 class="layouts-card__title">
									{{ item?.name }}
								</h3>
								<div class="layouts-card__subtitle">
									{{ item?.user_code }}
								</div>
							</div>
						</div>

						<div class="layouts-card__setting">
							<div class="layouts-card__item layouts-card__rename">
								<FmIcon
									btn
									icon="file_download"
									v-fm-tooltip="'Export Classifier'"
									@click=";(exportClassifiersBtn = true), close()"
								/>
							</div>
							<div class="layouts-card__item layouts-card__default">
								<FmIcon
									btn
									icon="file_upload"
									v-fm-tooltip="'Import Classifiers from .csv file'"
								/>
							</div>
							<div class="layouts-card__item layouts-card__delete">
								<FmIcon
									btn
									icon="map"
									v-fm-tooltip="'Open Classifier Mappings'"
								/>
							</div>
							<div class="layouts-card__item layouts-card__delete">
								<FmIcon
									btn
									icon="format_align_right"
									v-fm-tooltip="'Edit Classifier tre'"
								/>
							</div>
							<div class="layouts-card__item layouts-card__delete">
								<FmIcon
									btn
									icon="edit"
									v-fm-tooltip="'Edit Attribute'"
									@click=";(editAttributBtn = true), close()"
								/>
							</div>
							<div class="layouts-card__item layouts-card__delete">
								<FmIcon
									btn
									icon="delete"
									v-fm-tooltip="'Delete Attribute'"
									@click=";(deleteAttributBtn = true), close()"
								/>
							</div>
						</div>
					</div>
				</div>
			</div>
			<span v-else class="not-atribute"
				>You could add new user attributes here</span
			>
		</FmExpansionPanel>
		<FmExpansionPanel title="Strategy 3 Attributes">
			<div class="attributes-header">
				<FmBtn
					type="primary"
					class="btn-transaction mr-20"
					@click="complexTransactionUserFieldCreate()"
					>Add New</FmBtn
				>
				<FmBtn
					type="primary"
					class="btn-transaction"
					@click="complexTransactionUserFieldCreate()"
					>SHOW HIDDEN ATTRIBUTES
				</FmBtn>
			</div>

			<div v-if="strategy3AttrTypeList">
				<div
					class="layouts-card"
					v-for="(item, index) in strategy3AttrTypeList"
					:key="index"
				>
					<div class="layouts-card__inner">
						<div class="layouts-card__name">
							<FmIcon btn icon="visibility" v-fm-tooltip="'Delete Attribute'" />
							<div class="layouts-card__text">
								<h3 class="layouts-card__title">
									{{ item?.name }}
								</h3>
								<div class="layouts-card__subtitle">
									{{ item?.user_code }}
								</div>
							</div>
						</div>

						<div class="layouts-card__setting">
							<div class="layouts-card__item layouts-card__rename">
								<FmIcon
									btn
									icon="file_download"
									v-fm-tooltip="'Export Classifier'"
									@click=";(exportClassifiersBtn = true), close()"
								/>
							</div>
							<div class="layouts-card__item layouts-card__default">
								<FmIcon
									btn
									icon="file_upload"
									v-fm-tooltip="'Import Classifiers from .csv file'"
								/>
							</div>
							<div class="layouts-card__item layouts-card__delete">
								<FmIcon
									btn
									icon="map"
									v-fm-tooltip="'Open Classifier Mappings'"
								/>
							</div>
							<div class="layouts-card__item layouts-card__delete">
								<FmIcon
									btn
									icon="format_align_right"
									v-fm-tooltip="'Edit Classifier tre'"
								/>
							</div>
							<div class="layouts-card__item layouts-card__delete">
								<FmIcon
									btn
									icon="edit"
									v-fm-tooltip="'Edit Attribute'"
									@click=";(editAttributBtn = true), close()"
								/>
							</div>
							<div class="layouts-card__item layouts-card__delete">
								<FmIcon
									btn
									icon="delete"
									v-fm-tooltip="'Delete Attribute'"
									@click=";(deleteAttributBtn = true), close()"
								/>
							</div>
						</div>
					</div>
				</div>
			</div>
			<span v-else class="not-atribute">This entity has no layouts.</span>
		</FmExpansionPanel>
		<FmExpansionPanel title="Account Type Attributes">
			<div class="attributes-header">
				<FmBtn
					type="primary"
					class="btn-transaction mr-20"
					@click="complexTransactionUserFieldCreate()"
					>Add New</FmBtn
				>
				<FmBtn
					type="primary"
					class="btn-transaction"
					@click="complexTransactionUserFieldCreate()"
					>SHOW HIDDEN ATTRIBUTES
				</FmBtn>
			</div>

			<div v-if="accountTypeAttributeItems">
				<div
					class="layouts-card"
					v-for="(item, index) in accountTypeAttributeItems"
					:key="index"
				>
					<div class="layouts-card__inner">
						<div class="layouts-card__name">
							<FmIcon btn icon="visibility" v-fm-tooltip="'Delete Attribute'" />
							<div class="layouts-card__text">
								<h3 class="layouts-card__title">
									{{ item?.name }}
								</h3>
								<div class="layouts-card__subtitle">
									{{ item?.user_code }}
								</div>
							</div>
						</div>

						<div class="layouts-card__setting">
							<div class="layouts-card__item layouts-card__rename">
								<FmIcon
									btn
									icon="file_download"
									v-fm-tooltip="'Export Classifier'"
									@click=";(exportClassifiersBtn = true), close()"
								/>
							</div>
							<div class="layouts-card__item layouts-card__default">
								<FmIcon
									btn
									icon="file_upload"
									v-fm-tooltip="'Import Classifiers from .csv file'"
								/>
							</div>
							<div class="layouts-card__item layouts-card__delete">
								<FmIcon
									btn
									icon="map"
									v-fm-tooltip="'Open Classifier Mappings'"
								/>
							</div>
							<div class="layouts-card__item layouts-card__delete">
								<FmIcon
									btn
									icon="format_align_right"
									v-fm-tooltip="'Edit Classifier tre'"
								/>
							</div>
							<div class="layouts-card__item layouts-card__delete">
								<FmIcon
									btn
									icon="edit"
									v-fm-tooltip="'Edit Attribute'"
									@click=";(editAttributBtn = true), close()"
								/>
							</div>
							<div class="layouts-card__item layouts-card__delete">
								<FmIcon
									btn
									icon="delete"
									v-fm-tooltip="'Delete Attribute'"
									@click=";(deleteAttributBtn = true), close()"
								/>
							</div>
						</div>
					</div>
				</div>
			</div>
			<span v-else class="not-atribute"
				>You could add new user attributes here</span
			>
		</FmExpansionPanel>
		<FmExpansionPanel title="Transaction Type Attributes">
			<div class="attributes-header">
				<FmBtn
					type="primary"
					class="btn-transaction mr-20"
					@click="complexTransactionUserFieldCreate()"
					>Add New</FmBtn
				>
				<FmBtn
					type="primary"
					class="btn-transaction"
					@click="complexTransactionUserFieldCreate()"
					>SHOW HIDDEN ATTRIBUTES
				</FmBtn>
			</div>
			<span class="not-atribute">You could add new user attributes here</span>
		</FmExpansionPanel>
		<ModalUserAttributes
			title="Attribute manager"
			v-model="editAttributBtn"
			@save="renameLayout"
		/>
		<ModalExportClassifiers
			title="Export Classifiers"
			v-model="exportClassifiersBtn"
			@save="renameLayout"
		/>

		<!-- title="Rename layout"
			:name="activeLayout.name"
			:user_code="activeLayout.user_code"
			:configuration_code="activeLayout.configuration_code"
			:content_type="content_type"
			:occupiedUserCodes="occupiedUserCodes" -->
	</div>
</template>
<script setup>
	definePageMeta({
		middleware: 'auth',
		bread: [
			{
				text: 'Default settings',
				to: '/settings/default-settings',
			},
		],
	})

	const instrumentItems = ref([])
	const portfolioItems = ref([])
	const accountItems = ref([])
	const responsibleAttrItems = ref([])
	const counterpartyAttributeTypeItems = ref([])
	const currencyAttrTypeItems = ref([])
	const strategy1AttrTypeItems = ref([])
	const accountsTypeItems = ref([])
	const pricingPolicyListItems = ref([])
	const instrumentPeriodicityItems = ref([])
	const instrumentAccrualCalculationModelItems = ref([])
	const instrumentClassItems = ref([])
	const instrumentSizeDetailItems = ref([])
	const instrumentPricingСonditionItems = ref([])
	const counterpartyResponsibleLightItems = ref([])
	const counterpartyCounterpartyLightItems = ref([])
	const strategiesOneLightItems = ref([])
	const strategiesOneSubgroupItems = ref([])
	const strategiesSecondLightItems = ref([])
	const strategiesSecondSubgroupItems = ref([])
	const strategiesThirdLightItems = ref([])
	const strategiesThirdSubgroupItems = ref([])
	const instrumentSchemeListItems = ref([])
	const currencySchemeListItems = ref([])

	const editAttributBtn = ref(false)
	const deleteAttributBtn = ref(false)
	const exportClassifiersBtn = ref(false)

	const disabledBtn = ref(true)
	const ecosystemDefaults = ref([1])
	const BaseInputEcosystemDefaults = ref([])
	const activeAttributList = ref([])

	const evAttrsStore = useEvAttributesStore()

	let attributMap = ref({
		'portfolios.portfolio': [],
		'reports.plreport': [],
		'reports.balancereport': [],
		'reports.transactionreport': [],
		'accounts.account': [],
		'accounts.accounttype': [],
		'instruments.instrument': [],
		'instruments.instrumenttype': [],
		'counterparties.responsible': [],
		'counterparties.counterparty': [],
		'currencies.currency': [],
		'strategies.strategy1': [],
		'strategies.strategy2': [],
		'strategies.strategy3': [],
		'transactions.transactiontype': [],
		'transactions.complextransaction': [],
	})
	getAttributList()
	async function getAttributList() {
		attributMap = ref({
			'portfolios.portfolio': [],
			'reports.plreport': [],
			'reports.balancereport': [],
			'reports.transactionreport': [],
			'accounts.account': [],
			'accounts.accounttype': [],
			'instruments.instrument': [],
			'instruments.instrumenttype': [],
			'counterparties.responsible': [],
			'counterparties.counterparty': [],
			'currencies.currency': [],
			'strategies.strategy1': [],
			'strategies.strategy2': [],
			'strategies.strategy3': [],
			'transactions.transactiontype': [],
			'transactions.complextransaction': [],
		})
		const res = await evAttrsStore.getFetchAllAttributeTypes()
		console.log('res getLayouts', res)
		
		const res2 = res.then((results) =>
			results.forEach((result) => console.log(result.status))
		)

		console.log('res getLayouts res2', res2)
		activeAttributList.value = res.then(
			function (result) {
				console.log('res getLayoutsewefwf', result)
			},
			function (error) {
				/* обработает ошибку */
			}
		)

		activeAttributList.value.forEach((Attribut) => {
			// attributMap.value[Attribut.content_type].push(layout)
		})
		console.log('AttributMap activeAttributList', attributMap)
		// console.log(
		// 	"AttributMap.value['portfolios.portfolio']",
		// 	AttributMap.value['portfolios.portfolio']
		// )
	}

	// watch(
	// 	ecosystemDefaults,
	// 	(newValue, oldValue) => {
	// 		if (oldValue[0] === 1) {
	// 		} else {
	// 			disabledBtn.value = false
	// 		}
	// 	},
	// 	{ deep: true }
	// ),
	// 	instrumentAttrGet()
	// portfolioAttrGet()
	// accountAttrGet()
	// responsibleAttrGet()
	// counterpartyAttributeTypeGet()
	// currencyAttrTypeListGet()
	// strategy1AttrTypeListGet()
	// strategy2AttrTypeListGet()
	// strategy3AttrTypeListGet()
	// accountTypeAttributeGet()

	// async function instrumentAttrGet() {
	// 	let edRes = await useApi('instrumentAttrTypeList.get')
	// 	instrumentItems.value = edRes.error ? [] : edRes.results
	// 	console.log(ecosystemDefaults.value, 'edRes')
	// }
	// async function portfolioAttrGet() {
	// 	let edRes = await useApi('portfolioAttrTypeList.get')

	// 	portfolioItems.value = edRes.error ? [] : edRes.results
	// 	console.log(ecosystemDefaults.value, 'edRes')
	// }
	// async function accountAttrGet() {
	// 	let edRes = await useApi('accountAttrTypeList.get')

	// 	accountItems.value = edRes.error ? [] : edRes.results
	// 	console.log(ecosystemDefaults.value, 'edRes')
	// }
	// async function responsibleAttrGet() {
	// 	let edRes = await useApi('responsibleAttrTypeList.get')

	// 	responsibleAttrItems.value = edRes.error ? [] : edRes.results
	// 	console.log(ecosystemDefaults.value, 'edRes')
	// }
	// async function counterpartyAttributeTypeGet() {
	// 	let edRes = await useApi('counterpartyAttributeTypeList.get')

	// 	counterpartyAttributeTypeItems.value = edRes.error ? [] : edRes.results
	// 	console.log(ecosystemDefaults.value, 'edRes')
	// }
	// async function currencyAttrTypeListGet() {
	// 	let edRes = await useApi('currencyAttrTypeList.get')

	// 	currencyAttrTypeItems.value = edRes.error ? [] : edRes.results
	// 	console.log(ecosystemDefaults.value, 'edRes')
	// }
	// async function strategy1AttrTypeListGet() {
	// 	let edRes = await useApi('strategy1AttrTypeList.get')

	// 	strategy1AttrTypeItems.value = edRes.error ? [] : edRes.results
	// 	console.log(ecosystemDefaults.value, 'edRes')
	// }
	// async function strategy2AttrTypeListGet() {
	// 	let edRes = await useApi('strategy1AttrTypeList.get')

	// 	strategy2AttrTypeItems.value = edRes.error ? [] : edRes.results
	// 	console.log(ecosystemDefaults.value, 'edRes')
	// }

	// async function strategy3AttrTypeListGet() {
	// 	let edRes = await useApi('strategy3AttrTypeList.get')

	// 	strategy3AttrTypeItems.value = edRes.error ? [] : edRes.results
	// 	console.log(ecosystemDefaults.value, 'edRes')
	// }
	// async function accountTypeAttributeGet() {
	// 	let edRes = await useApi('accountTypeAttributeType.get')

	// 	accountTypeAttributeItems.value = edRes.error ? [] : edRes.results
	// 	console.log(ecosystemDefaults.value, 'edRes')
	// }

	function renameLayout(newNamesData) {
		emit('rename', newNamesData)
		renameIsOpened.value = false
	}

	async function defaultSettingsCreate() {
		let res = await useApi('defaultSettings.put', {
			params: { id: ecosystemDefaults.value.id },
			body: ecosystemDefaults.value,
		})

		if (res.error) {
			// console.error(res.error);
			useNotify({ type: 'error', title: res.error.message || res.error.detail })
			throw new Error(res.error)
		} else {
			useNotify({ type: 'success', title: `data saved on the server` })
		}
		disabledBtn.value = true
	}
</script>

<style lang="scss" scoped>
	.wrapp-select {
		display: grid;
		grid-template-columns: 1fr 1fr 1fr 1fr 1fr;
		grid-template-rows: 1fr;

		gap: 10px 5px;
	}
	.container {
		padding: 30px;
	}
	.title {
		margin-bottom: 24px;
		font-weight: 700;
	}
	.layouts-card {
		display: flex;
		box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.2), 0 1px 1px 0 rgba(0, 0, 0, 0.14),
			0 2px 1px -1px rgba(0, 0, 0, 0.12);
		margin-bottom: 8px;
		border-radius: 2px;
		// .layouts-card__inner

		&__inner {
			display: flex;
			justify-content: space-between;
			width: 100%;
			padding: 20px;
		}

		// .layouts-card__name

		&__name {
			display: flex;
		}

		// .layouts-card__setting

		&__setting {
			display: flex;
		}

		// .layouts-card__item

		&__item {
		}

		// .layouts-card__rename

		&__rename {
		}

		// .layouts-card__default

		&__default {
		}

		// .layouts-card__delete

		&__delete {
		}

		// .layouts-card__layout

		&__layout {
		}
	}

	.menu {
		// .menu_item

		&_item {
		}
	}
	.attributes-header {
		display: flex;
		justify-content: space-between;
		margin-bottom: 20px;
	}
	.mr-20 {
		margin-right: 20px;
	}

	.not-atribute {
		display: flex;
		justify-content: center;
		font-weight: 700;
		font-size: 32px;
		margin: 20px 0;
	}

	@media (max-width: 1200px) {
		.wrapp-select {
			display: grid;
			grid-template-columns: 1fr 1fr 1fr;
			grid-template-rows: 1fr;
			gap: 10px 5px;
		}
	}
	@media (max-width: 767px) {
		.wrapp-select {
			display: grid;
			grid-template-columns: 1fr;
			grid-template-rows: 1fr;
			gap: 10px 5px;
		}
	}
</style>
