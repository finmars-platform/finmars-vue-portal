<template>
	<ModalSystemErrorLog v-model="showErrorLog"
						 @cancel="showErrorLog = false"/>

	<div class="sidenav-wrapper">
		<div class="sidenav-left">
			<div class="sidenav-logo-container">
				<div class="sidenav-logo-wrapper">
					<FmLogo />
				</div>
				<div class="panel-resizer-holder sidenav-resizer-holder">
					<button
						class="to-small-btn sidenav-btn raised-btn"
						@click="resizeSideNav(false)"
					>
						<FmIcon icon="chevron_left"></FmIcon>
					</button>

					<button
						class="expand-sidenav-btn sidenav-btn raised-btn"
						@click="resizeSideNav(true)"
					>
						<FmIcon icon="chevron_right"></FmIcon>
					</button>
				</div>
			</div>

			<div class="sidenav-content">
				<div
					class="side-menu-container flex-column"
					v-toggle-settings-menu-directive
				>
					<div class="side-menu-main-buttons">
						<ul class="side-menu" v-if="readyStatus.access">
							<li>
								<!--								<button ui-sref-active="active"
												class="sidemenu-btn"
												ui-sref="app.portal.dashboard">
												<FmIcon icon="dashboard" class="side-nav-icon"></FmIcon>
									<span class="side-nav-title">Dashboard</span>

								</button>-->
								<a
									:href="getUrlToOldApp('/dashboard')"
									class="sidemenu-btn"
								>
									<FmIcon icon="dashboard" class="side-nav-icon"></FmIcon>
									<span class="side-nav-title">Dashboard</span>
								</a>
							</li>

							<li>
								<NuxtLink :to="useGetNuxtLink('/home', $route.params)" class="sidemenu-btn">
									<FmIcon icon="home" class="side-nav-icon"></FmIcon>
									<span class="side-nav-title">Home</span>
								</NuxtLink>
							</li>

							<li>
								<div
									class="sidenav-dropdown-menu-wrapper"
									@mouseenter="showSubmenu($event)"
									@mouseleave="hideSubmenu($event)"
								>
									<button class="sidemenu-btn openSubmenuBtn">
										<FmIcon icon="assessment" class="side-nav-icon"></FmIcon>
										<span class="side-nav-title">Reports</span>
									</button>

									<ul class="sidenav-dropdown-menu display-none submenuElement">
										<li v-if="accessTable.report_balance">
											<a
												:href="getUrlToOldApp('/report/balance')"
												class="sidenav-dropdown-menu-btn"
											>
												<span class="side-nav-title">Balance</span>
											</a>
										</li>
										<li v-if="accessTable.report_pl">
											<a
												:href="getUrlToOldApp('/report/profit-and-lost')"
												class="sidenav-dropdown-menu-btn"
											>
												<span class="side-nav-title">P&L</span>
											</a>
										</li>
										<li v-if="accessTable.report_transaction">
											<a
												:href="getUrlToOldApp('/report/transaction')"
												class="sidenav-dropdown-menu-btn"
											>
												<span class="side-nav-title">Transaction</span>
											</a>
										</li>
										<li v-if="accessTable.report_performance">
											<NuxtLink
												:to="useGetNuxtLink('/reports/performance', $route.params)"
												class="sidenav-dropdown-menu-btn"
											>
												<span class="side-nav-title">Performance</span>
											</NuxtLink>
										</li>
										<li v-if="accessTable.report_cash_flow">
											<!--											<a :href="getUrlToOldApp('/reports/cash-flow-projection')"
												 class="sidenav-dropdown-menu-btn">-->
											<div class="sidenav-dropdown-menu-btn disabled-elem">
												<span class="side-nav-title">Cash flow</span>
											</div>
										</li>
										<li v-if="accessTable.report_event">
											<a
												:href="getUrlToOldApp('/report/check-for-events')"
												class="sidenav-dropdown-menu-btn"
											>
												<span class="side-nav-title">Events</span>
											</a>
										</li>
									</ul>
								</div>
							</li>

							<li>
								<div
									class="sidenav-dropdown-menu-wrapper"
									@mouseenter="showSubmenu($event)"
									@mouseleave="hideSubmenu($event)"
								>
									<button class="sidemenu-btn openSubmenuBtn">
										<FmIcon icon="view_compact" class="side-nav-icon"></FmIcon>
										<span class="side-nav-title">Data</span>
									</button>

									<ul class="sidenav-dropdown-menu submenuElement display-none">
										<li v-if="accessTable.data_portfolio">
											<a
												:href="getUrlToOldApp('/data/portfolio')"
												class="sidenav-dropdown-menu-btn"
											>
												<span class="side-nav-title">Portfolios</span>
											</a>
										</li>
										<li v-if="accessTable.data_portfolio">
											<a
												:href="getUrlToOldApp('/data/portfolio-register')"
												class="sidenav-dropdown-menu-btn"
											>
												<span class="side-nav-title">Registers</span>
											</a>
										</li>
										<li v-if="accessTable.data_account">
											<a
												:href="getUrlToOldApp('/data/account')"
												class="sidenav-dropdown-menu-btn"
											>
												<span class="side-nav-title">Accounts</span>
											</a>
										</li>
										<li v-if="accessTable.data_instrument">
											<a
												:href="getUrlToOldApp('/data/instrument')"
												class="sidenav-dropdown-menu-btn"
											>
												<span class="side-nav-title">Instruments</span>
											</a>
										</li>
										<li v-if="accessTable.data_counterparty">
											<a
												:href="getUrlToOldApp('/data/counterparty')"
												class="sidenav-dropdown-menu-btn"
											>
												<span class="side-nav-title">Counterparties</span>
											</a>
										</li>
										<li v-if="accessTable.data_responsible">
											<a
												:href="getUrlToOldApp('/data/responsible')"
												class="sidenav-dropdown-menu-btn"
											>
												<span class="side-nav-title">Responsibles</span>
											</a>
										</li>
										<li v-if="accessTable.data_currency">
											<a
												:href="getUrlToOldApp('/data/currency')"
												class="sidenav-dropdown-menu-btn"
											>
												<span class="side-nav-title">Currencies</span>
											</a>
										</li>
										<li v-if="accessTable.data_strategies">
											<a
												:href="getUrlToOldApp('/data/strategy/1')"
												class="sidenav-dropdown-menu-btn"
											>
												<span class="side-nav-title">Strategies 1</span>
											</a>
										</li>
										<li v-if="accessTable.data_strategies">
											<a
												:href="getUrlToOldApp('/data/strategy/2')"
												class="sidenav-dropdown-menu-btn"
											>
												<span class="side-nav-title">Strategies 2</span>
											</a>
										</li>
										<li v-if="accessTable.data_strategies">
											<a
												:href="getUrlToOldApp('/data/strategy/3')"
												class="sidenav-dropdown-menu-btn"
											>
												<span class="side-nav-title">Strategies 3</span>
											</a>
										</li>
										<li v-if="accessTable.data_instrument">
											<a
												:href="getUrlToOldApp('data/generated-event')"
												class="sidenav-dropdown-menu-btn"
											>
												<span class="side-nav-title">Events</span>
											</a>
										</li>
										<li>
											<a
												:href="getUrlToOldApp('/explorer')"
												class="sidenav-dropdown-menu-btn"
											>
												<span class="side-nav-title">Explorer</span>
											</a>
										</li>
										<li>
											<a
												:href="getUrlToOldApp('/data-stats')"
												class="sidenav-dropdown-menu-btn"
											>
												<span class="side-nav-title">Stats</span>
											</a>
										</li>
										<li>
											<a
												:href="getUrlToOldApp('/calendar')"
												class="sidenav-dropdown-menu-btn"
											>
												<span class="side-nav-title">Calendar</span>
											</a>
										</li>
										<li>
											<a
												:href="getUrlToOldApp('/task')"
												class="sidenav-dropdown-menu-btn"
											>
												<span class="side-nav-title">Tasks</span>
											</a>
										</li>
										<li>
											<a
												:href="getUrlToOldApp('/worker')"
												class="sidenav-dropdown-menu-btn"
											>
												<span class="side-nav-title">Workers</span>
											</a>
										</li>
										<li>
											<a
												:href="getUrlToOldApp('/workflow')"
												class="sidenav-dropdown-menu-btn"
											>
												<span class="side-nav-title">Workflows</span>
											</a>
										</li>
									</ul>
								</div>
							</li>

							<li v-if="accessSectionTable.history">
								<div
									class="sidenav-dropdown-menu-wrapper"
									@mouseenter="showSubmenu($event)"
									@mouseleave="hideSubmenu($event)"
								>
									<button class="sidemenu-btn openSubmenuBtn">
										<FmIcon icon="history" class="side-nav-icon"></FmIcon>
										<span class="side-nav-title">Transactions</span>
									</button>

									<ul class="sidenav-dropdown-menu submenuElement display-none">
										<li v-if="accessTable.data_transaction">
											<a
												:href="getUrlToOldApp('/data/complex-transaction')"
												class="sidenav-dropdown-menu-btn"
											>
												<span class="side-nav-title">Transactions</span>
											</a>
										</li>
										<li>
											<a
												:href="getUrlToOldApp('/data/transaction')"
												class="sidenav-dropdown-menu-btn"
											>
												<span class="side-nav-title">Base Transactions</span>
											</a>
										</li>
										<li>
											<a
												:href="getUrlToOldApp('/data/portfolio-register-record')"
												class="sidenav-dropdown-menu-btn"
											>
												<span class="side-nav-title">Register Records</span>
											</a>
										</li>
									</ul>
								</div>
							</li>

							<li v-if="accessSectionTable">
								<div
									class="sidenav-dropdown-menu-wrapper"
									@mouseenter="showSubmenu($event)"
									@mouseleave="hideSubmenu($event)"
								>
									<button class="sidemenu-btn openSubmenuBtn">
										<FmIcon
											icon="currency_exchange"
											class="side-nav-icon"
										></FmIcon>
										<span class="side-nav-title">Valuations</span>
									</button>

									<ul class="sidenav-dropdown-menu submenuElement display-none">
										<li v-if="accessTable.data_price_history">
											<a
												:href="getUrlToOldApp('/data/price-history')"
												class="sidenav-dropdown-menu-btn"
											>
												<span class="side-nav-title">Prices</span>
											</a>
										</li>
										<li v-if="accessTable.data_price_history">
											<a
												:href="getUrlToOldApp('/data/pricing-errors')"
												class="sidenav-dropdown-menu-btn"
											>
												<span class="side-nav-title">Prices Journal</span>
											</a>
										</li>
										<li v-if="accessTable.data_fx_history">
											<a
												:href="getUrlToOldApp('/data/currency-history')"
												class="sidenav-dropdown-menu-btn"
											>
												<span class="side-nav-title">FX Rates</span>
											</a>
										</li>
										<li v-if="accessTable.data_fx_history">
											<a
												:href="getUrlToOldApp('/data/currencies-errors')"
												class="sidenav-dropdown-menu-btn"
											>
												<span class="side-nav-title">FX Rates Journal</span>
											</a>
										</li>
										<li>
											<a
												:href="getUrlToOldApp('/run-pricing-procedures')"
												class="sidenav-dropdown-menu-btn"
											>
												<span class="side-nav-title">Run Pricing</span>
											</a>
										</li>
										<li>
											<a
												:href="getUrlToOldApp('/pricing-parent-procedures')"
												class="sidenav-dropdown-menu-btn"
											>
												<span class="side-nav-title">Procedures status</span>
											</a>
										</li>
										<li>
											<a
												:href="getUrlToOldApp('/data/portfolio-history')"
												class="sidenav-dropdown-menu-btn"
											>
												<span class="side-nav-title">Portfolio History</span>
											</a>
										</li>
									</ul>
								</div>
							</li>

							<li v-if="accessSectionTable.import">
								<div
									class="sidenav-dropdown-menu-wrapper"
									@mouseenter="showSubmenu($event)"
									@mouseleave="hideSubmenu($event)"
								>
									<button class="sidemenu-btn openSubmenuBtn">
										<FmIcon icon="file_download" class="side-nav-icon"></FmIcon>
										<span class="side-nav-title">Import</span>
									</button>

									<ul class="sidenav-dropdown-menu submenuElement display-none">
										<li v-if="accessTable.data_simple_import">
											<a
												:href="getUrlToOldApp('/import/simple-entity-import')"
												class="sidenav-dropdown-menu-btn two-line-text"
											>
												<span class="side-nav-title">
													Data<br/>
													(from file)
												</span>
											</a>
										</li>
										<!--										<li v-if="accessTable.data_simple_import">-->
										<!--											<a-->
										<!--												:href="getUrlToOldApp('/import/unified-entity-import')"-->
										<!--												class="sidenav-dropdown-menu-btn two-line-text"-->
										<!--											>-->
										<!--												<span class="side-nav-title">-->
										<!--													Instrument<br/>-->
										<!--													(from file)-->
										<!--												</span>-->
										<!--											</a>-->
										<!--										</li>-->
										<li v-if="accessTable.data_transaction_import">
											<a
												:href="getUrlToOldApp('/import/transaction-import')"
												class="sidenav-dropdown-menu-btn two-line-text"
											>
												<span class="side-nav-title">
													Transactions<br/>
													(from file)
												</span>
											</a>
										</li>
										<li v-if="accessTable.data_complex_import">
											<a
												:href="getUrlToOldApp('/import/complex-import')"
												class="sidenav-dropdown-menu-btn two-line-text"
											>
												<span class="side-nav-title">
													Data and Transactions<br/>
													(from file)
												</span>
											</a>
										</li>
										<li v-if="accessTable.data_instrument_download">
											<a
												:href="getUrlToOldApp('/import/instrument-import')"
												class="sidenav-dropdown-menu-btn two-line-text"
											>
												<span class="side-nav-title">
													Instrument<br/>
													(from provider)
												</span>
											</a>
										</li>
										<li v-if="accessTable.data_instrument_download">
											<a
												:href="getUrlToOldApp('/import/instrument-import-cbonds')"
												class="sidenav-dropdown-menu-btn two-line-text"
											>
												<span class="side-nav-title">
													Instrument<br/>
													(from Finmars Database)
												</span>
											</a>
										</li>
										<!--										<li v-if="accessTable.data_prices_download">-->
										<!--											<a-->
										<!--												:href="getUrlToOldApp('/import/prices-import')"-->
										<!--												class="sidenav-dropdown-menu-btn two-line-text"-->
										<!--											>-->
										<!--												<span class="side-nav-title">-->
										<!--													Prices/FX<br/>-->
										<!--													(from provider)-->
										<!--												</span>-->
										<!--											</a>-->
										<!--										</li>-->
										<li>
											<a
												:href="getUrlToOldApp('/run-data-procedures')"
												class="sidenav-dropdown-menu-btn two-line-text"
											>
												<span class="side-nav-title">Import From Bank</span>
											</a>
										</li>
									</ul>
								</div>
							</li>
							<li v-if="accessSectionTable.reconciliation">
								<div
									class="sidenav-dropdown-menu-wrapper"
									@mouseenter="showSubmenu($event)"
									@mouseleave="hideSubmenu($event)"
								>
									<button class="sidemenu-btn openSubmenuBtn">
										<FmIcon icon="currency_exchange" class="side-nav-icon"></FmIcon>
										<span class="side-nav-title">Reconciliation</span>
									</button>

									<ul class="sidenav-dropdown-menu display-none submenuElement">
										<li>
											<a
												:href="getUrlToOldApp('/data/portfolio-reconcile-group')"
												class="sidenav-dropdown-menu-btn"
											>
												<span class="side-nav-title">Portfolio Reconcile Groups</span>
											</a>
										</li>
										<li>
											<a
												:href="getUrlToOldApp('/data/portfolio-reconcile-history')"
												class="sidenav-dropdown-menu-btn"
											>
												<span class="side-nav-title">Reconciliation History</span>
											</a>
										</li>
									</ul>
								</div>
							</li>
						</ul>
					</div>

					<div class="side-menu-bottom-menu side-menu-main-buttons">
						<ul class="side-menu" v-if="readyStatus.access">
							<li v-if="accessSectionTable.journal">
								<a
									:href="getUrlToOldApp('/journal')"
									class="sidemenu-btn"
								>
									<FmIcon icon="book" class="side-nav-icon"></FmIcon>
									<span class="side-nav-title">Journal</span>
								</a>
							</li>

							<li>
								<button
									class="sidemenu-btn sidenav-settings-toggle-btn toggleSettingsBtn"
								>
									<FmIcon icon="settings" class="side-nav-icon"></FmIcon>
									<span class="side-nav-title">Settings</span>
								</button>
							</li>
						</ul>
					</div>

					<div
						class="side-menu-settings-container side-menu-settings-menu"
						ref="settingsMenu"
					>
						<div class="side-menu-settings-wrapper">
							<div
								class="panel-resizer-holder settings-menu-collapse-btn-holder"
							>
								<button
									class="to-small-btn sidenav-btn raised-btn collapseSettingsMenu"
								>
									<FmIcon icon="chevron_left"></FmIcon>
								</button>
							</div>

							<div class="side-menu-group-btn-container border-top-none">
								<h3 class="sms-btn-group-header">Interface</h3>
								<ul class="side-menu">
									<li>
										<div
											class="sidenav-dropdown-menu-wrapper"
											@mouseenter="showSubmenu($event)"
											@mouseleave="hideSubmenu($event)"
										>
											<button class="sidemenu-btn openSubmenuBtn">
												<span class="side-nav-title">Layouts</span>
											</button>

											<ul
												class="sidenav-dropdown-menu display-none submenuElement"
											>
												<li>
													<a
														:href="getUrlToOldApp('/settings/layout')"
														class="sidenav-dropdown-menu-btn"
													>
														<span class="side-nav-title"
														>Entity Viewer Layouts</span
														>
													</a>
												</li>
												<li>
													<a
														:href="getUrlToOldApp('/dashboard-layout')"
														class="sidenav-dropdown-menu-btn"
													>
														<span class="side-nav-title"
														>Dashboard Layouts</span
														>
													</a>
												</li>
												<li>
													<a
														:href="getUrlToOldApp('/settings/input-form-layout')"
														class="sidenav-dropdown-menu-btn"
													>
														<span class="side-nav-title"
														>Input Form Layouts</span
														>
													</a>
												</li>
												<li>
													<a
														:href="getUrlToOldApp('/context-menu-layout')"
														class="sidenav-dropdown-menu-btn"
													>
														<span class="side-nav-title"
														>Context Menu Layouts</span
														>
													</a>
												</li>

												<li>
													<a
														:href="getUrlToOldApp('/manual-sorting-layout')"
														class="sidenav-dropdown-menu-btn"
													>
														<span class="side-nav-title">Manual Sorting</span>
													</a>
												</li>

												<li>
													<NuxtLink
														:to="useGetNuxtLink('/dashboard/mobile', $route.params)"
														class="sidenav-dropdown-menu-btn"
													>
														<span class="side-nav-title">Mobile</span>
													</NuxtLink>
												</li>
											</ul>
										</div>
									</li>

									<li>
										<a
											:href="getUrlToOldApp('/settings/notification')"
											class="sidemenu-btn"
										>
											<span class="side-nav-title">Notifications</span>
										</a>
									</li>
									<li>
										<a
											:href="getUrlToOldApp('/settings/interface')"
											class="sidemenu-btn"
										>
											<span class="side-nav-title">Interface Complexity</span>
										</a>
									</li>
								</ul>
							</div>

							<div
								class="side-menu-group-btn-container side-menu-settings-border-top-1"
							>
								<h3 class="sms-btn-group-header">Configuration</h3>
								<ul class="side-menu">
									<li v-if="accessSectionTable.settings_data">
										<div
											class="sidenav-dropdown-menu-wrapper"
											@mouseenter="showSubmenu($event)"
											@mouseleave="hideSubmenu($event)"
										>
											<button class="sidemenu-btn openSubmenuBtn">
												<span class="side-nav-title">Data Settings</span>
											</button>

											<ul
												class="sidenav-dropdown-menu display-none submenuElement"
											>
												<li v-if="accessTable.data_portfolio">
													<a
														:href="getUrlToOldApp('/data/portfolio-type')"
														class="sidenav-dropdown-menu-btn"
													>
														<span class="side-nav-title">Portfolio Types</span>
													</a>
												</li>

												<li v-if="accessTable.configuration_account_type">
													<a
														:href="getUrlToOldApp('/data/account-type')"
														class="sidenav-dropdown-menu-btn"
													>
														<span class="side-nav-title">Account Types</span>
													</a>
												</li>
												<li v-if="accessTable.configuration_instrument_type">
													<a
														:href="getUrlToOldApp('/data/instrument-type')"
														class="sidenav-dropdown-menu-btn"
													>
														<span class="side-nav-title">Instrument Types</span>
													</a>
												</li>
												<li v-if="accessTable.configuration_transaction_type">
													<a
														:href="getUrlToOldApp('/data/transaction-type')"
														class="sidenav-dropdown-menu-btn"
													>
														<span class="side-nav-title"
														>Transaction Types</span
														>
													</a>
												</li>
												<li>
													<a
														:href="getUrlToOldApp('/transaction-type-group')"
														class="sidenav-dropdown-menu-btn"
													>
														<span class="side-nav-title"
														>Transaction Type Groups</span
														>
													</a>
												</li>
												<!-- <li v-if="accessTable.configuration_pricing_policy">
														<button class="sidenav-dropdown-menu-btn"
																			 ui-sref="app.portal.data.pricing-policy">
																<span class="side-nav-title">Pricing Policies</span>
																<span class="md-visually-hidden"
																			v-if="isSelected()">current page</span>
														</button>
												</li> -->
												<li v-if="accessTable.configuration_user_attributes">
													<a
														:href="getUrlToOldApp('/settings/user-attribute')"
														class="sidenav-dropdown-menu-btn"
													>
														<span class="side-nav-title">User Attributes</span>
													</a>
												</li>

												<li v-if="accessTable.configuration_reference_table">
													<a
														:href="getUrlToOldApp('/import/reference-table')"
														class="sidenav-dropdown-menu-btn"
													>
														<span class="side-nav-title">Reference Tables</span>
													</a>
												</li>

												<li v-if="accessTable.configuration_mapping_tables">
													<a
														:href="getUrlToOldApp('/import/mapping-tables-import')"
														class="sidenav-dropdown-menu-btn"
													>
														<span class="side-nav-title"> Mapping Tables </span>
													</a>
												</li>

												<li v-if="accessTable.configuration_template">
													<a
														:href="getUrlToOldApp('/template-layout')"
														class="sidenav-dropdown-menu-btn"
													>
														<span class="side-nav-title">Templates</span>
													</a>
												</li>

												<li>
													<a
														:href="getUrlToOldApp('/portfolio-bundle')"
														class="sidenav-dropdown-menu-btn"
													>
														<span class="side-nav-title">Portfolio Bundles</span>
													</a>
												</li>
											</ul>
										</div>
									</li>

									<li>
										<div
											class="sidenav-dropdown-menu-wrapper"
											@mouseenter="showSubmenu($event)"
											@mouseleave="hideSubmenu($event)"
										>
											<button class="sidemenu-btn openSubmenuBtn">
												<span class="side-nav-title">Pricing</span>
											</button>

											<ul
												class="sidenav-dropdown-menu display-none submenuElement"
											>
												<li>
													<a
														:href="getUrlToOldApp('/pricing-schemes')"
														class="sidenav-dropdown-menu-btn"
													>
														<span class="side-nav-title">Schemes</span>
													</a>
												</li>
												<li>
													<a
														:href="getUrlToOldApp('/pricing-policy')"
														class="sidenav-dropdown-menu-btn"
													>
														<span class="side-nav-title">Policies</span>
													</a>
												</li>
												<li>
													<a
														:href="getUrlToOldApp('/pricing-manage')"
														class="sidenav-dropdown-menu-btn"
													>
														<span class="side-nav-title">Manage</span>
													</a>
												</li>
											</ul>
										</div>
									</li>

									<li v-if="accessSectionTable.settings_import_from_providers">
										<div
											class="sidenav-dropdown-menu-wrapper"
											@mouseenter="showSubmenu($event)"
											@mouseleave="hideSubmenu($event)"
										>
											<button class="sidemenu-btn openSubmenuBtn">
												<span class="side-nav-title"
												>Import from Providers</span
												>
											</button>

											<ul
												class="sidenav-dropdown-menu display-none submenuElement"
											>
												<li
													v-if="
														accessTable.configuration_instrument_download_scheme
													"
												>
													<a
														:href="getUrlToOldApp('/settings/instrument-import')"
														class="sidenav-dropdown-menu-btn"
													>
														<span class="side-nav-title"
														>Instrument Schemes</span
														>
													</a>
												</li>
											</ul>
										</div>
									</li>

									<li v-if="accessSectionTable.settings_import_from_files">
										<div
											class="sidenav-dropdown-menu-wrapper"
											@mouseenter="showSubmenu($event)"
											@mouseleave="hideSubmenu($event)"
										>
											<button class="sidemenu-btn openSubmenuBtn">
												<span class="side-nav-title">Import from Files</span>
											</button>

											<ul
												class="sidenav-dropdown-menu display-none submenuElement"
											>
												<li
													v-if="accessTable.configuration_simple_import_scheme"
												>
													<a
														:href="getUrlToOldApp('/settings/data-import')"
														class="sidenav-dropdown-menu-btn"
													>
														<span class="side-nav-title">Data Import</span>
													</a>
												</li>
												<li
													v-if="
														accessTable.configuration_transaction_import_scheme
													"
												>
													<a
														:href="getUrlToOldApp('/settings/transaction-import')"
														class="sidenav-dropdown-menu-btn"
													>
														<span class="side-nav-title"
														>Transactions Import</span
														>
													</a>
												</li>
												<!--												<li-->
												<!--													v-if="accessTable.configuration_complex_import_scheme"-->
												<!--												>-->
												<!--													<a-->
												<!--														:href="getUrlToOldApp('/settings/complex-import')"-->
												<!--														class="sidenav-dropdown-menu-btn"-->
												<!--													>-->
												<!--														<span class="side-nav-title">Complex Import</span>-->
												<!--													</a>-->
												<!--												</li>-->
											</ul>
										</div>
									</li>

									<li>
										<div
											class="sidenav-dropdown-menu-wrapper"
											@mouseenter="showSubmenu($event)"
											@mouseleave="hideSubmenu($event)"
										>
											<button class="sidemenu-btn openSubmenuBtn">
												<span class="side-nav-title"
												>Procedures</span
												>
											</button>

											<ul
												class="sidenav-dropdown-menu display-none submenuElement"
											>
												<li>
													<a
														:href="getUrlToOldApp('/pricing-procedure')"
														class="sidenav-dropdown-menu-btn"
													>
														<span class="side-nav-title"
														>Pricing Procedures</span
														>
													</a>
												</li>
												<li>
													<a
														:href="getUrlToOldApp('/data-procedure')"
														class="sidenav-dropdown-menu-btn"
													>
														<span class="side-nav-title">Data Procedures</span>
													</a>
												</li>
												<li>
													<a
														:href="getUrlToOldApp('/expression-procedure')"
														class="sidenav-dropdown-menu-btn"
													>
														<span class="side-nav-title"
														>Expression Procedures</span
														>
													</a>
												</li>
												<li>
													<a
														:href="getUrlToOldApp('/schedule')"
														class="sidenav-dropdown-menu-btn"
													>
														<span class="side-nav-title">Schedules</span>
													</a>
												</li>
											</ul>
										</div>
									</li>

									<li>
										<!--<button class="sidemenu-btn"
															 ui-sref="app.portal.settings.template-fields">
												<span class="side-nav-title">Aliases</span>
										</button>-->
										<div
											class="sidenav-dropdown-menu-wrapper"
											@mouseenter="showSubmenu($event)"
											@mouseleave="hideSubmenu($event)"
										>
											<button class="sidemenu-btn openSubmenuBtn">
												<span class="side-nav-title">Specifications</span>
											</button>

											<ul
												class="sidenav-dropdown-menu display-none submenuElement"
											>
												<li v-if="accessTable.configuration_aliases">
													<a
														:href="getUrlToOldApp('/settings/aliase')"
														class="sidenav-dropdown-menu-btn"
													>
														<span class="side-nav-title">Aliases</span>
													</a>
												</li>

												<li>
													<a
														:href="getUrlToOldApp('/settings/tooltip')"
														class="sidenav-dropdown-menu-btn"
													>
														<span class="side-nav-title">Tooltips</span>
													</a>
												</li>

												<li>
													<a
														:href="getUrlToOldApp('/settings/palette')"
														class="sidenav-dropdown-menu-btn"
													>
														<span class="side-nav-title">Palettes</span>
													</a>
												</li>

												<li>
													<a
														:href="getUrlToOldApp('/settings/cross-entity-attribute-extension')"
														class="sidenav-dropdown-menu-btn"
													>
														<span class="side-nav-title">Reports</span>
													</a>
												</li>
											</ul>
										</div>
									</li>

									<li>
										<div
											class="sidenav-dropdown-menu-wrapper"
											@mouseenter="showSubmenu($event)"
											@mouseleave="hideSubmenu($event)"
										>
											<button class="sidemenu-btn openSubmenuBtn">
												<span class="side-nav-title">Configuration</span>
											</button>

											<ul
												class="sidenav-dropdown-menu display-none submenuElement"
											>
												<li v-if="accessTable.settings_import_configuration">
													<a
														:href="getUrlToOldApp('/settings/import-configuration')"
														class="sidenav-dropdown-menu-btn"
													>
														<span class="side-nav-title">Import</span>
													</a>
												</li>
												<li v-if="accessTable.settings_export_configuration">
													<a
														:href="getUrlToOldApp('/settings/export-configuration')"
														class="sidenav-dropdown-menu-btn"
													>
														<span class="side-nav-title">Export (Deprecated)</span>
													</a>
												</li>
												<li>
													<a
														:href="getUrlToOldApp('/update-configuration')"
														class="sidenav-dropdown-menu-btn"
													>
														<span class="side-nav-title">Update</span>
													</a>
												</li>
												<li>
													<a
														:href="getUrlToOldApp('/manage-configuration')"
														class="sidenav-dropdown-menu-btn"
													>
														<span class="side-nav-title">Manage</span>
													</a>
												</li>
												<li>
													<NuxtLink
														:to="useGetNuxtLink('/marketplace', $route.params)"
														class="sidenav-dropdown-menu-btn"
													>
														<span class="side-nav-title">Marketplace</span>
													</NuxtLink>
												</li>
											</ul>
										</div>
									</li>
								</ul>
							</div>

							<div
								class="side-menu-group-btn-container side-menu-settings-border-top-1"
								v-if="
									accessSectionTable.settings_administration
								"
							>
								<h3 class="sms-btn-group-header">Administration</h3>
								<ul class="side-menu">
									<li v-if="accessTable.settings_provider">
										<a
											:href="getUrlToOldApp('/settings/data-providers')"
											class="sidemenu-btn"
										>
											<span class="side-nav-title">Data providers</span>
										</a>
									</li>
									<li v-if="accessTable.settings_init_configuration">
										<a
											:href="getUrlToOldApp('/settings/init-configuration')"
											class="sidemenu-btn"
										>
											<span class="side-nav-title">New User Setups</span>
										</a>
									</li>
									<li v-if="accessTable.settings_users_groups_permission">
										<NuxtLink
											:to="useGetNuxtLink('/settings/permissions', $route.params)"
											class="sidemenu-btn"
										>
											<span class="side-nav-title">Permissions</span>
										</NuxtLink>
									</li>
									<li v-if="accessTable.settings_ecosystem_default">
										<NuxtLink
											:to="useGetNuxtLink('/settings/default-settings', $route.params)"
											class="sidemenu-btn"
										>
											<span class="side-nav-title">Default Settings</span>
										</NuxtLink>
									</li>
									<!--									<li>
																			<a
																				:href="getUrlToOldApp('/processes')"
																				class="sidemenu-btn"
																			>
																				<span class="side-nav-title">Active Processes</span>
																			</a>
																		</li>-->
									<li>
										<a
											:href="getUrlToOldApp('/recycle-bin')"
											class="sidemenu-btn"
										>
											<span class="side-nav-title">Recycle Bin</span>
										</a>
									</li>
									<li>
										<a
											:href="getUrlToOldApp('/system-dashboard')"
											class="sidemenu-btn"
										>
											<span class="side-nav-title">System</span>
										</a>
									</li>
									<li>
										<a
											:href="getUrlToOldApp('/vault')"
											class="sidemenu-btn"
										>
											<span class="side-nav-title">Vault</span>
										</a>
									</li>
									<li>
										<NuxtLink
											class="sidemenu-btn"
											:to="useGetNuxtLink('/settings/vault-record', $route.params)"
										>
											Vault Record
										</NuxtLink>
									</li>
									<li>
										<NuxtLink
											class="sidemenu-btn"
											:to="useGetNuxtLink('/system/settings/general/', $route.params)"
										>
											White Label
										</NuxtLink>
									</li>
								</ul>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>

		<div class="build-date">

			<!--			<div class="side-nav-versions-block">-->
			<!--				<div v-for="version of store.current.versions">-->

			<!--					<div>{{ version.app }}:{{ version.version }}</div>-->

			<!--				</div>-->
			<!--			</div>-->

			<!--			<div>-->
			<!--				Session Remaining Time: {{ remainingTimePretty }}-->
			<!--			</div>-->

			<a href="https://finmars.com" target="_blank" class="finmars-site-link">© {{ currentYear }} Finmars
				SCSA</a>

		</div>
	</div>
