<template>
	<md-sidenav
		class="md-sidenav-left md-whiteframe-z1"
		md-component-id="left"
		md-is-locked-open="true"
	>
		<md-toolbar md-scroll-shrink>
			<div class="md-toolbar-tools">
				<div class="sidenav-logo-wrapper">
					<img
						src="/img/logo.png"
						alt=""
						height="40"
						class="sidenav-logo"
					/>
				</div>
				<div class="side-nav-btn-resize-holder">
					<md-button
						data-ng-show="vm.sideNavStatus == 'expand'"
						aria-label="resize"
						class="to-small-btn side-nav-btn fab md-raised"
						data-ng-click="vm.resizeSideNav('collapse')"
					>
						<ng-md-icon icon="chevron_left"></ng-md-icon>
					</md-button>
					<md-button
						data-ng-show="vm.sideNavStatus == 'collapse'"
						aria-label="resize"
						class="expand-sidenav-btn side-nav-btn fab md-raised"
						data-ng-click="vm.resizeSideNav('expand')"
					>
						<ng-md-icon icon="chevron_right"></ng-md-icon>
					</md-button>
				</div>
			</div>
		</md-toolbar>
		<div class="sidenav-content">
			<div class="side-menu-container" layout="column">
				<!--<ul class="side-menu">
                <li data-ng-repeat="section in vm.sections" class="parent-list-item"
                    data-ng-class="{'parentActive' : vm.isSectionSelected(section)}">
                    <menu-link section="section" ng-if="section.type === 'link'"></menu-link>
                    <menu-toggle section="section" ng-if="section.type === 'toggle'"></menu-toggle>
                </li>
                <li>
                    <md-button ui-sref-active="active" class="sidemenu-btn"
                               ng-click="vm.openHelp($event)">
                        <span class="side-nav-icon">
                            <ng-md-icon icon="local_library" size="24"></ng-md-icon>
                        </span>
                        <span class="side-nav-title">Help</span>
                    </md-button>
                </li>
            </ul>-->

				<div class="side-menu-main-buttons">
					<ul class="side-menu" data-ng-if="vm.readyStatus.access">
						<li>
							<md-button
								ui-sref-active="active"
								class="sidemenu-btn"
								ui-sref="app.portal.dashboard"
							>
								<span class="side-nav-icon">
									<ng-md-icon icon="dashboard" size="24"></ng-md-icon>
								</span>
								<span class="side-nav-title">Dashboard</span>
								<!--<span class="md-visually-hidden" data-ng-if="isSelected()">current page</span>-->
							</md-button>
						</li>

						<li>
							<md-button
								ui-sref-active="active"
								class="sidemenu-btn"
								ui-sref="app.portal.home"
							>
								<span class="side-nav-icon">
									<ng-md-icon icon="home" size="24"></ng-md-icon>
								</span>
								<span class="side-nav-title">Homepage</span>
								<!--<span class="md-visually-hidden" data-ng-if="isSelected()">current page</span>-->
							</md-button>
						</li>

						<li>
							<div
								class="sidenav-dropdown-menu-wrapper"
								sidenav-dropdown-menu
								menu-type="reports"
							>
								<md-button class="sidemenu-btn reports-sidenav-menu-btn">
									<span class="side-nav-icon">
										<ng-md-icon icon="assessment" size="24"></ng-md-icon>
									</span>
									<span class="side-nav-title">Reports</span>
									<!--<span class="md-visually-hidden" data-ng-if="isSelected()">current page</span>-->
								</md-button>

								<ul
									class="sidenav-dropdown-menu reports-dropdown-menu-element ng-hide"
								>
									<li data-ng-if="vm.accessTable.report_balance">
										<md-button
											ui-sref-active="active"
											class="sidenav-dropdown-menu-btn"
											ui-sref="app.portal.reports.balance-report"
										>
											<span class="side-nav-title">Balance</span>
											<span class="md-visually-hidden" data-ng-if="isSelected()"
												>current page</span
											>
										</md-button>
									</li>
									<li data-ng-if="vm.accessTable.report_pl">
										<md-button
											ui-sref-active="active"
											class="sidenav-dropdown-menu-btn"
											ui-sref="app.portal.reports.pl-report"
										>
											<span class="side-nav-title">P&L</span>
											<span class="md-visually-hidden" data-ng-if="isSelected()"
												>current page</span
											>
										</md-button>
									</li>
									<li data-ng-if="vm.accessTable.report_transaction">
										<md-button
											ui-sref-active="active"
											class="sidenav-dropdown-menu-btn"
											ui-sref="app.portal.reports.transaction-report"
										>
											<span class="side-nav-title">Transaction</span>
											<span class="md-visually-hidden" data-ng-if="isSelected()"
												>current page</span
											>
										</md-button>
									</li>
									<li data-ng-if="vm.accessTable.report_performance">
										<md-button
											ui-sref-active="active"
											class="sidenav-dropdown-menu-btn"
											ui-sref="app.portal.reports.performance-report"
											disabled
										>
											<span class="side-nav-title">Performance</span>
											<span class="md-visually-hidden" data-ng-if="isSelected()"
												>current page</span
											>
										</md-button>
									</li>
									<li data-ng-if="vm.accessTable.report_cash_flow">
										<md-button
											ui-sref-active="active"
											class="sidenav-dropdown-menu-btn"
											ui-sref="app.portal.reports.cash-flow-projection-report"
											disabled
										>
											<span class="side-nav-title">Cash flow</span>
											<span class="md-visually-hidden" data-ng-if="isSelected()"
												>current page</span
											>
										</md-button>
									</li>
									<li data-ng-if="vm.accessTable.report_event">
										<md-button
											ui-sref-active="active"
											class="sidenav-dropdown-menu-btn"
											ui-sref="app.portal.reports.check-for-events"
										>
											<span class="side-nav-title">Events</span>
											<span class="md-visually-hidden" data-ng-if="isSelected()"
												>current page</span
											>
										</md-button>
									</li>
								</ul>
							</div>
						</li>

						<li>
							<div
								class="sidenav-dropdown-menu-wrapper"
								sidenav-dropdown-menu
								menu-type="data"
							>
								<md-button class="sidemenu-btn data-sidenav-menu-btn">
									<span class="side-nav-icon">
										<ng-md-icon icon="view_compact" size="24"></ng-md-icon>
									</span>
									<span class="side-nav-title">Data</span>
									<!--<span class="md-visually-hidden" data-ng-if="isSelected()">current page</span>-->
								</md-button>

								<ul
									class="sidenav-dropdown-menu data-dropdown-menu-element ng-hide"
								>
									<li data-ng-if="vm.accessTable.data_portfolio">
										<md-button
											ui-sref-active="active"
											class="sidenav-dropdown-menu-btn"
											ui-sref="app.portal.data.portfolio"
										>
											<span class="side-nav-title">Portfolios</span>
											<span class="md-visually-hidden" data-ng-if="isSelected()"
												>current page</span
											>
										</md-button>
									</li>
									<li data-ng-if="vm.accessTable.data_portfolio">
										<md-button
											ui-sref-active="active"
											class="sidenav-dropdown-menu-btn"
											ui-sref="app.portal.data.portfolio-register"
										>
											<span class="side-nav-title">Registers</span>
											<span class="md-visually-hidden" data-ng-if="isSelected()"
												>current page</span
											>
										</md-button>
									</li>
									<li data-ng-if="vm.accessTable.data_account">
										<md-button
											ui-sref-active="active"
											class="sidenav-dropdown-menu-btn"
											ui-sref="app.portal.data.account"
										>
											<span class="side-nav-title">Accounts</span>
											<span class="md-visually-hidden" data-ng-if="isSelected()"
												>current page</span
											>
										</md-button>
									</li>
									<li data-ng-if="vm.accessTable.data_instrument">
										<md-button
											ui-sref-active="active"
											class="sidenav-dropdown-menu-btn"
											ui-sref="app.portal.data.instrument"
										>
											<span class="side-nav-title">Instruments</span>
											<span class="md-visually-hidden" data-ng-if="isSelected()"
												>current page</span
											>
										</md-button>
									</li>
									<li data-ng-if="vm.accessTable.data_counterparty">
										<md-button
											ui-sref-active="active"
											class="sidenav-dropdown-menu-btn"
											ui-sref="app.portal.data.counterparty"
										>
											<span class="side-nav-title">Counterparties</span>
											<span class="md-visually-hidden" data-ng-if="isSelected()"
												>current page</span
											>
										</md-button>
									</li>
									<li data-ng-if="vm.accessTable.data_responsible">
										<md-button
											ui-sref-active="active"
											class="sidenav-dropdown-menu-btn"
											ui-sref="app.portal.data.responsible"
										>
											<span class="side-nav-title">Responsibles</span>
											<span class="md-visually-hidden" data-ng-if="isSelected()"
												>current page</span
											>
										</md-button>
									</li>
									<li data-ng-if="vm.accessTable.data_currency">
										<md-button
											ui-sref-active="active"
											class="sidenav-dropdown-menu-btn"
											ui-sref="app.portal.data.currency"
										>
											<span class="side-nav-title">Currencies</span>
											<span class="md-visually-hidden" data-ng-if="isSelected()"
												>current page</span
											>
										</md-button>
									</li>
									<li data-ng-if="vm.accessTable.data_strategies">
										<md-button
											ui-sref-active="active"
											class="sidenav-dropdown-menu-btn"
											ui-sref="app.portal.data.strategy({strategyNumber: 1})"
										>
											<span class="side-nav-title">Strategies 1</span>
											<span class="md-visually-hidden" data-ng-if="isSelected()"
												>current page</span
											>
										</md-button>
									</li>
									<li data-ng-if="vm.accessTable.data_strategies">
										<md-button
											ui-sref-active="active"
											class="sidenav-dropdown-menu-btn"
											ui-sref="app.portal.data.strategy({strategyNumber: 2})"
										>
											<span class="side-nav-title">Strategies 2</span>
											<span class="md-visually-hidden" data-ng-if="isSelected()"
												>current page</span
											>
										</md-button>
									</li>
									<li data-ng-if="vm.accessTable.data_strategies">
										<md-button
											ui-sref-active="active"
											class="sidenav-dropdown-menu-btn"
											ui-sref="app.portal.data.strategy({strategyNumber: 3})"
										>
											<span class="side-nav-title">Strategies 3</span>
											<span class="md-visually-hidden" data-ng-if="isSelected()"
												>current page</span
											>
										</md-button>
									</li>
									<li data-ng-if="vm.accessTable.data_instrument">
										<md-button
											ui-sref-active="active"
											class="sidenav-dropdown-menu-btn"
											ui-sref="app.portal.data.generated-event"
										>
											<span class="side-nav-title">Events</span>
											<span class="md-visually-hidden" data-ng-if="isSelected()"
												>current page</span
											>
										</md-button>
									</li>
								</ul>
							</div>
						</li>

						<li data-ng-if="vm.accessSectionTable.history">
							<div
								class="sidenav-dropdown-menu-wrapper"
								sidenav-dropdown-menu
								menu-type="history"
							>
								<md-button class="sidemenu-btn history-sidenav-menu-btn">
									<span class="side-nav-icon">
										<ng-md-icon icon="history" size="24"></ng-md-icon>
									</span>
									<span class="side-nav-title">Transactions</span>
									<!--<span class="md-visually-hidden" data-ng-if="isSelected()">current page</span>-->
								</md-button>

								<ul
									class="sidenav-dropdown-menu history-dropdown-menu-element ng-hide"
								>
									<li data-ng-if="vm.accessTable.data_transaction">
										<md-button
											ui-sref-active="active"
											class="sidenav-dropdown-menu-btn"
											ui-sref="app.portal.data.complex-transaction"
										>
											<span class="side-nav-title">Transactions</span>
											<span class="md-visually-hidden" data-ng-if="isSelected()"
												>current page</span
											>
										</md-button>
									</li>
									<li>
										<md-button
											class="sidenav-dropdown-menu-btn"
											ui-sref="app.portal.data.transaction"
										>
											<span class="side-nav-title">Base Transactions</span>
											<span class="md-visually-hidden" data-ng-if="isSelected()"
												>current page</span
											>
										</md-button>
									</li>
									<li>
										<md-button
											class="sidenav-dropdown-menu-btn"
											ui-sref="app.portal.data.portfolio-register-record"
										>
											<span class="side-nav-title">Register Records</span>
											<span class="md-visually-hidden" data-ng-if="isSelected()"
												>current page</span
											>
										</md-button>
									</li>
								</ul>
							</div>
						</li>

						<li data-ng-if="vm.accessSectionTable">
							<div
								class="sidenav-dropdown-menu-wrapper"
								sidenav-dropdown-menu
								menu-type="history"
							>
								<md-button class="sidemenu-btn history-sidenav-menu-btn">
									<span class="side-nav-icon">
										<ng-md-icon icon="layers" size="24"></ng-md-icon>
									</span>
									<span class="side-nav-title">Valuations</span>
									<!--<span class="md-visually-hidden" data-ng-if="isSelected()">current page</span>-->
								</md-button>

								<ul
									class="sidenav-dropdown-menu history-dropdown-menu-element ng-hide"
								>
									<li data-ng-if="vm.accessTable.data_price_history">
										<md-button
											ui-sref-active="active"
											class="sidenav-dropdown-menu-btn"
											ui-sref="app.portal.data.price-history"
										>
											<span class="side-nav-title">Prices</span>
											<span class="md-visually-hidden" data-ng-if="isSelected()"
												>current page</span
											>
										</md-button>
									</li>
									<li data-ng-if="vm.accessTable.data_price_history">
										<md-button
											ui-sref-active="active"
											class="sidenav-dropdown-menu-btn"
											ui-sref="app.portal.data.price-history-error"
										>
											<span class="side-nav-title">Prices Journal</span>
											<span class="md-visually-hidden" data-ng-if="isSelected()"
												>current page</span
											>
										</md-button>
									</li>
									<li data-ng-if="vm.accessTable.data_fx_history">
										<md-button
											ui-sref-active="active"
											class="sidenav-dropdown-menu-btn"
											ui-sref="app.portal.data.currency-history"
										>
											<span class="side-nav-title">FX Rates</span>
											<span class="md-visually-hidden" data-ng-if="isSelected()"
												>current page</span
											>
										</md-button>
									</li>
									<li data-ng-if="vm.accessTable.data_fx_history">
										<md-button
											ui-sref-active="active"
											class="sidenav-dropdown-menu-btn"
											ui-sref="app.portal.data.currency-history-error"
										>
											<span class="side-nav-title">FX Rates Journal</span>
											<span class="md-visually-hidden" data-ng-if="isSelected()"
												>current page</span
											>
										</md-button>
									</li>
									<li>
										<md-button
											ui-sref-active="active"
											class="sidenav-dropdown-menu-btn"
											ui-sref="app.portal.run-pricing-procedure"
										>
											<span class="side-nav-title">Run Pricing</span>
											<span class="md-visually-hidden" data-ng-if="isSelected()"
												>current page</span
											>
										</md-button>
									</li>
									<li>
										<md-button
											ui-sref-active="active"
											class="sidenav-dropdown-menu-btn"
											ui-sref="app.portal.pricing-parent-procedure"
										>
											<span class="side-nav-title">Procedures status</span>
											<span class="md-visually-hidden" data-ng-if="isSelected()"
												>current page</span
											>
										</md-button>
									</li>
								</ul>
							</div>
						</li>

						<li data-ng-if="vm.accessSectionTable.import">
							<div
								class="sidenav-dropdown-menu-wrapper"
								sidenav-dropdown-menu
								menu-type="import"
							>
								<md-button class="sidemenu-btn import-sidenav-menu-btn">
									<span class="side-nav-icon">
										<ng-md-icon icon="file_download" size="24"></ng-md-icon>
									</span>
									<span class="side-nav-title">Import</span>
									<!--<span class="md-visually-hidden" data-ng-if="isSelected()">current page</span>-->
								</md-button>

								<ul
									class="sidenav-dropdown-menu import-dropdown-menu-element ng-hide"
								>
									<li data-ng-if="vm.accessTable.data_simple_import">
										<md-button
											ui-sref-active="active"
											class="sidenav-dropdown-menu-btn two-line-text"
											ui-sref="app.portal.import.simple-entity"
										>
											<span class="side-nav-title">
												Data<br />
												(from file)
											</span>
											<span class="md-visually-hidden" data-ng-if="isSelected()"
												>current page</span
											>
										</md-button>
									</li>
									<li data-ng-if="vm.accessTable.data_simple_import">
										<md-button
											ui-sref-active="active"
											class="sidenav-dropdown-menu-btn two-line-text"
											ui-sref="app.portal.import.unified-entity"
										>
											<span class="side-nav-title">
												Instrument<br />
												(from file)
											</span>
											<span class="md-visually-hidden" data-ng-if="isSelected()"
												>current page</span
											>
										</md-button>
									</li>
									<li data-ng-if="vm.accessTable.data_transaction_import">
										<md-button
											ui-sref-active="active"
											class="sidenav-dropdown-menu-btn two-line-text"
											ui-sref="app.portal.import.transaction"
										>
											<span class="side-nav-title">
												Transactions<br />
												(from file)
											</span>
											<span class="md-visually-hidden" data-ng-if="isSelected()"
												>current page</span
											>
										</md-button>
									</li>
									<li data-ng-if="vm.accessTable.data_complex_import">
										<md-button
											ui-sref-active="active"
											class="sidenav-dropdown-menu-btn two-line-text"
											ui-sref="app.portal.import.complex-import"
										>
											<span class="side-nav-title">
												Data and Transactions<br />
												(from file)
											</span>
											<span class="md-visually-hidden" data-ng-if="isSelected()"
												>current page</span
											>
										</md-button>
									</li>
									<li data-ng-if="vm.accessTable.data_instrument_download">
										<md-button
											ui-sref-active="active"
											class="sidenav-dropdown-menu-btn two-line-text"
											ui-sref="app.portal.import.instrument"
										>
											<span class="side-nav-title">
												Instrument<br />
												(from provider)
											</span>
											<span class="md-visually-hidden" data-ng-if="isSelected()"
												>current page</span
											>
										</md-button>
									</li>
									<li data-ng-if="vm.accessTable.data_instrument_download">
										<md-button
											ui-sref-active="active"
											class="sidenav-dropdown-menu-btn two-line-text"
											ui-sref="app.portal.import.instrument-cbonds"
										>
											<span class="side-nav-title">
												Instrument<br />
												(from CBONDS)
											</span>
											<span class="md-visually-hidden" data-ng-if="isSelected()"
												>current page</span
											>
										</md-button>
									</li>
									<li data-ng-if="vm.accessTable.data_prices_download">
										<md-button
											ui-sref-active="active"
											class="sidenav-dropdown-menu-btn two-line-text"
											ui-sref="app.portal.import.prices"
										>
											<span class="side-nav-title">
												Prices/FX<br />
												(from provider)
											</span>
											<span class="md-visually-hidden" data-ng-if="isSelected()"
												>current page</span
											>
										</md-button>
									</li>
									<li>
										<md-button
											ui-sref-active="active"
											class="sidenav-dropdown-menu-btn"
											ui-sref="app.portal.run-data-procedure"
										>
											<span class="side-nav-title">Import From Bank</span>
											<span class="md-visually-hidden" data-ng-if="isSelected()"
												>current page</span
											>
										</md-button>
									</li>
								</ul>
							</div>
						</li>

						<li data-ng-if="vm.accessTable.report_forum">
							<md-button
								class="sidemenu-btn"
								ui-sref-active="active"
								ui-sref="app.forum.thread-groups"
							>
								<span class="side-nav-icon">
									<ng-md-icon icon="forum" size="24"></ng-md-icon>
								</span>
								<span class="side-nav-title">Forum</span>
								<!--<span class="md-visually-hidden" data-ng-if="isSelected()">current page</span>-->
							</md-button>
						</li>
					</ul>
				</div>

				<div class="side-menu-bottom-menu side-menu-main-buttons">
					<ul class="side-menu" data-ng-if="vm.readyStatus.access">
						<li>
							<md-button
								ui-sref="app.portal.developer-panel"
								class="sidemenu-btn"
							>
								<span class="side-nav-icon">
									<ng-md-icon icon="developer_dashboard" size="24"></ng-md-icon>
								</span>
								<span class="side-nav-title">Dev Panel</span>
							</md-button>
						</li>

						<li>
							<md-button
								ui-sref-active="active"
								class="sidemenu-btn"
								ng-click="vm.openHelp($event)"
							>
								<span class="side-nav-icon">
									<ng-md-icon icon="local_library" size="24"></ng-md-icon>
								</span>
								<span class="side-nav-title">Help</span>
							</md-button>
						</li>

						<li data-ng-if="vm.accessSectionTable.journal">
							<div
								class="sidenav-dropdown-menu-wrapper"
								sidenav-dropdown-menu
								menu-type="journal"
							>
								<md-button class="sidemenu-btn journal-sidenav-menu-btn">
									<span class="side-nav-icon">
										<ng-md-icon icon="book" size="24"></ng-md-icon>
									</span>
									<span class="side-nav-title">Journal</span>
									<!--<span class="md-visually-hidden" data-ng-if="isSelected()">current page</span>-->
								</md-button>

								<ul
									class="sidenav-dropdown-menu open-upward journal-dropdown-menu-element ng-hide"
								>
									<li data-ng-if="vm.accessTable.report_instrument_audit">
										<md-button
											class="sidenav-dropdown-menu-btn"
											ui-sref="app.portal.data.instruments"
										>
											<span class="side-nav-title">Instruments Audit</span>
											<span class="md-visually-hidden" data-ng-if="isSelected()"
												>current page</span
											>
										</md-button>
									</li>
									<li data-ng-if="vm.accessTable.report_transaction_audit">
										<md-button
											class="sidenav-dropdown-menu-btn"
											ui-sref="app.portal.data.transactions"
										>
											<span class="side-nav-title">Transactions Audit</span>
											<span class="md-visually-hidden" data-ng-if="isSelected()"
												>current page</span
											>
										</md-button>
									</li>
									<li data-ng-if="vm.accessTable.report_activity_log">
										<md-button
											class="sidenav-dropdown-menu-btn"
											ui-sref="#"
											disabled
										>
											<span class="side-nav-title">Activity Log</span>
											<span class="md-visually-hidden" data-ng-if="isSelected()"
												>current page</span
											>
										</md-button>
									</li>
									<li data-ng-if="vm.accessTable.report_activity_log">
										<md-button
											class="sidenav-dropdown-menu-btn"
											ui-sref="app.portal.system.file-reports"
										>
											<span class="side-nav-title">System Files</span>
											<span class="md-visually-hidden" data-ng-if="isSelected()"
												>current page</span
											>
										</md-button>
									</li>
								</ul>
							</div>
						</li>

						<li>
							<md-button
								class="sidemenu-btn sidenav-settings-toggle-btn"
								aria-label="toggle settings side menu"
								data-ng-click="vm.toggleSettingsSideMenu()"
							>
								<span class="side-nav-icon">
									<ng-md-icon icon="settings" size="24"></ng-md-icon>
								</span>
								<span class="side-nav-title">Settings</span>
								<!--<span class="md-visually-hidden" data-ng-if="isSelected()">current page</span>-->
							</md-button>
						</li>
					</ul>
				</div>

				<div class="side-menu-settings-container side-menu-settings-menu">
					<div class="side-menu-settings-wrapper">
						<div class="settings-menu-collapse-button-holder">
							<md-button
								aria-label="toggle settings side menu"
								class="to-small-btn side-nav-btn fab md-raised"
								data-ng-click="vm.toggleSettingsSideMenu()"
							>
								<ng-md-icon icon="chevron_left"></ng-md-icon>
							</md-button>
						</div>

						<div class="side-menu-group-btn-container border-top-none">
							<h3 class="sms-btn-group-header">Interface</h3>
							<ul class="side-menu">
								<!--                            <li data-ng-if="vm.accessTable.report_dashboard">-->
								<!--                                <md-button class="sidemenu-btn"-->
								<!--                                           ui-sref="app.portal.dashboard-layout-manager">-->
								<!--                                    <span class="side-nav-title">Dashboard Layouts</span>-->
								<!--                                    &lt;!&ndash;<span class="md-visually-hidden" data-ng-if="isSelected()">current page</span>&ndash;&gt;-->
								<!--                                </md-button>-->
								<!--                            </li>-->
								<!--                            <li>-->
								<!--                                <md-button class="sidemenu-btn"-->
								<!--                                           ui-sref="app.portal.settings.forms">-->
								<!--                                    <span class="side-nav-title">Forms</span>-->
								<!--                                    &lt;!&ndash;<span class="md-visually-hidden" data-ng-if="isSelected()">current page</span>&ndash;&gt;-->
								<!--                                </md-button>-->
								<!--                            </li>-->
								<li>
									<div
										class="sidenav-dropdown-menu-wrapper"
										sidenav-dropdown-menu
										menu-type="dataTypes"
									>
										<md-button class="sidemenu-btn dataTypes-sidenav-menu-btn">
											<span class="side-nav-title">Layouts</span>
											<!--<span class="md-visually-hidden" data-ng-if="isSelected()">current page</span>-->
										</md-button>

										<ul
											class="sidenav-dropdown-menu dataTypes-dropdown-menu-element ng-hide"
										>
											<li>
												<md-button
													class="sidenav-dropdown-menu-btn"
													ui-sref="app.portal.settings.layouts"
												>
													<span class="side-nav-title"
														>Entity Viewer Layouts</span
													>
													<span
														class="md-visually-hidden"
														data-ng-if="isSelected()"
														>current page</span
													>
												</md-button>
											</li>
											<li>
												<md-button
													class="sidenav-dropdown-menu-btn"
													ui-sref="app.portal.dashboard-layout-manager"
												>
													<span class="side-nav-title">Dashboard Layouts</span>
													<span
														class="md-visually-hidden"
														data-ng-if="isSelected()"
														>current page</span
													>
												</md-button>
											</li>
											<li>
												<md-button
													class="sidenav-dropdown-menu-btn"
													ui-sref="app.portal.settings.input-form-layouts"
												>
													<span class="side-nav-title">Input Form Layouts</span>
													<span
														class="md-visually-hidden"
														data-ng-if="isSelected()"
														>current page</span
													>
												</md-button>
											</li>
											<li>
												<md-button
													class="sidenav-dropdown-menu-btn"
													ui-sref="app.portal.context-menu-layout-manager"
												>
													<span class="side-nav-title"
														>Context Menu Layouts</span
													>
													<span
														class="md-visually-hidden"
														data-ng-if="isSelected()"
														>current page</span
													>
												</md-button>
											</li>

											<li>
												<md-button
													class="sidenav-dropdown-menu-btn"
													ui-sref="app.portal.manual-sorting-layout-manager"
												>
													<span class="side-nav-title">Manual Sorting</span>
													<span
														class="md-visually-hidden"
														data-ng-if="isSelected()"
														>current page</span
													>
												</md-button>
											</li>
										</ul>
									</div>
								</li>

								<li>
									<md-button
										class="sidemenu-btn"
										ui-sref="app.portal.settings.notifications"
									>
										<span class="side-nav-title">Notifications</span>
										<!--<span class="md-visually-hidden" data-ng-if="isSelected()">current page</span>-->
									</md-button>
								</li>
								<li>
									<md-button
										class="sidemenu-btn"
										ui-sref="app.portal.settings.interface-access"
									>
										<span class="side-nav-title">Interface Complexity</span>
										<!--<span class="md-visually-hidden" data-ng-if="isSelected()">current page</span>-->
									</md-button>
								</li>
							</ul>
						</div>

						<div
							class="side-menu-group-btn-container side-menu-settings-border-top-1"
						>
							<h3 class="sms-btn-group-header">Configuration</h3>
							<ul class="side-menu">
								<li data-ng-if="vm.accessSectionTable.settings_data">
									<div
										class="sidenav-dropdown-menu-wrapper"
										sidenav-dropdown-menu
										menu-type="dataTypes"
									>
										<md-button class="sidemenu-btn dataTypes-sidenav-menu-btn">
											<span class="side-nav-title">Data Settings</span>
											<!--<span class="md-visually-hidden" data-ng-if="isSelected()">current page</span>-->
										</md-button>

										<ul
											class="sidenav-dropdown-menu dataTypes-dropdown-menu-element ng-hide"
										>
											<li
												data-ng-if="vm.accessTable.configuration_account_type"
											>
												<md-button
													class="sidenav-dropdown-menu-btn"
													ui-sref="app.portal.data.account-type"
												>
													<span class="side-nav-title">Account Types</span>
													<span
														class="md-visually-hidden"
														data-ng-if="isSelected()"
														>current page</span
													>
												</md-button>
											</li>
											<li
												data-ng-if="vm.accessTable.configuration_instrument_type"
											>
												<md-button
													class="sidenav-dropdown-menu-btn"
													ui-sref="app.portal.data.instrument-type"
												>
													<span class="side-nav-title">Instrument Types</span>
													<span
														class="md-visually-hidden"
														data-ng-if="isSelected()"
														>current page</span
													>
												</md-button>
											</li>
											<li
												data-ng-if="vm.accessTable.configuration_transaction_type"
											>
												<md-button
													class="sidenav-dropdown-menu-btn"
													ui-sref="app.portal.data.transaction-type"
												>
													<span class="side-nav-title">Transaction Types</span>
													<span
														class="md-visually-hidden"
														data-ng-if="isSelected()"
														>current page</span
													>
												</md-button>
											</li>
											<!-- <li data-ng-if="vm.accessTable.configuration_pricing_policy">
                                            <md-button class="sidenav-dropdown-menu-btn"
                                                       ui-sref="app.portal.data.pricing-policy">
                                                <span class="side-nav-title">Pricing Policies</span>
                                                <span class="md-visually-hidden"
                                                      data-ng-if="isSelected()">current page</span>
                                            </md-button>
                                        </li> -->
											<li
												data-ng-if="vm.accessTable.configuration_user_attributes"
											>
												<md-button
													class="sidenav-dropdown-menu-btn"
													ui-sref="app.portal.settings.entities-custom-attributes"
												>
													<span class="side-nav-title">User Attributes</span>
													<span
														class="md-visually-hidden"
														data-ng-if="isSelected()"
														>current page</span
													>
												</md-button>
											</li>

											<li
												data-ng-if="vm.accessTable.configuration_reference_table"
											>
												<md-button
													ui-sref-active="active"
													class="sidenav-dropdown-menu-btn"
													ui-sref="app.portal.import.reference-tables"
												>
													<span class="side-nav-title">Reference Tables</span>
													<span
														class="md-visually-hidden"
														data-ng-if="isSelected()"
														>current page</span
													>
												</md-button>
											</li>

											<li
												data-ng-if="vm.accessTable.configuration_mapping_tables"
											>
												<md-button
													ui-sref-active="active"
													class="sidenav-dropdown-menu-btn"
													ui-sref="app.portal.import.mapping-tables"
												>
													<span class="side-nav-title"> Mapping Tables </span>
													<span
														class="md-visually-hidden"
														data-ng-if="isSelected()"
														>current page</span
													>
												</md-button>
											</li>

											<li data-ng-if="vm.accessTable.configuration_template">
												<md-button
													class="sidenav-dropdown-menu-btn"
													ui-sref="app.portal.template-layout-manager"
												>
													<span class="side-nav-title">Templates</span>
													<!--<span class="md-visually-hidden" data-ng-if="isSelected()">current page</span>-->
												</md-button>
											</li>
										</ul>
									</div>
								</li>

								<li>
									<div
										class="sidenav-dropdown-menu-wrapper"
										sidenav-dropdown-menu
										menu-type="dataTypes"
									>
										<md-button class="sidemenu-btn dataTypes-sidenav-menu-btn">
											<span class="side-nav-title">Pricing</span>
											<!--<span class="md-visually-hidden" data-ng-if="isSelected()">current page</span>-->
										</md-button>

										<ul
											class="sidenav-dropdown-menu dataTypes-dropdown-menu-element ng-hide"
										>
											<li>
												<md-button
													class="sidenav-dropdown-menu-btn"
													ui-sref="app.portal.pricing-schemes"
												>
													<span class="side-nav-title">Schemes</span>
													<span
														class="md-visually-hidden"
														data-ng-if="isSelected()"
														>current page</span
													>
												</md-button>
											</li>
											<li>
												<md-button
													class="sidenav-dropdown-menu-btn"
													ui-sref="app.portal.pricing-policy"
												>
													<span class="side-nav-title">Policies</span>
													<span
														class="md-visually-hidden"
														data-ng-if="isSelected()"
														>current page</span
													>
												</md-button>
											</li>
										</ul>
									</div>
								</li>

								<li
									data-ng-if="vm.accessSectionTable.settings_import_from_providers"
								>
									<div
										class="sidenav-dropdown-menu-wrapper"
										sidenav-dropdown-menu
										menu-type="dataTypes"
									>
										<md-button class="sidemenu-btn dataTypes-sidenav-menu-btn">
											<span class="side-nav-title">Import from Providers</span>
											<!--<span class="md-visually-hidden" data-ng-if="isSelected()">current page</span>-->
										</md-button>

										<ul
											class="sidenav-dropdown-menu dataTypes-dropdown-menu-element ng-hide"
										>
											<li
												data-ng-if="vm.accessTable.configuration_price_download_scheme"
											>
												<md-button
													class="sidenav-dropdown-menu-btn"
													ui-sref="app.portal.settings.price-download-scheme"
												>
													<span class="side-nav-title">Price Schemes</span>
													<span
														class="md-visually-hidden"
														data-ng-if="isSelected()"
														>current page</span
													>
												</md-button>
											</li>
											<li
												data-ng-if="vm.accessTable.configuration_instrument_download_scheme"
											>
												<md-button
													class="sidenav-dropdown-menu-btn"
													ui-sref="app.portal.settings.instrument-import"
												>
													<span class="side-nav-title">Instrument Schemes</span>
													<span
														class="md-visually-hidden"
														data-ng-if="isSelected()"
														>current page</span
													>
												</md-button>
											</li>
										</ul>
									</div>
								</li>

								<li
									data-ng-if="vm.accessSectionTable.settings_import_from_files"
								>
									<div
										class="sidenav-dropdown-menu-wrapper"
										sidenav-dropdown-menu
										menu-type="dataTypes"
									>
										<md-button class="sidemenu-btn dataTypes-sidenav-menu-btn">
											<span class="side-nav-title">Import from Files</span>
											<!--<span class="md-visually-hidden" data-ng-if="isSelected()">current page</span>-->
										</md-button>

										<ul
											class="sidenav-dropdown-menu dataTypes-dropdown-menu-element ng-hide"
										>
											<li
												data-ng-if="vm.accessTable.configuration_simple_import_scheme"
											>
												<md-button
													ui-sref-active="active"
													class="sidenav-dropdown-menu-btn"
													ui-sref="app.portal.settings.simple-entity-import"
												>
													<span class="side-nav-title">Data Import</span>
													<span
														class="md-visually-hidden"
														data-ng-if="isSelected()"
														>current page</span
													>
												</md-button>
											</li>
											<li
												data-ng-if="vm.accessTable.configuration_transaction_import_scheme"
											>
												<md-button
													ui-sref-active="active"
													class="sidenav-dropdown-menu-btn"
													ui-sref="app.portal.settings.transaction-import"
												>
													<span class="side-nav-title"
														>Transactions Import</span
													>
													<span
														class="md-visually-hidden"
														data-ng-if="isSelected()"
														>current page</span
													>
												</md-button>
											</li>
											<li
												data-ng-if="vm.accessTable.configuration_complex_import_scheme"
											>
												<md-button
													ui-sref-active="active"
													class="sidenav-dropdown-menu-btn"
													ui-sref="app.portal.settings.complex-import"
												>
													<span class="side-nav-title">Complex Import</span>
													<span
														class="md-visually-hidden"
														data-ng-if="isSelected()"
														>current page</span
													>
												</md-button>
											</li>
										</ul>
									</div>
								</li>

								<li>
									<div
										class="sidenav-dropdown-menu-wrapper"
										sidenav-dropdown-menu
										menu-type="dataTypes"
									>
										<md-button
											class="sidemenu-btn dataTypes-sidenav-menu-btn f-s-10"
										>
											<span class="side-nav-title"
												>Procedures and schedules</span
											>
											<!--<span class="md-visually-hidden" data-ng-if="isSelected()">current page</span>-->
										</md-button>

										<ul
											class="sidenav-dropdown-menu dataTypes-dropdown-menu-element ng-hide"
										>
											<li>
												<md-button
													class="sidenav-dropdown-menu-btn"
													ui-sref="app.portal.pricing-procedure"
												>
													<span class="side-nav-title">Pricing Procedures</span>
													<span
														class="md-visually-hidden"
														data-ng-if="isSelected()"
														>current page</span
													>
												</md-button>
											</li>
											<li>
												<md-button
													class="sidenav-dropdown-menu-btn"
													ui-sref="app.portal.data-procedure"
												>
													<span class="side-nav-title">Data Procedures</span>
													<span
														class="md-visually-hidden"
														data-ng-if="isSelected()"
														>current page</span
													>
												</md-button>
											</li>
											<li>
												<md-button
													class="sidenav-dropdown-menu-btn"
													ui-sref="app.portal.schedules"
												>
													<span class="side-nav-title">Schedules</span>
													<span
														class="md-visually-hidden"
														data-ng-if="isSelected()"
														>current page</span
													>
												</md-button>
											</li>
										</ul>
									</div>
								</li>

								<li>
									<!--<md-button class="sidemenu-btn"
                                           ui-sref="app.portal.settings.template-fields">
                                    <span class="side-nav-title">Aliases</span>
                                </md-button>-->
									<div
										class="sidenav-dropdown-menu-wrapper"
										sidenav-dropdown-menu
										menu-type="dataTypes"
									>
										<md-button class="sidemenu-btn dataTypes-sidenav-menu-btn">
											<span class="side-nav-title">Specifications</span>
											<!--<span class="md-visually-hidden" data-ng-if="isSelected()">current page</span>-->
										</md-button>

										<ul
											class="sidenav-dropdown-menu dataTypes-dropdown-menu-element ng-hide"
										>
											<li data-ng-if="vm.accessTable.configuration_aliases">
												<md-button
													ui-sref-active="active"
													class="sidenav-dropdown-menu-btn"
													ui-sref="app.portal.settings.template-fields"
												>
													<span class="side-nav-title">Aliases</span>
													<span
														class="md-visually-hidden"
														data-ng-if="isSelected()"
														>current page</span
													>
												</md-button>
											</li>

											<li>
												<md-button
													ui-sref-active="active"
													class="sidenav-dropdown-menu-btn"
													ui-sref="app.portal.settings.tooltips"
												>
													<span class="side-nav-title">Tooltips</span>
													<span
														class="md-visually-hidden"
														data-ng-if="isSelected()"
														>current page</span
													>
												</md-button>
											</li>

											<li>
												<md-button
													ui-sref-active="active"
													class="sidenav-dropdown-menu-btn"
													ui-sref="app.portal.settings.color-palettes"
												>
													<span class="side-nav-title">Palettes</span>
													<span
														class="md-visually-hidden"
														data-ng-if="isSelected()"
														>current page</span
													>
												</md-button>
											</li>

											<li>
												<md-button
													ui-sref-active="active"
													class="sidenav-dropdown-menu-btn"
													ui-sref="app.portal.settings.cross-entity-attribute-extensions"
												>
													<span class="side-nav-title">Reports</span>
													<span
														class="md-visually-hidden"
														data-ng-if="isSelected()"
														>current page</span
													>
												</md-button>
											</li>
										</ul>
									</div>
								</li>

								<li>
									<div
										class="sidenav-dropdown-menu-wrapper"
										sidenav-dropdown-menu
										menu-type="configuration"
									>
										<md-button
											class="sidemenu-btn configuration-sidenav-menu-btn"
										>
											<span class="side-nav-title">Configuration</span>
											<!--<span class="md-visually-hidden" data-ng-if="isSelected()">current page</span>-->
										</md-button>

										<ul
											class="sidenav-dropdown-menu configuration-dropdown-menu-element ng-hide"
										>
											<li
												data-ng-if="vm.accessTable.settings_import_configuration"
											>
												<md-button
													class="sidenav-dropdown-menu-btn"
													ui-sref="app.portal.settings.import-configuration"
												>
													<span class="side-nav-title">Import</span>
													<span
														class="md-visually-hidden"
														data-ng-if="isSelected()"
														>current page</span
													>
												</md-button>
											</li>
											<li
												data-ng-if="vm.accessTable.settings_export_configuration"
											>
												<md-button
													class="sidenav-dropdown-menu-btn"
													ui-sref="app.portal.settings.export-configuration"
												>
													<span class="side-nav-title">Export</span>
													<span
														class="md-visually-hidden"
														data-ng-if="isSelected()"
														>current page</span
													>
												</md-button>
											</li>
											<li>
												<md-button
													class="sidenav-dropdown-menu-btn"
													ui-sref="app.portal.update-configuration"
												>
													<span class="side-nav-title">Update</span>
													<span
														class="md-visually-hidden"
														data-ng-if="isSelected()"
														>current page</span
													>
												</md-button>
											</li>
										</ul>
									</div>
								</li>
							</ul>
						</div>

						<div
							class="side-menu-group-btn-container side-menu-settings-border-top-1"
							data-ng-if="vm.accessSectionTable.settings_administration && vm.member.is_admin"
						>
							<h3 class="sms-btn-group-header">Administration</h3>
							<ul class="side-menu">
								<li data-ng-if="vm.accessTable.settings_provider">
									<md-button
										class="sidemenu-btn"
										ui-sref="app.portal.settings.data-providers"
									>
										<span class="side-nav-title">Data providers</span>
										<!--<span class="md-visually-hidden" data-ng-if="isSelected()">current page</span>-->
									</md-button>
								</li>
								<li data-ng-if="vm.accessTable.settings_init_configuration">
									<md-button
										class="sidemenu-btn"
										ui-sref="app.portal.settings.init-configuration"
									>
										<span class="side-nav-title">New User Setups</span>
										<!--<span class="md-visually-hidden" data-ng-if="isSelected()">current page</span>-->
									</md-button>
								</li>
								<li
									data-ng-if="vm.accessTable.settings_users_groups_permission"
								>
									<md-button
										class="sidemenu-btn"
										ui-sref="app.portal.settings.users-groups"
									>
										<span class="side-nav-title">Permissions</span>
										<!--<span class="md-visually-hidden" data-ng-if="isSelected()">current page</span>-->
									</md-button>
								</li>
								<li data-ng-if="vm.accessTable.settings_ecosystem_default">
									<md-button
										class="sidemenu-btn"
										ui-sref="app.portal.settings.ecosystem-default-settings"
									>
										<span class="side-nav-title">Default Settings</span>
										<!--<span class="md-visually-hidden" data-ng-if="isSelected()">current page</span>-->
									</md-button>
								</li>
								<li>
									<md-button class="sidemenu-btn" ui-sref="#" disabled>
										<span class="side-nav-title">Security</span>
										<!--<span class="md-visually-hidden" data-ng-if="isSelected()">current page</span>-->
									</md-button>
								</li>
								<li>
									<md-button
										class="sidemenu-btn"
										ui-sref="app.portal.processes"
									>
										<span class="side-nav-title">Active Processes</span>
										<!--<span class="md-visually-hidden" data-ng-if="isSelected()">current page</span>-->
									</md-button>
								</li>
							</ul>
						</div>
					</div>
				</div>
			</div>
		</div>
	</md-sidenav>
