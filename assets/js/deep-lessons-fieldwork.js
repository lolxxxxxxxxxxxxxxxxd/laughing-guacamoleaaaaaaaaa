"use strict";

(() => {
  const d = window.OFFSET_LESSON_DEPTH;
  window.OFFSET_REGISTER_DEPTH({
    "red-scope-and-rules": d(
      "A requester, a defined asset owner, and a training or assessment context.",
      [["Permission is a prerequisite, not a result", "A domain name or reachable address does not imply authorization. Written scope should identify the owner, assets, time window, approved methods, excluded systems, emergency contacts, and reporting path. The rules of engagement are a technical boundary: they determine which requests are allowed, when to stop, and how to handle unexpected data."],
      ["Reconfirm scope before each phase", "A third-party host, shared cloud range, or production dependency may fall outside the original request. Verify ownership and current scope before active testing. Stop if results affect an excluded system or expose sensitive data. For learning, use a local lab or designated training platform and keep a copy of the scope next to the test notes."]],
      ["A written authorization for one asset does not authorize adjacent infrastructure.", "A time window and stop contact should be explicit, not inferred."],
      { question: "What is the correct response when a test appears to reach an excluded system?", answer: "Stop the activity, preserve minimal facts, and contact the owner through the agreed channel." },
      ["Draft scope with included assets, exclusions, methods, and time window.", "Add an emergency contact and a technical stop condition.", "Review one proposed test action against every scope rule before running it."],
      { time: "25–30 MIN" }
    ),
    "red-asset-inventory": d(
      "A written asset list from an owner and clear engagement scope.",
      [["Inventory begins with authoritative ownership", "Start from the owner's asset list, approved DNS records, and configuration exports. Record asset owner, purpose, exposure, verification source, and time observed. Passive records can be stale or shared; a provider name does not establish who owns a service. Unverified discovery can cross scope even when the initial question sounds broad."],
      ["Treat discovery as a boundary decision", "Confirm shared hosting, vendor systems, and third-party dependencies with the owner before considering active checks. In a local lab, compare intended services with what the system actually exposes. Keep passive observations separate from tested facts, and do not convert a discovered hostname into permission to probe it."]],
      ["A DNS record is not proof of authorization to test the destination.", "An inventory without an owner or observation time is difficult to validate."],
      { question: "What must happen before an unexpected discovered host is tested?", answer: "The owner must confirm it is in scope and specify allowed methods and timing." },
      ["Create an asset table with owner, service, purpose, source, and time.", "Mark entries that depend on third-party hosting.", "Write the confirmation needed before any active test."],
      { time: "20–25 MIN" }
    ),
    "red-web-lab": d(
      "A local container or designated intentionally vulnerable training application.",
      [["A training target should be designed for practice", "Use OWASP Juice Shop, WebGoat, or a platform's explicitly assigned lab. Keep the target isolated from personal accounts and production data. Learn the request/response flow and the class of design mistake, then focus on the server-side fix. The goal is to understand a weakness and prevent it, not to test random live sites."],
      ["Repeat the lesson as a defensive regression test", "Document the lab version and setup, reproduce only the provided exercise, and capture minimal synthetic evidence. Implement or describe a secure correction, then test the formerly failing case and a benign case. Stop if the environment differs from the lab instructions or appears to affect shared infrastructure."]],
      ["A vulnerability lab is not permission to test a real site with a similar stack.", "A client-side validation change alone does not establish server-side authorization."],
      { question: "What makes a target appropriate for a beginner web-security exercise?", answer: "It is a purpose-built local or explicitly assigned training target with published rules." },
      ["Read the lab scope and record the target version.", "Use synthetic data to reproduce one lesson.", "Write the server-side fix and a regression test before closing the lab."],
      { time: "30–40 MIN" }
    ),
    "red-auth-review": d(
      "An owned local application and synthetic test accounts.",
      [["Review the lifecycle, not just the login form", "Authentication testing includes login, recovery, session creation, privilege change, logout, and account deactivation. Use synthetic accounts supplied for the lab. Check whether a session rotates after login, recovery links expire, rate limits behave as documented, and every sensitive operation is authorized server-side."],
      ["Protect real users while testing", "Do not use credential stuffing, password spraying, or real people's accounts. Agree on request limits and stop conditions before testing a shared environment. Record expected and observed behavior, then ask whether a fix prevents the unsafe action without breaking a legitimate role. Treat tokens and recovery URLs as secrets in logs and reports."]],
      ["A successful login does not prove access to a specific object is authorized.", "Testing real accounts without explicit authorization can harm users and violate policy."],
      { question: "Which test verifies object-level authorization?", answer: "Use two synthetic users and verify one cannot access the other's protected record unless the policy permits it." },
      ["Create tests for login, logout, and recovery using synthetic accounts.", "Test both allowed and denied object access.", "Verify session invalidation after logout and privilege change."],
      { time: "25–30 MIN" }
    ),
    "red-validation-report": d(
      "A scoped finding with an owner-approved reproduction path.",
      [["Validate only enough to answer the question", "A minimal reproduction should establish the affected version, preconditions, observed behavior, and plausible impact without collecting unnecessary data. Stop once the security question is answered. Preserve relevant evidence with secrets and personal data redacted. Distinguish direct observations from assumptions and label confidence honestly."],
      ["Make the report actionable", "Include a concise summary, scope, reproduction steps, impact, evidence, targeted remediation, and a retest condition. The owner should be able to reproduce the behavior in a safe environment. Coordinate disclosure through the approved channel and timeline; do not publish sensitive details merely to prove a point."]],
      ["A dramatic demonstration can collect more data than needed to establish impact.", "A report that says only vulnerable gives an engineer no reliable reproduction or fix."],
      { question: "What is the safest proof for an authorization flaw in a training app?", answer: "A minimal test using synthetic records that demonstrates the denied role can access only the specific in-scope record." },
      ["Write the finding in a six-part template: summary, scope, steps, impact, fix, retest.", "Redact values that are not needed to reproduce the issue.", "Ask another reviewer to follow the reproduction in the lab."],
      { time: "25–30 MIN" }
    ),
    "red-purple-team": d(
      "An approved simulation, an agreed telemetry source, and a defender contact.",
      [["Purple teaming connects a behavior to a control", "Choose one benign behavior, one lab system, and one expected data source. Agree on the test plan with defenders before execution. The exercise asks whether prevention, telemetry, alerting, and response worked; it is not an evasion contest or a score against an unprepared team."],
      ["Turn the result into a measurable improvement", "Record the test time, expected event, observed event, alert path, and response. If the control failed, identify whether the cause was configuration, collection, query logic, or ownership. Retest after the change. Use a vendor-provided simulation or a purpose-built lab and stop if observed scope differs from the agreement."]],
      ["An unannounced test can create confusion or trigger unnecessary response actions.", "A passed simulation does not prove coverage for every variant or environment."],
      { question: "What should a purple-team exercise produce besides a test result?", answer: "A documented control gap, owner, corrective action, and a retest that verifies improvement." },
      ["Write a one-page test hypothesis and expected telemetry.", "Run only the approved benign simulation in the agreed window.", "Create a retest criterion with the blue-team owner."],
      { time: "25–30 MIN" }
    ),
    "red-engagement-lifecycle": d(
      "A written engagement plan and named points of contact.",
      [["An assessment has phases and owners", "Intake, authorization, planning, execution, evidence handling, reporting, retest, and closeout each need a responsible person. Before each active phase, reconfirm scope, time window, emergency contact, data handling, and stop switch. Track actions and timestamps so the owner can distinguish authorized testing from unrelated events."],
      ["Closeout is part of the technical work", "At completion, return or securely delete agreed data, remove temporary accounts and infrastructure, communicate unresolved risks, and verify cleanup. Document what was not tested and why. A report that omits limitations can be misread as a guarantee that the whole system is secure."]],
      ["Authorization can expire or change while an assessment is underway.", "Leaving test accounts or temporary services behind creates new exposure."],
      { question: "What should an assessment closeout verify?", answer: "Evidence handling, removal of temporary access and infrastructure, communicated residual risks, and documented limitations." },
      ["Draft a pre-engagement checklist.", "Create an action log format with timestamps and scope references.", "Write a closeout checklist before beginning the exercise."],
      { time: "25–30 MIN" }
    ),
    "osint-ethics": d(
      "A legitimate research question and an explicit privacy boundary.",
      [["Public does not mean harmless", "Information that is individually public can become sensitive when aggregated. Define the research purpose, audience, and permitted sources. Avoid identifying private individuals, collecting home addresses or personal contact details, and combining unrelated traces into a targeting profile. Ask whether the question can be answered with less data or at a less precise level."],
      ["Minimize collection and stop when scope changes", "Use fictional identities, your own accounts, or an organizational public-interest question. Keep a collection log, redact incidental personal data, respect platform rules, and do not bypass access controls or impersonate someone. If the work begins to identify a private person, pause and reassess purpose and harm."]],
      ["A data point being searchable does not make republishing it ethical.", "Combining harmless-looking records can expose a person's location or identity."],
      { question: "What should an OSINT researcher do when a public source begins identifying a private person outside the brief?", answer: "Stop collection, minimize or discard the personal data, and reassess whether the research question justifies continuing." },
      ["Write a charter with purpose, allowed sources, and excluded data.", "List who could be harmed by the report.", "Set a stop condition before collecting information."],
      { time: "25–30 MIN" }
    ),
    "osint-source-validation": d(
      "A claim to verify and at least one original source to examine.",
      [["Provenance is the chain behind a claim", "A repost, screenshot, or search snippet is not the same as an original source. Record the earliest source you can find, author or publisher, URL, access time, and the exact evidence supporting the claim. Search results can be stale or personalized. Several sites repeating one copied report are not independent corroboration."],
      ["Separate observation from interpretation", "Keep direct observations, quoted claims, and analyst inference in separate fields. Seek independent sources and record contradictory evidence. State uncertainty and confidence. If a source changes or disappears, preserve an appropriate reference without collecting unnecessary personal data or violating access terms."]],
      ["Multiple copies of one original report do not make independent corroboration.", "A screenshot without source and capture time is difficult to verify."],
      { question: "What makes two sources independent corroboration?", answer: "They rely on distinct evidence or reporting paths, rather than both repeating the same original claim." },
      ["Create a source ledger with URL, capture time, claim, evidence, and confidence.", "Trace one repost back to its earliest source.", "Record one piece of evidence that could disconfirm the claim."],
      { time: "25–30 MIN" }
    ),
    "osint-domain-footprints": d(
      "A domain you own or are explicitly authorized to research.",
      [["Passive records are clues, not attribution", "RDAP/registration data, DNS records, and certificate-transparency entries can describe public infrastructure. Privacy services, shared hosting, dynamic DNS, and stale records limit attribution. A certificate entry can show a name was observed, but it does not prove current control or authorize testing the host."],
      ["Record time and source", "For a domain you control, compare authoritative DNS, registrar records, and certificate history. Record access time, resolver, record type, and confidence. Keep collection passive unless the owner explicitly authorizes active checks. Do not turn a discovered hostname into a scan target without written scope."]],
      ["Shared hosting means an IP address can serve many unrelated organizations.", "A certificate-transparency record is historical evidence, not proof of current ownership."],
      { question: "Does discovering a subdomain in a public certificate log authorize testing it?", answer: "No. It is a passive clue; the owner must confirm scope and allowed methods." },
      ["Inventory a domain you own using passive public records.", "Record observation time and the source for each result.", "Mark any third-party or shared-hosting dependency for owner confirmation."],
      { time: "25–30 MIN" }
    ),
    "osint-metadata": d(
      "A document or image you own and a local metadata viewer.",
      [["A file contains more than visible content", "Images and documents can retain author names, timestamps, GPS coordinates, software details, comments, and revision history. Cropping or printing to PDF does not necessarily remove every metadata field. Visible redaction is also different from removing hidden text or layers."],
      ["Verify the released copy", "Create a synthetic test document, inspect it locally, remove unneeded metadata, then inspect the exported copy again. Keep an untouched original only when retention is authorized and appropriate. Avoid uploading private files to unknown web tools. Review both visible content and embedded properties before sharing."]],
      ["Removing metadata does not securely redact visible text.", "A clean-looking export can retain comments, revisions, or location fields."],
      { question: "What is the reliable way to confirm metadata removal?", answer: "Inspect the final exported copy with an appropriate local tool and verify the fields that matter are absent." },
      ["Create a document with synthetic author and location data.", "Inspect, remove, export, then inspect the new copy.", "Make a pre-publication checklist for both visible and hidden content."],
      { time: "20–25 MIN" }
    ),
    "osint-visual-verification": d(
      "A purpose-made public dataset or historical image with a legitimate public-interest question.",
      [["Visual verification needs multiple independent clues", "Check original publication context, visible signage, architecture, weather, shadow direction, and timestamps. Each clue has uncertainty: a landmark can be reused, metadata can be stripped, and a repost can shift dates. Record both supporting and contradictory evidence rather than fitting every detail to the first hypothesis."],
      ["Precision has a privacy cost", "Use only the location precision needed for the question. Do not publish exact locations of private homes, vulnerable people, or sensitive facilities. Practice with historical or purpose-made datasets and follow the toolkit's methodology. A good result may be that the evidence is insufficient to make a confident claim."]],
      ["A familiar landmark alone does not establish image date or location.", "Publishing a precise location can put uninvolved people at risk."],
      { question: "What is a defensible conclusion when clues conflict or are incomplete?", answer: "State the uncertainty and avoid a precise claim until independent evidence resolves it." },
      ["Record source, date, visible clues, and counter-evidence.", "Separate verified facts from inferred location.", "Perform a privacy review before sharing the result."],
      { time: "25–30 MIN" }
    ),
    "osint-reporting": d(
      "A scoped research question, source log, and a plan for retaining data.",
      [["A notebook should make research reproducible", "Record exact URLs, access time, search terms, page context, and the claim each source supports. Separate direct observation from inference and note failed searches. Respect terms of service and applicable law; do not bypass access controls or impersonate someone to obtain information."],
      ["Report less, but support it better", "Include purpose, scope, evidence, confidence, limitations, and a retention plan. Share only details necessary for the intended audience. Redact incidental personal information, securely delete unnecessary copies, and preserve provenance for the evidence that supports a conclusion."]],
      ["A report without source timestamps can be impossible to reproduce.", "Collecting more personal data than the question needs creates unnecessary risk."],
      { question: "What is the main reason to record failed searches as well as successful sources?", answer: "They document research coverage and help another analyst understand how the conclusion was reached." },
      ["Make a source note for a fictional public organization.", "Separate evidence, inference, and confidence in the report.", "Set a retention and redaction rule before collection."],
      { time: "20–25 MIN" }
    )
  });
})();