</template>

<script setup>
// import menu from "~/assets/data/menu.js";

import {useGetNuxtLink} from "~/composables/useMeta";

const store = useStore()
const config = useRuntimeConfig()
const buildDate = config.public.buildDATE
const apiUrl = config.public.apiURL;
const currentYear = new Date().getFullYear();
const remainingTimePretty = ref('');

// console.log('store.current', JSON.stringify(store.current, null, 4))

let readyStatus = reactive({
	// will be used by getInterfaceAccess()
	access: true,
});

let showErrorLog = ref(false);

let interfaceAccess = [];

let accessSectionTable = reactive({
	history: true,
	journal: true,
	import: true,

	settings_data: true,
	settings_import_from_providers: true,
	settings_import_from_files: true,

	reconciliation: true,
	settings_administration: true,
});

let accessTable = reactive({
	data_portfolio: true,
	data_account: true,
	data_instrument: true,
	data_responsible: true,
	data_counterparty: true,
	data_currency: true,
	data_strategies: true,
	data_transaction: true,
	data_price_history: true,
	data_fx_history: true,
	data_simple_import: true,
	data_transaction_import: true,
	data_complex_import: true,
	data_instrument_download: true,
	data_prices_download: true,

	report_balance: true,
	report_pl: true,
	report_transaction: true,
	report_performance: true,
	report_cash_flow: true,
	report_dashboard: true,
	report_event: true,
	report_bookmark: true,
	report_instrument_audit: true,
	report_transaction_audit: true,
	report_base_transaction: true,
	report_activity_log: true,
	report_forum: true,

	configuration_account_type: true,
	configuration_instrument_type: true,
	configuration_transaction_type: true,
	configuration_pricing_policy: true,
	configuration_price_download_scheme: true,
	configuration_instrument_download_scheme: true,
	configuration_automated_price_downloads: true,
	configuration_simple_import_scheme: true,
	configuration_transaction_import_scheme: true,
	configuration_complex_import_scheme: true,
	configuration_mapping_tables: true,
	configuration_user_attributes: true,
	configuration_aliases: true,
	configuration_template: true,
	configuration_reference_table: true,

	settings_notification: true,
	settings_export_configuration: true,
	settings_import_configuration: true,
	settings_export_mapping: true,
	settings_import_mapping: true,
	settings_provider: true,
	settings_init_configuration: true,
	settings_users_groups_permission: true,
	settings_new_objects_permission: true,
	settings_timezone: true,
	settings_ecosystem_default: true,

	account_settings: true,
	account_personal_data: true,
	account_ecosystem_management: true,
});