</template>

<style lang="scss" scoped>

body {
  font-family: 'Roboto-Regular', 'Roboto', sans-serif;
}

h2 {
  font-weight: 400;
}

.z-index-2 {
  z-index: 2;
}


button {
  background-color: transparent;
  border: none;

  &:focus {
    outline: none;
  }
}

md-content.md-default-theme {
  background-color: #eee;
}

.md-select-menu-container.md-active md-select-menu {
  background: #fff;
}

.md-button.md-fab {
  height: 38px;
  width: 38px;
}

md-card {
  background-color: #fff;

  h2:first-of-type {
    margin-top: 0;
  }
}

md-content {
  background: transparent;
}

.side-menu-container {
  display: block;
  position: absolute;
  overflow: visible;
  height: 100%;
  width: 100%;

  .md-button[disabled] {
    color: #fff;
    opacity: 0.5;
  }
}

@media (max-width: 959px) and (min-width: 0) and (orientation: portrait) {
  md-toolbar {
    min-height: 52px;
  }
}

md-toolbar.md-default-theme:not(.md-menu-toolbar),
md-toolbar:not(.md-menu-toolbar) {
  //background-color: #4c334d;
  background: #f2f2f2;
}


md-toolbar.md-default-theme:not(.md-menu-toolbar), md-toolbar:not(.md-menu-toolbar) {
  color: #747474;
}

