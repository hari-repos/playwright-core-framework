@epic("BackendAPI")
@story("UserService")
Feature: API Tests

  @severity("normal")
  Scenario: Fetch users and validate schema
    Given I fetch users with limit 5
    Then the response status should be 200
    And the response JSON schema should be valid

  @severity("normal")
  Scenario: Validate and parse XML payload
    When I validate and parse the following XML payload:
      """
      <?xml version="1.0" encoding="UTF-8"?>
      <response>
        <status>success</status>
        <data>
          <message>Hello from BDD XML API</message>
        </data>
      </response>
      """
    Then the XML status should be "success"
    And the XML message should be "Hello from BDD XML API"