let sidenavExpanded = true;

let sidenav_width = useState("sidenav_width", () => 160)

function getUrlToOldApp(suffix) {

	let baseApiUrl = '';

	if (Object.keys(store.current).length) {

		if (store.realm_code) {
			baseApiUrl = '/' + store.realm_code + '/' + store.space_code;
		} else {
			baseApiUrl = '/' + store.isUrlValid;
		}
	}

	return `${apiUrl}${baseApiUrl}/a/#!${suffix}`;

}

function resizeSideNav(expand) {
	// sideNavStatus = status;
	sidenavExpanded = expand

	if (sidenavExpanded) {
		document.body.classList.remove("sidenav-collapsed")
		document.body.classList.add("sidenav-expanded")
		sidenav_width.value = 160
	} else {
		document.body.classList.remove("sidenav-expanded")
		document.body.classList.add("sidenav-collapsed")
		sidenav_width.value = 65
	}

	window.dispatchEvent(new Event("resize"))
}

let sideMenuSettingsMenuOpened = false

const vToggleSettingsMenuDirective = {
	mounted: (el) => {
		const settingsMenu = el.querySelector(".side-menu-settings-menu")
		const settingsToggleBtn = el.querySelector(".toggleSettingsBtn")
		const settingsCollapseBtn = el.querySelector(".collapseSettingsMenu")

		function settingsSideMenuOnClickOutside(event) {
			let clickedOutside = true
			let elem = event.target

			for (var i = 0; i < 15; i++) {
				if (elem.classList.contains("side-menu-settings-menu")) {
					clickedOutside = false
					break
				} else if (elem.tagName === "BODY") {
					break
				} else {
					elem = elem.parentNode
				}
			}

			if (clickedOutside) {
				toggleSettingsSideMenu()
			}
		}

		function toggleSettingsSideMenu() {
			if (sideMenuSettingsMenuOpened) {
				/*$('.sidenav-settings-toggle-btn').removeClass('settings-menu-opened');
			$('.side-menu-settings-menu').removeClass('overflow-visible');
			$('.side-menu-settings-menu').removeClass('settings-menu-opened');*/
				settingsToggleBtn.classList.remove("settings-menu-opened")
				settingsMenu.classList.remove(
					"overflow-visible",
					"settings-menu-opened"
				)

				window.removeEventListener("click", settingsSideMenuOnClickOutside)
				window.removeEventListener(
					"contextmenu",
					settingsSideMenuOnClickOutside
				)

			} else {
				/* $('.side-menu-settings-menu').addClass('settings-menu-opened');
				$('.sidenav-settings-toggle-btn').addClass('settings-menu-opened'); */

				settingsMenu.classList.add("settings-menu-opened")
				settingsToggleBtn.classList.add("settings-menu-opened")

				setTimeout(function () {
					// $('.side-menu-settings-menu').addClass('overflow-visible');
					if (sideMenuSettingsMenuOpened) {

						settingsMenu.classList.add("overflow-visible")

						window.addEventListener("click", settingsSideMenuOnClickOutside)
						window.addEventListener(
							"contextmenu",
							settingsSideMenuOnClickOutside
						)

					}

				}, 250)
			}

			sideMenuSettingsMenuOpened = !sideMenuSettingsMenuOpened
		}

		settingsToggleBtn.addEventListener("click", toggleSettingsSideMenu)
		settingsCollapseBtn.addEventListener("click", toggleSettingsSideMenu)
	},
}