md-toolbar.header {
  position: relative;
  // z-index: 98;
  // padding-left: 160px;
  //background-color: #4c334d;
  //background-color: #000;
  z-index: 51;
  background: #f2f2f2;
  min-height: 53px;
  height: 53px;
  max-height: 53px;
  border-bottom: 1px solid #eee;
  box-sizing: border-box;
  color: #747474;

  .toolbar-wrapper {
    // height: 53px; // 1px for border;
    height: 100%;
    color: #747474;
    fill: #747474;
    // border-bottom: 1px solid rgba(224, 224, 224, 1);
  }

  .md-toolbar-tools {
    min-height: 52px;
    height: 52px;
    background-color: rgba(242, 242, 242, 1);

    .current-location-title {
      text-transform: capitalize;
      font-family: 'Roboto-Medium', 'Roboto Medium', 'Roboto', sans-serif;
      font-weight: 500;
      font-style: normal;
      letter-spacing: 0.4px;
      color: #747474;
      font-size: 14px;
    }
  }

  .header-breadcrumbs {
    margin: 0;
    padding-left: 11px;
    font-size: 14px;
    font-weight: 600;
  }

  .md-button.md-default-theme {
    border-radius: 99%; // round toolbar buttons
  }

}

.portal-header {
  display: block;
  flex: 0 0 53px;

  md-toolbar.header {
    padding-left: 10px;
  }
}

