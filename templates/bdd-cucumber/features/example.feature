Feature: Digital UI Tests

  Scenario: Homepage has title
    Given I am on the Playwright homepage
    Then the title should contain "Playwright"