/*const vExpandOnHoverDirective = {
mounted: (el) => {
	var dropdownMenuClass = '.' + scope.menuType + '-dropdown-menu-element';
	var menuBtnClass = '.' + scope.menuType + '-sidenav-menu-btn';
	var dropdownMenu = el.find(dropdownMenuClass);
	var menuBtn = el.find(menuBtnClass);

	el.mouseenter(function () {
		$(menuBtn).addClass('active-menu-btn');
		$(dropdownMenu).removeClass('ng-hide');
	});

	el.mouseleave(function () {
		$(menuBtn).removeClass('active-menu-btn');
		$(dropdownMenu).addClass('ng-hide');
	});
}
}*/

function secondsToHms(d) {
	d = Number(d);
	const h = Math.floor(d / 3600);
	const m = Math.floor(d % 3600 / 60);
	const s = Math.floor(d % 3600 % 60);

	const hDisplay = h > 0 ? (h < 10 ? '0' + h : h) + ':' : '00:';
	const mDisplay = m > 0 ? (m < 10 ? '0' + m : m) + ':' : '00:';
	const sDisplay = s > 0 ? (s < 10 ? '0' + s : s) : '00';
	return hDisplay + mDisplay + sDisplay;
}

const getSessionRemainingTime = function () {

	const token = useCookie("refresh_token").value
	const decodedToken = JSON.parse(atob(token.split('.')[1]));
	const currentTime = Math.floor(new Date().getTime() / 1000); // Current time in seconds since epoch
	const remainingTime = decodedToken.exp - currentTime;

	remainingTimePretty.value = secondsToHms(remainingTime);

	// console.log('getSessionRemainingTime', vm.remainingTimePretty);

}
getSessionRemainingTime() // todo do it update every second

