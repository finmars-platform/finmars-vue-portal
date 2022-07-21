<template>
	<div class="sidenav-wrapper">
		<div class="sidenav-left">
			<div class="sidenav-logo-container">
				<div class="sidenav-logo-wrapper">
					<NuxtLink to="/">
						<img src="/v/img/logo.png" class="sidenav-logo" alt=""/>
					</NuxtLink>
				</div>
				<div class="panel-resizer-holder sidenav-resizer-holder">
					<button class="to-small-btn sidenav-btn raised-btn"
									@click="resizeSideNav(false)">
						<icon icon="chevron_left"></icon>
					</button>

					<button class="expand-sidenav-btn sidenav-btn raised-btn"
									@click="resizeSideNav(true)">
						<icon icon="chevron_right"></icon>
					</button>
				</div>
			</div>

			<div class="sidenav-content">
				<div class="side-menu-container flex-column" v-toggle-settings-menu-directive>

					<div class="side-menu-main-buttons">
						<ul class="side-menu" v-if="readyStatus.access">

							<li>
<!--								<button ui-sref-active="active"
												class="sidemenu-btn"
												ui-sref="app.portal.dashboard">
												<icon icon="dashboard" class="side-nav-icon"></icon>
									<span class="side-nav-title">Dashboard</span>

								</button>-->
								<a :href="`${config.public.apiURL}/a/#!/dashboard`"
													class="sidemenu-btn">
									<icon icon="dashboard" class="side-nav-icon"></icon>
									<span class="side-nav-title">Dashboard</span>
								</a>
							</li>

							<li>
								<a :href="`${config.public.apiURL}/a/#!/`"
									 class="sidemenu-btn">
									<icon icon="home" class="side-nav-icon"></icon>
									<span class="side-nav-title">Homepage</span>
								</a>
							</li>

							<li>
								<div class="sidenav-dropdown-menu-wrapper"
										 @mouseenter="showSubmenu($event)"
										 @mouseleave="hideSubmenu($event)">

									<button class="sidemenu-btn openSubmenuBtn">
										<icon icon="assessment" class="side-nav-icon"></icon>
										<span class="side-nav-title">Reports</span>
									</button>

									<ul class="sidenav-dropdown-menu display-none submenuElement">
										<li v-if="accessTable.report_balance">
											<a :href="`${config.public.apiURL}/a/#!/reports/balance`"
												 class="sidenav-dropdown-menu-btn">
												<span class="side-nav-title">Balance</span>

											</a>
										</li>
										<li v-if="accessTable.report_pl">
											<a :href="`${config.public.apiURL}/a/#!/reports/profit-and-lost`"
												 class="sidenav-dropdown-menu-btn">
												<span class="side-nav-title">P&L</span>

											</a>
										</li>
										<li v-if="accessTable.report_transaction">
											<a :href="`${config.public.apiURL}/a/#!/reports/transaction`"
												 class="sidenav-dropdown-menu-btn">
												<span class="side-nav-title">Transaction</span>
											</a>
										</li>
										<li v-if="accessTable.report_performance">
											<NuxtLink to="reports/performance"
																class="sidenav-dropdown-menu-btn">
												<span class="side-nav-title">Performance</span>
											</NuxtLink>
										</li>
										<li v-if="accessTable.report_cash_flow">
