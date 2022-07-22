<template>
	<div class="sidenav-wrapper">
		<div class="sidenav-left">
			<div class="sidenav-logo-container">
				<div class="sidenav-logo-wrapper">
					<NuxtLink to="/">
						<img src="/v/img/logo.png" class="sidenav-logo" alt=""/>
					</NuxtLink>
				</div>
				<div class="side-nav-btn-resize-holder">
					<button v-if="sidenavExpanded"
									class="to-small-btn side-nav-btn fab "
									@click="resizeSideNav(false)">
						<ng-md-icon icon="chevron_left"></ng-md-icon>
					</button>

					<button v-if="!sidenavExpanded"
									class="expand-sidenav-btn side-nav-btn fab"
									@click="resizeSideNav(true)">
						<ng-md-icon icon="chevron_right"></ng-md-icon>
					</button>
				</div>
			</div>

			<div class="sidenav-content">
				<div class="side-menu-container flex-column" v-toggle-settings-menu-directive>

					<div class="side-menu-main-buttons">
						<ul class="side-menu" v-if="readyStatus.access">

							<li>
								<button ui-sref-active="active"
												class="sidemenu-btn"
												ui-sref="app.portal.dashboard">
                        <span class="side-nav-icon">
                            <ng-md-icon icon="dashboard" size="24"></ng-md-icon>
                        </span>
									<span class="side-nav-title">Dashboard</span>

								</button>
							</li>

							<li>
								<button ui-sref-active="active"
												class="sidemenu-btn"
												ui-sref="app.portal.home">
                        <span class="side-nav-icon">
                            <ng-md-icon icon="home" size="24"></ng-md-icon>
                        </span>
									<span class="side-nav-title">Homepage</span>

								</button>
							</li>

							<li>
								<div class="sidenav-dropdown-menu-wrapper" sidenav-dropdown-menu menu-type="reports">

									<button class="sidemenu-btn reports-sidenav-menu-btn">
                            <span class="side-nav-icon">
                                <ng-md-icon icon="assessment" size="24"></ng-md-icon>
                            </span>
										<span class="side-nav-title">Reports</span>

									</button>

									<ul class="sidenav-dropdown-menu reports-dropdown-menu-element ng-hide">
										<li v-if="accessTable.report_balance">
											<button ui-sref-active="active"
															class="sidenav-dropdown-menu-btn"
															ui-sref="app.portal.reports.balance-report">
												<span class="side-nav-title">Balance</span>

											</button>
										</li>
										<li v-if="accessTable.report_pl">
											<button ui-sref-active="active"
															class="sidenav-dropdown-menu-btn"
															ui-sref="app.portal.reports.pl-report">
												<span class="side-nav-title">P&L</span>

											</button>
										</li>
										<li v-if="accessTable.report_transaction">
											<button ui-sref-active="active"
															class="sidenav-dropdown-menu-btn"
															ui-sref="app.portal.reports.transaction-report">
												<span class="side-nav-title">Transaction</span>
											</button>
										</li>
										<li v-if="accessTable.report_performance">
											<button ui-sref-active="active"
															class="sidenav-dropdown-menu-btn"
															ui-sref="app.portal.reports.performance-report"
															disabled>
												<span class="side-nav-title">Performance</span>
											</button>
										</li>
										<li v-if="accessTable.report_cash_flow">
											<button ui-sref-active="active"
															class="sidenav-dropdown-menu-btn"
															ui-sref="app.portal.reports.cash-flow-projection-report"
															disabled>
												<span class="side-nav-title">Cash flow</span>
											</button>
										</li>
										<li v-if="accessTable.report_event">
											<button ui-sref-active="active"
															class="sidenav-dropdown-menu-btn"
															ui-sref="app.portal.reports.check-for-events">
												<span class="side-nav-title">Events</span>
											</button>
										</li>
									</ul>

								</div>
							</li>

							<li>
								<div class="sidenav-dropdown-menu-wrapper" sidenav-dropdown-menu menu-type="data">

									<button class="sidemenu-btn data-sidenav-menu-btn">
                            <span class="side-nav-icon">
                                <ng-md-icon icon="view_compact" size="24"></ng-md-icon>
                            </span>
										<span class="side-nav-title">Data</span>

									</button>

									<ul class="sidenav-dropdown-menu data-dropdown-menu-element ng-hide">
										<li v-if="accessTable.data_portfolio">
											<button ui-sref-active="active"
															class="sidenav-dropdown-menu-btn"
															ui-sref="app.portal.data.portfolio">
												<span class="side-nav-title">Portfolios</span>
											</button>
										</li>
										<li v-if="accessTable.data_portfolio">
											<button ui-sref-active="active"
															class="sidenav-dropdown-menu-btn"
															ui-sref="app.portal.data.portfolio-register">
												<span class="side-nav-title">Registers</span>

											</button>
										</li>
										<li v-if="accessTable.data_account">
											<button ui-sref-active="active"
															class="sidenav-dropdown-menu-btn"
															ui-sref="app.portal.data.account">
												<span class="side-nav-title">Accounts</span>

											</button>
										</li>
										<li v-if="accessTable.data_instrument">
											<button ui-sref-active="active"
															class="sidenav-dropdown-menu-btn"
															ui-sref="app.portal.data.instrument">
												<span class="side-nav-title">Instruments</span>

											</button>
										</li>
										<li v-if="accessTable.data_counterparty">
											<button ui-sref-active="active"
															class="sidenav-dropdown-menu-btn"
															ui-sref="app.portal.data.counterparty">
												<span class="side-nav-title">Counterparties</span>

											</button>
										</li>
										<li v-if="accessTable.data_responsible">
											<button ui-sref-active="active"
															class="sidenav-dropdown-menu-btn"
															ui-sref="app.portal.data.responsible">
												<span class="side-nav-title">Responsibles</span>

											</button>
										</li>
										<li v-if="accessTable.data_currency">
											<button ui-sref-active="active"
															class="sidenav-dropdown-menu-btn"
															ui-sref="app.portal.data.currency">
												<span class="side-nav-title">Currencies</span>

											</button>
										</li>
										<li v-if="accessTable.data_strategies">
											<button ui-sref-active="active"
															class="sidenav-dropdown-menu-btn"
															ui-sref="app.portal.data.strategy({strategyNumber: 1})">
												<span class="side-nav-title">Strategies 1</span>

											</button>
										</li>
										<li v-if="accessTable.data_strategies">
											<button ui-sref-active="active"
															class="sidenav-dropdown-menu-btn"
															ui-sref="app.portal.data.strategy({strategyNumber: 2})">
												<span class="side-nav-title">Strategies 2</span>

											</button>
										</li>
										<li v-if="accessTable.data_strategies">
											<button ui-sref-active="active"
															class="sidenav-dropdown-menu-btn"
															ui-sref="app.portal.data.strategy({strategyNumber: 3})">
												<span class="side-nav-title">Strategies 3</span>

											</button>
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
								<div class="sidenav-dropdown-menu-wrapper" sidenav-dropdown-menu menu-type="history">
									<button class="sidemenu-btn history-sidenav-menu-btn">
                            <span class="side-nav-icon">
                                <ng-md-icon icon="history" size="24"></ng-md-icon>
                            </span>
										<span class="side-nav-title">Transactions</span>

									</button>

									<ul class="sidenav-dropdown-menu history-dropdown-menu-element ng-hide">
										<li v-if="accessTable.data_transaction">
											<button ui-sref-active="active"
															class="sidenav-dropdown-menu-btn"
															ui-sref="app.portal.data.complex-transaction">
												<span class="side-nav-title">Transactions</span>

											</button>
										</li>
										<li>
											<button class="sidenav-dropdown-menu-btn"
															ui-sref="app.portal.data.transaction">
												<span class="side-nav-title">Base Transactions</span>

											</button>
										</li>
										<li>
											<button class="sidenav-dropdown-menu-btn"
															ui-sref="app.portal.data.portfolio-register-record">
												<span class="side-nav-title">Register Records</span>

											</button>
										</li>
									</ul>
								</div>
							</li>

							<li v-if="accessSectionTable">
								<div class="sidenav-dropdown-menu-wrapper" sidenav-dropdown-menu menu-type="history">
									<button class="sidemenu-btn history-sidenav-menu-btn">
                            <span class="side-nav-icon">
                                <ng-md-icon icon="layers" size="24"></ng-md-icon>
                            </span>
										<span class="side-nav-title">Valuations</span>

									</button>

									<ul class="sidenav-dropdown-menu history-dropdown-menu-element ng-hide">
										<li v-if="accessTable.data_price_history">
											<button ui-sref-active="active"
															class="sidenav-dropdown-menu-btn"
															ui-sref="app.portal.data.price-history">
												<span class="side-nav-title">Prices</span>

											</button>
										</li>
										<li v-if="accessTable.data_price_history">
											<button ui-sref-active="active"
															class="sidenav-dropdown-menu-btn"
															ui-sref="app.portal.data.price-history-error">
												<span class="side-nav-title">Prices Journal</span>

											</button>
										</li>
										<li v-if="accessTable.data_fx_history">
											<button ui-sref-active="active"
															class="sidenav-dropdown-menu-btn"
															ui-sref="app.portal.data.currency-history">
												<span class="side-nav-title">FX Rates</span>

											</button>
										</li>
										<li v-if="accessTable.data_fx_history">
											<button ui-sref-active="active"
															class="sidenav-dropdown-menu-btn"
															ui-sref="app.portal.data.currency-history-error">
												<span class="side-nav-title">FX Rates Journal</span>

											</button>
										</li>
										<li>
											<button ui-sref-active="active"
															class="sidenav-dropdown-menu-btn"
															ui-sref="app.portal.run-pricing-procedure">
												<span class="side-nav-title">Run Pricing</span>

											</button>
										</li>
										<li>
											<button ui-sref-active="active"
															class="sidenav-dropdown-menu-btn"
															ui-sref="app.portal.pricing-parent-procedure">
												<span class="side-nav-title">Procedures status</span>

											</button>
										</li>
									</ul>
								</div>
							</li>

							<li v-if="accessSectionTable.import">
								<div class="sidenav-dropdown-menu-wrapper" sidenav-dropdown-menu menu-type="import">
									<button class="sidemenu-btn import-sidenav-menu-btn">
                                <span class="side-nav-icon">
                                    <ng-md-icon icon="file_download" size="24"></ng-md-icon>
                                </span>
										<span class="side-nav-title">Import</span>

									</button>

									<ul class="sidenav-dropdown-menu import-dropdown-menu-element ng-hide">
										<li v-if="accessTable.data_simple_import">
											<button ui-sref-active="active"
															class="sidenav-dropdown-menu-btn two-line-text"
															ui-sref="app.portal.import.simple-entity">
                                        <span class="side-nav-title">
                                            Data<br>
                                            (from file)
                                        </span>

											</button>
										</li>
										<li v-if="accessTable.data_simple_import">
											<button ui-sref-active="active"
															class="sidenav-dropdown-menu-btn two-line-text"
															ui-sref="app.portal.import.unified-entity">
                                        <span class="side-nav-title">
                                            Instrument<br>
                                            (from file)
                                        </span>

											</button>
										</li>
										<li v-if="accessTable.data_transaction_import">
											<button ui-sref-active="active"
															class="sidenav-dropdown-menu-btn two-line-text"
															ui-sref="app.portal.import.transaction">
                                        <span class="side-nav-title">
                                            Transactions<br>
                                            (from file)
                                        </span>

											</button>
										</li>
										<li v-if="accessTable.data_complex_import">
											<button ui-sref-active="active"
															class="sidenav-dropdown-menu-btn two-line-text"
															ui-sref="app.portal.import.complex-import">
                                        <span class="side-nav-title">
                                            Data and Transactions<br>
                                            (from file)
                                        </span>

											</button>
										</li>
										<li v-if="accessTable.data_instrument_download">
											<button ui-sref-active="active"
															class="sidenav-dropdown-menu-btn two-line-text"
															ui-sref="app.portal.import.instrument">
                                        <span class="side-nav-title">
                                            Instrument<br>
                                            (from provider)
                                        </span>

											</button>
										</li>
										<li v-if="accessTable.data_instrument_download">
											<button ui-sref-active="active"
															class="sidenav-dropdown-menu-btn two-line-text"
															ui-sref="app.portal.import.instrument-cbonds">
                                        <span class="side-nav-title">
                                            Instrument<br>
                                            (from Finmars Database)
                                        </span>

											</button>
										</li>
										<li v-if="accessTable.data_prices_download">
											<button ui-sref-active="active"
															class="sidenav-dropdown-menu-btn two-line-text"
															ui-sref="app.portal.import.prices">
                                        <span class="side-nav-title">
                                            Prices/FX<br>
                                            (from provider)
                                        </span>

											</button>
										</li>
										<li>
											<button ui-sref-active="active"
															class="sidenav-dropdown-menu-btn"
															ui-sref="app.portal.run-data-procedure">
												<span class="side-nav-title">Import From Bank</span>

											</button>
										</li>
									</ul>
								</div>
							</li>

						</ul>
					</div>

					<div class="side-menu-bottom-menu side-menu-main-buttons">
						<ul class="side-menu" v-if="readyStatus.access">

							<li v-if="accessSectionTable.journal">
								<div class="sidenav-dropdown-menu-wrapper" sidenav-dropdown-menu menu-type="journal">
									<button class="sidemenu-btn journal-sidenav-menu-btn">
                                <span class="side-nav-icon">
                                    <ng-md-icon icon="book" size="24"></ng-md-icon>
                                </span>
										<span class="side-nav-title">Journal</span>

									</button>

									<ul class="sidenav-dropdown-menu open-upward journal-dropdown-menu-element ng-hide">
										<li v-if="accessTable.report_instrument_audit">
											<button class="sidenav-dropdown-menu-btn"
															ui-sref="app.portal.data.instruments">
												<span class="side-nav-title">Instruments Audit</span>

											</button>
										</li>
										<li v-if="accessTable.report_transaction_audit">
											<button class="sidenav-dropdown-menu-btn"
															ui-sref="app.portal.data.transactions">
												<span class="side-nav-title">Transactions Audit</span>

											</button>
										</li>
										<li v-if="accessTable.report_activity_log">
											<button class="sidenav-dropdown-menu-btn"
															ui-sref="#"
															disabled>
												<span class="side-nav-title">Activity Log</span>

											</button>
										</li>
										<li v-if="accessTable.report_activity_log">
											<button class="sidenav-dropdown-menu-btn"
															ui-sref="app.portal.system.file-reports">
												<span class="side-nav-title">System Files</span>
											</button>
										</li>
									</ul>

								</div>
							</li>

							<li>
								<button class="sidemenu-btn sidenav-settings-toggle-btn" ref="toggleSettingsBtn">
                <span class="side-nav-icon">
										<ng-md-icon icon="settings" size="24"></ng-md-icon>
								</span>

									<span class="side-nav-title">Settings</span>
								</button>
							</li>

						</ul>
					</div>

					<div class="side-menu-settings-container side-menu-settings-menu" ref="settingsMenu">
						<div class="side-menu-settings-wrapper">
							<div class="settings-menu-collapse-button-holder">
								<button class="to-small-btn side-nav-btn fab"
												ref="toggleSettingsBtn">
									<ng-md-icon icon="chevron_left"></ng-md-icon>
								</button>
							</div>

							<div class="side-menu-group-btn-container border-top-none">
								<h3 class="sms-btn-group-header">Interface</h3>
								<ul class="side-menu">
									<li>

										<div class="sidenav-dropdown-menu-wrapper" sidenav-dropdown-menu menu-type="dataTypes">
											<button class="sidemenu-btn dataTypes-sidenav-menu-btn">
												<span class="side-nav-title">Layouts</span>

											</button>

											<ul class="sidenav-dropdown-menu dataTypes-dropdown-menu-element ng-hide">

												<li>
													<button class="sidenav-dropdown-menu-btn"
																	ui-sref="app.portal.settings.layouts">
														<span class="side-nav-title">Entity Viewer Layouts</span>

													</button>
												</li>
												<li>
													<button class="sidenav-dropdown-menu-btn"
																	ui-sref="app.portal.dashboard-layout-manager">
														<span class="side-nav-title">Dashboard Layouts</span>

													</button>
												</li>
												<li>
													<button class="sidenav-dropdown-menu-btn"
																	ui-sref="app.portal.settings.input-form-layouts">
														<span class="side-nav-title">Input Form Layouts</span>

													</button>
												</li>
												<li>
													<button class="sidenav-dropdown-menu-btn"
																	ui-sref="app.portal.context-menu-layout-manager">
														<span class="side-nav-title">Context Menu Layouts</span>

													</button>
												</li>

												<li>
													<button class="sidenav-dropdown-menu-btn"
																	ui-sref="app.portal.manual-sorting-layout-manager">
														<span class="side-nav-title">Manual Sorting</span>

													</button>
												</li>

											</ul>

										</div>

									</li>

									<li>
										<button class="sidemenu-btn"
														ui-sref="app.portal.settings.notifications">
											<span class="side-nav-title">Notifications</span>

										</button>
									</li>
									<li>
										<button class="sidemenu-btn"
														ui-sref="app.portal.settings.interface-access">
											<span class="side-nav-title">Interface Complexity</span>

										</button>
									</li>


								</ul>
							</div>

							<div class="side-menu-group-btn-container side-menu-settings-border-top-1">
								<h3 class="sms-btn-group-header">Configuration</h3>
								<ul class="side-menu">
									<li v-if="accessSectionTable.settings_data">
										<div class="sidenav-dropdown-menu-wrapper" sidenav-dropdown-menu menu-type="dataTypes">
											<button class="sidemenu-btn dataTypes-sidenav-menu-btn">
												<span class="side-nav-title">Data Settings</span>

											</button>

											<ul class="sidenav-dropdown-menu dataTypes-dropdown-menu-element ng-hide">

												<li v-if="accessTable.configuration_account_type">
													<button class="sidenav-dropdown-menu-btn"
																	ui-sref="app.portal.data.account-type">
														<span class="side-nav-title">Account Types</span>

													</button>
												</li>
												<li v-if="accessTable.configuration_instrument_type">
													<button class="sidenav-dropdown-menu-btn"
																	ui-sref="app.portal.data.instrument-type">
														<span class="side-nav-title">Instrument Types</span>

													</button>
												</li>
												<li v-if="accessTable.configuration_transaction_type">
													<button class="sidenav-dropdown-menu-btn"
																	ui-sref="app.portal.data.transaction-type">
														<span class="side-nav-title">Transaction Types</span>

													</button>
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
													<button class="sidenav-dropdown-menu-btn"
																	ui-sref="app.portal.settings.entities-custom-attributes">
														<span class="side-nav-title">User Attributes</span>

													</button>
												</li>

												<li v-if="accessTable.configuration_reference_table">
													<button ui-sref-active="active"
																	class="sidenav-dropdown-menu-btn"
																	ui-sref="app.portal.import.reference-tables">
														<span class="side-nav-title">Reference Tables</span>

													</button>
												</li>

												<li v-if="accessTable.configuration_mapping_tables">
													<button ui-sref-active="active"
																	class="sidenav-dropdown-menu-btn"
																	ui-sref="app.portal.import.mapping-tables">
                                                <span class="side-nav-title">
                                                    Mapping Tables
                                                </span>

													</button>
												</li>

												<li v-if="accessTable.configuration_template">
													<button class="sidenav-dropdown-menu-btn"
																	ui-sref="app.portal.template-layout-manager">
														<span class="side-nav-title">Templates</span>

													</button>
												</li>

											</ul>

										</div>
									</li>

									<li>
										<div class="sidenav-dropdown-menu-wrapper" sidenav-dropdown-menu menu-type="dataTypes">
											<button class="sidemenu-btn dataTypes-sidenav-menu-btn">
												<span class="side-nav-title">Pricing</span>

											</button>

											<ul class="sidenav-dropdown-menu dataTypes-dropdown-menu-element ng-hide">

												<li>
													<button class="sidenav-dropdown-menu-btn"
																	ui-sref="app.portal.pricing-schemes">
														<span class="side-nav-title">Schemes</span>

													</button>
												</li>
												<li>
													<button class="sidenav-dropdown-menu-btn"
																	ui-sref="app.portal.pricing-policy">
														<span class="side-nav-title">Policies</span>

													</button>
												</li>

											</ul>

										</div>
									</li>

									<li v-if="accessSectionTable.settings_import_from_providers">
										<div class="sidenav-dropdown-menu-wrapper" sidenav-dropdown-menu menu-type="dataTypes">
											<button class="sidemenu-btn dataTypes-sidenav-menu-btn">
												<span class="side-nav-title">Import from Providers</span>

											</button>

											<ul class="sidenav-dropdown-menu dataTypes-dropdown-menu-element ng-hide">

												<li v-if="accessTable.configuration_price_download_scheme">
													<button class="sidenav-dropdown-menu-btn"
																	ui-sref="app.portal.settings.price-download-scheme">
														<span class="side-nav-title">Price Schemes</span>

													</button>
												</li>
												<li v-if="accessTable.configuration_instrument_download_scheme">
													<button class="sidenav-dropdown-menu-btn"
																	ui-sref="app.portal.settings.instrument-import">
														<span class="side-nav-title">Instrument Schemes</span>

													</button>
												</li>

											</ul>

										</div>
									</li>

									<li v-if="accessSectionTable.settings_import_from_files">
										<div class="sidenav-dropdown-menu-wrapper" sidenav-dropdown-menu menu-type="dataTypes">
											<button class="sidemenu-btn dataTypes-sidenav-menu-btn">
												<span class="side-nav-title">Import from Files</span>

											</button>

											<ul class="sidenav-dropdown-menu dataTypes-dropdown-menu-element ng-hide">

												<li v-if="accessTable.configuration_simple_import_scheme">
													<button ui-sref-active="active"
																	class="sidenav-dropdown-menu-btn"
																	ui-sref="app.portal.settings.simple-entity-import">
														<span class="side-nav-title">Data Import</span>

													</button>
												</li>
												<li v-if="accessTable.configuration_transaction_import_scheme">
													<button ui-sref-active="active"
																	class="sidenav-dropdown-menu-btn"
																	ui-sref="app.portal.settings.transaction-import">
														<span class="side-nav-title">Transactions Import</span>

													</button>
												</li>
												<li v-if="accessTable.configuration_complex_import_scheme">
													<button ui-sref-active="active"
																	class="sidenav-dropdown-menu-btn"
																	ui-sref="app.portal.settings.complex-import">
														<span class="side-nav-title">Complex Import</span>

													</button>
												</li>

											</ul>

										</div>
									</li>

									<li>
										<div class="sidenav-dropdown-menu-wrapper"
												 sidenav-dropdown-menu
												 menu-type="dataTypes">

											<button class="sidemenu-btn dataTypes-sidenav-menu-btn f-s-10">
												<span class="side-nav-title">Procedures and schedules</span>

											</button>

											<ul class="sidenav-dropdown-menu dataTypes-dropdown-menu-element ng-hide">
												<li>
													<button class="sidenav-dropdown-menu-btn"
																	ui-sref="app.portal.pricing-procedure">
														<span class="side-nav-title">Pricing Procedures</span>

													</button>
												</li>
												<li>
													<button class="sidenav-dropdown-menu-btn"
																	ui-sref="app.portal.data-procedure">
														<span class="side-nav-title">Data Procedures</span>

													</button>
												</li>
												<li>
													<button class="sidenav-dropdown-menu-btn"
																	ui-sref="app.portal.expression-procedure">
														<span class="side-nav-title">Expression Procedures</span>

													</button>
												</li>
												<li>
													<button class="sidenav-dropdown-menu-btn"
																	ui-sref="app.portal.schedules">
														<span class="side-nav-title">Schedules</span>

													</button>
												</li>
											</ul>

										</div>
									</li>

									<li>
										<!--<button class="sidemenu-btn"
															 ui-sref="app.portal.settings.template-fields">
												<span class="side-nav-title">Aliases</span>
										</button>-->
										<div class="sidenav-dropdown-menu-wrapper" sidenav-dropdown-menu menu-type="dataTypes">
											<button class="sidemenu-btn dataTypes-sidenav-menu-btn">
												<span class="side-nav-title">Specifications</span>

											</button>

											<ul class="sidenav-dropdown-menu dataTypes-dropdown-menu-element ng-hide">

												<li v-if="accessTable.configuration_aliases">
													<button ui-sref-active="active"
																	class="sidenav-dropdown-menu-btn"
																	ui-sref="app.portal.settings.template-fields">
														<span class="side-nav-title">Aliases</span>

													</button>
												</li>

												<li>
													<button ui-sref-active="active"
																	class="sidenav-dropdown-menu-btn"
																	ui-sref="app.portal.settings.tooltips"
													>
														<span class="side-nav-title">Tooltips</span>

													</button>
												</li>

												<li>
													<button ui-sref-active="active"
																	class="sidenav-dropdown-menu-btn"
																	ui-sref="app.portal.settings.color-palettes">
														<span class="side-nav-title">Palettes</span>

													</button>
												</li>

												<li>
													<button ui-sref-active="active"
																	class="sidenav-dropdown-menu-btn"
																	ui-sref="app.portal.settings.cross-entity-attribute-extensions">
														<span class="side-nav-title">Reports</span>

													</button>
												</li>

											</ul>

										</div>
									</li>

									<li>
										<div class="sidenav-dropdown-menu-wrapper" sidenav-dropdown-menu
												 menu-type="configuration">
											<button class="sidemenu-btn configuration-sidenav-menu-btn">
												<span class="side-nav-title">Configuration</span>

											</button>

											<ul class="sidenav-dropdown-menu configuration-dropdown-menu-element ng-hide">

												<li v-if="accessTable.settings_import_configuration">
													<button class="sidenav-dropdown-menu-btn"
																	ui-sref="app.portal.settings.import-configuration">
														<span class="side-nav-title">Import</span>

													</button>
												</li>
												<li v-if="accessTable.settings_export_configuration">
													<button class="sidenav-dropdown-menu-btn"
																	ui-sref="app.portal.settings.export-configuration">
														<span class="side-nav-title">Export</span>

													</button>
												</li>
												<li>
													<button class="sidenav-dropdown-menu-btn"
																	ui-sref="app.portal.update-configuration">
														<span class="side-nav-title">Update</span>

													</button>
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
										<button class="sidemenu-btn"
														ui-sref="app.portal.settings.data-providers">
											<span class="side-nav-title">Data providers</span>

										</button>
									</li>
									<li v-if="accessTable.settings_init_configuration">
										<button class="sidemenu-btn"
														ui-sref="app.portal.settings.init-configuration">
											<span class="side-nav-title">New User Setups</span>

										</button>
									</li>
									<li v-if="accessTable.settings_users_groups_permission">
										<button class="sidemenu-btn"
														ui-sref="app.portal.settings.users-groups">
											<span class="side-nav-title">Permissions</span>

										</button>
									</li>
									<li v-if="accessTable.settings_ecosystem_default">
										<button class="sidemenu-btn"
														ui-sref="app.portal.settings.ecosystem-default-settings">
											<span class="side-nav-title">Default Settings</span>

										</button>
									</li>
									<li>
										<button class="sidemenu-btn"
														ui-sref="#"
														disabled>
											<span class="side-nav-title">Security</span>

										</button>
									</li>
									<li>
										<button class="sidemenu-btn"
														ui-sref="app.portal.processes">
											<span class="side-nav-title">Active Processes</span>

										</button>
									</li>


								</ul>
							</div>
						</div>

					</div>

				</div>
			</div>
		</div>
	</div>
