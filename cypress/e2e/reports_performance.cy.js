describe('Performance report', () => {
	beforeEach(() => {
		cy.setToken()
	})

  it('passes', () => {
    cy.visit('/reports/performance')
  })
})