<!--											<a :href="`${config.public.apiURL}/a/#!/reports/cash-flow-projection`"
												 class="sidenav-dropdown-menu-btn">-->
											<div class="sidenav-dropdown-menu-btn disabled-elem">
												<span class="side-nav-title">Cash flow</span>
											</div>
										</li>
										<li v-if="accessTable.report_event">
											<a :href="`${config.public.apiURL}/a/#!/reports/check-for-events`"
												 class="sidenav-dropdown-menu-btn">
												<span class="side-nav-title">Events</span>
											</a>
										</li>
									</ul>

								</div>
							</li>

							<li>
								<div class="sidenav-dropdown-menu-wrapper"
										 @mouseenter="showSubmenu($event)"
										 @mouseleave="hideSubmenu($event)">

									<button class="sidemenu-btn openSubmenuBtn">
										<icon icon="view_compact" class="side-nav-icon"></icon>
										<span class="side-nav-title">Data</span>

									</button>

									<ul class="sidenav-dropdown-menu submenuElement display-none">
										<li v-if="accessTable.data_portfolio">
											<a :href="`${config.public.apiURL}/a/#!/data/portfolios`"
												 class="sidenav-dropdown-menu-btn">
												<span class="side-nav-title">Portfolios</span>
											</a>
										</li>
										<li v-if="accessTable.data_portfolio">
											<a :href="`${config.public.apiURL}/a/#!/data/portfolio-registers`"
												 class="sidenav-dropdown-menu-btn">
												<span class="side-nav-title">Registers</span>

											</a>
										</li>
										<li v-if="accessTable.data_account">
											<a :href="`${config.public.apiURL}/a/#!/data/accounts`"
												 class="sidenav-dropdown-menu-btn">
												<span class="side-nav-title">Accounts</span>

											</a>
										</li>
										<li v-if="accessTable.data_instrument">
											<a :href="`${config.public.apiURL}/a/#!/data/instruments`"
												 class="sidenav-dropdown-menu-btn">
												<span class="side-nav-title">Instruments</span>

											</a>
										</li>
										<li v-if="accessTable.data_counterparty">
											<a :href="`${config.public.apiURL}/a/#!/data/counterparties`"
												 class="sidenav-dropdown-menu-btn">
												<span class="side-nav-title">Counterparties</span>

											</a>
										</li>
										<li v-if="accessTable.data_responsible">
											<a :href="`${config.public.apiURL}/a/#!/data/responsibles`"
												 class="sidenav-dropdown-menu-btn">
												<span class="side-nav-title">Responsibles</span>

											</a>
										</li>
										<li v-if="accessTable.data_currency">
											<a :href="`${config.public.apiURL}/a/#!/data/currency`"
												 class="sidenav-dropdown-menu-btn">
												<span class="side-nav-title">Currencies</span>

											</a>
										</li>
										<li v-if="accessTable.data_strategies">
											<a :href="`${config.public.apiURL}/a/#!/data/strategy/1`"
												 class="sidenav-dropdown-menu-btn">
												<span class="side-nav-title">Strategies 1</span>

											</a>
										</li>
										<li v-if="accessTable.data_strategies">
											<a :href="`${config.public.apiURL}/a/#!/data/strategy/2`"
												 class="sidenav-dropdown-menu-btn">
												<span class="side-nav-title">Strategies 2</span>

											</a>
										</li>
										<li v-if="accessTable.data_strategies">
											<a :href="`${config.public.apiURL}/a/#!/data/strategy/3`"
												 class="sidenav-dropdown-menu-btn">
												<span class="side-nav-title">Strategies 3</span>

											</a>
										</li>
										<li v-if="accessTable.data_instrument">
											<button ui-sref-active="active"
															class="sidenav-dropdown-menu-btn"
															ui-sref="app.portal.data.generated-event">
												<span class="side-nav-title">Events</span>

											</button>
										</li>
									</ul>
								</div>
							</li>

							<li v-if="accessSectionTable.history">
								<div class="sidenav-dropdown-menu-wrapper"
										 @mouseenter="showSubmenu($event)"
										 @mouseleave="hideSubmenu($event)">

									<button class="sidemenu-btn openSubmenuBtn">
										<icon icon="history" class="side-nav-icon"></icon>
										<span class="side-nav-title">Transactions</span>

									</button>

									<ul class="sidenav-dropdown-menu submenuElement display-none">
										<li v-if="accessTable.data_transaction">
											<a :href="`${config.public.apiURL}/a/#!/data/complex-transactions`"
												 class="sidenav-dropdown-menu-btn">
												<span class="side-nav-title">Transactions</span>

											</a>
										</li>
										<li>
											<a :href="`${config.public.apiURL}/a/#!/data/transactions`"
												 class="sidenav-dropdown-menu-btn">
												<span class="side-nav-title">Base Transactions</span>

											</a>
										</li>
										<li>
											<a :href="`${config.public.apiURL}/a/#!/data/portfolio-register-records`"
												 class="sidenav-dropdown-menu-btn">
												<span class="side-nav-title">Register Records</span>

											</a>
										</li>
									</ul>
								</div>
							</li>

							<li v-if="accessSectionTable">
								<div class="sidenav-dropdown-menu-wrapper"
										 @mouseenter="showSubmenu($event)"
										 @mouseleave="hideSubmenu($event)">

									<button class="sidemenu-btn openSubmenuBtn">
										<icon icon="currency_exchange" class="side-nav-icon"></icon>
										<span class="side-nav-title">Valuations</span>
									</button>

									<ul class="sidenav-dropdown-menu submenuElement display-none">
										<li v-if="accessTable.data_price_history">
											<a :href="`${config.public.apiURL}/a/#!/data/pricing`"
												 class="sidenav-dropdown-menu-btn">
												<span class="side-nav-title">Prices</span>

											</a>
										</li>
										<li v-if="accessTable.data_price_history">
											<a :href="`${config.public.apiURL}/a/#!/data/pricing-errors`"
												 class="sidenav-dropdown-menu-btn">
												<span class="side-nav-title">Prices Journal</span>

											</a>
										</li>
										<li v-if="accessTable.data_fx_history">
											<a :href="`${config.public.apiURL}/a/#!/data/currencies`"
												 class="sidenav-dropdown-menu-btn">
												<span class="side-nav-title">FX Rates</span>

											</a>
										</li>
										<li v-if="accessTable.data_fx_history">
											<a :href="`${config.public.apiURL}/a/#!/data/currencies-errors`"
												 class="sidenav-dropdown-menu-btn">
												<span class="side-nav-title">FX Rates Journal</span>

											</a>
										</li>
										<li>
											<a :href="`${config.public.apiURL}/a/#!/run-pricing-procedures`"
												 class="sidenav-dropdown-menu-btn">
												<span class="side-nav-title">Run Pricing</span>

											</a>
										</li>
										<li>
											<a :href="`${config.public.apiURL}/a/#!/pricing-parent-procedures`"
												 class="sidenav-dropdown-menu-btn">
												<span class="side-nav-title">Procedures status</span>

											</a>
										</li>
									</ul>
								</div>
							</li>

							<li v-if="accessSectionTable.import">
								<div class="sidenav-dropdown-menu-wrapper"
										 @mouseenter="showSubmenu($event)"
										 @mouseleave="hideSubmenu($event)">

									<button class="sidemenu-btn openSubmenuBtn">
										<icon icon="file_download" class="side-nav-icon"></icon>
										<span class="side-nav-title">Import</span>

									</button>

									<ul class="sidenav-dropdown-menu submenuElement display-none">
										<li v-if="accessTable.data_simple_import">
											<a :href="`${config.public.apiURL}/a/#!/import/simple-entity-import`"
												 class="sidenav-dropdown-menu-btn two-line-text">
												<span class="side-nav-title">
														Data<br>
														(from file)
												</span>

											</a>
										</li>
										<li v-if="accessTable.data_simple_import">
											<a :href="`${config.public.apiURL}/a/#!/import/unified-entity-import`"
												 class="sidenav-dropdown-menu-btn two-line-text">
                                        <span class="side-nav-title">
                                            Instrument<br>
                                            (from file)
                                        </span>

											</a>
										</li>
										<li v-if="accessTable.data_transaction_import">
											<a :href="`${config.public.apiURL}/a/#!/import/transaction-import`"
												 class="sidenav-dropdown-menu-btn two-line-text">
                                        <span class="side-nav-title">
                                            Transactions<br>
                                            (from file)
                                        </span>

											</a>
										</li>
										<li v-if="accessTable.data_complex_import">
											<a :href="`${config.public.apiURL}/a/#!/import/complex-import`"
												 class="sidenav-dropdown-menu-btn two-line-text">
                                        <span class="side-nav-title">
                                            Data and Transactions<br>
                                            (from file)
                                        </span>

											</a>
										</li>
										<li v-if="accessTable.data_instrument_download">
											<a :href="`${config.public.apiURL}/a/#!/import/instrument-import`"
												 class="sidenav-dropdown-menu-btn two-line-text">
                                        <span class="side-nav-title">
                                            Instrument<br>
                                            (from provider)
                                        </span>

											</a>
										</li>
										<li v-if="accessTable.data_instrument_download">
											<a :href="`${config.public.apiURL}/a/#!/import/instrument-import-cbonds`"
												 class="sidenav-dropdown-menu-btn two-line-text">
                                        <span class="side-nav-title">
                                            Instrument<br>
                                            (from Finmars Database)
                                        </span>

											</a>
										</li>
										<li v-if="accessTable.data_prices_download">
											<a :href="`${config.public.apiURL}/a/#!/import/prices-import`"
												 class="sidenav-dropdown-menu-btn two-line-text">
                                        <span class="side-nav-title">
                                            Prices/FX<br>
                                            (from provider)
                                        </span>

											</a>
										</li>
										<li>
											<a :href="`${config.public.apiURL}/a/#!/run-data-procedures`"
												 class="sidenav-dropdown-menu-btn two-line-text">
												<span class="side-nav-title">Import From Bank</span>

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
								<div class="sidenav-dropdown-menu-wrapper"
										 @mouseenter="showSubmenu($event)"
										 @mouseleave="hideSubmenu($event)">

									<button class="sidemenu-btn journal-sidenav-menu-btn openSubmenuBtn">
										<icon icon="book" class="side-nav-icon"></icon>
										<span class="side-nav-title">Journal</span>

									</button>

									<ul class="sidenav-dropdown-menu open-upward journal-dropdown-menu-element display-none submenuElement">
										<li v-if="accessTable.report_instrument_audit">
											<a :href="`${config.public.apiURL}/a/#!/data/audit/instruments`"
												 class="sidenav-dropdown-menu-btn">
												<span class="side-nav-title">Instruments Audit</span>

											</a>
										</li>
										<li v-if="accessTable.report_transaction_audit">
											<a :href="`${config.public.apiURL}/a/#!/data/audit/transactions`"
												 class="sidenav-dropdown-menu-btn">
												<span class="side-nav-title">Transactions Audit</span>

											</a>
										</li>
										<li v-if="accessTable.report_activity_log">
											<div class="sidenav-dropdown-menu-btn disabled-elem">
												<span class="side-nav-title">Activity Log</span>

											</div>
										</li>
										<li v-if="accessTable.report_activity_log">
											<a :href="`${config.public.apiURL}/a/#!/system/file-reports`"
												 class="sidenav-dropdown-menu-btn">
												<span class="side-nav-title">System Files</span>
											</a>
										</li>
									</ul>

								</div>
							</li>

							<li>
								<button class="sidemenu-btn sidenav-settings-toggle-btn toggleSettingsBtn">
									<icon icon="settings" class="side-nav-icon"></icon>
									<span class="side-nav-title">Settings</span>
								</button>
							</li>

						</ul>
					</div>

					<div class="side-menu-settings-container side-menu-settings-menu" ref="settingsMenu">
						<div class="side-menu-settings-wrapper">
							<div class="panel-resizer-holder settings-menu-collapse-btn-holder">
								<button class="to-small-btn sidenav-btn raised-btn collapseSettingsMenu">
									<icon icon="chevron_left"></icon>
								</button>
							</div>

							<div class="side-menu-group-btn-container border-top-none">
								<h3 class="sms-btn-group-header">Interface</h3>
								<ul class="side-menu">
									<li>

										<div class="sidenav-dropdown-menu-wrapper"
												 @mouseenter="showSubmenu($event)"
												 @mouseleave="hideSubmenu($event)">
											<button class="sidemenu-btn openSubmenuBtn">
												<span class="side-nav-title">Layouts</span>

											</button>

											<ul class="sidenav-dropdown-menu display-none submenuElement">

												<li>
													<a :href="`${config.public.apiURL}/a/#!/import/layouts`"
														 class="sidenav-dropdown-menu-btn">
														<span class="side-nav-title">Entity Viewer Layouts</span>

													</a>
												</li>
												<li>
													<a :href="`${config.public.apiURL}/a/#!/dashboard-layouts`"
														 class="sidenav-dropdown-menu-btn">
														<span class="side-nav-title">Dashboard Layouts</span>

													</a>
												</li>
												<li>
													<a :href="`${config.public.apiURL}/a/#!/settings/input-form-layouts`"
														 class="sidenav-dropdown-menu-btn">
														<span class="side-nav-title">Input Form Layouts</span>

													</a>
												</li>
												<li>
													<a :href="`${config.public.apiURL}/a/#!/context-menu-layouts`"
														 class="sidenav-dropdown-menu-btn">
														<span class="side-nav-title">Context Menu Layouts</span>

													</a>
												</li>

												<li>
													<a :href="`${config.public.apiURL}/a/#!/manual-sorting-layouts`"
														 class="sidenav-dropdown-menu-btn">
														<span class="side-nav-title">Manual Sorting</span>

													</a>
												</li>

											</ul>

										</div>

									</li>

									<li>
										<a :href="`${config.public.apiURL}/a/#!/settings/notifications`"
											 class="sidemenu-btn">
											<span class="side-nav-title">Notifications</span>

										</a>
									</li>
									<li>
										<a :href="`${config.public.apiURL}/a/#!/settings/interface`"
											 class="sidemenu-btn">
											<span class="side-nav-title">Interface Complexity</span>

										</a>
									</li>


								</ul>
							</div>

							<div class="side-menu-group-btn-container side-menu-settings-border-top-1">
								<h3 class="sms-btn-group-header">Configuration</h3>
								<ul class="side-menu">
									<li v-if="accessSectionTable.settings_data">
										<div class="sidenav-dropdown-menu-wrapper"
												 @mouseenter="showSubmenu($event)"
												 @mouseleave="hideSubmenu($event)">
											<button class="sidemenu-btn openSubmenuBtn">
												<span class="side-nav-title">Data Settings</span>

											</button>

											<ul class="sidenav-dropdown-menu display-none submenuElement">

												<li v-if="accessTable.configuration_account_type">
													<a :href="`${config.public.apiURL}/a/#!/data/account-types`"
														 class="sidenav-dropdown-menu-btn">
														<span class="side-nav-title">Account Types</span>

													</a>
												</li>
												<li v-if="accessTable.configuration_instrument_type">
													<a :href="`${config.public.apiURL}/a/#!/data/instrument-types`"
														 class="sidenav-dropdown-menu-btn">
														<span class="side-nav-title">Instrument Types</span>

													</a>
												</li>
												<li v-if="accessTable.configuration_transaction_type">
													<a :href="`${config.public.apiURL}/a/#!/data/transaction-types`"
														 class="sidenav-dropdown-menu-btn">
														<span class="side-nav-title">Transaction Types</span>

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
													<a :href="`${config.public.apiURL}/a/#!/settings/entities-custom-attributes`"
														 class="sidenav-dropdown-menu-btn">
														<span class="side-nav-title">User Attributes</span>

													</a>
												</li>

												<li v-if="accessTable.configuration_reference_table">
													<a :href="`${config.public.apiURL}/a/#!/import/reference-tables`"
														 class="sidenav-dropdown-menu-btn">
														<span class="side-nav-title">Reference Tables</span>

													</a>
												</li>

												<li v-if="accessTable.configuration_mapping_tables">
													<a :href="`${config.public.apiURL}/a/#!/import/mapping-tables-import`"
														 class="sidenav-dropdown-menu-btn">
														<span class="side-nav-title">
																Mapping Tables
														</span>

													</a>
												</li>

												<li v-if="accessTable.configuration_template">
													<a :href="`${config.public.apiURL}/a/#!/template-layouts`"
														 class="sidenav-dropdown-menu-btn">
														<span class="side-nav-title">Templates</span>

													</a>
												</li>

											</ul>

										</div>
									</li>

									<li>
										<div class="sidenav-dropdown-menu-wrapper"
												 @mouseenter="showSubmenu($event)"
												 @mouseleave="hideSubmenu($event)">
											<button class="sidemenu-btn openSubmenuBtn">
												<span class="side-nav-title">Pricing</span>

											</button>

											<ul class="sidenav-dropdown-menu display-none submenuElement">

												<li>
													<a :href="`${config.public.apiURL}/a/#!/pricing-schemes`"
														 class="sidenav-dropdown-menu-btn">
														<span class="side-nav-title">Schemes</span>

													</a>
												</li>
												<li>
													<a :href="`${config.public.apiURL}/a/#!/pricing-policies`"
														 class="sidenav-dropdown-menu-btn">
														<span class="side-nav-title">Policies</span>

													</a>
												</li>

											</ul>

										</div>
									</li>

									<li v-if="accessSectionTable.settings_import_from_providers">
										<div class="sidenav-dropdown-menu-wrapper"
												 @mouseenter="showSubmenu($event)"
												 @mouseleave="hideSubmenu($event)">
											<button class="sidemenu-btn openSubmenuBtn">
												<span class="side-nav-title">Import from Providers</span>

											</button>

											<ul class="sidenav-dropdown-menu display-none submenuElement">

												<li v-if="accessTable.configuration_price_download_scheme">
													<a :href="`${config.public.apiURL}/a/#!/settings/price-download-scheme`"
														 class="sidenav-dropdown-menu-btn">
														<span class="side-nav-title">Price Schemes</span>

													</a>
												</li>
												<li v-if="accessTable.configuration_instrument_download_scheme">
													<a :href="`${config.public.apiURL}/a/#!/settings/instrument-import`"
														 class="sidenav-dropdown-menu-btn">
														<span class="side-nav-title">Instrument Schemes</span>

													</a>
												</li>

											</ul>

										</div>
									</li>

									<li v-if="accessSectionTable.settings_import_from_files">
										<div class="sidenav-dropdown-menu-wrapper"
												 @mouseenter="showSubmenu($event)"
												 @mouseleave="hideSubmenu($event)">
											<button class="sidemenu-btn openSubmenuBtn">
												<span class="side-nav-title">Import from Files</span>

											</button>

											<ul class="sidenav-dropdown-menu display-none submenuElement">

												<li v-if="accessTable.configuration_simple_import_scheme">
													<a :href="`${config.public.apiURL}/a/#!/settings/data-import`"
														 class="sidenav-dropdown-menu-btn">
														<span class="side-nav-title">Data Import</span>

													</a>
												</li>
												<li v-if="accessTable.configuration_transaction_import_scheme">
													<a :href="`${config.public.apiURL}/a/#!/settings/transaction-import`"
														 class="sidenav-dropdown-menu-btn">
														<span class="side-nav-title">Transactions Import</span>

													</a>
												</li>
												<li v-if="accessTable.configuration_complex_import_scheme">
													<a :href="`${config.public.apiURL}/a/#!/settings/complex-import`"
														 class="sidenav-dropdown-menu-btn">
														<span class="side-nav-title">Complex Import</span>

													</a>
												</li>

											</ul>

										</div>
									</li>

									<li>
										<div class="sidenav-dropdown-menu-wrapper"
												 @mouseenter="showSubmenu($event)"
												 @mouseleave="hideSubmenu($event)">

											<button class="sidemenu-btn f-s-10 openSubmenuBtn">
												<span class="side-nav-title">Procedures and schedules</span>

											</button>

											<ul class="sidenav-dropdown-menu display-none submenuElement">
												<li>
													<a :href="`${config.public.apiURL}/a/#!/pricing-procedures`"
														 class="sidenav-dropdown-menu-btn">
														<span class="side-nav-title">Pricing Procedures</span>

													</a>
												</li>
												<li>
													<a :href="`${config.public.apiURL}/a/#!/data-procedures`"
														 class="sidenav-dropdown-menu-btn">
														<span class="side-nav-title">Data Procedures</span>

													</a>
												</li>
												<li>
													<a :href="`${config.public.apiURL}/a/#!/expression-procedures`"
														 class="sidenav-dropdown-menu-btn">
														<span class="side-nav-title">Expression Procedures</span>

													</a>
												</li>
												<li>
													<a :href="`${config.public.apiURL}/a/#!/schedules`"
														 class="sidenav-dropdown-menu-btn">
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
										<div class="sidenav-dropdown-menu-wrapper"
												 @mouseenter="showSubmenu($event)"
												 @mouseleave="hideSubmenu($event)">
											<button class="sidemenu-btn openSubmenuBtn">
												<span class="side-nav-title">Specifications</span>

											</button>

											<ul class="sidenav-dropdown-menu display-none submenuElement">

												<li v-if="accessTable.configuration_aliases">
													<a :href="`${config.public.apiURL}/a/#!/settings/aliases`"
														 class="sidenav-dropdown-menu-btn">
														<span class="side-nav-title">Aliases</span>

													</a>
												</li>

												<li>
													<a :href="`${config.public.apiURL}/a/#!/settings/tooltips`"
														 class="sidenav-dropdown-menu-btn">
														<span class="side-nav-title">Tooltips</span>

													</a>
												</li>

												<li>
													<a :href="`${config.public.apiURL}/a/#!/settings/palettes`"
														 class="sidenav-dropdown-menu-btn">
														<span class="side-nav-title">Palettes</span>

													</a>
												</li>

												<li>
													<a :href="`${config.public.apiURL}/a/#!/settings/cross-entity-attribute-extension`"
														 class="sidenav-dropdown-menu-btn">
														<span class="side-nav-title">Reports</span>

													</a>
												</li>

											</ul>

										</div>
									</li>

									<li>
										<div class="sidenav-dropdown-menu-wrapper"
												 @mouseenter="showSubmenu($event)"
												 @mouseleave="hideSubmenu($event)">
											<button class="sidemenu-btn openSubmenuBtn">
												<span class="side-nav-title">Configuration</span>

											</button>

											<ul class="sidenav-dropdown-menu display-none submenuElement">

												<li v-if="accessTable.settings_import_configuration">
													<a :href="`${config.public.apiURL}/a/#!/settings/import-configuration`"
														 class="sidenav-dropdown-menu-btn">
														<span class="side-nav-title">Import</span>

													</a>
												</li>
												<li v-if="accessTable.settings_export_configuration">
													<a :href="`${config.public.apiURL}/a/#!/settings/export-configuration`"
														 class="sidenav-dropdown-menu-btn">
														<span class="side-nav-title">Export</span>

													</a>
												</li>
												<li>
													<a :href="`${config.public.apiURL}/a/#!/update-configuration`"
														 class="sidenav-dropdown-menu-btn">
														<span class="side-nav-title">Update</span>

													</a>
												</li>

											</ul>

										</div>
									</li>
								</ul>

							</div>

							<div class="side-menu-group-btn-container side-menu-settings-border-top-1"
									 v-if="accessSectionTable.settings_administration && member.is_admin">
								<h3 class="sms-btn-group-header">Administration</h3>
								<ul class="side-menu">
									<li v-if="accessTable.settings_provider">
										<a :href="`${config.public.apiURL}/a/#!/settings/data-providers`"
											 class="sidemenu-btn">
											<span class="side-nav-title">Data providers</span>

										</a>
									</li>
									<li v-if="accessTable.settings_init_configuration">
										<a :href="`${config.public.apiURL}/a/#!/settings/init-configuration`"
											 class="sidemenu-btn">
											<span class="side-nav-title">New User Setups</span>

										</a>
									</li>
									<li v-if="accessTable.settings_users_groups_permission">
										<a :href="`${config.public.apiURL}/a/#!/settings/users-and-groups`"
											 class="sidemenu-btn">
											<span class="side-nav-title">Permissions</span>

										</a>
									</li>
									<li v-if="accessTable.settings_ecosystem_default">
										<a :href="`${config.public.apiURL}/a/#!/settings/default-settings`"
											 class="sidemenu-btn">
											<span class="side-nav-title">Default Settings</span>

										</a>
									</li>
									<li>
										<div class="sidemenu-btn disabled-elem">
											<span class="side-nav-title">Security</span>

										</div>
									</li>
									<li>
										<a :href="`${config.public.apiURL}/a/#!/processes`"
											 class="sidemenu-btn">
											<span class="side-nav-title">Active Processes</span>

										</a>
									</li>


								</ul>
							</div>
						</div>

					</div>

				</div>
			</div>

		</div>

		<div class="build-date">
			Build date: {{buildDate}}


			<!--				<span class="websocket-connection-status {{vm.getWsStatus()}}"
										title="Websocket status: {{vm.getWsStatus()}}"></span>

							<br/>
							<div class="sidenav-error-subtitle" data-ng-click="vm.openSystemErrorLogDialog($event)">
								<span class="{{vm.getErrorCount() ? 'text-warning-red' : ''}}">Errors: {{ vm.getErrorCount() }}</span>
							</div>

							<div classs="sidenav-api-subtitle">
							<span><a class="sidenav-api-link" href="{{ vm.getCurrentApiUrl() }}" target="_blank">API</a>: <span
								data-ng-click="vm.copyToBuffer(vm.getCurrentBaseApiUrl())" class="sidenav-tech-button">
									{{ vm.getCurrentBaseApiUrl() }}

									<md-tooltip class="tooltip_1" md-direction="top">Copy</md-tooltip>

							</span></span>
							</div>-->

		</div>
	</div>