const showSubmenu = function ($event) {
	const el = $event.target
	const dropdownMenu = el.querySelector(".submenuElement")
	const menuBtn = el.querySelector(".openSubmenuBtn")

	menuBtn.classList.add("active-menu-btn")
	dropdownMenu.classList.remove("display-none")
}

const hideSubmenu = function ($event) {
	const el = $event.target
	const dropdownMenu = el.querySelector(".submenuElement")
	const menuBtn = el.querySelector(".openSubmenuBtn")

	menuBtn.classList.remove("active-menu-btn")
	dropdownMenu.classList.add("display-none")
}

//# region Permissions for access
const syncInterfaceAccess = function () {

	Object.keys(accessTable).forEach(function (key) {

		accessTable[key] = false;

	});

	interfaceAccess.forEach(function (item) {

		if (item.value <= store.member.interface_level) {
			accessTable[item.user_code] = true;
		}

	});

};

const syncInterfaceSectionsAccess = function () {

	accessSectionTable.history =
		accessTable.data_transaction ||
		accessTable.data_price_history ||
		accessTable.data_fx_history;


	accessSectionTable.journal =
		accessTable.report_instrument_audit ||
		accessTable.report_transaction_audit ||
		accessTable.report_base_transaction;

	accessSectionTable.import =
		accessTable.data_simple_import ||
		accessTable.data_transaction_import ||
		accessTable.data_complex_import ||
		accessTable.data_instrument_download ||
		accessTable.data_prices_download ||
		accessTable.configuration_mapping_tables;

	accessSectionTable.settings_data =
		accessTable.configuration_account_type ||
		accessTable.configuration_instrument_type ||
		accessTable.configuration_transaction_type ||
		accessTable.configuration_pricing_policy ||
		accessTable.configuration_user_attributes ||
		accessTable.configuration_reference_table;

	accessSectionTable.settings_import_from_providers =
		accessTable.configuration_price_download_scheme ||
		accessTable.configuration_instrument_download_scheme ||
		accessTable.configuration_automated_price_downloads;

	accessSectionTable.settings_import_from_files =
		accessTable.configuration_simple_import_scheme ||
		accessTable.configuration_transaction_import_scheme ||
		accessTable.configuration_complex_import_scheme;


	accessSectionTable.settings_administration =
		accessTable.settings_provider ||
		accessTable.settings_init_configuration ||
		accessTable.settings_users_groups_permission ||
		accessTable.settings_ecosystem_default;

};