.md-toolbar-tools-bottom {
  font-size: small;

  & :last-child {
    opacity: 0.8;
  }
}

md-toolbar:not(.md-hue-1),
.md-fab {
  fill: #fff;
}


.md-toolbar-tools {
  position: relative;
  background-color: #fff;
  color: #747474;
}

md-sidenav {
  width: 100%;
  fill: #737373;
  overflow: visible;

  font-family: 'Roboto-Regular', 'Roboto', sans-serif;
  font-weight: 400;
  font-style: normal;
  font-size: 12px;

  a {
    color: #fff;
  }

  color: #fff;

  .md-button {
    color: #fff;
  }

  md-toolbar {
    min-height: 52px;
    height: 52px;
  }

  .md-toolbar-tools {
    //background-color: #3b283b;
    min-height: 52px;
    height: 52px;
    background-color: #000;
    padding: 0;
  }

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
  width: 12px;
  height: 100%;
  top: 0;
  left: 0;
  z-index: 51;

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

  /* Fixes for old sidemenu styles */
  /*overflow: hidden;

  menu-toggle {
    ul {
      padding-left: 0;

      .sidemenu-btn {
        padding-left: 61px;

        &.active {
          background: rgba(255, 255, 255, .1);
        }
      }

      menu-toggle {
        ul {
          li {
            padding-left: 20px;
          }
        }
      }

      ul {
        .sidemenu-btn {
          padding-left: 81px;
        }
      }
    }
  }

  span.side-nav-title {
    position: relative;
    top: -4px;
  }

  .sidemenu-btn {
    height: 30px;
    min-height: 30px;
    font-size: 11px;
    line-height: 39px;
  }

  .side-nav-icon {
    position: static;
    fill: #fff;
    margin-right: 20px;
    display: inline-block;
  }*/

  /* < Fixes for old sidemenu styles > */

  transition: width ease 0.25s;
}