</template>

<script setup>
// import menu from "~/assets/data/menu.js";
import Icon from "./base/Icon";

const readyStatus = { // will be used by getInterfaceAccess()
	access: true
}

const accessSectionTable = {
	history: true,
	journal: true,
	import: true,

	settings_data: true,
	settings_import_from_providers: true,
	settings_import_from_files: true,

	settings_administration: true

};

const accessTable = {

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
	account_ecosystem_management: true

};

let config = useRuntimeConfig();
let buildDate = config.public.buildDATE;

let sidenavExpanded = true;

function resizeSideNav(expand) {

	// sideNavStatus = status;
	sidenavExpanded = expand;

	if (sidenavExpanded) {

		document.body.classList.remove('sidenav-collapsed');
		document.body.classList.add('sidenav-expanded');

	} else {

		document.body.classList.remove('sidenav-expanded');
		document.body.classList.add('sidenav-collapsed');

	}

	window.dispatchEvent(new Event('resize'));

}

let sideMenuSettingsMenuOpened = false;

const vToggleSettingsMenuDirective = {
	mounted: (el) => {

		const settingsMenu = el.querySelector('.side-menu-settings-menu');
		const settingsToggleBtn = el.querySelector('.toggleSettingsBtn');
		const settingsCollapseBtn = el.querySelector('.collapseSettingsMenu');

		function settingsSideMenuOnClickOutside(event) {

			let clickedOutside = true;
			let elem = event.target;

			for (var i = 0; i < 15; i++) {

				if (elem.classList.contains('side-menu-settings-menu')) {
					clickedOutside = false;
					break;
				} else if (elem.tagName === 'BODY') {
					break;
				} else {
					elem = elem.parentNode;
				}

			}

			if (clickedOutside) {
				toggleSettingsSideMenu();
			}

		}

		function toggleSettingsSideMenu() {

			if (sideMenuSettingsMenuOpened) {

				/*$('.sidenav-settings-toggle-btn').removeClass('settings-menu-opened');
				$('.side-menu-settings-menu').removeClass('overflow-visible');
				$('.side-menu-settings-menu').removeClass('settings-menu-opened');*/
				settingsToggleBtn.classList.remove('settings-menu-opened');
				settingsMenu.classList.remove('overflow-visible', 'settings-menu-opened');

				window.removeEventListener('click', settingsSideMenuOnClickOutside);
				window.removeEventListener('contextmenu', settingsSideMenuOnClickOutside);

			} else {

				/* $('.side-menu-settings-menu').addClass('settings-menu-opened');
					$('.sidenav-settings-toggle-btn').addClass('settings-menu-opened'); */

				settingsMenu.classList.add('settings-menu-opened');
				settingsToggleBtn.classList.add('settings-menu-opened');

				setTimeout(function () {
					// $('.side-menu-settings-menu').addClass('overflow-visible');
					settingsMenu.classList.add('overflow-visible');

					window.addEventListener('click', settingsSideMenuOnClickOutside);
					window.addEventListener('contextmenu', settingsSideMenuOnClickOutside);
				}, 250);

			}

			sideMenuSettingsMenuOpened = !sideMenuSettingsMenuOpened;

		}

		settingsToggleBtn.addEventListener('click', toggleSettingsSideMenu);
		settingsCollapseBtn.addEventListener('click', toggleSettingsSideMenu);

	}
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

const showSubmenu = function ($event) {

	const el = $event.target;
	const dropdownMenu = el.querySelector('.submenuElement');
	const menuBtn = el.querySelector('.openSubmenuBtn');

	menuBtn.classList.add('active-menu-btn');
	dropdownMenu.classList.remove('display-none');

};

const hideSubmenu = function ($event) {

	const el = $event.target;
	const dropdownMenu = el.querySelector('.submenuElement');
	const menuBtn = el.querySelector('.openSubmenuBtn');

	menuBtn.classList.remove('active-menu-btn');
	dropdownMenu.classList.add('display-none');

};

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
		color: $c1;
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
	box-shadow: 0 1px 3px 0 rgb(0 0 0 / 20%), 0 1px 1px 0 rgb(0 0 0 / 14%), 0 2px 1px -1px rgb(0 0 0 / 12%);
	overflow: visible;

	font-family: 'Roboto-Regular', 'Roboto', sans-serif;
	font-weight: 400;
	font-style: normal;
	font-size: 12px;

	z-index: 60;

	a {
		color: #fff;
	}

	color: #fff;

	button {
		color: #fff;
	}

	ng-md-icon {
		position: relative;
		top: 5px; // adjust for svg viewbox
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
	background-color: #000;
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
	background-color: #000;
	overflow: visible;
}

.sidenav-logo-wrapper {
	position: absolute;
	left: 10px;
	width: 140px;
	height: 40px;
	overflow: hidden;
}

.sidenav-logo {
	max-width: 140px;
	width: 140px;
	height: 40px;
	margin: 0 auto;
}

.sidenav-dropdown-menu-wrapper {
	position: relative;
}

@mixin option-hover {
		background-color: rgba(158,158,158,0.2);
}

.sidenav-dropdown-menu {
	width: 200px;
	position: absolute;
	//background-color: #5a3e5a;
	background-color: #000;
	top: 0;
	right: -200px;
	padding-left: 0;
	z-index: 1;

	.sidenav-dropdown-menu-btn {
		width: 100%;
		height: 35px;
		min-height: 30px;
		display: block;
		text-align: left;
		padding-left: 1em;
		margin-left: 0;
		margin-bottom: 6px;
		font-size: 11px;
		line-height: 2;
		padding-top: 12px;
		padding-bottom: 10px;
		text-transform: uppercase;

		&:not([disabled]):hover {
			@include option-hover;
		}

		&.active {
			color: #F05A22;
			fill: #F05A22;
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
	position: absolute;
	width: $leftSidenavWidth;
	height: 100%;
	top: 0;
	left: 0;
	z-index: 61;

	span.side-nav-title {
		position: relative;
		top: -4px;
	}

	.side-nav-icon {
		fill: #fff;
		display: inline-block;
		position: absolute;
		//left: 11px;
		left: 17px;
		// bottom: 3px;
		bottom: 6px;

	}

	transition: width ease 0.25s;
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
	display: block;

	text-align: left;
	line-height: 2;
	text-transform: uppercase;

	padding-top: 11px;
	padding-bottom: 2px;
	padding-left: 55px;
	margin-top: 6px;
	margin-bottom: 6px;
	margin-left: 0;

	.side-nav-icon div.icon {
		position: relative;
		top: 0;
		left: -6px;
	}

	&:not(.f-s-10) {
		font-size: 11px;
	}

	&:not([disabled]):hover {
		@include option-hover;
	}

	&.active {
		color: #F05A22;
		fill: #F05A22;
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
	bottom: 40px;
	width: 100%;
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

.side-menu-settings-container {
	width: 0px;
	height: 100%;
	overflow: visible;
	position: absolute;
	top: 0;
	left: $leftSidenavWidth;
	z-index: 0;
	//background-color: #3b283b;
	background-color: #000;
	color: #ffffff;
	overflow: hidden;
	transition: width ease 0.25s, left ease 0.25s;

	.side-menu-settings-wrapper {
		position: relative;
		width: 200px;
		height: 100%;
		border-top: 2px solid #1f1f1f;
		border-left: 2px solid #1f1f1f;
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
			padding-left: 45px;
		}
	}

	.side-menu-settings-border-top-1 {
		border-top: 2px solid #1f1f1f;
	}
}

.sidenav-btn {
	position: relative;
	display: block;
	width: 24px;
	height: 24px;
	background: #fff;
	border-radius: 50%;
	fill: $gray;
	left: 12px;
	min-height: 24px;
	min-width: 24px;

	&.expand-sidenav-btn ng-md-icon {
		left: -5px;
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
		width: $collapsedLeftSidenavWidth;
		position: absolute;
		height: 100%;
		left: 0;
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
	background-color: #69476a;
}

.side-menu-settings-menu.settings-menu-opened {
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
		opacity: .7;
	}

}

.sidenav-tech-button {
	cursor: pointer;

	&:hover {
		opacity: .7;
	}
}

.sidenav-api-link {

	color: #fff;
	text-decoration: none;

	&:hover {
		opacity: .7;
	}

}

</style>
