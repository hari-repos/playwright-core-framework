@epic("BackendAPI")
@story("UserService")
Feature: API Tests

  @severity("normal")
  Scenario: Fetch users from API
    Given I fetch users from page 2
    Then the response status should be 200
    And the response should contain users