const applyMemberInterfacePermissions = function () {

	if (!store.member.is_admin && !store.member.is_owner) {

		console.log("Applying Member Interface Permissions");

		store.member.groups_object.forEach(function (group) {

			console.log(' group.permission_table', group.permission_table);

			if (group.permission_table) {

				if (group.permission_table.function) {

					group.permission_table.function.forEach(function (item) {

						console.log('function item', item);

						if (item.content_type === 'function.import_data') {

							if (accessTable.data_simple_import) { // because possibly we dont have access to this menu via interface complexity level
								accessTable.data_simple_import = item.data.creator_view
							}
						}

						if (item.content_type === 'function.import_transactions') {
							if (accessTable.data_transaction_import) {
								accessTable.data_transaction_import = item.data.creator_view
							}
						}

						if (item.content_type === 'function.import_complex') {
							if (accessTable.data_complex_import) {
								accessTable.data_complex_import = item.data.creator_view
							}
						}

						if (item.content_type === 'function.provider_download_instrument') {
							if (accessTable.data_instrument_download) {
								accessTable.data_instrument_download = item.data.creator_view
							}
						}

						if (item.content_type === 'function.provider_download_price') {
							if (accessTable.data_prices_download) {
								accessTable.data_prices_download = item.data.creator_view
							}
						}


					})

				}


				if (group.permission_table.configuration) {

					group.permission_table.configuration.forEach(function (item) {

						if (item.content_type === 'obj_attrs.attributetype') {

							if (accessTable.configuration_user_attributes) { // because possibly we dont have access to this menu via interface complexity level
								accessTable.configuration_user_attributes = item.data.creator_view
							}
						}

						if (item.content_type === 'reference_tables.referencetable') {

							if (accessTable.configuration_reference_table) {
								accessTable.configuration_reference_table = item.data.creator_view
							}
						}

						if (item.content_type === 'ui.templatelayout') {

							if (accessTable.configuration_template) {
								accessTable.configuration_template = item.data.creator_view
							}

						}

						if (item.content_type === 'integrations.mappingtable') {

							if (accessTable.configuration_mapping_tables) {
								accessTable.configuration_mapping_tables = item.data.creator_view
							}
						}

						if (item.content_type === 'integrations.pricedownloadscheme') {

							if (accessTable.configuration_price_download_scheme) {
								accessTable.configuration_price_download_scheme = item.data.creator_view
							}
						}

						if (item.content_type === 'integrations.instrumentdownloadscheme') {

							if (accessTable.configuration_instrument_download_scheme) {
								accessTable.configuration_instrument_download_scheme = item.data.creator_view
							}
						}

						if (item.content_type === 'csv_import.csvimportscheme') {

							if (accessTable.configuration_simple_import_scheme) {
								accessTable.configuration_simple_import_scheme = item.data.creator_view
							}
						}

						if (item.content_type === 'integrations.complextransactionimportscheme') {

							if (accessTable.configuration_transaction_import_scheme) {
								accessTable.configuration_transaction_import_scheme = item.data.creator_view
							}
						}

						if (item.content_type === 'complex_import.compleximportscheme') {

							if (accessTable.configuration_complex_import_scheme) {
								accessTable.configuration_complex_import_scheme = item.data.creator_view
							}
						}

						if (item.content_type === 'ui.userfield') {

							if (accessTable.configuration_aliases) {
								accessTable.configuration_aliases = item.data.creator_view
							}
						}


					})

				}

			}

		});

	}

};

