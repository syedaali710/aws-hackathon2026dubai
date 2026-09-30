# Requirements Document

## Introduction

This feature is a chat-style web frontend for the existing "Health Companion" (CareBridge UAE) AI agent, an AWS Bedrock AgentCore agent built with Strands (`AgentCoreProject/app/HealthAgent/main.py`). The Health Companion is a safety-first healthcare **navigation** agent that helps people gauge symptom urgency, review synthetic patient context and medications for risks, find a suitable provider, make a mock booking, and prepare a bilingual (English/Arabic) visit summary for a clinician. It explicitly does **not** diagnose, name conditions, prescribe, or give treatment advice.

The frontend is built with [shadcn/ui](https://ui.shadcn.com/) components. It provides a conversational interface where a user describes symptoms, receives urgency guidance, reviews provider options, confirms a mock booking, approves a consent-controlled care snapshot, and reads a bilingual clinician handoff. The frontend surfaces the agent's workflow-step activity events, prominently displays a persistent "not medical advice" disclaimer, and connects to the AgentCore backend either through a local development endpoint or the deployed AgentCore runtime.

The backend accepts an event with a `prompt` string and returns a JSON object of the form `{ "result": "<assistant text>" }`. The assistant text may contain workflow markers in the form `[ACTIVITY] <EVENT_NAME>` (for example `TRIAGE_GUIDANCE_RETRIEVED`, `PROVIDER_OPTIONS_FOUND`, `BOOKING_AWAITING_CONFIRMATION`, `MOCK_BOOKING_CONFIRMED`, `URGENT_ESCALATION_SHOWN`, `VISIT_SUMMARY_GENERATED`) and a bilingual handoff that includes an Arabic (right-to-left) section.

## Glossary

- **Frontend**: The shadcn/ui-based web chat application defined by this specification.
- **Chat_Interface**: The Frontend component that renders the conversation, the message input, and message send controls.
- **Backend_Client**: The Frontend module responsible for sending prompts to and receiving responses from the Health Companion backend.
- **Health_Companion**: The existing Bedrock AgentCore agent (CareBridge UAE) that the Frontend converses with.
- **AgentCore_Runtime**: The deployed Bedrock AgentCore runtime endpoint that hosts the Health Companion, invoked via the `invoke_agent_runtime` API.
- **Local_Dev_Endpoint**: The local development HTTP server started by `agentcore dev` at `http://0.0.0.0:8080`.
- **Session**: A single continuous conversation between the user and the Health_Companion, identified by a session identifier.
- **Session_Id**: The identifier the Backend_Client sends to the AgentCore_Runtime to associate turns of one Session; must be at least 33 characters.
- **Message**: A single conversational turn, either a user message or an agent message, displayed in the Chat_Interface.
- **Activity_Event**: A workflow-step marker emitted by the Health_Companion in the form `[ACTIVITY] <EVENT_NAME>`.
- **Activity_Timeline**: The Frontend component that displays the sequence of Activity_Events for the current Session.
- **Provider_Options**: A set of mock healthcare provider choices returned by the Health_Companion during the routine care route.
- **Booking_Confirmation**: The explicit user action that authorizes the Health_Companion to make a mock booking.
- **Care_Snapshot**: The consent-controlled summary of what information will be shared for a mock appointment, which the user must approve before the handoff is generated.
- **Clinician_Handoff**: The bilingual visit summary (English clinician handoff plus Arabic patient/caregiver summary) produced by the Health_Companion after consent.
- **Disclaimer**: The persistent "not medical advice" notice displayed by the Frontend.
- **Urgent_Escalation**: A response state in which the Health_Companion directs the user to urgent or emergency care and does not offer routine booking.
- **Response_Text**: The assistant text contained in the `result` field of a backend response.

## Requirements

### Requirement 1: Chat conversation interface

**User Story:** As a user seeking care navigation, I want a chat interface to converse with the Health Companion, so that I can describe my situation and read the agent's guidance in a familiar messaging format.

#### Acceptance Criteria

1. THE Chat_Interface SHALL display a text input control that accepts a user Message of 1 to 4000 characters and a send control for submitting the Message.
2. WHEN the user submits a Message containing at least 1 non-whitespace character and no more than 4000 characters, THE Chat_Interface SHALL append the user Message to the conversation view.
3. WHEN the Backend_Client returns Response_Text for a submitted Message, THE Chat_Interface SHALL append an agent Message containing the Response_Text to the conversation view.
4. THE Chat_Interface SHALL display Messages in chronological order with a visual distinction between user Messages and agent Messages.
5. IF the user submits a Message that contains no non-whitespace characters or exceeds 4000 characters, THEN THE Chat_Interface SHALL reject the submission, retain the input focus, display an indication of the reason for rejection, and not contact the Backend_Client.
6. WHILE the conversation view contains more Messages than fit in the visible area, THE Chat_Interface SHALL scroll so that the most recently appended Message is fully visible within 500 milliseconds after it is appended.
7. THE Chat_Interface SHALL be built using shadcn/ui components.
8. WHILE a submitted Message is awaiting Response_Text from the Backend_Client, THE Chat_Interface SHALL display an in-progress indicator and disable the send control.
9. IF the Backend_Client fails to return Response_Text within 30 seconds or returns an error, THEN THE Chat_Interface SHALL append an agent Message indicating the request could not be completed, re-enable the send control, and retain the submitted user Message in the conversation view.

### Requirement 2: Backend connection and invocation

**User Story:** As a user, I want the frontend to send my messages to the Health Companion backend and receive its responses, so that I can have a real conversation with the agent.

#### Acceptance Criteria

1. WHEN the user submits a Message, THE Backend_Client SHALL send a request containing a `prompt` field set to the Message text to the configured Health_Companion endpoint.
2. WHEN the Backend_Client receives a response with a success status and a body containing a `result` field, THE Backend_Client SHALL extract the value of the `result` field as the Response_Text.
3. WHERE the Frontend is configured to use the Local_Dev_Endpoint, THE Backend_Client SHALL send requests to the configured local development URL.
4. WHERE the Frontend is configured to use the AgentCore_Runtime, THE Backend_Client SHALL invoke the configured runtime using the AgentCore runtime invocation interface and SHALL include a Session_Id of at least 33 characters.
5. THE Backend_Client SHALL read the backend endpoint configuration from application configuration rather than a hard-coded value in the Chat_Interface.
6. IF a backend response omits the `result` field, THEN THE Backend_Client SHALL surface the raw response body as Response_Text so that the user is not shown an empty agent Message.
7. IF a request to the Health_Companion does not complete within 30 seconds, THEN THE Backend_Client SHALL abort the request and report a timeout error to the Chat_Interface.

### Requirement 3: Session continuity

**User Story:** As a user, I want the agent to remember the context of my current conversation, so that follow-up messages such as confirming a booking are understood in context.

#### Acceptance Criteria

1. WHEN a Session is initialized (on first message of a conversation or after the user starts a new conversation), THE Backend_Client SHALL generate a Session_Id between 33 and 128 characters consisting only of URL-safe characters (alphanumeric, hyphen, underscore).
2. WHILE a Session is active, THE Backend_Client SHALL send the identical Session_Id generated for that Session with every request in that Session.
3. WHEN the user starts a new conversation (via the new-conversation control), THE Frontend SHALL clear all displayed Messages, clear the Activity_Timeline, and begin a new Session associated with a newly generated Session_Id distinct from the previous Session_Id.
4. IF Session_Id generation fails, THEN THE Backend_Client SHALL not send the request and SHALL surface an error indication to the Frontend that the Session could not be started.

### Requirement 4: Loading and streaming states

**User Story:** As a user, I want clear feedback while the agent is thinking, so that I know my message was received and a response is on the way.

#### Acceptance Criteria

1. WHILE a request to the Health_Companion is in progress, THE Chat_Interface SHALL display a pending indicator for the awaited agent Message.
2. WHILE a request to the Health_Companion is in progress, THE Chat_Interface SHALL disable the send control so that no additional request can be submitted in the same Session until the in-progress request completes or fails.
3. WHEN Response_Text is received in full, THE Chat_Interface SHALL remove the pending indicator and re-enable the send control.
4. WHERE the configured endpoint delivers the response incrementally, THE Chat_Interface SHALL append each received portion of Response_Text to the displayed agent Message in the order received while keeping the pending indicator visible until the final portion is received.
5. WHERE the configured endpoint delivers the response as a single payload, THE Chat_Interface SHALL render the complete Response_Text when the response is received.
6. IF the request fails, returns an error, or does not complete within 60 seconds, THEN THE Chat_Interface SHALL remove the pending indicator, re-enable the send control, and display an error indication that the response could not be retrieved, while preserving the user's submitted Message in the conversation view.

### Requirement 5: Persistent "not medical advice" disclaimer

**User Story:** As a user, I want a clear and constant reminder that this tool does not provide medical advice, so that I understand the agent's role and limits.

#### Acceptance Criteria

1. THE Frontend SHALL display a Disclaimer stating that the Health_Companion provides care navigation support and does not provide medical advice.
2. WHILE any conversation view is displayed, THE Frontend SHALL keep the Disclaimer within the visible viewport at all times without requiring the user to scroll to reveal it, including when the Message list is empty and when the Message list exceeds the viewport height.
3. THE Disclaimer SHALL state that the Health_Companion does not diagnose, name conditions, prescribe, or advise on medication.
4. THE Disclaimer SHALL state that the Frontend uses synthetic data and simulated provider and booking tools.

### Requirement 6: Workflow activity timeline

**User Story:** As a user, I want to see which navigation steps the agent has completed, so that I can follow the progress of my care navigation.

#### Acceptance Criteria

1. WHEN an agent Message contains one or more Activity_Events matching a known event identifier (TRIAGE_GUIDANCE_RETRIEVED, RELEVANT_CONTEXT_RETRIEVED, MEDICATION_REFERENCE_CHECKED, PROVIDER_OPTIONS_FOUND, BOOKING_AWAITING_CONFIRMATION, MOCK_BOOKING_CONFIRMED, VISIT_SUMMARY_GENERATED, URGENT_ESCALATION_SHOWN), THE Frontend SHALL add one corresponding step per Activity_Event to the Activity_Timeline for the current Session.
2. THE Frontend SHALL render each Activity_Timeline entry using a predefined human-readable label mapped one-to-one from its event identifier.
3. IF an Activity_Event identifier is not among the known event identifiers, THEN THE Frontend SHALL render the Activity_Timeline entry using the raw event identifier text and SHALL NOT discard the entry.
4. THE Chat_Interface SHALL present the conversational text of an agent Message with all `[ACTIVITY] <EVENT_NAME>` markers removed from the displayed Message body, including markers whose EVENT_NAME is unknown or malformed.
5. THE Frontend SHALL display Activity_Timeline entries in the order the Activity_Events were received within the Session, preserving duplicate events as separate ordered entries.

### Requirement 7: Urgent escalation presentation

**User Story:** As a user with a potentially urgent situation, I want the agent's urgent-care guidance to stand out, so that I do not miss a direction to seek urgent or emergency care.

#### Acceptance Criteria

1. WHEN an agent Message includes the `URGENT_ESCALATION_SHOWN` Activity_Event, THE Chat_Interface SHALL render that agent Message with an urgent visual treatment that includes a persistent, distinct visual indicator not present on routine agent Messages.
2. WHILE an Urgent_Escalation is displayed, THE Chat_Interface SHALL NOT present booking or provider-selection controls for that Message.
3. WHERE an agent Message includes both the `URGENT_ESCALATION_SHOWN` Activity_Event and any of `PROVIDER_OPTIONS_FOUND` or `BOOKING_AWAITING_CONFIRMATION`, THE Chat_Interface SHALL apply the urgent visual treatment and SHALL suppress the booking and provider-selection controls for that Message.

### Requirement 8: Provider options and mock booking

**User Story:** As a user on a routine care path, I want to review provider options and confirm a booking, so that I can complete a mock appointment through the interface.

#### Acceptance Criteria

1. WHEN an agent Message includes the `PROVIDER_OPTIONS_FOUND` Activity_Event and the Response_Text contains one or more Provider_Options, THE Chat_Interface SHALL present each Provider_Option contained in the Response_Text to the user.
2. IF an agent Message includes the `PROVIDER_OPTIONS_FOUND` Activity_Event but the Response_Text contains no Provider_Options, THEN THE Chat_Interface SHALL display an indication that no provider options are available and SHALL NOT present a Booking_Confirmation control for that Message.
3. WHEN an agent Message includes the `BOOKING_AWAITING_CONFIRMATION` Activity_Event, THE Chat_Interface SHALL present a Booking_Confirmation control to the user.
4. WHEN the user activates the Booking_Confirmation control, THE Backend_Client SHALL send an explicit confirmation Message to the Health_Companion in the current Session.
5. IF the confirmation Message fails to be sent to the Health_Companion, THEN THE Chat_Interface SHALL display an error indication that the booking was not confirmed, SHALL retain the Booking_Confirmation control in an actionable state, and SHALL preserve the current Session state.
6. WHEN an agent Message includes the `MOCK_BOOKING_CONFIRMED` Activity_Event, THE Chat_Interface SHALL display the confirmed appointment details from the Response_Text.

### Requirement 9: Consent-controlled care snapshot

**User Story:** As a user, I want to review and approve what information will be shared before a handoff is prepared, so that I stay in control of my data.

#### Acceptance Criteria

1. WHEN an agent Message presents a Care_Snapshot, THE Chat_Interface SHALL display the full Care_Snapshot contents to the user and SHALL NOT display any Clinician_Handoff until the user approves the Care_Snapshot.
2. THE Chat_Interface SHALL present an approval control that lets the user approve the Care_Snapshot and a separate control that lets the user decline it.
3. WHEN the user approves the Care_Snapshot, THE Backend_Client SHALL send the user's approval to the Health_Companion in the current Session within 2 seconds and SHALL display a confirmation indicating the approval was sent.
4. IF sending the user's approval to the Health_Companion fails due to a network or transport error, or does not complete within 10 seconds, THEN THE Chat_Interface SHALL display an error notice indicating the approval could not be sent, SHALL re-enable the approval control, and SHALL NOT display any Clinician_Handoff.
5. WHEN the user declines the Care_Snapshot, THE Chat_Interface SHALL NOT send an approval to the Health_Companion and SHALL NOT display any Clinician_Handoff.

### Requirement 10: Bilingual clinician handoff display

**User Story:** As a user, I want the visit summary shown clearly in both English and Arabic, so that I and my caregiver can read and share it with a clinician.

#### Acceptance Criteria

1. WHEN an agent Message includes the `VISIT_SUMMARY_GENERATED` Activity_Event, THE Chat_Interface SHALL display the Clinician_Handoff contained in the Response_Text.
2. WHERE the Clinician_Handoff contains an Arabic section, THE Chat_Interface SHALL render that section with right-to-left text direction.
3. THE Chat_Interface SHALL render the English clinician handoff section and the Arabic patient/caregiver section as separate blocks, each preceded by a distinct visible label or heading identifying its language and audience.
4. IF the Clinician_Handoff is missing either the English section or the Arabic section, THEN THE Chat_Interface SHALL display the section that is present and SHALL display a notice indicating the other section is unavailable.

### Requirement 11: Error handling

**User Story:** As a user, I want clear feedback when something goes wrong communicating with the agent, so that I can understand the problem and try again.

#### Acceptance Criteria

1. IF a request to the Health_Companion fails due to a network or transport error, or does not receive a response within 30 seconds, THEN THE Chat_Interface SHALL display an error notice indicating the message could not be delivered and SHALL re-enable the send control.
2. IF the backend returns a non-success status, THEN THE Chat_Interface SHALL display an error notice indicating the request did not succeed, and the notice SHALL NOT contain credentials, tokens, or internal endpoint values.
3. WHEN an error notice is displayed for a failed Message, THE Chat_Interface SHALL provide a control to retry sending that Message, and SHALL allow at least 3 retry attempts for the same Message.
4. WHILE an error notice is displayed, THE Chat_Interface SHALL preserve all previously exchanged Messages in the conversation view.

### Requirement 12: Bilingual user experience

**User Story:** As an Arabic-speaking or English-speaking user, I want the interface to support my language preference, so that I can interact comfortably.

#### Acceptance Criteria

1. THE Frontend SHALL allow the user to select a preferred interface language of English or Arabic.
2. WHERE the user selects Arabic as the preferred language, THE Frontend SHALL render the interface layout with right-to-left orientation.
3. WHERE the user selects English as the preferred language, THE Frontend SHALL render the interface layout with left-to-right orientation.
4. IF the user has not selected a preferred language, THEN THE Frontend SHALL render the interface in English with left-to-right orientation.
5. WHEN the user selects a preferred language, THE Frontend SHALL apply that language for the remainder of the current Session without requiring the user to reselect it.

### Requirement 13: No protected health information in client logs

**User Story:** As a privacy-conscious user, I want my health details kept out of technical logs, so that my sensitive information is not inadvertently exposed.

#### Acceptance Criteria

1. THE Frontend SHALL exclude Message content, symptoms, medications, allergies, and identifiers from browser console logs and analytics events.
2. WHERE the Frontend records diagnostic events, THE Frontend SHALL record only non-identifying operational data such as Activity_Event labels, request status, and timing.
3. IF an error or exception is logged, THEN THE Frontend SHALL exclude Message content, symptoms, medications, allergies, and identifiers from the logged error details.
