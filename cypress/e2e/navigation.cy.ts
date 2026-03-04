describe('Navigation Drawer', () => {
  beforeEach(() => {
    cy.login()
  })

  it('should open navigation drawer with hamburger menu', () => {
    cy.visit('/curriculums')
    cy.get('[data-automation-id="nav-drawer-toggle"]').should('be.visible')
    cy.get('[data-automation-id="nav-drawer-toggle"]').click()
    
    // Check that drawer is visible with domain sections
    cy.contains('CURRICULUM DOMAIN').should('be.exist')
    cy.contains('RATING DOMAIN').should('be.exist')
    cy.contains('REVIEW DOMAIN').should('be.exist')
    cy.contains('EVENT DOMAIN').should('be.exist')
    cy.contains('RESOURCE DOMAIN').should('be.exist')
    cy.contains('PATH DOMAIN').should('be.exist')
  })
  it('should have all curriculum domain links in drawer', () => {
    cy.visit('/curriculums')
    cy.get('[data-automation-id="nav-drawer-toggle"]').click()
    
    cy.get('[data-automation-id="nav-curriculums-list-link"]').should('be.visible')
    cy.get('[data-automation-id="nav-curriculums-new-link"]').should('be.visible')
  })
  it('should have all rating domain links in drawer', () => {
    cy.visit('/ratings')
    cy.get('[data-automation-id="nav-drawer-toggle"]').click()
    
    cy.get('[data-automation-id="nav-ratings-list-link"]').should('be.visible')
    cy.get('[data-automation-id="nav-ratings-new-link"]').should('be.visible')
  })
  it('should have all review domain links in drawer', () => {
    cy.visit('/reviews')
    cy.get('[data-automation-id="nav-drawer-toggle"]').click()
    
    cy.get('[data-automation-id="nav-reviews-list-link"]').should('be.visible')
    cy.get('[data-automation-id="nav-reviews-new-link"]').should('be.visible')
  })
  it('should have all event domain links in drawer', () => {
    cy.visit('/curriculums')
    cy.get('[data-automation-id="nav-drawer-toggle"]').click()
    
    cy.get('[data-automation-id="nav-events-list-link"]').should('be.visible')
    cy.get('[data-automation-id="nav-events-new-link"]').should('be.visible')
  })
  it('should have resource domain link in drawer', () => {
    cy.visit('/curriculums')
    cy.get('[data-automation-id="nav-drawer-toggle"]').click()
    
    cy.get('[data-automation-id="nav-resources-list-link"]').should('be.visible')
  })
  it('should have path domain link in drawer', () => {
    cy.visit('/curriculums')
    cy.get('[data-automation-id="nav-drawer-toggle"]').click()
    
    cy.get('[data-automation-id="nav-paths-list-link"]').should('be.visible')
  })

  it('should have admin and logout at bottom of drawer', () => {
    // Login with admin role to see admin link
    cy.login(['admin'])
    cy.visit('/curriculums')
    cy.get('[data-automation-id="nav-drawer-toggle"]').click()
    
    // Admin and Logout should be visible in the drawer
    cy.get('[data-automation-id="nav-admin-link"]').should('be.visible')
    cy.get('[data-automation-id="nav-logout-link"]').should('be.visible')
  })

  it('should navigate to different pages from drawer', () => {
    cy.visit('/curriculums')
    cy.get('[data-automation-id="nav-drawer-toggle"]').click()
    
    cy.get('[data-automation-id="nav-events-list-link"]').click()
    cy.url().should('include', '/events')
  })

  it('should close drawer after navigation', () => {
    cy.visit('/curriculums')
    cy.get('[data-automation-id="nav-drawer-toggle"]').click()
    
    cy.get('[data-automation-id="nav-events-list-link"]').click()
    
    // Drawer should close after navigation (temporary drawer)
    cy.wait(500)
    cy.contains('CURRICULUM DOMAIN').should('not.be.visible')
  })
})