</template>

<script setup>
// import menu from "~/assets/data/menu.js";
const readyStatus = {
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

let open = ref(['user'])
let rail = ref(false)
let isOpenSubmenu = ref(false)
let member = {}

let config = useRuntimeConfig()

let sidenavExpanded = true;

function resizeSideNav(expand) {

	// sideNavStatus = status;
	sidenavExpanded = expand;

	if (status === 'expand') {

		document.body.removeClass('sidenav-collapsed');
		document.body.addClass('sidenav-expanded');

	} else {

		document.body.removeClass('sidenav-expanded');
		document.body.addClass('sidenav-collapsed');

	}

	window.dispatchEvent(new Event('resize'));

}

let sideMenuSettingsMenuOpened = false;

const vToggleSettingsMenuDirective = {
	mounted: (el) => {

		const settingsMenu = el.querySelector('.side-menu-settings-menu');
		const settingsToggleBtn = el.querySelector('.sidenav-settings-toggle-btn');

		function settingsSideMenuOnClickOutside(event) {
			console.log("testing1 settingsSideMenuOnClickOutside called");
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

			if (!sideMenuSettingsMenuOpened) {

				/* $('.side-menu-settings-menu').addClass('settings-menu-opened');
					$('.sidenav-settings-toggle-btn').addClass('settings-menu-opened'); */

				settingsMenu.addClass('settings-menu-opened');
				settingsToggleBtn.addClass('settings-menu-opened');

				setTimeout(function () {
					// $('.side-menu-settings-menu').addClass('overflow-visible');
					settingsMenu.addClass('overflow-visible');

					window.addEventListener('click', settingsSideMenuOnClickOutside);
					window.addEventListener('contextmenu', settingsSideMenuOnClickOutside);
				}, 250);

			} else {

				/*$('.sidenav-settings-toggle-btn').removeClass('settings-menu-opened');
				$('.side-menu-settings-menu').removeClass('overflow-visible');
				$('.side-menu-settings-menu').removeClass('settings-menu-opened');*/
				settingsToggleBtn.removeClass('settings-menu-opened');
				settingsMenu.removeClass('overflow-visible', 'settings-menu-opened');

				window.removeEventListener('click', settingsSideMenuOnClickOutside);
				window.removeEventListener('contextmenu', settingsSideMenuOnClickOutside);

			}

			sideMenuSettingsMenuOpened = !sideMenuSettingsMenuOpened;

		}

	}
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

	button[disabled] {
		color: #fff;
		opacity: 0.5;
	}
}

.sidenav-left {
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

	// md-toolbar
	.sidenav-logo-container {
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
		position: relative;
		height: 100%;
		//background-color: #3b283b;
		background-color: #000;
		overflow: visible;
	}

	ng-md-icon {
		position: relative;
		top: 5px; // adjust for svg viewbox
	}
}

.sidenav-dropdown-menu-wrapper {
	position: relative;
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
		font-size: 11px;
		line-height: 2;
		padding-top: 12px;
		padding-bottom: 10px;

		&.active {
			color: #F05A22;
			fill: #F05A22;
		}

		&.active-menu-btn {
			//background-color: #5a3e5a;

			&:hover {
				//background-color: #5a3e5a;
			}
		}
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
		left: 17px;
		//left: 11px;
		bottom: 3px;
	}

	transition: width ease 0.25s;
}

