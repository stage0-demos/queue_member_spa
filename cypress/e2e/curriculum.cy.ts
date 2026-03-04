describe('Curriculum Domain', () => {
  beforeEach(() => {
    cy.login()
  })

  it('should display curriculums list page', () => {
    cy.visit('/curriculums')
    cy.get('h1').contains('Curriculums').should('be.visible')
    cy.get('[data-automation-id="curriculum-list-new-button"]').should('be.visible')
  })

  it('should navigate to new curriculum page', () => {
    cy.visit('/curriculums')
    cy.get('[data-automation-id="curriculum-list-new-button"]').click()
    cy.url().should('include', '/curriculums/new')
    cy.get('h1').contains('New Curriculum').should('be.visible')
  })

  it('should create a new curriculum', () => {
    cy.visit('/curriculums/new')
    
    const timestamp = Date.now()
    const itemName = `test-curriculum-${timestamp}`
    
    // Use automation IDs for reliable element selection
    cy.get('[data-automation-id="curriculum-new-name-input"]').type(itemName)
    cy.get('[data-automation-id="curriculum-new-description-input"]').type('Test description for Cypress')
    cy.get('[data-automation-id="curriculum-new-submit-button"]').click()
    
    // Should redirect to edit page after creation
    cy.url().should('include', '/curriculums/')
    cy.url().should('not.include', '/curriculums/new')
    
    // Verify the curriculum name is displayed on edit page
    cy.get('[data-automation-id="curriculum-edit-name-input"]').find('input').should('have.value', itemName)
  })

  it('should update a curriculum', () => {
    // First create a curriculum
    cy.visit('/curriculums/new')
    const timestamp = Date.now()
    const itemName = `test-curriculum-update-${timestamp}`
    const updatedName = `updated-curriculum-${timestamp}`
    
    cy.get('[data-automation-id="curriculum-new-name-input"]').type(itemName)
    cy.get('[data-automation-id="curriculum-new-description-input"]').type('Original description')
    cy.get('[data-automation-id="curriculum-new-submit-button"]').click()
    
    // Wait for redirect to edit page
    cy.url().should('include', '/curriculums/')
    
    // Update the name field (auto-save on blur)
    cy.get('[data-automation-id="curriculum-edit-name-input"]').find('input').clear().type(updatedName)
    cy.get('[data-automation-id="curriculum-edit-name-input"]').find('input').blur()
    
    // Wait for save to complete
    cy.wait(1000)
    
    // Verify the update was saved
    cy.get('[data-automation-id="curriculum-edit-name-input"]').find('input').should('have.value', updatedName)
    
    // Update description
    cy.get('[data-automation-id="curriculum-edit-description-input"]').find('textarea').clear().type('Updated description')
    cy.get('[data-automation-id="curriculum-edit-description-input"]').find('textarea').blur()
    cy.wait(1000)
    
    // Update status
    cy.get('[data-automation-id="curriculum-edit-status-select"]').click()
    cy.get('.v-list-item').contains('archived').click()
    cy.wait(1000)
    
    // Navigate back to list and verify the curriculum appears with updated name
    cy.get('[data-automation-id="curriculum-edit-back-button"]').click()
    cy.url().should('include', '/curriculums')
    
    // Search for the updated curriculum
    cy.get('[data-automation-id="curriculum-list-search"]').find('input').type(updatedName)
    // Wait for debounce (300ms) plus API call
    cy.wait(800)
    
    // Verify the curriculum appears in the search results
    cy.get('table').should('contain', updatedName)
    
    // Clear search and verify all curriculums are shown again
    cy.get('[data-automation-id="curriculum-list-search"]').find('input').clear()
    cy.wait(800)
    cy.get('table').should('exist')
  })

  it('should search for curriculums', () => {
    // First create a curriculum with a unique name
    cy.visit('/curriculums/new')
    const timestamp = Date.now()
    const itemName = `search-test-${timestamp}`
    
    cy.get('[data-automation-id="curriculum-new-name-input"]').type(itemName)
    cy.get('[data-automation-id="curriculum-new-description-input"]').type('Search test description')
    cy.get('[data-automation-id="curriculum-new-submit-button"]').click()
    cy.url().should('include', '/curriculums/')
    
    // Navigate to list page
    cy.visit('/curriculums')
    
    // Wait for initial load
    cy.get('table').should('exist')
    
    // Search for the curriculum
    cy.get('[data-automation-id="curriculum-list-search"]').find('input').type(itemName)
    // Wait for debounce (300ms) plus API call
    cy.wait(800)
    
    // Verify the search results contain the curriculum
    cy.get('table tbody').should('contain', itemName)
    
    // Clear search and verify all curriculums are shown again
    cy.get('[data-automation-id="curriculum-list-search"]').find('input').clear()
    cy.wait(800)
    cy.get('table').should('exist')
  })
})
