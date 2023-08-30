<template>
	<div>
		<div class="fm_tabs">
			<div
				class="fm_tabs_item"
				:class="{ active: tab == 'balance' }"
				@click="tab = 'balance'"
			>
				Balance
			</div>
			<div
				class="fm_tabs_item"
				:class="{ active: tab == 'pnl' }"
				@click="tab = 'pnl'"
			>
				P&L
			</div>
			<div
				class="fm_tabs_item"
				:class="{ active: tab == 'dashboard' }"
				@click="tab = 'dashboard'"
			>
				Dashboard
			</div>
			<!--			<div class="fm_tabs_item">Transactions</div>
						<div class="fm_tabs_item">Settings</div>-->
		</div>

		<div
			v-if="tab == 'balance' && layout.balance"
			class="p-24"
		>
			<!-- <FmInputText v-model="" /> -->
			<h4>Total NAV with History chart</h4>

			<FmCheckbox
				label="Total NAV with History chart"
				v-model="layout.balance.isShowHistoryChart"
			/>
			<br />
			<h4>Indicators</h4>
			<FmCheckbox
				label="P&L daily, MTD, YTD"
				v-model="layout.balance.isShowIndicatorsPnl"
				class="m-b-8"
			/>
			<FmCheckbox
				label="Standart indicators"
				v-model="layout.balance.isShowIndicators"
			/>
			<br />
			<h4>Doughnut charts</h4>

			<div class="flex">
				<FmBtn
					@click="openAttrSelector('fieldsToGroup')"
					class="m-r-8"
				>
					set columns to groupping
				</FmBtn>
				<FmBtn
					@click="openAttrSelector('fieldToAggrigate')"
					class="m-r-8"
				>
					set one column to Aggrigate by sum
				</FmBtn>
				<FmBtn type="text" @click="clearAttrs()">Clear all attrs</FmBtn>
			</div>

			<div class="flex">
				<FmCard
					v-for="item in layout.balance.fieldsToGroup"
					style="
						background: #fff;
						width: 280px;
						margin-right: 10px;
						margin-top: 10px;
					"
				>
					<div class="fm_card_title" style="font-size: 14px">
						{{ item.layout_name || item.name }}
					</div>
					<div style="padding-bottom: 40px">
						<b>Sum by:</b>

<!--						{{
							layout.balance.fieldToAggrigate &&
							layout.balance.fieldToAggrigate[0]?.name
						}}-->
            {{ getAggAttrName('balance') }}
					</div>

					<template #controls>
						<FmBtn class="m-8" @click="clearAttr(item.key)">REMOVE</FmBtn>
					</template>
				</FmCard>
			</div>
			<br /><br />
			<FmBtn @click="saveLayout()">save</FmBtn>
		</div>

		<div
			class="p-24"
			v-if="tab == 'pnl' && layout.pnl"
		>
			<!-- <FmInputText v-model="" /> -->
			<h4>Total with History chart</h4>

			<FmCheckbox
				label="Total with History chart"
				v-model="layout.pnl.isShowHistoryChart"
			/>
			<br />
			<h4>Indicators</h4>
			<FmCheckbox
				label="P&L daily, MTD, YTD"
				v-model="layout.pnl.isShowIndicatorsPnl"
				class="m-b-8"
			/>
			<FmCheckbox
				label="Standart indicators"
				v-model="layout.pnl.isShowIndicators"
			/>
			<br />
			<h4>Doughnut charts</h4>

			<div class="flex">
				<FmBtn
					@click="openAttrSelector('fieldsToGroup', 'reports.plreport')"
					class="m-r-8"
				>set columns to groupping</FmBtn>

				<FmBtn
					@click="openAttrSelector('fieldToAggrigate', 'reports.plreport')"
					class="m-r-8"
				>set one column to Aggrigate by sum</FmBtn>

				<FmBtn type="text" @click="clearAttrs()">Clear all attrs</FmBtn>
			</div>

			<div class="flex">
				<FmCard
					v-for="item in layout.pnl.fieldsToGroup"
					style="
						background: #fff;
						width: 280px;
						margin-right: 10px;
						margin-top: 10px;
					"
				>
					<div class="fm_card_title" style="font-size: 14px">
						{{ item.layout_name || item.name }}
					</div>
					<div style="padding-bottom: 40px">
						<b>Sum by:</b>