.side-menu {
  width: 100%;
  padding-left: 0;
}

/* Old sidemenu styles */
/*.sidemenu-btn {
  width: 100%;
  display: block;
  text-align: left;
  padding-left: 1em;
  margin-left: 0;

  .dropdown-icon {
    float: right;
    fill: #fff;
  }
}*/

/* < Old sidemenu styles > */

/* New sidemenu styles */
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

/* < New sidemenu styles > */


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
  left: 200px;
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

  //<editor-fold desc="New sidemenu styles">
  .space-for-sidenav {
    padding-left: 40px;
  }

  .g-table-dial {
    left: 80px;
  }

  //.bookmarks-list {
  //  padding-left: 80px;
  //}

  .sidenav-logo-wrapper {
    width: 40px;
  }

  .sidenav-wrapper {
    width: 40px;
  }

  .side-nav-btn-resize-holder {
    position: absolute;
    right: -12px;
  }

  .side-menu-settings-container {
    left: 40px;
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
    width: 40px;
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
    padding-left: 40px;
  }

  //</editor-fold>

  //<editor-fold desc="Old sidemenu styles">
  /*.sidenav-wrapper {
    width: 55px;
    position: absolute;
    height: 100%;
    left: 0;
    // z-index: 11000;
    z-index: 1;
    overflow: hidden;
  }

  .app-md-content {
    padding-left: 55px;
  }

  md-toolbar.header {
    padding-left: 70px;
  }

  .g-table-dial {
    left: 70px;
  }*/
  //</editor-fold>
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

button.md-raised.md-button.colored-btn {
  //background: rgb(255, 238, 232);
  background-color: rgb(255, 238, 232);
}

md-select-header input {
  border: none;
  outline: none;
  height: 48px;
  width: 100%;
  padding: 0;
  padding-left: 5px;
}
.build-date {
  position: absolute;
  bottom: 0px;
  color: #eee;
  z-index: 100;
  font-size: 9px;
  text-align: center;
  margin: 16px;
  cursor: pointer;
}

.md-toolbar-tools .draggable-dialog-sign {
  top: 5px;
  left: 10px;
}
button.md-raised.md-warn.md-button {
  fill: #fff;
}
span.websocket-connection-status {
  display: block;
  width: 6px;
  height: 6px;
  background: white;
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
</style>
