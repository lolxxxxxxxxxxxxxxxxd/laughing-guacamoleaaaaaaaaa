"use strict";

(() => {
  const d = window.OFFSET_LESSON_DEPTH;
  window.OFFSET_REGISTER_DEPTH({
    "memory-safety": d(
      "Pointers, object lifetime, containers, and integer types.",
      [["Memory bugs are contract failures", "An out-of-bounds access means the program's range contract was broken; use-after-free means an observer outlived its owner; integer overflow can turn a size calculation into an undersized allocation. These are not exotic failures. They often begin where untrusted input meets a native type or where ownership is unclear. Identify the object, its valid range, and its lifetime before reasoning about the fault."],
      ["Use defense in depth", "Prefer standard containers and RAII, validate lengths before arithmetic, and keep ownership visible. Compiler warnings, static analysis, fuzzing, and sanitizers each find different classes of bugs. Test boundary values and error paths, and treat a clean tool run as evidence rather than proof. When a tool reports an error, reduce the input and fix the earliest invalid operation instead of suppressing the symptom."]],
      ["A non-null pointer can still be dangling.", "An assert can be compiled out and must not replace external-input validation."],
      { question: "Which pair of facts is necessary before dereferencing a pointer?", answer: "The pointer must designate a live object, and the access must be within that object's valid range." },
      ["State the owner and lifetime for each pointer in a small function.", "Check multiplication before using an input count as an allocation size.", "Run a sanitizer build on a minimized, local test case."],
      { time: "30–35 MIN" }
    ),
    "debugging-and-reversing": d(
      "A repeatable program, build identity, and a question to investigate.",
      [["Reverse engineering is hypothesis testing", "Begin with a known binary, version, and controlled input. Record observable behavior before inferring intent. Strings, imports, metadata, logs, and call stacks are evidence with different strengths; a string in a file does not prove the program uses it on the path you care about. Symbols and source mapping improve the view, while optimized code can reorder or remove source-level operations."],
      ["Move from high-level evidence to lower-level detail", "Reproduce the behavior, inspect logs and symbols, then step through a focused call path. If source is unavailable, form one question about a function or data structure and use disassembly to test it. Record addresses with module and build context. Analyze only software you own or are authorized to inspect, and preserve the original sample rather than modifying evidence."]],
      ["A source line in a stack does not prove it caused earlier memory corruption.", "A string or imported function alone is weak evidence of runtime behavior."],
      { question: "What makes a debugging observation reproducible?", answer: "The exact binary/build, environment, input, expected result, and observed result are recorded so the same case can be repeated." },
      ["Reduce a failure to the smallest input that still reproduces it.", "Record the first useful stack frame and matching symbol version.", "Write one hypothesis and one observation that could falsify it."],
      { time: "30–35 MIN" }
    ),
    "threat-modeling": d(
      "A defined program boundary and a reason to protect something.",
      [["Start with assets and trust boundaries", "An asset is something whose confidentiality, integrity, or availability matters: user data, an update channel, or a service's ability to run. Draw components and data flows, then mark where information crosses a user, file, network, process, or privilege boundary. Threats become more useful when they describe a capability and a concrete path, not a vague label such as attacker."],
      ["Prioritize mitigations by risk and cost", "For each boundary, ask what malformed, oversized, stale, or unauthorized input could do. Estimate likelihood and impact, then choose a proportionate control: validation, least privilege, authentication, logging, or a safer API. Record assumptions and residual risk. Revisit the model when dependencies, deployment, or data flows change; a threat model is a design artifact, not a one-time compliance diagram."]],
      ["A list of threats without assets or trust boundaries is difficult to act on.", "Adding a security control without understanding its operational effect can create new failure modes."],
      { question: "What turns a threat statement into an actionable security scenario?", answer: "An asset, a capability, a path across a boundary, an impact, and a mitigation that can be checked." },
      ["Draw a small data-flow diagram.", "Name one asset and one trust boundary.", "Choose a mitigation and define how a test would verify it."],
      { time: "25–30 MIN" }
    ),
    "safe-lab": d(
      "Basic virtualization or a local process you control.",
      [["A lab needs explicit scope", "Write down which machine, program, accounts, and network connections are in scope before running tools. Use software you wrote, an intentionally vulnerable training target, or a system with explicit authorization. A reachable host is not an authorized target. Define a stop condition, contact, and allowed activity so an unexpected system or sensitive record does not turn a lesson into an incident."],
      ["Make the environment reversible", "Use a disposable VM or container, take a snapshot, use synthetic credentials, and disable shared folders or networking when unnecessary. Keep notes on tool versions and changes. Separate lab data from personal or work data. At the end, restore the snapshot, remove temporary accounts, and verify the host returned to its expected state."]],
      ["A VM is not automatically isolated if it has bridged networking or shared folders.", "A lab scope should include cleanup and stop conditions, not just target names."],
      { question: "What should you do if your test appears to reach an out-of-scope system?", answer: "Stop immediately, preserve minimal facts, and contact the authorized owner through the agreed channel." },
      ["Write a one-page scope with inclusions and exclusions.", "Create a snapshot and verify the network mode.", "Write the cleanup checklist before beginning the exercise."],
      { time: "20–25 MIN" }
    ),
    "security-triad": d(
      "An application or information asset to reason about.",
      [["Translate CIA into user impact", "Confidentiality asks who can learn information; integrity asks whether information or actions can be changed without authorization; availability asks whether a service remains usable. One incident can affect several goals at once. A database leak is not only a confidentiality issue if the same flaw also permits record modification or disables recovery."],
      ["Turn goals into requirements", "Name the asset, the people or services that rely on it, and the unacceptable outcome. Then state a requirement that can be tested: for example, only the record owner or an assigned administrator can change a record, and every change is auditable. The triad is a framing tool, not a complete risk model; add safety, privacy, and business context where they matter."]],
      ["A control should be tied to a specific asset and impact.", "Confidentiality, integrity, and availability are goals, not implementation mechanisms."],
      { question: "A flaw lets an unauthorized user change a stored payment amount. Which security goal is directly affected?", answer: "Integrity, because data can be changed without authorization; confidentiality may or may not also be affected." },
      ["Choose one application and identify a sensitive asset.", "Write one unacceptable outcome for each CIA goal.", "Turn one outcome into a testable requirement."],
      { time: "20–25 MIN" }
    ),
    "network-dns-http": d(
      "Basic IP addresses, ports, and client/server requests.",
      [["Trace one request across layers", "Entering a URL can involve name resolution, a transport connection, a TLS handshake, and an HTTP request/response. Each layer has its own state and failure modes. DNS answers can change; a port number is a convention; TLS authenticates a server name under certificate rules; HTTP carries application semantics such as methods, headers, and status codes."],
      ["Diagnose the failing layer", "Use browser developer tools or a capture of your own traffic to identify whether resolution, connection, TLS, or application handling failed. Record time, host, resolver, and request context. Never capture other people's traffic or share cookies, tokens, and personal data. A firewall rule can permit a connection without making the application request trustworthy."]],
      ["A port number does not prove which application is listening.", "A successful TLS connection does not mean the user is authorized for every request."],
      { question: "Which layer decides whether a logged-in user may view a particular record?", answer: "Application authorization; transport encryption alone does not make that decision." },
      ["Draw the steps from URL entry to HTTP response.", "Use devtools on your own browser to distinguish DNS, TLS, and HTTP errors.", "Redact secrets before saving or sharing a trace."],
      { time: "25–30 MIN" }
    ),
    "tls-certificates": d(
      "DNS names, public-key concepts, and a browser or client trust store.",
      [["TLS protects a connection and checks endpoint identity", "During a TLS handshake, peers negotiate cryptographic parameters and the client validates a certificate chain and hostname under its trust policy. Encryption protects traffic in transit, while certificate validation helps establish which endpoint the client reached. Neither property proves that the service's business logic is safe or that a user may perform every action."],
      ["Diagnose trust failures without disabling verification", "Check the requested hostname, system clock, certificate chain, and configured proxy or trust store. Disabling certificate verification removes an important protection and can expose credentials to interception. Application authorization remains a separate check after the channel is established. When pinning or custom trust is necessary, document rotation and recovery rather than copying a certificate permanently."]],
      ["Clicking through a certificate warning is not a safe troubleshooting method.", "Encryption without identity validation can protect a connection to the wrong endpoint."],
      { question: "What does a valid certificate chain for a hostname establish at the TLS layer?", answer: "That the peer presented a certificate trusted for that hostname under the client's validation rules; it does not prove the app is harmless." },
      ["Explain the difference between encryption and authentication.", "Inspect a certificate error in a test environment without bypassing validation.", "List two guarantees TLS does not provide."],
      { time: "25–30 MIN" }
    ),
    "vulnerability-lifecycle": d(
      "An asset inventory and a way to test a deployed version.",
      [["Risk depends on exposure and context", "A vulnerability record may describe a weakness and severity, but operational risk depends on the affected asset, reachable attack surface, available mitigations, and business impact. Known-exploited status is important evidence, not a substitute for determining whether your asset is affected. Inventory quality and version accuracy are prerequisites for useful prioritization."],
      ["Close the loop with verification", "Track a finding from source and evidence through owner, priority, remediation, and retest. A patch or configuration change is not complete until the deployed version and relevant settings are verified. Preserve the reason for deferral and a review date. Never validate a suspected exploit against a production system without an approved plan and owner coordination."]],
      ["A severity score alone does not tell you whether an asset is exposed.", "Closing a ticket without verifying the deployed fix leaves the risk uncertain."],
      { question: "What evidence should close a remediation ticket?", answer: "A verified deployed change plus a retest or configuration check that demonstrates the affected condition is resolved." },
      ["Build a fictional asset/finding record with source and version evidence.", "Prioritize it using exposure and impact, not score alone.", "Define a concrete retest condition."],
      { time: "25–30 MIN" }
    ),
    "secure-input": d(
      "Basic parsing, integer ranges, and an input boundary.",
      [["Validation should match the destination type", "At a trust boundary, check length before allocation, parse into a type that can represent the value, and validate the allowed range before use. Canonicalization matters when multiple encodings represent the same logical value. A generic string filter is not a universal defense: SQL, HTML, shell arguments, and file paths have different grammars and should use context-aware APIs."],
      ["Reject ambiguity before side effects", "Parse into a temporary value, validate all fields, then commit the change. This avoids partially updating state when a later field fails. Keep error messages useful without echoing secrets. For command execution, prefer a process API with an argument array instead of building a shell command string. For paths, normalize and enforce an explicit base directory."]],
      ["A length limit does not prove the data is semantically valid.", "Escaping for one output context does not make a value safe in another."],
      { question: "Why should parsing and validation finish before committing a state change?", answer: "So malformed input cannot leave the program partially updated." },
      ["Set length, character, and range rules for a port number.", "Test empty, oversized, malformed, and boundary-valid values.", "Use a parameterized API instead of concatenating input into a command or query."],
      { time: "25–30 MIN" }
    ),
    "secure-auth-sessions": d(
      "A client/server model and the difference between identity and permission.",
      [["Authentication and authorization answer different questions", "Authentication establishes an identity or session; authorization decides whether that identity may perform a requested action on a particular object. Every sensitive server-side operation needs an authorization check, including object-level checks. Hiding a button or route in the browser is not an access control because a client can still send a request."],
      ["Treat session tokens as bearer secrets", "Use unpredictable session identifiers, protect them in transit, rotate them after login or privilege changes, and invalidate them on logout or recovery. Scope cookies appropriately and avoid logging tokens. Test both allowed and denied cases with synthetic accounts. Rate limits and recovery flows are part of the security boundary, not optional UI details."]],
      ["A valid login does not grant access to every object.", "A logout button is not proof that the server invalidated the session."],
      { question: "Where should permission to read another user's record be enforced?", answer: "On the trusted server for that record and action, not only in the client interface." },
      ["Write an access matrix for roles and objects.", "Test both permitted and denied cross-user access with synthetic accounts.", "Verify session rotation and invalidation on a local training app."],
      { time: "25–30 MIN" }
    ),
    "supply-chain-basics": d(
      "A small build with one or more external dependencies.",
      [["A program includes more than its source", "The software supply chain includes direct and transitive libraries, compilers, build tools, package registries, and update channels. A lockfile improves repeatability but does not prove a package is trustworthy. Reduce unused dependencies, record versions, review ownership and update activity, and verify signatures or checksums when the ecosystem provides them."],
      ["Make provenance part of the build", "Record the toolchain and dependency versions needed to reproduce a release. Keep secrets out of source and build logs. Review changes before automatic updates reach production, and test security updates promptly. A software bill of materials is useful only if it reflects the artifact actually deployed and has an owner for remediation."]],
      ["Pinning a version makes a build repeatable, not automatically safe.", "A direct dependency list can hide transitive packages and build-time tools."],
      { question: "What does a lockfile guarantee, and what does it not?", answer: "It can constrain resolved versions for repeatability; it does not establish that those packages are benign or maintained." },
      ["Draw a dependency chain for a small project.", "Identify who reviews an update and how it is tested.", "Generate or inspect an SBOM and compare it with the deployed artifact."],
      { time: "25–30 MIN" }
    ),
    "security-incident-report": d(
      "A reproducible issue, defined scope, and an owner who can fix it.",
      [["A finding is an evidence chain", "A useful security finding states the affected component and version, preconditions, exact observed behavior, potential impact, and evidence source. Separate confirmed facts from hypotheses. Redact credentials, personal data, and unrelated system details. A small reproduction that demonstrates the issue is usually more actionable and safer than a dramatic demonstration."],
      ["Make remediation and retest concrete", "Write for the engineer who must fix the issue: explain the failing assumption, recommend a targeted change, and define how to verify it. Include environment and timestamps where they matter. Coordinate disclosure through the owner's approved channel and timeline. A report should not claim severity beyond the demonstrated impact."]],
      ["Vague claims such as input is insecure are not reproducible findings.", "Publishing sensitive proof before coordination can harm users and owners."],
      { question: "What makes a remediation verifiable?", answer: "A retest condition tied to the original behavior, such as the denied action now being rejected while authorized behavior still works." },
      ["Turn a vague report into steps, impact, and evidence.", "Redact secrets while preserving enough context to reproduce.", "Write a retest that would distinguish a real fix from a cosmetic change."],
      { time: "20–25 MIN" }
    ),
    "blue-logs-first-response": d(
      "A fictional alert and access to a training log set.",
      [["Logs are observations with provenance", "A log entry is produced by a specific provider, host, time source, and collection path. It can be missing, delayed, filtered, duplicated, or malformed. Record host identity, time zone, clock offset, event source, and retention window before building a timeline. Distinguish what the record directly shows from the analyst's interpretation."],
      ["Preserve before you conclude", "Keep original records and note each triage action so another analyst can reproduce the timeline. Correlate independent sources when possible, but verify they are not copies of the same upstream event. Use fictional or sanitized training data; real endpoint logs can contain personal and business-sensitive information."]],
      ["An event's absence does not prove an action never happened.", "A timestamp without host and time-zone context can misorder a timeline."],
      { question: "What should be recorded before correlating events from multiple hosts?", answer: "Host identity, source/provider, timestamp and time zone, clock context, and collection provenance." },
      ["Build a timeline from a synthetic alert dataset.", "Mark direct evidence separately from inference.", "List one missing data source that would change your confidence."],
      { time: "20–25 MIN" }
    ),
    "blue-windows-event-logs": d(
      "Windows event channels, providers, and a lab VM.",
      [["Telemetry is a designed system", "Windows event logs and Sysmon record only what their providers and configuration make available. Event IDs, versions, and fields define interpretation. Collection policy, retention, filtering, and forwarding affect coverage. A missing event can mean the action did not occur, but it can also mean it was not collected or did not reach the central store."],
      ["Validate the collection path", "In a disposable VM, generate benign activity and verify the expected event locally and centrally. Record configuration, time, host, and dropped-event indicators. Tune collection to the question rather than enabling every high-volume event. Protect logs as sensitive data and test configuration changes before deploying them broadly."]],
      ["Sysmon does not record every action by default.", "An event ID without its provider, version, and field context can be misread."],
      { question: "Does the absence of a process event prove no process started?", answer: "No. Collection settings, forwarding, retention, or source coverage may explain the missing event." },
      ["Choose one event source and list its useful fields.", "Generate a benign process event in a lab and verify it reaches the consumer.", "Document one coverage gap and one privacy consideration."],
      { time: "25–30 MIN" }
    ),
    "blue-process-triage": d(
      "Process IDs, timestamps, command lines, and a fictional endpoint alert.",
      [["A process tree is a lead, not a verdict", "Parent-child relationships help reconstruct execution, but a parent process is not automatically responsible for every child behavior. Process IDs can be reused, so correlate them with host and time. Review path, signature, hash, command line, user, integrity context, and neighboring events before assigning meaning."],
      ["Separate observation from confidence", "Expand one generation at a time and record why each relationship matters. A signed administrative tool can be used legitimately or unexpectedly; the name alone cannot establish intent. State what evidence would raise or lower confidence and what additional telemetry is needed before containment or escalation."]],
      ["A process name alone is weak attribution.", "A parent process relationship does not prove malicious intent."],
      { question: "Which context is needed to interpret a process ID reliably?", answer: "At least the host and event time, plus image path, user, command line, and related telemetry." },
      ["Create a triage table with process, parent, user, path, time, and confidence.", "Mark each statement as observed fact or inference.", "List the next data source that would resolve one uncertainty."],
      { time: "20–25 MIN" }
    ),
    "blue-detection-engineering": d(
      "A behavior hypothesis, its telemetry source, and a safe test dataset.",
      [["A detection is a tested hypothesis", "Before writing a query, describe the behavior, data source, systems covered, and benign cases likely to match. A syntactically valid rule can still miss the intended activity or flood analysts with noise. Sigma provides a portable rule format, but backend field mappings and event coverage still determine whether the translated query works."],
      ["Validate positive and negative cases", "Test a rule against representative benign and controlled positive examples. Version it, document required fields and platform assumptions, measure alert volume, and record the expected response. Use vendor simulations or synthetic data in a lab; do not execute unknown samples on production endpoints to create a test event."]],
      ["A rule's syntax check does not prove its data source exists in production.", "A detection without expected false positives and an owner is difficult to operate."],
      { question: "What should a detection test include besides a positive match?", answer: "Benign negative cases, telemetry assumptions, expected noise, and a defined validation result." },
      ["Write a plain-language hypothesis before writing the rule.", "Test one positive and two benign cases in a lab dataset.", "Document required fields and the action an alert should trigger."],
      { time: "25–30 MIN" }
    ),
    "blue-network-triage": d(
      "DNS, connection metadata, host identity, and time-bounded data.",
      [["Indicators need context and a timestamp", "An IP address may belong to shared cloud hosting, a CDN, VPN, NAT gateway, or dynamic assignment. A current DNS lookup may not match the answer at event time. Record source host, resolver, destination, port, protocol, and observation time. Reputation scores are leads, not proof of malicious behavior."],
      ["Correlate independently", "Compare DNS, endpoint process, proxy, and firewall data while preserving each source's provenance. Separate observed facts from enrichment and attribution claims. Escalate when a coherent chain supports the risk, not because one domain or address has a poor score. Never scan or probe infrastructure that is outside the authorized scope."]],
      ["A destination IP does not uniquely identify an organization or person.", "Enrichment data can be stale or derived from the same original source."],
      { question: "Why should an IP reputation result not be treated as proof?", answer: "Addresses can be shared, reassigned, or misclassified, and reputation lacks the endpoint and time context needed to establish behavior." },
      ["Build a timeline from synthetic DNS and connection events.", "Record source and access time for every enrichment result.", "List evidence that would distinguish an update service from suspicious traffic."],
      { time: "25–30 MIN" }
    ),
    "blue-incident-response": d(
      "Incident roles, an escalation path, and a fictional tabletop scenario.",
      [["Response is a coordinated lifecycle", "Preparation, detection, analysis, containment, eradication, recovery, and lessons learned each need an owner. Containment can stop spread but interrupt service or destroy volatile evidence. Decisions should follow the organization's response plan and authority model, not an improvised command during an alert."],
      ["Define recovery evidence in advance", "A reboot is not proof of recovery. Verify the affected version and configuration, restore from a known-good source, rotate credentials if required, and monitor for recurrence. Record who approved each action and what evidence was preserved. A tabletop exercise can expose missing contacts and ambiguous responsibilities without touching real systems."]],
      ["Isolating a host without considering business and evidence impact can make recovery harder.", "Closing the incident without a retest can leave persistence or exposure unresolved."],
      { question: "What should determine whether an isolated system returns to service?", answer: "Documented recovery criteria, owner approval, verified remediation, and a monitoring plan." },
      ["Run a tabletop with fictional facts.", "Assign authority for containment and external communication.", "Write technical recovery criteria and a post-incident review question."],
      { time: "25–30 MIN" }
    ),
    "blue-host-hardening": d(
      "A supported Windows baseline and a disposable test environment.",
      [["Hardening is role-specific configuration", "Reducing unnecessary services, patching software, limiting administrative access, and enabling platform protections can reduce exposure. A baseline must match the system's role and operational requirements. A setting that breaks a critical workflow is not useful until the workflow and a safer alternative are understood."],
      ["Measure drift and validate changes", "Compare a test VM to a documented baseline. Record deviations with an owner, reason, and review date. Test changes before deployment, keep a rollback path, and verify that the intended setting actually reached managed endpoints. Hardening is continuous configuration management, not a one-time checklist."]],
      ["Blindly applying a baseline can break a system's required function.", "A configured policy is not proof that every endpoint received it."],
      { question: "What makes a baseline deviation acceptable to track?", answer: "A documented reason, owner, risk decision, and date to review or remove the exception." },
      ["Choose three controls and name the threat each reduces.", "Record one operational risk each control could introduce.", "Test deployment and rollback in a VM before broader rollout."],
      { time: "25–30 MIN" }
    ),
    "blue-threat-intel": d(
      "A public report or synthetic indicator set with source references.",
      [["An indicator is not an explanation", "A hash, domain, IP, or path has value only with source, observation time, confidence, behavior, and expiration context. Indicators can be reused by benign infrastructure or become stale. Attribution claims require more evidence than a matching indicator, and sharing may be limited by license, privacy, or handling rules."],
      ["Use intelligence to guide a decision", "Compare independent sources, distinguish technical observation from attribution, and state what would change your confidence. A defensive action should match evidence strength: investigate, monitor, block, or inform an owner. Keep raw source and collection time so a later analyst can reassess the indicator."]],
      ["A reputation score alone does not establish malicious behavior.", "An old indicator can cause false positives if it is treated as permanent."],
      { question: "What minimum context makes an indicator useful to another analyst?", answer: "Value and type, source, observation time, confidence, behavior context, and an expiry or review policy." },
      ["Build an indicator record from a fictional report.", "Separate observed facts from attribution statements.", "Choose a proportionate defensive action and explain why."],
      { time: "25–30 MIN" }
    ),
    "blue-yara-basics": d(
      "A file format, a benign test corpus, and isolated analysis tools.",
      [["A YARA rule is a classifier with limits", "YARA matches strings and conditions in files or memory. A narrow rule can help group known samples, but it may miss variants or match benign files. The rule's purpose, corpus, and collection context determine useful strings. A syntactically valid rule does not prove that its matches are correct."],
      ["Test both matches and non-matches", "Create a harmless fixture, test it alongside benign near-matches, and record the intended coverage. Use an isolated analysis environment for untrusted samples. Preserve sample provenance and protect any private files. Do not deploy a research rule widely until false positives, performance, and response procedures are understood."]],
      ["A string match is not proof of malware or intent.", "Testing only one positive sample hides false positives and brittle assumptions."],
      { question: "What should be included in a YARA validation set?", answer: "Expected positive samples, benign near-matches, provenance, and a documented match purpose." },
      ["Write a rule for a harmless text fixture you create.", "Add a benign negative sample that should not match.", "Record the corpus and limitations alongside the rule."],
      { time: "25–30 MIN" }
    )
  });
})();
