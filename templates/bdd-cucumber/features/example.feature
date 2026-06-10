@epic("WebInterface")
@story("HomepageNavigation")
Feature: Digital UI Tests

  @severity("critical")
  Scenario: Homepage has title
    Given I am on the Playwright homepage
    Then the title should contain "Playwright"