<!--						{{
							layout.pnl.fieldToAggrigate &&
							layout.pnl.fieldToAggrigate[0]?.name
						}}-->
            {{ getAggAttrName('pnl') }}
					</div>

					<template #controls>
						<FmBtn class="m-8" @click="clearAttr(item.key)">REMOVE</FmBtn>
					</template>
				</FmCard>
			</div>
			<br /><br />
			<FmBtn @click="saveLayout()">save</FmBtn>
		</div>

		<div class="p-24" v-if="tab == 'dashboard' && layout.dashboard">
			<!-- <FmInputText v-model="" /> -->
			<h4>All Portfolios History chart</h4>

			<FmCheckbox
				label="All Portfolios History chart"
				v-model="layout.dashboard.isShowHistoryChart"
			/>
			<br />
			<h4>Indicators</h4>
			<FmCheckbox
				label="P&L daily, MTD, YTD"
				v-model="layout.dashboard.isShowIndicatorsPnl"
				class="m-b-8"
			/>
			<FmCheckbox
				label="Standart indicators"
				v-model="layout.dashboard.isShowIndicators"
			/>

			<br /><br />
			<FmBtn @click="saveLayout()">save</FmBtn>
		</div>

		<!--		<ModalAttributesSelector
					v-if="attrsSelectorIsOpen"
					:payload="payloadForSelector"
					:modelValue="true"
				></ModalAttributesSelector>-->
		<FmAttributesSelectModal
			v-model="attrsSelectorIsOpen"
			title="Add column"
			:contentType="attrsSelContentType"
			:attributes="allAttrs"
			:selected="selAttrsKeys"
			:disabledAttributes="selAttrsKeys"
			multiselect
			@selectedAttributesChanged="attrs => applySelAttrs(attrs)"
      @favoritesChanged="favAttrs => renameAttrs('fieldsToGroup', favAttrs)"
		/>

		<FmAttributesSelectModal
			v-model="aggAttrsSelIsOpen"
			title="Select column"
			:contentType="attrsSelContentType"
			:valueType="20"
			:attributes="allAttrs"
			:selected="selAttrsKeys[0]"
			@selectedAttributesChanged="attr => applyAggAttr(attr)"
      @favoritesChanged="favAttrs => renameAttrs('fieldToAggrigate', favAttrs)"
		/>
	</div>
</template>

