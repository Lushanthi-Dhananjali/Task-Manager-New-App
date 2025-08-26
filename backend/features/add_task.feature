Feature: Manage tasks
  As a user
  I want to add and view tasks
  So that I can track my work

  Background:
    Given I am a registered user
    And I am logged in

  Scenario: Add a new task successfully
    When I add a task with title "Finish Assignment" and description "Include TDD, BDD"
    Then I should see a task titled "Finish Assignment" in my list

  Scenario: Reject short title
    When I try to add a task with title " a "
    Then I should get a 400 error