const getInterfaceAccess = function () {

	// uiService.getPortalInterfaceAccess().then(function (data) {
	useApi('interfaceAccess.get').then(function (data) {

		// console.log('vm.getInterfaceAccess', data);
		interfaceAccess = data;

		syncInterfaceAccess();
		applyMemberInterfacePermissions();
		syncInterfaceSectionsAccess();

		readyStatus.access = true;

	})

};
//# endregion

const getWsStatus = function () {

	if (store.ws && store.ws.readyState === WebSocket.OPEN) {
		return 'open';
	}

	return 'closed';

};

const copyToBuffer = function (content) {

	const listener = function (e) {

		e.clipboardData.setData('text/plain', content);

		e.preventDefault();

	}

	document.addEventListener("copy", listener, {once: true})

	document.execCommand("copy")

	useNotify({type: "success", title: "Copied"})
}

// function toggleSettingsSideMenu() {
//
// 	if (!sideMenuSettingsMenuOpened) {
//
// 		/* $('.side-menu-settings-menu').addClass('settings-menu-opened');
// 		$('.sidenav-settings-toggle-btn').addClass('settings-menu-opened'); */
// 		settingsMenu.addClass('settings-menu-opened');
// 		settingsToggleBtn.addClass('settings-menu-opened');
//
// 		setTimeout(function () {
// 			// $('.side-menu-settings-menu').addClass('overflow-visible');
// 			settingsMenu.addClass('overflow-visible');
//
// 			window.addEventListener('click', settingsSideMenuOnClickOutside);
// 			window.addEventListener('contextmenu', settingsSideMenuOnClickOutside);
// 		}, 250);
//
// 	} else {
//
// 		/*$('.sidenav-settings-toggle-btn').removeClass('settings-menu-opened');
// 		$('.side-menu-settings-menu').removeClass('overflow-visible');
// 		$('.side-menu-settings-menu').removeClass('settings-menu-opened');*/
// 		settingsToggleBtn.removeClass('settings-menu-opened');
// 		settingsMenu.removeClass('overflow-visible', 'settings-menu-opened');
//
// 		window.removeEventListener('click', vm.settingsSideMenuOnClickOutside);
// 		window.removeEventListener('contextmenu', vm.settingsSideMenuOnClickOutside);
//
// 	}
//
// 	sideMenuSettingsMenuOpened = !sideMenuSettingsMenuOpened;
// }

const init = function () {
	getInterfaceAccess();
};

init();
</script>

<style lang="scss" scoped>
/*.sidebar {
width: 160px;
background: #000;

}
.logo {
padding: 10px;
}
.menu_item {
color: #fff;
border-radius: 0;
text-transform: uppercase;

&.router-link-exact-active {
	color: $primary;
}
}
.drop_menu_wrap:hover {
background: #9e9e9e33;
cursor: pointer;
.drop_menu {
	opacity: 1;
	visibility: visible;
}
}
.v-list-item-title {
text-transform: uppercase;
}
.menu {
overflow: inherit;
text-transform: uppercase;
}
.submenu {
position: fixed;
top: 55px;
left: 160px;
width: 160px;
height: calc(100vh - 55px);
background: #000;
border-left: 1px solid $border;

&_list {
	background: #000;
	color: #fff;
	overflow: inherit;
}
}
.drop_menu {
position: absolute;
left: 160px;
top: 0;
background: #000;
width: 160px;
color: #fff;
opacity: 0;
visibility: hidden;
transition: 0.3s;

&.active {
	opacity: 1;
	visibility: visible;
}
}*/
.side-menu-container {
	display: block;
	position: absolute;
	overflow: visible;
	height: 100%;
	width: 100%;
	border-right: 1px solid var(--table-border-color);

	button[disabled] {
		color: #fff;
		opacity: 0.5;
	}
}

.sidenav-left {
	display: flex;
	flex-direction: column;
	width: 100%;
	height: 100%;
	// fill: #737373;
	overflow: visible;

	font-family: "Roboto-Regular", "Roboto", sans-serif;
	font-weight: 400;
	font-style: normal;
	font-size: 12px;

	z-index: 60;

	a {
		color: var(--secondary-color);
	}

	color: var(--secondary-color);

	button {
		color: var(--secondary-color);
	}

	ng-md-icon {
		position: relative;
		top: 5px; // adjust for svg viewbox
		fill: var(--secondary-color);
	}
}

// <md-toolbar> in angularjs interface
.sidenav-logo-container {
	display: flex;
	flex-direction: row;
	flex: 0 0 52px;
	align-items: center;
	min-height: 52px;
	height: 52px;
	background-color: var(--base-backgroundColor);
	border-right: 1px solid var(--table-border-color);
}

/*.md-toolbar-tools {
//background-color: #3b283b;
min-height: 52px;
height: 52px;
background-color: #000;
padding: 0;
}*/

.sidenav-content {
	flex: 0 1 100%;
	position: relative;
	// height: 100%;
	//background-color: #3b283b;
	//background-color: #000;
	background-color: var(--base-backgroundColor);
	overflow: visible;
}

.sidenav-logo-wrapper {
	position: absolute;
	left: 10px;
	width: 140px;
	height: 40px;
	overflow: hidden;
}

.sidenav-dropdown-menu-wrapper {
	position: relative;
}

@mixin option-hover {
	background-color: var(--activeState-backgroundColor);
}