.side-menu {
	width: 100%;
	padding-left: 0;
}

.sidemenu-btn {
	width: 100%;
	height: 35px;
	display: block;
	text-align: left;
	margin-left: 0;
	font-size: 11px;
	line-height: 2;
	padding-top: 11px;
	padding-bottom: 2px;
	padding-left: 55px;

	&.active {
		color: #F05A22;
		fill: #F05A22;
	}

	&.active-menu-btn {
		//background-color: #5a3e5a;

		&:hover {
			//background-color: #5a3e5a;
		}
	}

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

	.settings-menu-collapse-button-holder {
		position: absolute;
		right: 3px;
		top: 3px;
	}

	.side-menu-group-btn-container {
		width: 100%;
		box-sizing: border-box;

		.sms-btn-group-header {
			margin-left: 20px;
			margin-top: 15px;
		}

		.sidemenu-btn {
			padding-left: 45px;
		}
	}

	.side-menu-settings-border-top-1 {
		border-top: 2px solid #1f1f1f;
	}
}

.side-nav-btn {
	width: 24px;
	height: 24px;
	background: #fff;
	border-radius: 50%;
	fill: #747474;
	left: 20px;
	min-height: 24px;
	min-width: 24px;

	ng-md-icon {
		position: relative;
		top: 0;
		left: -6px;
	}

	&.expand-sidenav-btn ng-md-icon {
		left: -5px;
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

	.side-nav-btn-resize-holder {
		position: absolute;
		right: -12px;
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

.side-nav-btn-resize-holder {
	position: absolute;
	right: 0;
}

.sidenav-logo-wrapper {
	position: absolute;
	left: 10px;
	width: 140px;
	overflow: hidden;
}

.sidenav-logo {
	width: 140px;
	margin: 0 auto;
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