<script setup>

  definePageMeta({
    middleware: 'auth',
    bread: [
      {
        text: 'Mobile dashboard',
        disabled: true,
      },
    ],
  })

  let evAttrsStore = useEvAttributesStore();

  let tab = ref('balance')
  let layout = ref({})

  // let payloadForSelector = ref({});

  let reportProp = computed(() => {

    if ( ['balance', 'pnl'].includes(tab.value) ) return tab.value;

    return '';

  });
  // let isPnl = ref(false);
  let attrsSelContentType = ref('reports.balancereport');
  let allAttrs = ref([]);
  let selAttrs = ref([]);
  let selAttrsKeys = computed( () => selAttrs.value.map( attr => attr.key ) );

  const attrsSelectorIsOpen = ref(false);
  let aggAttrsSelIsOpen = ref(false);

  /*function openAttrSelector(layoutField, isPnl = false) {
    window.evRvLayoutsHelper = new evRvLayoutsHelperInst()
    let middlewareService = new middlewareServiceInst()

    // Globals HACK
    window.metaContentTypesService = new metaContentTypesServiceInst()
    window.globalDataService = new globalDataServiceInst()
    window.xhrService = new xhrService()
    window.cookieService = new cookieService()

    attrsSelectorIsOpen.value = true

    let attributeDataService = new attributeDataServiceInst(
      metaContentTypesService,
      customFieldService,
      attributeTypeService,
      uiService
    )

    allAttrs = attributeDataService.getForAttributesSelector(
      isPnl ? 'pl-report' : 'balance-report'
    )
    const selectedAttrs = layout.value[isPnl ? 'pnl' : 'balance'][layoutField]

    payloadForSelector.value = {
      data: {
        title: 'Add columns',
        attributes: allAttrs,
        selectedAttributes: [],
        contentType: isPnl ? 'reports.plreport' : 'reports.balancereport',
      },
      resolve(res) {
        console.log('res:', res)
        layout.value[isPnl ? 'pnl' : 'balance'][layoutField] = res.data.items
        attrsSelectorIsOpen.value = false

        useNotify({ title: 'Changed', type: 'success' })
      },
      reject(res) {
        attrsSelectorIsOpen.value = false
      },
    }
  }*/
  function openAttrSelector(layoutField, content_type = 'reports.balancereport') {

    attrsSelContentType.value = content_type;

    // TODO: with use of evAttributesStore delete services from angularjs
    /*window.evRvLayoutsHelper = new evRvLayoutsHelperInst()
    // let middlewareService = new middlewareServiceInst()

    // Globals HACK
    window.metaContentTypesService = new metaContentTypesServiceInst()
    window.globalDataService = new globalDataServiceInst()
    window.xhrService = new xhrService()
    window.cookieService = new cookieService()*/

    if (layoutField === 'fieldsToGroup') {
      attrsSelectorIsOpen.value = true;

    } else {
      aggAttrsSelIsOpen.value = true;
    }

    /*let attributeDataService = new attributeDataServiceInst(
      metaContentTypesService,
      customFieldService,
      attributeTypeService,
      uiService
    )*/

    /*allAttrs = attributeDataService.getForAttributesSelector(
      isPnl ? 'pl-report' : 'balance-report'
    )*/
    allAttrs.value = evAttrsStore.getAllAttributesByContentType(content_type);
    selAttrs.value = [];

    if ( layout.value[reportProp.value][layoutField] ) {

      selAttrs.value = JSON.parse(JSON.stringify( layout.value[reportProp.value][layoutField] ));

    } else {
      layout.value[reportProp.value][layoutField] = [];
    }

    /*payloadForSelector.value = {
      data: {
        title: 'Add columns',
        attributes: allAttrs,
        selectedAttributes: [],
        contentType: isPnl ? 'reports.plreport' : 'reports.balancereport',
      },
      resolve(res) {
        console.log('res:', res)
        layout.value[isPnl ? 'pnl' : 'balance'][layoutField] = res.data.items
        attrsSelectorIsOpen.value = false

        useNotify({ title: 'Changed', type: 'success' })
      },
      reject(res) {
        attrsSelectorIsOpen.value = false
      },
    }*/


  }

  function applySelAttrs(attrs) {
    layout.value[reportProp.value].fieldsToGroup =
      layout.value[reportProp.value].fieldsToGroup.concat(attrs);
  }

  function renameAttrs(layoutField, favAttrs) {

    layout.value[reportProp.value][layoutField] =

      layout.value[reportProp.value][layoutField].map(attr => {

        const favAttr = favAttrs.find(fAttr => fAttr.key === attr.key);

        if (favAttr) attr.layout_name = favAttr.customName;

        return attr;

      });

  }

  function applyAggAttr(attr) {
    if (attr) {
      layout.value[reportProp.value].fieldToAggrigate = [attr];
      useNotify({ title: 'Changed attribute for aggregation' });
    }
  }

  function getAggAttrName(reportProperty) {

    const fta = layout.value[reportProperty].fieldToAggrigate;

    if ( fta && fta[0] ) return fta[0].layout_name || fta[0].name;

    return '';
  }

  function clearAttr(attrKey) {

    const index = layout.value[reportProp.value].fieldsToGroup.findIndex(
      attr => attr.key === attrKey
    );

    layout.value[reportProp.value].fieldsToGroup.splice(index, 1);

  }

  function clearAttrs() {
    layout.value[reportProp.value].fieldToAggrigate = [];
    layout.value[reportProp.value].fieldsToGroup = [];
  }

  let layoutStock

  async function saveLayout() {
    let res = await useApi('mobileLayout.put', {
      params: {
        id: layoutStock.id,
      },
      body: {
        user_code: 'only_one',
        configuration_code: 'local',
        data: layout.value,
      },
    })
    useNotify({ title: 'Mobile layout has been saved.', type: 'success' })
  }

  async function fetchMobileLayout() {
    let res = await useApi('mobileLayout.get')

    layoutStock = res.results[0]
    layout.value = layoutStock?.data

    if (!res.results.length) {
      layout.value = {
        balance: {
          fieldToAggrigate: [],
          fieldsToGroup: [],
        },
        pnl: {
          fieldToAggrigate: [],
          fieldsToGroup: [],
        },
        dashboard: {},
        transactions: {},
        global: {},
      }
      let res = await useApi('mobileLayout.post', {
        body: {
          name: 'Only one',
          user_code: 'only_one',
          configuration_code: 'local',
          data: layout.value,
        },
      })
      layoutStock = res
    }
    console.log('layout.value:', layout.value)
  }

  async function init () {

    let res = await Promise.all([
      fetchMobileLayout(),
      evAttrsStore.getFetchAllAttributeTypes(),
      evAttrsStore.getFetchAllCustomFields(),
      evAttrsStore.getFetchAllUserFields(),
    ]);

  }

  init();

</script>

<style lang="scss" scoped>
  h4 {
    font-weight: 600;
    font-size: 16px;
    margin-bottom: 10px;
  }
</style>