.sidenav-dropdown-menu {
	width: 200px;
	position: absolute;
	//background-color: #5a3e5a;
	background-color: var(--base-backgroundColor);
	top: 0;
	right: -200px;
	padding-left: 0;
	border: 1px solid var(--table-border-color);
	z-index: 1;

	.sidenav-dropdown-menu-btn {
		width: 100%;
		/*height: 35px;
		min-height: 30px;*/
		min-height: 24px;
		display: block;
		text-align: left;
		padding-left: 1em;
		margin-left: 0;
		margin-bottom: 6px;
		font-size: 12px;
		line-height: 2;
		/*padding-top: 12px;
		padding-bottom: 10px;*/
		padding-top: 3px;
		padding-bottom: 3px;
		text-transform: capitalize;

		&:not([disabled]):hover {
			@include option-hover;
			border-radius: 100px;
		}

		&.active {
			color: #f05a22;
			fill: #f05a22;
		}

		/*&.active-menu-btn {
		//background-color: #5a3e5a;

		&:hover {
			//background-color: #5a3e5a;
		}
	}*/
	}

	&:not(.open-upward) li:first-child .sidenav-dropdown-menu-btn {
		margin-top: 0;
	}

	.sidenav-dropdown-menu-btn.two-line-text {
		padding-top: 8px;
		padding-bottom: 0;
		line-height: 1.5;
	}
}

.sidenav-dropdown-menu.open-upward {
	top: initial;
	bottom: 0;

	li:last-child .sidenav-dropdown-menu-btn {
		margin-bottom: 0;
	}
}

.sidenav-wrapper {
	position: relative;
	min-width: $leftSidenavWidth;
	height: 100vh;
	top: 0;
	left: 0;
	z-index: 61;
	transition: min-width ease 0.25s;

	span.side-nav-title {
		position: relative;
		// top: -4px;
	}

	.side-nav-icon {
		//color: $separ;
		color: var(--secondary-color);
		display: inline-block;
		position: absolute;
		left: 17px;
		// left: 17px;
		//bottom: 3px;
		// bottom: 0;
	}
}

.side-menu {
	width: 100%;
	padding-left: 0;
	margin: 12px 0;
}

.sidemenu-btn {
	position: relative;
	width: 100%;
	height: 36px;
	display: flex;
	align-items: center;

	text-align: left;
	line-height: 2;
	text-transform: capitalize;

	//padding-top: 11px;
	//padding-bottom: 2px;
	/*padding-top: 0;
	padding-bottom: 0;*/
	padding-left: 55px;
	margin-left: 0;

	.side-nav-icon div.icon {
		position: relative;
		top: 0;
		left: -6px;
	}

	&:not(.f-s-10) {
		font-size: 12px;
	}

	.icon {
		font-size: 20px;
	}

	&:not([disabled]):hover {
		@include option-hover;
		border-radius: 100px;
	}

	&.active {
		color: #f05a22;
		fill: #f05a22;
	}

	/*&.active-menu-btn {
	//background-color: #5a3e5a;

	&:not([disabled]):hover {
		//background-color: #5a3e5a;
	}
}*/

	.dropdown-icon {
		float: right;
		fill: #fff;
	}
}

.side-menu-bottom-menu {
	position: absolute;
	//bottom: 75px;
	bottom: 20px;
	width: 100%;
}

.build-date {
	.highlight {
		color: #fff;
	}

	.link:hover {
		opacity: .7;
	}

	.ws-status {
		width: 6px;
		height: 6px;
		border-radius: 50%;
		float: right;
		margin-left: 3px;
		margin-top: 2px;

		&.open {
			background: green;
		}

		&.closed {
			background: red;
		}
	}
}

@media screen and (max-height: 620px) {
	.side-menu-bottom-menu {
		position: relative;
		bottom: initial;
	}

	.build-date {
		display: none;
	}
}

.sidenav-btn {
	position: relative;
	display: block;
	width: 24px;
	height: 24px;
	background: var(--base-backgroundColor);
	border-radius: 50%;
	fill: var(--secondary-color);
	left: 12px;
	min-height: 24px;
	min-width: 24px;

	&.expand-sidenav-btn ng-md-icon {
		left: -5px;
	}
}

.side-menu-settings-container {
	width: 0px;
	height: 100%;
	overflow: visible;
	position: absolute;
	top: 0;
	left: $leftSidenavWidth;
	z-index: 0;
	//background-color: #3b283b;
	background-color: var(--base-backgroundColor);
	color: var(--secondary-color);
	overflow: hidden;
	transition: width ease 0.25s, left ease 0.25s;

	.side-menu-settings-wrapper {
		position: relative;
		width: 200px;
		height: 100%;
		border-left: 0;
		box-sizing: border-box;
	}

	.settings-menu-collapse-btn-holder {
		position: absolute;
		right: 3px;
		top: 9px;
	}

	.side-menu-group-btn-container {
		width: 100%;
		box-sizing: border-box;

		.sms-btn-group-header {
			margin-left: 20px;
			margin-top: 15px;
			font-weight: 600;
			line-height: normal;
		}

		.sidemenu-btn {
			height: 36px;
			padding-left: 45px;
		}
	}

	.side-menu-settings-border-top-1 {
		border-top: 1px solid var(--table-border-color);
	}
}

.panel-resizer-holder {
	position: absolute;

	div.icon {
		color: $gray;
	}
}

.sidenav-resizer-holder {
	right: 0;

	.expand-sidenav-btn {
		display: none;
	}
}

.sidenav-collapsed {
	.space-for-sidenav {
		padding-left: $collapsedLeftSidenavWidth;
	}

	.g-table-dial {
		left: 80px;
	}

	.sidenav-logo-wrapper {
		width: 40px;
	}

	.sidenav-wrapper {
		width: $collapsedLeftSidenavWidth;
	}

	.sidenav-resizer-holder {
		// position: absolute;
		// right: -12px;
		.to-small-btn {
			display: none;
		}

		.expand-sidenav-btn {
			display: block;
		}
	}

	.side-menu-settings-container {
		left: $collapsedLeftSidenavWidth;
	}

	.md-button.md-raised.expand-sidenav-btn {
		width: 25px;
		min-height: 20px;
		height: 25px;
		margin: 0;
		left: initial;

		ng-md-icon {
			top: initial;
			right: 4px;
		}
	}

	.sidenav-wrapper {
		min-width: $collapsedLeftSidenavWidth;
		z-index: 11000;
	}

	.sidemenu-btn {
		min-width: 50px;
	}

	.side-menu-main-buttons .sidemenu-btn .side-nav-title {
		display: none;
	}

	.portal-header md-toolbar.header {
		padding-left: $collapsedLeftSidenavWidth;
	}

	.build-date {
		display: none;
	}
}

.separate-side-menu {
	margin-top: 20px;
}

.sidenav-settings-toggle-btn.settings-menu-opened,
.sidenav-settings-toggle-btn.settings-menu-opened.md-button:not([disabled]).md-focused {
	background-color: var(--activeState-backgroundColor);
}

.side-menu-settings-menu.settings-menu-opened {
	border-right: 1px solid var(--table-border-color);
	width: 200px;
}

.build-date {
	position: absolute;
	bottom: 0px;
	color: $gray;
	z-index: 100;
	font-size: 9px;
	text-align: left;
	margin: 6px;
}

.sidenav-error-subtitle {
	margin-top: 4px;
	margin-bottom: 4px;

	cursor: pointer;

	&:hover {
		opacity: 0.7;
	}
}

.sidenav-tech-button {
	cursor: pointer;

	&:hover {
		opacity: 0.7;
	}
}

.side-nav-versions-block {
	margin-bottom: 10px;
	font-size: 8.8px;
}

.sidenav-api-link, .finmars-site-link {
	color: #fff;
	margin-top: 2px;
	display: block;
	color: rgba(255, 255, 255, .6);
	padding-left: 24px;

	&:visited {
		color: rgba(255, 255, 255, .6);
	}

	&:active {
		color: rgba(255, 255, 255, .6);
	}

	&:hover {
		color: rgba(255, 255, 255, 1);
	}
}


</style>
