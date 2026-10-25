"use strict";

(() => {
  const tracks = new Map((window.OFFSET_TRACKS || []).map((track) => [track.id, track]));

  const moduleFrom = (item) => {
    const track = tracks.get(item.track);
    return {
      id: item.id,
      track: item.track,
      label: track?.label || item.track,
      number: "",
      title: item.title,
      time: "30–45 MIN",
      level: item.level || "CORE",
      description: item.description,
      summary: item.summary,
      focus: item.focus,
      sections: item.sections.map(([heading, ...paragraphs]) => ({ heading, paragraphs })),
      exercise: item.exercise,
      takeaway: item.takeaway,
      codeTitle: item.codeTitle,
      code: item.code,
      resources: item.resources || [],
      depth: {
        prerequisites: item.prerequisites,
        pitfalls: item.pitfalls,
        practiceSteps: item.practiceSteps,
        checkpoint: item.checkpoint,
        checkpoints: item.checkpoints || [],
        workedExample: item.workedExample,
        lab: item.lab,
        glossary: item.glossary,
        interactiveCase: item.interactiveCase || null,
        time: "30–45 MIN"
      }
    };
  };

  const topics = [
    {
      id: "cpp-filesystem", track: "cpp", title: "Filesystem paths & safe file operations",
      description: "Represent paths as paths, validate destinations, and report I/O errors.",
      summary: "The filesystem library models paths and file operations, but it does not remove the need to define a trust boundary or handle races and failures.",
      focus: ["std::filesystem::path", "relative vs absolute paths", "error handling"], prerequisites: "C++ strings, exceptions, and basic file I/O.",
      sections: [
        ["Use path operations instead of string tricks", "`std::filesystem::path` represents a path and lets the implementation apply platform-specific separators and syntax. Concatenating strings with a slash is not a reliable substitute: a path may be relative, rooted, UNC, or contain special components. Keep a trusted base directory separate from user-supplied path components.", "Before a program reads or writes a user-selected location, define which roots are allowed and what canonicalization policy applies. Reject paths that escape the intended base after resolving `.` and `..`; consider symbolic links and reparse points when the threat model includes concurrent filesystem changes."],
        ["Treat every filesystem operation as fallible", "A path can disappear between checking and opening it, permissions can change, and another process can replace a file. A check-then-open sequence may contain a time-of-check/time-of-use race. Prefer an API that performs the operation with the required access and handles its result rather than trusting an earlier existence check.", "Use `std::error_code` overloads when errors are expected control flow, or catch `filesystem_error` at a layer that can report useful context. Do not print full paths into public logs if they can reveal usernames or private project names."]
      ],
      exercise: "Write a function that accepts a relative file name, rejects absolute paths and parent traversal, and opens only files under a test directory.",
      takeaway: "A path is untrusted input plus filesystem state; an earlier existence check is not a permission or race-free guarantee.",
      practiceSteps: ["Test an ordinary relative path, an absolute path, and a path containing `..`.", "Check the exact error from an open failure and include the operation in the message.", "Explain how a symlink could change the meaning of a path after validation."],
      pitfalls: ["String-prefix checks can accept sibling directories with similar names.", "Checking a path and opening it later can race with another process."],
      checkpoint: { question: "Why is checking that a path exists before opening it insufficient?", answer: "The filesystem can change between the check and the open, and existence does not establish permission or that the path remains under an allowed root." },
      checkpoints: [{ question: "What should a path validator do with `..`?", answer: "Resolve or reject traversal according to an explicit root policy, then account for links and races where relevant." }],
      workedExample: { title: "Constrain a report export", scenario: "A command-line tool lets a user choose a report name but should write inside a dedicated output folder.", steps: ["Parse the requested path as a path object, not a shell fragment.", "Reject absolute paths and parent traversal under the program's stated policy.", "Open the destination using a safe operation and handle failure without assuming an earlier check is still true."], result: "The output rule is tied to a directory boundary, and the filesystem result—not an earlier check—determines success." },
      lab: { title: "Build a path policy test", objective: "Make path acceptance rules explicit and testable.", prompt: "Design a small file exporter that writes under a temporary directory you create for the exercise.", steps: ["Write the allowed and rejected path cases before implementing the check.", "Test nested relative paths, absolute paths, and traversal attempts.", "Test a missing or read-only directory and report the operation that failed."], completion: "Every accepted path remains within the intended policy and every failure is reported clearly.", hint: "A naive string prefix is not a reliable containment test." },
      glossary: [["Canonical path", "A normalized path representation resolved according to filesystem rules."], ["TOCTOU", "A time-of-check/time-of-use race between validation and a later operation."], ["Path traversal", "Using path components to escape an intended directory boundary." ]]
    },
    {
      id: "cpp-standard-library-views", track: "cpp", title: "Views, optionals & variants",
      description: "Pass borrowed ranges and explicit alternatives without hiding ownership.",
      summary: "Views can avoid copies, and sum types make absence or alternatives explicit. Their benefits depend on clear lifetime and state contracts.",
      focus: ["std::string_view and std::span", "std::optional", "std::variant"], prerequisites: "C++ values, references, containers, and object lifetime.",
      sections: [
        ["A view borrows; it does not own", "`std::string_view` and `std::span` describe access to existing storage. They are useful for synchronous read-only functions because they can represent text or a range without copying it. The owner must outlive every use of the view, including any callback or deferred task that stores it.", "Use an owning `std::string` or `std::vector` when data must be kept. Do not return a view into a local object or store a view into a temporary. A span carries a length, but it does not prove that the underlying pointer and extent are valid."],
        ["Represent absence and alternatives in the type", "`std::optional<T>` makes a possible missing value explicit; `std::variant<A, B>` represents one of several alternatives. These types can be clearer than magic values or a loosely documented tag plus untyped storage. Callers still need to handle the absent or unexpected case, especially when values cross a file or network boundary.", "Use `std::get_if` or `std::visit` to make variant handling explicit. If an alternative is added later, compiler diagnostics and exhaustive handling can help reveal places that need an update."]
      ],
      exercise: "Refactor a function that accepts `const std::string&` into a read-only view, then verify that no caller stores the view beyond the owner's lifetime.",
      takeaway: "Views describe access, not ownership; optional and variant types make alternatives explicit but do not validate external input.",
      practiceSteps: ["Identify which object owns the bytes behind each view.", "Use optional to represent a missing result instead of a sentinel value.", "Handle every variant alternative and test an untrusted serialized tag separately."],
      pitfalls: ["A view into a temporary dangles after the full expression.", "A variant from a file still needs validation and a versioning policy."],
      checkpoint: { question: "Does `std::span` extend the lifetime of the array it views?", answer: "No. It stores a pointer and extent; the underlying owner must outlive its use." },
      checkpoints: [{ question: "When is optional clearer than a sentinel?", answer: "When absence is a valid result and a sentinel could also be a valid value." }],
      workedExample: { title: "Parse an optional label", scenario: "A function accepts a string view and may return no recognized label.", steps: ["Pass the view only while the owning string remains alive.", "Return `std::optional<Label>` so not-found is distinct from any valid label.", "Check the optional before using its value and keep parsing separate from later side effects."], result: "The interface communicates borrowing and absence independently." },
      lab: { title: "Audit a view's lifetime", objective: "Find and remove a dangling-view possibility.", prompt: "Review a helper that creates a local string and returns a string_view into it.", steps: ["Draw the owner and view lifetimes.", "Replace the returned view with an owning string or change the interface to view caller-owned storage.", "Add a test that exercises the result after the helper returns."], completion: "No returned view refers to storage whose lifetime ended.", hint: "Returning a view is safe only when the API clearly guarantees the backing owner remains alive." },
      glossary: [["View", "A non-owning object that describes access to existing data."], ["Optional", "A type that represents either a value or no value."], ["Variant", "A type-safe value that contains one of several declared alternatives." ]]
    },
    {
      id: "cpp-concurrency-basics", track: "cpp", title: "Threads, races & synchronization",
      description: "Reason about shared state and thread lifetimes before adding parallel work.",
      summary: "Concurrency adds timing and ownership constraints. A thread-safe design protects invariants, not just individual variables.",
      focus: ["data races", "mutex and RAII locks", "joining and shutdown"], prerequisites: "C++ functions, RAII, references, and shared ownership.",
      sections: [
        ["Define the invariant before selecting a lock", "A data race occurs when conflicting unsynchronized accesses happen and at least one access writes. Identify the shared state and the invariant it represents, then ensure every access that can violate the invariant follows the same synchronization rule. A mutex is often the clearest starting point.", "An atomic protects operations on that atomic object; it does not make a multi-field invariant consistent by itself. Avoid using `volatile` for thread synchronization. Prefer reducing shared writable state or passing work through a queue when that makes the ownership model clearer."],
        ["Thread lifetime is resource lifetime", "A thread must be joined or safely owned before the data it uses is destroyed. Detached threads make shutdown and error handling much harder because the owner loses a direct completion point. Use RAII wrappers and define cancellation, shutdown order, and exception handling at the thread boundary.", "Do not call arbitrary callbacks while holding a mutex; the callback may re-enter the component or acquire another lock. Keep critical sections short and establish a consistent lock order when more than one lock is needed."]
      ],
      exercise: "Write a two-thread counter example, first with an intentional race in a disposable local test and then with a mutex protecting the update.",
      takeaway: "Concurrency safety requires a shared invariant, a synchronization rule, and a lifetime plan for every worker.",
      practiceSteps: ["List every thread that can read or write the shared value.", "Add a named lock guard around the invariant-preserving operation.", "Join workers before destroying any state they can access."],
      pitfalls: ["Locking only the writer does not protect a reader that ignores the same rule.", "A mutex cannot protect an object after its lifetime ends."],
      checkpoint: { question: "Does an atomic variable make a multi-field invariant thread-safe?", answer: "No. It synchronizes operations on that atomic object; other fields need a design that protects the complete invariant." },
      checkpoints: [{ question: "Why prefer joining an owned thread to detaching it?", answer: "Joining gives the owner a clear completion point before shared state is destroyed." }],
      workedExample: { title: "Protect a queue invariant", scenario: "Two workers add items while a consumer removes them.", steps: ["Identify the relationship between the queue's contents and its empty/non-empty state.", "Protect push and pop with the same mutex or a designed concurrent queue.", "Wake the consumer using a condition tied to the queue predicate and join workers during shutdown."], result: "The synchronization protects the operation's invariant and worker lifetime, not merely a single field." },
      lab: { title: "Review a thread shutdown path", objective: "Make shared state lifetime outlast every worker that uses it.", prompt: "Draw a manager, one worker, and a shared result structure.", steps: ["Mark who owns the worker and result.", "Write the stop-request, notification, join, and destruction order.", "Test an early error path and confirm the worker is joined before the result is destroyed."], completion: "Every thread finishes before the resources and state it uses are released.", hint: "A detached worker is not a substitute for a shutdown plan." },
      glossary: [["Data race", "Conflicting unsynchronized memory accesses with at least one write."], ["Invariant", "A condition that must remain true across operations on shared state."], ["Join", "A synchronization operation that waits for a thread to finish." ]]
    },
    {
      id: "c-first-program", track: "c", title: "Your first C program",
      description: "Compile a small C program and trace its entry point and output.",
      summary: "C source is translated by a compiler and linked into a program whose hosted entry point is `main`.",
      focus: ["main and return values", "stdio", "compile vs link"], prerequisites: "None.",
      sections: [
        ["Read the smallest complete program", "A hosted C program starts in `main`, which returns an integer status to the environment. `#include <stdio.h>` makes declarations for standard input and output available. `printf` formats text and values; the format string must match the argument types supplied.", "The build has stages: preprocessing expands directives, compilation checks and translates a translation unit, linking resolves external symbols, and the operating system starts the executable. A syntax diagnostic, unresolved symbol, and runtime failure need different fixes."],
        ["Keep the format string honest", "A `printf` format specifier is a contract with the variadic arguments. Passing an incompatible type or a missing argument can cause undefined behavior. Start with a fixed string, then add one formatted value at a time and use the matching conversion specifier.", "Compile with warnings enabled and treat warnings as feedback. Read the first useful diagnostic, check the source line and declaration, and change one thing before rebuilding."]
      ],
      exercise: "Print a name and an integer on separate lines, then compile with warnings and explain each format specifier.",
      takeaway: "C gives you direct control, so types, format strings, and build stages are explicit contracts.",
      practiceSteps: ["Change the output string and compile again.", "Add one integer argument with a matching format specifier.", "Create a missing-definition link error in a two-file toy project and identify the stage."],
      pitfalls: ["A format mismatch is not merely cosmetic; variadic calls rely on the format contract.", "Successful compilation does not prove the linker found every definition."],
      checkpoint: { question: "What does returning zero from a hosted `main` conventionally report?", answer: "Successful program termination." },
      checkpoints: [{ question: "Which stage resolves a call to a function defined in another object file?", answer: "The linker resolves the external symbol." }],
      workedExample: { title: "Add one formatted integer", scenario: "The program should print `items: 4`.", steps: ["Use a format string that contains `%d` for an int.", "Pass the integer as the corresponding argument.", "Compile with warnings and verify the declaration for `printf` is visible."], result: "The format and argument list agree, so output is defined and understandable." },
      lab: { title: "Build and diagnose a tiny C program", objective: "Connect source, compiler, linker, and output.", prompt: "Write a program that prints a label and a count using standard output.", steps: ["Compile and run the program with warnings enabled.", "Change one format specifier and observe the warning or behavior.", "Fix the format and write down which build stage reports each issue."], completion: "The program prints the expected text and the build has no unexplained diagnostics.", hint: "Use `%zu` for `size_t` rather than assuming it is an `int`." },
      glossary: [["Translation unit", "A source file after preprocessing, compiled independently."], ["Format string", "A template that tells a variadic output function how to interpret arguments."], ["Exit status", "A small result reported by a program to its environment." ]],
      codeTitle: "hello.c", code: "#include <stdio.h>\n\nint main(void) {\n    puts(\"Hello from C\");\n    return 0;\n}"
    },
    {
      id: "c-values-and-types", track: "c", title: "C values, types & conversions",
      description: "Choose integer types deliberately and validate before converting.",
      summary: "C's scalar types define representable ranges and conversion rules; a cast does not validate a value.",
      focus: ["integer promotions", "signed and unsigned", "initialization"], prerequisites: "Your first C program.",
      sections: [
        ["Choose the type for the domain", "Use `int` for ordinary integer calculations, `size_t` for object sizes and indexes, and fixed-width types when an external format specifies exact widths. The type name is not just storage: it determines promotions, arithmetic, comparison, and formatting rules.", "Initialize objects when they are declared. C does not automatically give every local scalar a useful value. Reading an uninitialized automatic object can produce undefined behavior, so make valid initialization part of the control flow."],
        ["Make conversions a checked step", "An implicit conversion may change signedness or discard range. A negative signed value converted to `size_t` becomes a large unsigned value. Parse untrusted input into a type that can represent it, check its range, and only then convert to the type used by the program.", "Use compiler warnings to find suspicious conversions. Do not silence them with a cast until you can state why the value is within range and why the resulting type is correct."]
      ],
      exercise: "Parse a signed count, reject negative and too-large inputs, then convert it to `size_t` only after validation.",
      takeaway: "A C cast changes representation; range checks establish whether the conversion is valid for the program.",
      practiceSteps: ["Write the minimum and maximum accepted values for an input field.", "Test zero, the upper boundary, a negative number, and a value beyond the destination range.", "Choose a format specifier that matches each type you print."],
      pitfalls: ["A cast does not clamp, validate, or report truncation.", "Signed and unsigned comparisons can convert one operand before the comparison."],
      checkpoint: { question: "Why reject negative input before converting it to `size_t`?", answer: "The conversion can produce a very large unsigned value rather than preserving the negative meaning." },
      checkpoints: [{ question: "What does `sizeof` return?", answer: "A value of type `size_t`, representing the size in bytes." }],
      workedExample: { title: "Validate a record count", scenario: "A command-line option supplies the number of records to allocate.", steps: ["Parse into a signed type and verify the full token was consumed.", "Reject values below zero and above the application's maximum.", "Convert to `size_t` only after those checks."], result: "The destination type is used only after its value range has been proven." },
      lab: { title: "Build a checked integer parser", objective: "Separate syntax, range, and conversion checks.", prompt: "Accept a retry count between zero and eight.", steps: ["Test empty and malformed text.", "Test the lower and upper boundary and one value outside each.", "Verify invalid input does not become a huge unsigned count."], completion: "Every accepted value is in range before conversion or allocation.", hint: "A range check after a narrowing cast may be too late." },
      glossary: [["Integer promotion", "A conversion applied to small integer types before many operations."], ["Signedness", "Whether a type represents negative values and how conversions behave."], ["size_t", "The unsigned type used to represent object sizes." ]]
    },
    {
      id: "c-control-flow", track: "c", title: "C conditions & loops",
      description: "Make branches, loop bounds, and termination arguments explicit.",
      summary: "Control flow is a sequence of decisions. Boundary tests expose skipped work, repeated work, and invalid access.",
      focus: ["if and switch", "for and while", "loop bounds"], prerequisites: "C values and types.",
      sections: [
        ["Write the condition in words", "An `if` chooses a branch based on whether an expression is nonzero. A `switch` dispatches among integer or enumeration values; each case needs a deliberate termination behavior such as `break` or a documented fallthrough. Braces make branch boundaries visible during review.", "A loop needs a start, a condition, and progress toward termination. Before writing an index loop, state the valid range and whether the end is inclusive or exclusive. For an array with `count` elements, the common valid range is `[0, count)`."],
        ["Test empty and exact-boundary cases", "For zero items, a loop should often execute zero times. For one item, it should execute exactly once. For a count N, `i < N` visits zero through N minus one. `i <= N` includes the one-past boundary and is usually wrong for indexing.", "An unsigned index cannot become negative. Reverse loops must check before decrementing, otherwise underflow can produce a very large value and keep the loop running unexpectedly."]
      ],
      exercise: "Write a loop that counts the even values in an array and verify it for lengths zero, one, and several.",
      takeaway: "A loop is correct when its bounds and progress can be explained for every valid input size.",
      practiceSteps: ["Trace the index and condition for an empty array.", "Trace the last valid index for a three-element array.", "Add a branch for an invalid state and test the exact boundary."],
      pitfalls: ["An inclusive upper bound can read one element past the array.", "An unsigned decrement at zero wraps instead of becoming negative."],
      checkpoint: { question: "For an array of length four, what does `i < 4` visit when `i` starts at zero?", answer: "Indexes zero, one, two, and three." },
      checkpoints: [{ question: "Can an index loop process an empty array?", answer: "Yes. With an initial index of zero and a `i < count` condition, the body is skipped." }],
      workedExample: { title: "Trace a half-open traversal", scenario: "A loop counts bytes in a buffer of length three.", steps: ["Start with index zero.", "Continue while index is less than three.", "Increment once per iteration; the body sees 0, 1, and 2."], result: "The end value three is a boundary, not an element." },
      lab: { title: "Test a bounded loop", objective: "Verify the loop for zero, one, and many elements.", prompt: "Write a function that counts values greater than a threshold in a pointer-and-count pair.", steps: ["Define behavior when count is zero.", "Check the index condition before reading each element.", "Test the first, last, and no-match cases."], completion: "The function never reads outside the declared range.", hint: "Treat count as the element count, not the final index." },
      glossary: [["Branch", "A control-flow choice based on a condition."], ["Loop invariant", "A fact that remains true across each iteration."], ["Half-open range", "A range that includes its start and excludes its end." ]]
    },
    {
      id: "c-functions", track: "c", title: "C functions & interfaces",
      description: "Use prototypes, return values, and pointer contracts to organize programs.",
      summary: "C function declarations expose a contract; implementations and callers must agree on types and ownership.",
      focus: ["prototypes", "return values", "pointer parameters"], prerequisites: "C conditions and loops.",
      sections: [
        ["Declare before calling", "A function prototype tells the compiler the function's name, parameter types, and return type. Put shared prototypes in a header and include it in callers and the implementation file. This lets the compiler catch mismatched arguments instead of treating the call as an unexplained symbol.", "A function should have one clear responsibility. Pass small scalar values directly. For arrays, pass a pointer and its count together. For output values, document whether the output is valid on success only or may be partially written on failure."],
        ["Choose result and ownership conventions", "Use a return value for status when that does not conflict with the result domain. If a function returns allocated memory, document who frees it and which allocator to use. A pointer returned into an input buffer is borrowed; the caller must keep the original buffer alive.", "Avoid hidden mutable globals when explicit parameters make the dependency visible. Smaller interfaces are easier to test and reuse, especially when errors need to be handled by a caller with more context."]
      ],
      exercise: "Write a function that returns the maximum of two integers, then write a separate function that reports an error through a status value.",
      takeaway: "A C function signature and its documentation together define the boundary between caller and implementation.",
      practiceSteps: ["Write a prototype and include it from the implementation file.", "Document nullability, capacity, mutation, and ownership for pointer parameters.", "Test both a valid result and a documented failure result."],
      pitfalls: ["An array parameter does not carry its length automatically.", "A pointer return does not say whether the caller owns the pointed-to storage."],
      checkpoint: { question: "Why include the public header in the source file that defines the function?", answer: "It lets the compiler verify that the definition matches the shared declaration." },
      checkpoints: [{ question: "When can a function safely return a pointer into its input?", answer: "When the contract says it is borrowed and the caller keeps the input alive for every use." }],
      workedExample: { title: "Return status and write output", scenario: "A parser converts one token into an integer and can fail.", steps: ["Return a named status for success or failure.", "Write the output only after complete parsing and range validation.", "Tell callers whether the output is unchanged or initialized on failure."], result: "The caller can inspect status before consuming the output and does not guess at ownership." },
      lab: { title: "Design a small C interface", objective: "Make data and failure behavior explicit.", prompt: "Design a parser function that receives text and returns a numeric result.", steps: ["Write the prototype and list required includes.", "Choose a status convention and output guarantee.", "Create a caller that handles both success and failure."], completion: "The interface documents the string lifetime, output validity, and exact error result.", hint: "Avoid returning a magic number that could also be valid data." },
      glossary: [["Prototype", "A declaration that gives the compiler a function's type before its definition."], ["Output parameter", "A pointer argument through which a function returns data."], ["Ownership", "Responsibility for the lifetime and release of an allocated resource." ]]
    },
    {
      id: "c-const-correctness", track: "c", title: "C const, pointers & API contracts",
      description: "Use qualifiers to clarify what a function may read or change.",
      summary: "`const` constrains modification through an expression; it does not guarantee ownership, lifetime, or global immutability.",
      focus: ["pointer-to-const", "const pointer", "API documentation"], prerequisites: "C functions, pointers, and arrays.",
      sections: [
        ["Read pointer qualifiers from the identifier outward", "`const int *value` means the function cannot modify the pointed-to integer through `value`; the pointer itself may be reassigned. `int *const value` means the local pointer cannot be reassigned, while the pointed-to integer may be modified. `const int *const value` constrains both through that name.", "These qualifiers communicate part of the contract and help the compiler catch accidental writes. They do not tell you who owns the object, whether it is still alive, or how many elements are valid."],
        ["Use const to describe intent", "A read-only array parameter should generally be `const T *` with an explicit count. A function that changes an object should take a mutable pointer and document the change. Avoid casting away const: the original object may truly be const, and modifying it can be undefined behavior.", "Const-correct APIs are easier to review because readers can see which functions observe and which mutate state. Keep that information consistent with the implementation and any retained pointers."]
      ],
      exercise: "Write a function that calculates the average of a read-only array and a second function that normalizes an array in place.",
      takeaway: "Const communicates permitted access through one expression; ownership and bounds remain separate contracts.",
      practiceSteps: ["Annotate each pointer in a function prototype as read-only or mutable.", "State whether the function retains the pointer after returning.", "Remove any cast that discards const and redesign the interface instead."],
      pitfalls: ["A const pointer is not necessarily a pointer to a const object.", "Const does not make a shared object thread-safe or extend its lifetime."],
      checkpoint: { question: "What does `const int *p` prevent?", answer: "It prevents modifying the pointed-to int through p; it does not make the pointer or object globally immutable." },
      checkpoints: [{ question: "Does `const` say whether a pointer owns its target?", answer: "No. It describes mutation through that expression, not ownership." }],
      workedExample: { title: "Separate observation from mutation", scenario: "A statistics function reads samples while a normalization function changes them.", steps: ["Declare the statistics parameter as a pointer to const data plus count.", "Declare the normalization parameter as a mutable pointer plus count.", "Document whether either function stores the pointer after returning."], result: "The function signatures show which operation mutates the caller's array." },
      lab: { title: "Audit a C header", objective: "Improve API contracts with qualifiers and comments.", prompt: "Review three pointer parameters in a toy header.", steps: ["For each parameter, state read-only or mutable access.", "Document nullability and capacity.", "Document ownership and lifetime separately from constness."], completion: "A caller can understand mutation and lifetime without reading implementation details.", hint: "Never cast away const simply to satisfy a poorly designed interface." },
      glossary: [["Pointer to const", "A pointer that cannot modify its target through that expression."], ["Const pointer", "A pointer variable that cannot be reassigned after initialization."], ["Const-correctness", "Using qualifiers consistently to express intended mutation." ]]
    },
    {
      id: "c-file-io", track: "c", title: "C files, streams & parsing",
      description: "Handle file errors and parse complete records before using them.",
      summary: "C stdio operations can fail at open, read, write, and close time; each result needs an explicit check.",
      focus: ["FILE* lifetime", "fgets and fscanf", "EOF vs error"], prerequisites: "C strings and function error handling.",
      sections: [
        ["Treat a file stream as an owned resource", "`fopen` returns a `FILE*` or null. A successful open creates an ownership obligation: close it exactly once with `fclose`. Read and write calls have their own return contracts. A successful open does not guarantee all later operations will succeed.", "Check `ferror` and end-of-file state after a read loop. A short read can mean end-of-file or an error; the stream indicators distinguish them. Preserve `errno` only when the documented library contract makes it relevant."],
        ["Parse a full record before updating state", "Read a complete line into a bounded buffer, detect truncation, and parse into temporary values. Validate that the parser consumed the whole record and that all ranges are acceptable before changing application state.", "`fscanf` can stop partway through a record and leave the input position in a surprising state. For simple formats it can be appropriate, but a line-first parser often gives clearer error reporting and recovery behavior."]
      ],
      exercise: "Read a text file containing one integer per line, reject malformed lines, and report the line number without printing a partial total as success.",
      takeaway: "File I/O is a sequence of fallible operations; parsing is not complete until the entire record is validated.",
      practiceSteps: ["Check the return from `fopen` before using the stream.", "Detect an overlong line instead of accepting a truncated prefix.", "Close the stream on every path and preserve useful error context."],
      pitfalls: ["A fixed-size buffer needs an overlong-line policy.", "EOF and I/O error are different stream states."],
      checkpoint: { question: "What should happen before parsed fields update program state?", answer: "Parse the whole record into temporaries and validate each field before committing the update." },
      checkpoints: [{ question: "Does successful `fopen` prove later reads will succeed?", answer: "No. Reads and writes can fail independently after the file is opened." }],
      workedExample: { title: "Read and validate a record", scenario: "A file contains an integer score on each line.", steps: ["Read one bounded line and track the line number.", "Parse into a temporary integer and verify no unexpected trailing characters remain.", "Add it to the total only after the whole record is valid."], result: "A malformed final line does not produce a misleading partial total." },
      lab: { title: "Build a defensive file reader", objective: "Cover open failure, malformed input, truncation, and cleanup.", prompt: "Use a test file with one valid record and one malformed record.", steps: ["Test a missing file and report the failed path safely.", "Test a valid file, empty file, malformed line, and long line.", "Check stream error state and close the file on every path."], completion: "The program distinguishes EOF from I/O failure and never reports an unvalidated partial result as success.", hint: "Line-oriented parsing makes it easier to attach errors to a record number." },
      glossary: [["FILE*", "A C library stream object used for buffered file operations."], ["EOF", "An end-of-file indicator returned by certain input functions."], ["ferror", "A stream indicator used to distinguish an I/O error from normal EOF." ]]
    },
    {
      id: "c-preprocessor", track: "c", title: "The C preprocessor & macros",
      description: "Understand includes and conditional compilation without hiding program logic.",
      summary: "The preprocessor performs textual inclusion and macro expansion before the compiler checks C syntax and types.",
      focus: ["include guards", "object-like macros", "conditional compilation"], prerequisites: "C functions, headers, and separate compilation.",
      sections: [
        ["Preprocessing occurs before C parsing", "`#include` inserts a header's processed contents into the translation unit. Include guards or `#pragma once` prevent repeated processing within that translation unit. They do not prevent duplicate external definitions across different source files.", "Macros are token substitutions, not typed variables or functions. Parenthesize macro arguments and the whole replacement when a macro is necessary, and beware that arguments can be evaluated more than once. Prefer `const`, `enum`, `static inline`, or ordinary functions when those express the intent safely."],
        ["Use conditional compilation for real platform differences", "`#if` and related directives can include platform-specific declarations or select implementation files. Keep the conditions narrow and documented. A feature flag that silently changes behavior across builds complicates testing; record the macro configuration used for each target.", "The preprocessor can make diagnostics difficult because the compiler sees expanded code. Use a preprocessor-output mode when you need to understand what a translation unit contains, then keep the actual source simple enough to review."]
      ],
      exercise: "Replace a value macro with a typed constant and a function-like macro with a `static inline` function; compare call-site behavior.",
      takeaway: "Macros operate on tokens before type checking; use typed language features when they provide the same capability.",
      practiceSteps: ["Add an include guard and include the header twice in one test file.", "Expand a side-effecting macro argument more than once and identify the bug.", "Inspect preprocessor output for a small source file."],
      pitfalls: ["A header guard does not deduplicate definitions across translation units.", "A macro can evaluate an argument multiple times and has no type checking."],
      checkpoint: { question: "When does macro expansion happen relative to C type checking?", answer: "It happens during preprocessing, before the compiler parses and type-checks the resulting translation unit." },
      checkpoints: [{ question: "Why are function-like macros riskier than ordinary functions?", answer: "They are textual substitutions, lack type checking, and may evaluate arguments multiple times." }],
      workedExample: { title: "Replace a macro safely", scenario: "A `MAX(a,b)` macro evaluates its arguments twice and callers pass expressions with side effects.", steps: ["Show how an expression can execute more than once after substitution.", "Replace the macro with a typed function or inline function when the types are known.", "Use a compile-time constant for a fixed value instead of an object-like macro."], result: "The new form gives normal argument evaluation and compiler diagnostics." },
      lab: { title: "Inspect an include chain", objective: "Understand which declarations a translation unit actually sees.", prompt: "Create two small headers with guarded declarations and inspect the preprocessed source.", steps: ["Include one header twice and confirm its guard behavior.", "Add a second source file with a duplicate external definition to see the linker is unaffected by include guards.", "Replace a simple macro with a typed alternative and compare warnings."], completion: "You can distinguish preprocessing behavior from compilation and linking behavior.", hint: "Include guards are local to one translation unit." },
      glossary: [["Macro", "A preprocessor token substitution defined with `#define`."], ["Include guard", "A preprocessor condition that prevents repeated inclusion in one translation unit."], ["Conditional compilation", "Including or excluding source text based on preprocessor conditions." ]]
    },
    {
      id: "c-function-pointers", track: "c", title: "C function pointers & callbacks",
      description: "Pass behavior through a typed callback while keeping state and lifetime clear.",
      summary: "A function pointer's type includes its parameter and return types; callbacks need an explicit contract for context and lifetime.",
      focus: ["function pointer syntax", "callback context", "API compatibility"], prerequisites: "C functions, pointers, and structs.",
      sections: [
        ["Read the function-pointer type", "A function pointer names a callable function with a specific return type and parameter list. Parentheses around `*name` distinguish a pointer to a function from a function returning a pointer. A callback with the wrong calling convention or signature is not compatible just because its address can be cast.", "C libraries often pair callbacks with a `void *context` pointer so callers can supply state. Document whether the callback can be called synchronously, repeatedly, or after the registering function returns. The context object must remain alive for every possible invocation."],
        ["Keep callback ownership explicit", "A callback does not own the context or resources it references. A registration API needs a cancellation or completion rule so the caller knows when callback storage can be released. If callbacks may run concurrently, define synchronization for shared context.", "Use a small typedef for complex callback signatures. It improves readability and makes it easier to keep declaration, implementation, and caller consistent."]
      ],
      exercise: "Write a function that accepts a comparator callback and a context pointer, then tests two integers using that comparator.",
      takeaway: "A callback's type is only part of its contract; invocation timing and context lifetime matter too.",
      practiceSteps: ["Declare a typedef for a callback with two inputs and a context pointer.", "Pass a function with the exact signature and test its result.", "Document when callback registration ends and who owns the context."],
      pitfalls: ["Casting an incompatible function pointer does not make the call valid.", "A stored callback can outlive the context pointer supplied at registration."],
      checkpoint: { question: "What must outlive a registered callback if it uses a context pointer?", answer: "The context object must remain valid until the API guarantees no further callback invocation." },
      checkpoints: [{ question: "Does a function pointer cast repair an incompatible signature?", answer: "No. Calling through an incompatible function-pointer type is not made safe by the cast." }],
      workedExample: { title: "Compare values through a callback", scenario: "A sorting helper needs an ordering rule supplied by its caller.", steps: ["Define one exact comparator function-pointer type.", "Pass a comparator implementation with matching parameters and return type.", "Provide context only if the comparison genuinely needs extra state and keep it alive through every call."], result: "The callback's type and lifetime contract are explicit at the API boundary." },
      lab: { title: "Design a callback contract", objective: "Practice function-pointer signatures without hidden lifetime assumptions.", prompt: "Create a callback API that invokes a user function for each value in a small array.", steps: ["Define callback signature and optional context.", "Specify whether callbacks can stop iteration or retain context.", "Test a callback that counts values and another that requests early termination."], completion: "The caller knows invocation timing, context lifetime, and error/termination behavior.", hint: "Keep the first version synchronous so the callback lifetime is bounded by the function call." },
      glossary: [["Function pointer", "A pointer to a function with a particular signature."], ["Callback", "A function supplied to another component for later invocation."], ["Context pointer", "Caller-supplied state passed to a callback, often through `void *`." ]]
    },
    {
      id: "c-debugging-sanitizers", track: "c", title: "C warnings, debugging & sanitizers",
      description: "Turn compiler and runtime diagnostics into a repeatable repair loop.",
      summary: "Warnings and sanitizers expose likely bugs, but the first invalid operation and an exact reproduction are what make a fix reliable.",
      focus: ["compiler warnings", "debug symbols", "ASan and UBSan"], prerequisites: "C functions, pointers, allocation, and undefined behavior.",
      sections: [
        ["Build for diagnosis", "Enable useful compiler warnings and debug symbols in development builds. Treat warnings as questions to answer rather than output to hide. A warning about format types, implicit conversion, or an unused result may reveal a bug before it becomes a crash.", "AddressSanitizer and UndefinedBehaviorSanitizer can detect selected memory and language errors on executed paths. They are not proofs of safety; untested paths and unsupported operations remain possible. Keep the compiler version and flags with the reproduction."],
        ["Start from the earliest useful evidence", "Record exact input, expected behavior, actual behavior, compiler flags, and first diagnostic. Under a debugger, stop at the first relevant failure and inspect the address, call stack, and object lifetime. Reduce the case until one invalid operation remains.", "Fix the earliest broken assumption and add a regression test. Do not merely patch the line where a symptom appears or suppress a sanitizer report because the output seems acceptable."]
      ],
      exercise: "Compile a small C function with warnings and sanitizers, then use a local boundary test to verify its corrected behavior.",
      takeaway: "Diagnostics become useful when they are reproducible, understood, and followed by a regression test.",
      practiceSteps: ["Record the exact compiler command and first warning.", "Reduce a test failure to the smallest input that reproduces it.", "Add a regression test and rerun the sanitizer build."],
      pitfalls: ["A clean sanitizer run only covers paths actually executed.", "Disabling warnings removes evidence rather than fixing the underlying issue."],
      checkpoint: { question: "What does a passing sanitizer run prove?", answer: "Only that no instrumented problem was detected on the executed paths in that run." },
      checkpoints: [{ question: "Why keep a failing input after fixing a bug?", answer: "It becomes a regression test that proves the repaired behavior remains correct." }],
      workedExample: { title: "Use a warning to find a format bug", scenario: "A program prints a `size_t` value using an integer conversion meant for `int`.", steps: ["Compile with format warnings enabled.", "Read the warning's expected and provided argument types.", "Use the matching format or a type-safe formatting API and add a test for a large value."], result: "The warning reveals a type-contract mismatch before it causes corrupted output or undefined behavior." },
      lab: { title: "Create a debug build recipe", objective: "Make a small failure reproducible and diagnosable.", prompt: "Take a local C program and define a debug build with useful warnings and sanitizers.", steps: ["Record compiler, standard mode, warning flags, and sanitizer flags.", "Run boundary tests and preserve the first diagnostic.", "Fix one issue and add a regression test."], completion: "Another developer can reproduce the build and understand why the diagnostic was addressed.", hint: "Use controlled toy input; do not test an unknown binary." },
      glossary: [["Compiler warning", "A diagnostic about suspicious code that may still compile."], ["Sanitizer", "Runtime instrumentation for selected classes of programming errors."], ["Regression test", "A repeatable check that guards against a previously fixed defect." ]]
    },
    {
      id: "lowlevel-stack-heap-layout", track: "lowlevel", title: "Stack, heap & process layout",
      description: "Distinguish storage regions, object lifetime, and operating-system mappings.",
      summary: "Stack and heap describe common storage strategies, not separate security domains or complete explanations of an object's lifetime.",
      focus: ["automatic storage", "dynamic allocation", "mappings and lifetime"], prerequisites: "C/C++ object lifetime, pointers, and virtual memory.",
      sections: [
        ["Storage duration is a language concept", "Automatic objects typically have lifetimes tied to block execution; dynamically allocated objects persist until released by their owner. The implementation may use a stack for automatic storage and a heap allocator for dynamic storage, but those terms do not fully specify the language rules or memory mapping.", "A freed block may remain mapped, and a mapped page may not contain a live object. Do not infer object validity from whether an address still appears readable in a debugger."],
        ["Track ownership across boundaries", "When a pointer crosses a function or thread boundary, document who owns the allocation and when it is released. A pointer copied onto another stack does not extend the target object's lifetime. In C++, RAII binds release to an owner; in C, cleanup conventions and return contracts must make the same responsibility clear.", "Stack space is finite and large automatic arrays can exhaust it. Dynamic allocation has its own failure, fragmentation, and cleanup costs. Choose storage based on the object's lifetime and size, then check the result under the actual platform." ]
      ],
      exercise: "Draw the lifetime of a local array, a heap allocation, and a pointer returned from a helper function.",
      takeaway: "Memory region, object lifetime, and ownership are related but distinct questions.",
      practiceSteps: ["Mark object creation, first use, owner, and destruction on a timeline.", "Explain why a readable address can still refer to a dead object.", "Compare automatic storage with a dynamically owned container for one example."],
      pitfalls: ["A pointer copy does not extend its target's lifetime.", "The words stack and heap do not prove page permissions or object validity."],
      checkpoint: { question: "Does a still-mapped address guarantee that the original C++ object is alive?", answer: "No. Storage mapping and language-level object lifetime are separate." },
      checkpoints: [{ question: "What should a function document when returning a pointer?", answer: "Whether it owns or borrows the target and how long the target remains valid." }],
      workedExample: { title: "Return an owned result", scenario: "A helper constructs text and a caller needs to keep it after the helper returns.", steps: ["Avoid returning a pointer into a local array.", "Return an owning string/container or pass caller-owned storage with a documented capacity.", "Test use after the helper's stack frame has ended."], result: "The value outlives the helper by ownership rather than by relying on stale stack bytes." },
      lab: { title: "Map an object's lifetime", objective: "Separate the object's storage from the pointer that refers to it.", prompt: "Review a toy function that returns an address and redesign the return contract.", steps: ["Identify where the object is created and destroyed.", "Choose a value return, explicit owner, or documented borrow.", "Test the result after the original scope exits."], completion: "No caller uses an observer after its owner has released the target.", hint: "A memory viewer showing bytes at an address does not establish a live object." },
      glossary: [["Automatic storage", "Storage whose lifetime is generally bounded by a block or scope."], ["Dynamic allocation", "Storage requested during execution and released under an ownership contract."], ["Object lifetime", "The period in which a language-level object exists and may be used." ]]
    },
    {
      id: "lowlevel-user-kernel-boundary", track: "lowlevel", title: "System calls & privilege boundaries",
      description: "Understand how user programs request operating-system services safely.",
      summary: "A system-call boundary transfers a request from user mode to a privileged kernel interface with validation and error handling.",
      focus: ["user vs kernel mode", "system-call ABI", "input validation"], prerequisites: "Processes, registers, and calling conventions.",
      sections: [
        ["A system call is a controlled transition", "Applications cannot directly perform every privileged operation. They request services through documented system interfaces. The architecture and operating system define how arguments cross the boundary, how execution transitions, and how results or errors return.", "The call interface validates pointers, lengths, handles, and access rights before using user-supplied values. A successful transition does not imply every requested operation is authorized; the kernel and service apply their own checks."],
        ["Do not confuse API wrappers with the kernel contract", "A high-level library call may validate arguments, convert types, or make several system calls. The system-call number or register layout is implementation-specific and can change. Use documented APIs for application work; study the boundary through official documentation or controlled tracing rather than hard-coding undocumented internals.", "Errors can originate in argument validation, access control, resource limits, or the underlying device. Preserve the return status and context instead of assuming all failures mean permission denial."]
      ],
      exercise: "Draw a request from a user program through a documented API to an OS service and back, marking trust checks and error results.",
      takeaway: "The kernel boundary is an authority transition with an ABI and validation contract, not a magic function call.",
      practiceSteps: ["Identify the user-controlled values passed to one documented API.", "Find its return and failure contract.", "Explain why an API wrapper may perform more than one kernel transition."],
      pitfalls: ["Undocumented system-call numbers are not stable application interfaces.", "Crossing into the kernel does not bypass access checks."],
      checkpoint: { question: "Why validate pointers and lengths at a system boundary?", answer: "They come from a less-trusted caller and must not be used beyond valid memory or authority." },
      checkpoints: [{ question: "Does a successful system call mean the caller is allowed to perform every related action?", answer: "No. Each operation still follows its documented access checks and resource rules." }],
      workedExample: { title: "Trace a file read request", scenario: "A user-mode program requests bytes from an open file handle.", steps: ["The program calls a documented library API with a handle and destination buffer.", "The OS checks handle rights and validates the destination range before writing.", "The call returns a byte count or a documented failure result."], result: "The transition includes validation, authority checks, and a result contract." },
      lab: { title: "Read one API contract", objective: "Learn a system interface from its documentation rather than assumptions.", prompt: "Select a file or process API from your operating system's official documentation.", steps: ["List parameter types, valid ranges, ownership, and failure values.", "Identify which inputs are controlled by the caller.", "Write one negative test that should fail safely."], completion: "Your notes describe the supported API, not an undocumented system-call implementation detail.", hint: "Use a local toy program and documented APIs for experiments." },
      glossary: [["User mode", "A restricted execution mode for ordinary applications."], ["Kernel mode", "A privileged execution mode used by the operating-system kernel."], ["System call", "A controlled interface through which a program requests an OS service." ]]
    },
    {
      id: "lowlevel-object-files", track: "lowlevel", title: "Object files, symbols & relocation",
      description: "Inspect how compiled code records external names and address fixups.",
      summary: "Object files contain machine code, data, symbols, and relocation records that the linker uses to build a final image.",
      focus: ["symbol tables", "undefined references", "relocation entries"], prerequisites: "Functions, build linking, and executable formats.",
      sections: [
        ["Symbols connect separately compiled code", "A source-level function may produce a symbol that another object file references. Object files distinguish defined symbols from unresolved references. The linker resolves those names against other objects or libraries and reports missing or duplicate definitions.", "Name mangling, visibility, architecture, and calling conventions affect whether two compiled components agree on a symbol. Compare the exact toolchain and language linkage rather than assuming similar source spelling means binary compatibility."],
        ["Relocations defer address decisions", "A compiler may not know the final address of a function or global when it emits one object file. A relocation entry records how the linker should adjust an instruction or data field once layout is known. Different object formats define different relocation types and constraints.", "Inspect a tiny program you built with a symbol viewer. Relocation output is evidence about that build and target; it is not a portable source-level guarantee."]
      ],
      exercise: "Compile two source files separately, inspect one undefined symbol in the caller object, then link the implementation and compare the result.",
      takeaway: "Object files preserve unresolved relationships until the linker has enough inputs to resolve them.",
      practiceSteps: ["Find a defined and undefined symbol in object output.", "Remove one implementation object and interpret the link diagnostic.", "Explain what a relocation record needs from the final layout."],
      pitfalls: ["An object file is not necessarily a complete executable.", "Symbol names and relocation formats are target-specific."],
      checkpoint: { question: "What does a relocation record describe?", answer: "How the linker must adjust an address-dependent field when the final layout is known." },
      checkpoints: [{ question: "Why can a caller object compile with an unresolved function reference?", answer: "The compiler can emit an external symbol reference for the linker to resolve later." }],
      workedExample: { title: "Follow an unresolved function", scenario: "`main.o` references `parse_record`, which is defined in another source file.", steps: ["Inspect the caller object and locate the undefined symbol.", "Inspect the implementation object and locate the matching definition.", "Link both objects and confirm the reference resolves."], result: "The object files describe a relationship; the linker supplies the final address and resolves it." },
      lab: { title: "Compare object and executable symbols", objective: "See how linking changes symbol state.", prompt: "Use a small two-file program you compile locally.", steps: ["Inspect symbols before linking.", "Link the objects and inspect the resulting image.", "Remove or rename the implementation and compare the diagnostic."], completion: "You can name which input provides each symbol and which stage reports a mismatch.", hint: "Use a documented object-file viewer for your target format." },
      glossary: [["Symbol", "A name representing a function, object, or section in compiled output."], ["Relocation", "A record describing an address-dependent adjustment for the linker."], ["Object file", "A compiled file that may still contain unresolved references." ]]
    },
    {
      id: "lowlevel-optimization", track: "lowlevel", title: "Compiler optimization & observability",
      description: "Understand why optimized code may not resemble the source line by line.",
      summary: "Optimizers preserve required observable behavior while changing instruction order, inlining functions, and removing unused calculations.",
      focus: ["inlining", "dead-code elimination", "debug symbols"], prerequisites: "Basic assembly reading and compiler builds.",
      sections: [
        ["Optimization changes representation, not the source contract", "A compiler can inline a call, combine operations, remove an unused value, or keep a variable only in a register. Several source statements may become one instruction, or a source line may have no independent machine instruction.", "Undefined behavior gives the optimizer additional freedom because the language imposes no requirements for that execution. A program that appears correct with optimizations disabled may still have a bug."],
        ["Debug optimized output with context", "Symbols help map addresses to functions and source locations, but they do not force machine state to match source-level variables. Inspect the exact executable, PDB or debug file, compiler version, target, and flags. Reproduce with the same configuration before concluding that a variable was corrupted.", "Compare debug and optimized builds to learn how a construct changes, but do not claim one assembly sequence is required by C or C++. The standard defines behavior, not a fixed instruction listing."]
      ],
      exercise: "Compile one small loop in debug and optimized modes and annotate which source variables survive in the optimized listing.",
      takeaway: "Optimized machine code is a valid implementation of the source contract, not a line-by-line transcript.",
      practiceSteps: ["Hold the target and compiler constant while changing one optimization flag.", "Identify an inlined call or removed calculation.", "Use a test to confirm observable behavior remains the same."],
      pitfalls: ["A missing source variable in a debugger does not by itself prove corruption.", "One compiler's output is not a permanent ABI or language guarantee."],
      checkpoint: { question: "Why might a local variable be unavailable in an optimized debugger session?", answer: "It may be kept in a register, combined with another value, or optimized away." },
      checkpoints: [{ question: "What does a compiler optimization need to preserve?", answer: "The observable behavior required by the language and program, not the source's exact instruction sequence." }],
      workedExample: { title: "Compare a small helper", scenario: "A simple function call disappears from optimized assembly.", steps: ["Confirm the same source and target were used.", "Check whether the function was inlined or its result folded at compile time.", "Compare program output and inspect debug metadata before deciding whether behavior changed."], result: "The call's absence can be a valid optimization rather than a missing operation." },
      lab: { title: "Build a source-to-assembly comparison", objective: "Interpret output under recorded build conditions.", prompt: "Use an online compiler or local compiler with a small function you own.", steps: ["Record compiler version, target, and optimization options.", "Compare debug and optimized output for one construct.", "Write one supported conclusion and one conclusion the listing cannot prove."], completion: "The notes avoid generalizing beyond the build that produced the listing.", hint: "Run the program too; assembly inspection alone does not test all inputs." },
      glossary: [["Inlining", "Substituting a function body at a call site."], ["Dead-code elimination", "Removing computations that cannot affect observable behavior."], ["Debug symbol", "Metadata that maps machine addresses to source-level information." ]]
    },
    {
      id: "lowlevel-concurrency", track: "lowlevel", title: "Concurrency, races & memory ordering",
      description: "Reason about shared state before tuning atomic operations.",
      summary: "Concurrency correctness begins with data ownership and invariants; memory ordering is a contract, not a performance switch.",
      focus: ["data races", "mutexes and atomics", "happens-before"], prerequisites: "Processes, threads, and function lifetimes.",
      sections: [
        ["Find shared mutable state first", "A data race occurs when conflicting unsynchronized accesses reach the same memory and at least one writes. List readers, writers, object lifetime, and the invariant they share before choosing a primitive. A mutex is often the simplest correct choice for a multi-field invariant.", "An atomic operation coordinates access to one atomic object. It does not automatically make adjacent non-atomic fields safe or preserve a larger state transition. Use message passing or minimize shared writable data when that makes ownership clearer."],
        ["Memory ordering has a specific purpose", "Acquire/release and stronger orders constrain which operations become visible across threads. Choose them from a proven synchronization pattern, not from intuition about processor speed. A relaxed atomic can be useful for independent counters, but it does not publish unrelated data safely by itself.", "Test races with thread sanitizers where available and review all access paths. A test run without a report does not prove that an interleaving cannot occur."]
      ],
      exercise: "Describe which synchronization protects a producer-consumer queue and what condition wakes the consumer.",
      takeaway: "Establish ownership and a happens-before relationship before attempting lock-free optimization.",
      practiceSteps: ["Draw all threads and the shared object they access.", "State the invariant and which synchronization protects each transition.", "Run a sanitizer-enabled test and retain a deterministic regression case."],
      pitfalls: ["`volatile` is not a thread synchronization primitive.", "Changing memory order without a proof can publish data incorrectly."],
      checkpoint: { question: "Does an atomic counter make neighboring data safe to read?", answer: "No. The atomic operation only provides guarantees for its own object and the selected memory order." },
      checkpoints: [{ question: "What is a good first tool for protecting a multi-field invariant?", answer: "A mutex with a clearly defined lock scope is often easier to reason about than custom lock-free code." }],
      workedExample: { title: "Publish a result safely", scenario: "One thread computes a result while another waits to consume it.", steps: ["Define who owns the result before and after publication.", "Use a mutex/condition or a proven atomic publication pattern.", "Ensure the producer finishes or signals shutdown before the result storage is destroyed."], result: "Visibility and lifetime are both handled; synchronization alone cannot keep the object alive." },
      lab: { title: "Review a shared-state design", objective: "Identify missing synchronization and lifetime rules.", prompt: "Use a toy queue or status object accessed by two threads.", steps: ["List every read and write.", "Choose one synchronization rule and apply it consistently.", "Test shutdown while a consumer is waiting."], completion: "There is no unsynchronized conflicting access and the owner joins workers before cleanup.", hint: "Do not use `volatile` as a replacement for atomic or mutex semantics." },
      glossary: [["Happens-before", "An ordering relation that makes effects from one operation visible to another."], ["Memory ordering", "Rules governing visibility and ordering of atomic operations."], ["Data race", "Conflicting unsynchronized memory accesses with at least one write." ]]
    },
    {
      id: "lowlevel-executable-hardening", track: "lowlevel", title: "Executable hardening concepts",
      description: "Recognize defense-in-depth properties in the compiler, loader, and operating system.",
      summary: "Mitigations such as ASLR, DEP/NX, stack protection, and control-flow checks reduce exploitability but do not replace correct code.",
      focus: ["ASLR", "DEP/NX", "stack canaries and CFG"], prerequisites: "Executable formats, virtual memory, and memory safety.",
      sections: [
        ["Mitigations change the cost of exploitation", "Address-space layout randomization makes important addresses less predictable. DEP/NX separates writable data from executable pages. Stack canaries can detect some overwrites before a function returns, and control-flow protections restrict some invalid indirect transfers.", "These features are defense in depth. They do not repair a bounds bug, guarantee that all control-flow paths are protected, or make memory corruption impossible. Understand which mitigation is enabled in the specific build and operating environment."],
        ["Verify configuration from the artifact and runtime", "Compiler options, executable metadata, loader behavior, and operating-system policy all matter. A build flag alone does not prove the final image has the desired property. Inspect a program you built and compare the generated artifact with the platform documentation.", "Do not disable a mitigation to make a program work. Diagnose the compatibility problem and fix the underlying code or configuration under an authorized test plan."]
      ],
      exercise: "Create a table that maps one memory-safety bug to the preventative coding practice and the mitigation that may limit its impact.",
      takeaway: "Mitigations reduce risk when bugs remain; secure code and correct configuration are still required.",
      practiceSteps: ["Identify which mitigation is documented for one compiler/platform.", "Inspect an artifact you built and note evidence of relevant properties.", "State one failure mode each mitigation does not prevent."],
      pitfalls: ["A mitigation flag is not proof that every module is protected.", "DEP/NX or ASLR does not make out-of-bounds access correct."],
      checkpoint: { question: "Does ASLR eliminate memory corruption vulnerabilities?", answer: "No. It can make addresses less predictable but does not prevent the underlying invalid access." },
      checkpoints: [{ question: "Why inspect the final artifact instead of only build flags?", answer: "Linking, libraries, platform settings, and module metadata affect the properties actually delivered." }],
      workedExample: { title: "Explain defense in depth", scenario: "A review finds an unsafe buffer operation in a program built with stack protection.", steps: ["Fix the bounds error at the source.", "Verify compiler and operating-system mitigations on the final artifact.", "Test the repaired behavior under sanitizers and retain regression coverage."], result: "The source fix removes the invalid operation; mitigations provide additional risk reduction if another defect remains." },
      lab: { title: "Inspect a benign executable", objective: "Connect build settings to documented runtime protections.", prompt: "Build a small program and inspect its metadata using trusted local tools.", steps: ["Record toolchain and target settings.", "Check documented indicators for supported mitigations.", "Write what the indicators prove and what they do not prove about source safety."], completion: "The conclusion is bounded to the inspected artifact and avoids treating mitigations as a substitute for validation.", hint: "Do not disable protections or test exploit payloads; this is a defensive artifact review." },
      glossary: [["ASLR", "A mitigation that varies image or memory locations to reduce address predictability."], ["DEP/NX", "A policy that marks data pages non-executable where supported."], ["Stack canary", "A value checked around selected stack frames to detect some overwrites." ]]
    },
    {
      id: "windows-command-line-paths", track: "windows", title: "Windows command lines & path rules",
      description: "Handle quoting, environment expansion, and path forms deliberately.",
      summary: "Windows path and command-line parsing rules differ from Unix shells; string concatenation often changes meaning at boundaries.",
      focus: ["CreateProcess quoting", "environment expansion", "UNC and device paths"], prerequisites: "Win32 API contracts, C strings, and trust boundaries.",
      sections: [
        ["A command line is not an argument array", "Windows process creation APIs accept a command-line string, and the receiving program may parse it according to its own runtime rules. Quoting and escaping are therefore part of the contract. Prefer APIs or libraries that accept structured argument lists when available, and avoid building shell commands by concatenating untrusted text.", "Paths can be relative, drive-qualified, UNC, device, or extended-length. The current directory and environment variables can change how a relative path resolves. Record the intended base and normalize inputs under a documented policy."],
        ["Treat user-provided components as data", "Validate a path against an allowed directory and account for traversal, reserved names, and reparse points where relevant. Do not assume a string prefix check proves containment. When starting a process, specify the executable path separately from arguments when the API supports it and control inherited handles deliberately.", "Command injection can happen when data is reparsed by a shell. Passing an argument safely still requires understanding the target program's option parser; an argument beginning with a dash can alter behavior even without shell metacharacters."]
      ],
      exercise: "Create a local program that prints its parsed arguments, then test spaces, quotes, Unicode, and a leading dash in a controlled environment.",
      takeaway: "Paths and arguments have platform-specific grammars; structured input and explicit parsing are safer than concatenated strings.",
      practiceSteps: ["Write down the working directory and executable path for a process launch.", "Test quoted arguments using a toy program that echoes them.", "Validate a relative path against an intended root and document link behavior."],
      pitfalls: ["A Windows command-line string may be parsed differently by different runtimes.", "String-prefix checks do not reliably enforce directory containment."],
      checkpoint: { question: "Why avoid concatenating untrusted text into a shell command?", answer: "The shell reparses metacharacters and quoting, which can turn data into commands." },
      checkpoints: [{ question: "Does quoting an argument prove the target program treats it as harmless data?", answer: "No. The target application's own option parser and semantics still matter." }],
      workedExample: { title: "Launch a local echo program", scenario: "A tool must pass a file name containing spaces to a program you wrote.", steps: ["Separate the executable location from the argument string.", "Apply the documented Windows quoting rules for the target runtime.", "Use the toy echo program to verify the exact received argument."], result: "The observed argument—not the appearance of the parent string—confirms the parser behavior." },
      lab: { title: "Test path and argument boundaries", objective: "Make quoting and path policy observable.", prompt: "Use a local test executable that prints each argument and a temporary directory you own.", steps: ["Test spaces, quotes, and Unicode in an argument.", "Test relative and absolute paths under a fixed working directory.", "Reject traversal outside the exercise directory."], completion: "The program receives the intended arguments and rejects paths outside the stated policy.", hint: "Do not use a real shell or production command for this experiment." },
      glossary: [["Argument parsing", "The rules a process uses to interpret its command-line input."], ["UNC path", "A network path using a server and share name."], ["Reparse point", "A filesystem object that can redirect path resolution." ]]
    },
    {
      id: "windows-uac-integrity", track: "windows", title: "UAC, integrity levels & elevation",
      description: "Distinguish account membership from the token a process actually uses.",
      summary: "Windows access decisions use process or thread tokens and object security descriptors; administrator membership alone does not describe effective authority.",
      focus: ["filtered tokens", "integrity levels", "least privilege"], prerequisites: "Windows tokens and access checks.",
      sections: [
        ["Inspect the effective token", "User Account Control can create a filtered token for an administrator account and prompt when elevation is requested. A process can therefore run with fewer rights than the account's group membership suggests. Impersonation and restricted tokens can further change the effective security context.", "Integrity levels influence certain cross-process interactions but are not a replacement for discretionary access checks. When diagnosing access, record the process token, requested right, object descriptor, and integrity context."],
        ["Elevation should be scoped and visible", "Avoid running an entire application elevated when only one operation needs additional authority. Separate privileged work into a narrow, documented component and validate every request from the less-privileged caller. Do not treat elevation as a fix for a path or ACL problem that has not been diagnosed.", "Use a disposable test account or VM to compare standard and elevated behavior. Change one variable at a time and record the exact token state and operation."]
      ],
      exercise: "Compare the effective token of a standard process and an elevated test process, then document which operation differs and why.",
      takeaway: "Ask what token is effective for this operation, not merely which groups the account belongs to.",
      practiceSteps: ["Inspect identity, groups, integrity level, and enabled privileges.", "Record the requested access right and target object's ACL.", "Choose the least-privileged process context that can complete the task."],
      pitfalls: ["Administrator membership does not mean every process is elevated.", "Elevation does not bypass every object-level permission or integrity rule."],
      checkpoint: { question: "Does an administrator account always run every process elevated?", answer: "No. UAC can start a process with a filtered token until elevation is explicitly requested." },
      checkpoints: [{ question: "What should be checked before elevating a process to fix access denied?", answer: "The effective token, requested right, object ACL, integrity context, and whether the application needs that authority." }],
      workedExample: { title: "Diagnose an elevated-only operation", scenario: "A file operation works in an elevated test process but fails in a standard process.", steps: ["Record both effective tokens and requested access rights.", "Inspect the file's security descriptor and path form.", "Grant only the narrow required right or redesign the operation to avoid broad elevation."], result: "The fix addresses the access rule rather than requiring the entire program to run as administrator." },
      lab: { title: "Build an access comparison", objective: "See the difference between account identity and process authority.", prompt: "Use two test processes in a disposable VM and a test file you own.", steps: ["Record token and integrity information for each process.", "Attempt the same documented read operation and observe the result.", "Change one ACL entry in the lab and repeat."], completion: "The result ties access to effective context and object policy.", hint: "Do not change permissions on production or personal system files." },
      glossary: [["Filtered token", "A restricted token created for a process even when the account has administrator membership."], ["Integrity level", "A Windows security label used in mandatory integrity checks."], ["Elevation", "Starting or switching a process into a higher-privilege security context." ]]
    },
    {
      id: "windows-job-objects", track: "windows", title: "Job objects & process supervision",
      description: "Group and manage child processes through documented OS controls.",
      summary: "Job objects provide a supported way to associate processes and apply limits or coordinated lifecycle rules.",
      focus: ["process grouping", "resource limits", "cleanup and inheritance"], prerequisites: "Windows processes, handles, and RAII.",
      sections: [
        ["Manage a process group deliberately", "A job object can associate processes with a managed group and apply documented limits or lifecycle behavior. This is useful for build tools, test runners, and applications that spawn helpers. The exact limits and breakaway rules depend on the API contract and platform version.", "The process that owns the job handle must define whether child processes inherit or join the group, what happens when the owner exits, and how handles are closed. A group is not a security boundary by itself; access rights and token privileges remain relevant."],
        ["Keep supervision and trust separate", "Use process supervision to bound resource use and cleanup for software you control. It does not make an untrusted program safe to run. Pair it with a disposable environment, least privilege, and network/file isolation for risky analysis.", "Observe exit codes and process completion through documented wait APIs. Do not terminate processes indiscriminately; record which process belongs to the test and why cleanup is required."]
      ],
      exercise: "Design a local test runner that starts two child processes, groups them, and cleans up only those test processes.",
      takeaway: "Job objects help manage process lifetimes and limits, but do not replace isolation or authorization.",
      practiceSteps: ["List which process creates and owns the job handle.", "Define child assignment, wait, and cleanup behavior.", "Test normal completion and one child failure in a disposable program."],
      pitfalls: ["A job object is not a sandbox or complete security boundary.", "Closing a handle does not necessarily mean every associated process stopped unless the configured rules say so."],
      checkpoint: { question: "What is a documented use of a Windows job object?", answer: "Grouping processes and applying process-management or resource-limit policies." },
      checkpoints: [{ question: "Does placing a process in a job automatically make it safe to execute?", answer: "No. It is a management mechanism, not a replacement for security isolation." }],
      workedExample: { title: "Supervise a local build helper", scenario: "A build tool starts a compiler and a code-generation helper for one test.", steps: ["Create a job and define the desired process limits.", "Start only the known local test children and assign them according to the API contract.", "Wait for completion, collect statuses, and apply the documented cleanup policy."], result: "The tool can manage its own child-process lifecycle without affecting unrelated processes." },
      lab: { title: "Plan process cleanup", objective: "Make a test runner's process ownership explicit.", prompt: "Draw a parent process and two local helper processes in a disposable project.", steps: ["Mark the owner of each process and handle.", "Define behavior if the parent exits early.", "Test that cleanup affects only the helpers created by the test."], completion: "The cleanup plan is scoped, observable, and does not terminate unrelated software.", hint: "Use documented process and job APIs; keep the experiment local." },
      glossary: [["Job object", "A Windows object for grouping processes and applying management policies."], ["Child process", "A process created by another process."], ["Handle ownership", "Responsibility for closing or transferring an OS handle." ]]
    },
    {
      id: "windows-crash-dumps", track: "windows", title: "Crash dumps & symbolized analysis",
      description: "Capture a reproducible crash and analyze the matching executable and symbols.",
      summary: "A dump is a snapshot whose usefulness depends on matching symbols, capture settings, and sensitive-data handling.",
      focus: ["dump types", "PDB matching", "privacy and retention"], prerequisites: "Windows debugging, call stacks, and build identity.",
      sections: [
        ["Choose a dump for the question", "A minidump can preserve exception and thread context with less storage; a full dump may include broader memory state and therefore more sensitive data. Capture only what the investigation needs. Record the exception, process, timestamp, build ID, and dump configuration.", "A dump may contain credentials, document contents, tokens, or personal data. Protect access, retention, and transfer. Do not upload a production dump to a public service unless the owner has explicitly approved that handling."],
        ["Use exact symbols and binaries", "The executable and PDB must match. Mismatched symbols can produce convincing but incorrect names or source lines. Preserve build artifacts or symbol-server identifiers and confirm the debugger loaded the correct modules.", "Optimized code may omit variables or inline functions. Treat source mappings as hints; verify the exception address, module, register state, and relevant memory against the actual binary."]
      ],
      exercise: "Write a crash-capture checklist for a toy Windows program, including build identity, dump type, symbol location, and redaction/retention policy.",
      takeaway: "A dump is useful only when it can be matched to the right build and handled as sensitive evidence.",
      practiceSteps: ["Record executable and PDB identifiers with every capture.", "Choose the smallest dump type that answers the debugging question.", "Protect the file and delete it under the agreed retention policy."],
      pitfalls: ["A source line from mismatched symbols is not reliable evidence.", "A dump can contain sensitive memory even when its filename looks harmless."],
      checkpoint: { question: "Why must symbols match the executable in a dump analysis?", answer: "They map addresses and types for a specific build; mismatches can mislabel the call stack." },
      checkpoints: [{ question: "Should a full memory dump be shared casually?", answer: "No. It can contain credentials, personal data, and other sensitive memory." }],
      workedExample: { title: "Verify a dump before trusting its call stack", scenario: "A crash dump opens but debugger function names look plausible and the source line is unexpected.", steps: ["Check the executable's build ID and module identity.", "Verify the PDB matches and inspect debugger symbol-loading status.", "Re-check the exception address and module using the actual binary."], result: "The analysis does not trust a plausible stack until artifact identity is confirmed." },
      lab: { title: "Create a local crash-analysis record", objective: "Practice evidence capture with synthetic data.", prompt: "Use a deliberate crash in a toy program you built yourself.", steps: ["Record build settings, exception code, and input.", "Capture a minimal dump and load matching symbols.", "Write a cleanup/retention note before storing or sharing the artifact."], completion: "The record is reproducible and protects dump contents.", hint: "Never use a third-party crash dump without authorization." },
      glossary: [["Minidump", "A selected subset of process state saved for debugging."], ["PDB", "A symbol file associated with a particular Windows executable build."], ["Symbol loading", "The process of mapping binary addresses to debug names and source information." ]]
    },
    {
      id: "windows-powershell-audit", track: "windows", title: "PowerShell logs & administrative audit",
      description: "Use approved administrative logs to reconstruct changes and distinguish intent from evidence.",
      summary: "PowerShell event data can provide context, but policy, logging settings, version, and collection coverage determine what is available.",
      focus: ["script-block logging", "event provenance", "privacy limits"], prerequisites: "Windows event logs, ETW, and incident timelines.",
      sections: [
        ["Know what the log source records", "PowerShell logging depends on version, policy, host, and configuration. Script-block, module, transcription, and process records answer different questions and may omit details. Record the provider, event identifiers, host, time zone, and forwarding path before drawing conclusions.", "Command content may include paths, usernames, tokens, or private data. Treat administrative logs as sensitive and use synthetic exercises in a disposable VM."],
        ["Separate presence from intent", "A logged administrative command documents activity, not necessarily the operator's intent or outcome. Correlate with identity, process, file, and change-ticket evidence. A script name alone is not proof that it ran successfully or that the resulting state persisted.", "Do not enable broad logging on production systems without change approval; collection volume, privacy, and retention need a plan. Verify the setting on the endpoint and confirm expected test events arrive centrally."]
      ],
      exercise: "Build a fictional timeline correlating one PowerShell event with a process record and a change ticket; identify what remains unknown.",
      takeaway: "Administrative logs are evidence with a collection boundary, not an automatic verdict.",
      practiceSteps: ["Record provider, host, event time, and log configuration.", "Correlate an event with a second independent source.", "Redact private command arguments before sharing the training record."],
      pitfalls: ["A missing event does not prove a command was never run.", "A command line can contain secrets and should not be copied into an unrestricted report."],
      checkpoint: { question: "Does a logged PowerShell command prove its operation succeeded?", answer: "No. Correlate with result, process, and system-state evidence." },
      checkpoints: [{ question: "What should be checked before relying on an absent event?", answer: "Logging policy, provider/version, endpoint coverage, retention, and forwarding." }],
      workedExample: { title: "Correlate a configuration change", scenario: "A fictional administrative event is followed by a service configuration change.", steps: ["Verify the event source, host, user, and clock context.", "Compare the event with service state and an approved change record.", "State what is directly observed and what remains an inference."], result: "The timeline separates a recorded command from verified system impact." },
      lab: { title: "Review an administrative audit trail", objective: "Practice evidence correlation without production data.", prompt: "Use a synthetic log set created for a local VM exercise.", steps: ["Create a timestamped sequence from two log sources.", "Match the source host and identity carefully.", "Write a conclusion with one limitation and one next evidence request."], completion: "The report is time-aware, corroborated, and privacy-safe.", hint: "Do not paste real command lines with credentials into public notes." },
      glossary: [["Script-block logging", "A policy-controlled PowerShell event source for script content."], ["Transcription", "A configured record of an interactive PowerShell session."], ["Audit trail", "A set of records used to reconstruct administrative actions." ]]
    },
    {
      id: "windows-update-servicing", track: "windows", title: "Windows updates & change validation",
      description: "Plan patching around asset inventory, testing, rollback, and verification.",
      summary: "A patch is a change to a deployed system; its success needs verification on the asset, not just in a management console.",
      focus: ["asset inventory", "pilot rings", "post-update verification"], prerequisites: "Windows configuration and vulnerability lifecycle.",
      sections: [
        ["Know which assets and versions you manage", "Patch decisions depend on accurate inventory, product version, support status, exposure, and business role. Vendor advisories and known-exploited status inform urgency; they do not replace checking whether the asset is actually affected.", "Use deployment rings or representative pilots to find compatibility issues before broad rollout. Record owners, maintenance windows, dependencies, and service impact."],
        ["Verify the deployed state", "A package marked approved or downloaded is not proof that each endpoint installed and activated the update. Verify version, configuration, reboot state, and relevant service behavior after deployment. Track failed or deferred systems with owners and review dates.", "Keep a rollback plan that reflects the system's role. For critical workloads, restoration may require a tested backup or failover rather than simply uninstalling a package."]
      ],
      exercise: "Create a patch validation plan for a fictional workstation fleet, including pilot group, owner, success criteria, and exceptions.",
      takeaway: "Patching is complete when the affected asset is verified and service health remains acceptable.",
      practiceSteps: ["Map an advisory to an exact installed product and version.", "Define a pilot and rollback trigger.", "Write a post-deployment check that proves the fix is active."],
      pitfalls: ["An update policy does not prove every endpoint received the update.", "A green deployment percentage can hide a critical unpatched asset."],
      checkpoint: { question: "What evidence closes a patch task?", answer: "Verified installed state and a check that the affected exposure is resolved on the asset." },
      checkpoints: [{ question: "Why use pilot rings?", answer: "They expose compatibility and operational issues before broad deployment." }],
      workedExample: { title: "Prioritize one known issue", scenario: "A vendor issues a patch for a library used by a public-facing service and an offline test machine.", steps: ["Confirm exact versions and exposure for both assets.", "Prioritize based on impact, reachability, mitigations, and owner input.", "Verify the production fix and separately record the offline asset's plan."], result: "Priority follows asset context instead of treating a score or headline as the entire decision." },
      lab: { title: "Create a patch change record", objective: "Connect advisory, deployment, and retest evidence.", prompt: "Use a fictional advisory and asset list.", steps: ["Record source, affected versions, asset owners, and exposure.", "Plan pilot, maintenance window, and rollback.", "Define exact post-update evidence and treatment of exceptions."], completion: "A second operator can see what is being changed and how completion will be verified.", hint: "Do not patch or alter production systems as part of this exercise." },
      glossary: [["Pilot ring", "A small representative group that receives a change before broad deployment."], ["Rollback", "A planned way to restore service if a change fails."], ["Post-update verification", "Evidence that the intended version and behavior are active after deployment." ]]
    },
    {
      id: "security-cryptography-principles", track: "security", title: "Cryptography: keys, hashes & signatures",
      description: "Use cryptographic primitives for the property they actually provide.",
      summary: "Encryption, hashing, and digital signatures solve different problems; choosing a primitive starts with a security requirement.",
      focus: ["symmetric encryption", "hashes and MACs", "digital signatures"], prerequisites: "Basic data integrity and TLS concepts.",
      sections: [
        ["Name the property before choosing an algorithm", "Encryption aims to keep data confidential. A cryptographic hash maps data to a fixed-size digest and can detect changes when the expected digest is trusted. A message authentication code uses a secret key to authenticate data. A digital signature uses a private key to let others verify a message under the corresponding public key.", "A plain hash does not prove who created a file; an attacker who can replace both file and hash can change both. A signature does not hide content. TLS combines several cryptographic mechanisms under a protocol and certificate-validation policy."],
        ["Use reviewed libraries and manage keys", "Do not invent a cipher, password hashing scheme, nonce format, or certificate protocol. Use a maintained library and documented mode. Keys need generation, storage, rotation, backup, revocation, and access controls; secure algorithms cannot compensate for exposed keys.", "Use password-specific hashing functions for stored passwords, not a fast general-purpose hash. The right choice depends on the library and deployment threat model, so follow current standards and vendor guidance."]
      ],
      exercise: "For three fictional requirements—hide a file, detect a modification, and prove a publisher—choose a property and explain why the other primitives do not satisfy it alone.",
      takeaway: "Cryptography is a set of precise tools; security depends on correct protocol and key management too.",
      practiceSteps: ["Match confidentiality, integrity, and authenticity to a mechanism.", "Identify who controls the key and how it is rotated.", "Reject custom cryptographic code in favor of a maintained library."],
      pitfalls: ["A hash is not encryption or proof of authorship.", "Using a secure primitive with a leaked or reused key can still fail."],
      checkpoint: { question: "Does a plain cryptographic hash prove who created a file?", answer: "No. It detects changes only when the expected digest is trusted; it does not authenticate a publisher." },
      checkpoints: [{ question: "What does a digital signature provide that encryption alone may not?", answer: "A verification mechanism for authenticity and integrity under the private/public key relationship; it does not provide confidentiality by itself." }],
      workedExample: { title: "Choose a file verification mechanism", scenario: "A team must ensure a downloaded release matches the publisher's intended artifact.", steps: ["Define whether the concern is accidental corruption, malicious modification, or publisher identity.", "Use a trusted signature verification flow for publisher authenticity.", "Protect the signing key and publish verification instructions through a trusted channel."], result: "A digest can detect a difference, while a verifiable signature ties the artifact to a key whose trust is established separately." },
      lab: { title: "Map requirements to cryptographic properties", objective: "Practice choosing properties rather than algorithms by name.", prompt: "Create a table for confidentiality, integrity, authenticity, and password storage.", steps: ["Write the attacker goal for each row.", "Choose a standard mechanism and key/secret requirement.", "List one failure caused by poor key management or wrong primitive selection."], completion: "Each requirement names its property, standard mechanism class, and key-management dependency.", hint: "Use official library and standards documentation; do not design your own cryptographic protocol." },
      glossary: [["Hash", "A fixed-size digest used to detect changes when the expected value is trusted."], ["MAC", "A keyed message authentication code for integrity and authenticity among key holders."], ["Digital signature", "A public-key mechanism that lets a verifier check integrity and signer-key possession." ]]
    },
    {
      id: "security-secrets-management", track: "security", title: "Secrets in development & deployment",
      description: "Keep credentials out of source, logs, artifacts, and developer workflows.",
      summary: "Secrets management covers where credentials live, which identities can use them, rotation, and incident response after exposure.",
      focus: ["secret stores", "least privilege", "rotation and revocation"], prerequisites: "Authentication, tokens, and software supply-chain basics.",
      sections: [
        ["Treat a secret as a capability", "A password, API token, signing key, or connection string grants authority to whoever possesses it. Keep it out of source code, screenshots, command-line arguments, and build logs. Use a platform secret store or managed identity where available, and grant each workload only the permissions it needs.", "Environment variables can reduce accidental source control exposure but may still be visible to process inspection, crash dumps, or diagnostics. Choose storage based on the threat model and platform rather than assuming one delivery method is automatically secret."],
        ["Plan rotation and compromise response", "Know who owns a secret, where it is used, how it is rotated, and how old credentials are revoked. Test the rotation process before an incident. If a secret is exposed, revoke or rotate it first, investigate access, remove copies from artifacts and logs where possible, and document the scope.", "Secret scanning helps find accidental commits but cannot prove no copy exists elsewhere. Treat leaked credentials as compromised even if the repository is private."]
      ],
      exercise: "Create a secret inventory for a fictional web app with a database password, API token, and signing key; assign owner, storage, permissions, and rotation process.",
      takeaway: "A secret is authority; minimize who can retrieve it and rehearse how to revoke it.",
      practiceSteps: ["List each secret, workload, owner, and required permission.", "Remove credentials from sample configuration and load a placeholder from an approved store.", "Write the rotation and revocation steps for one leaked token."],
      pitfalls: ["Deleting a secret from the latest source file does not remove it from repository history or build artifacts.", "A token in a URL or log can be copied to systems with broader access."],
      checkpoint: { question: "What is the first security action after confirming a live token was exposed?", answer: "Revoke or rotate the credential through its owner-approved process, then assess where it was used and copied." },
      checkpoints: [{ question: "Does a private repository make a committed secret safe?", answer: "No. Treat it as exposed and rotate it; private access does not erase copies or logs." }],
      workedExample: { title: "Respond to a committed API token", scenario: "A developer accidentally commits a token to a repository used by a team.", steps: ["Disable or rotate the token and confirm the old value is rejected.", "Identify workloads that need a replacement and provision least-privilege access.", "Review repository, CI logs, artifacts, and caches for copied values; remove where practical."], result: "The response revokes authority first and then reduces residual copies and recurrence risk." },
      lab: { title: "Design a credential rotation drill", objective: "Make a secret incident actionable before one occurs.", prompt: "Use fictional credentials and a written process; do not use a live production secret.", steps: ["Identify the owner and systems that depend on one credential.", "Write how to issue, deploy, verify, and revoke a replacement.", "Define what logs and artifacts are reviewed after exposure."], completion: "The drill has a clear owner, successful validation, and no real secret in the exercise materials.", hint: "Never paste a real token into a test report or public notebook." },
      glossary: [["Secret", "A credential whose possession grants access or signing authority."], ["Rotation", "Replacing a credential and retiring the prior value."], ["Least privilege", "Granting only the access required for a specific task." ]]
    },
    {
      id: "security-web-architecture", track: "security", title: "Web app trust boundaries",
      description: "Trace browser requests to server-side validation, authentication, and data access.",
      summary: "A browser is controlled by the user; the server must enforce validation, authorization, and state transitions.",
      focus: ["client vs server trust", "object authorization", "session boundaries"], prerequisites: "HTTP, TLS, secure input, and authentication.",
      sections: [
        ["Treat the browser as an untrusted client", "The user can change requests, scripts, hidden fields, and local storage. Client-side checks improve usability but do not enforce permission. The server must validate data, authenticate the session, authorize each action, and protect state-changing requests against the relevant web threats.", "Trace a request from browser to router, controller, service, and database. At each step, identify the identity and object being acted on. Object-level authorization must compare the session identity with the requested resource and policy."],
        ["Keep data and code separate", "Use parameterized queries for database operations and context-aware output encoding for HTML. Avoid building shell commands from request values. Apply request-size limits and parse content according to its media type. Each sink has a grammar; generic sanitization is not a substitute for a context-specific API.", "TLS protects the transport and helps authenticate an endpoint; it does not make client data trustworthy or authorize an account to access every record."]
      ],
      exercise: "Draw the server-side path for updating a profile record and label authentication, object authorization, validation, and persistence checks.",
      takeaway: "The server is the policy enforcement point; the browser can request an action but cannot grant itself permission.",
      practiceSteps: ["Choose a state-changing request and list all client-controlled fields.", "Identify the server-side permission and validation checks.", "Write one test for an allowed request and one for a denied cross-user request."],
      pitfalls: ["Hiding a control in the UI does not prevent a direct request.", "A valid login does not authorize access to every resource ID."],
      checkpoint: { question: "Where should the server check permission to change another user's profile?", answer: "At the trusted server for the requested user object and action, before applying the state change." },
      checkpoints: [{ question: "Does TLS make a request body safe to trust?", answer: "No. TLS protects transport; the server must still validate and authorize request data." }],
      workedExample: { title: "Review a profile update route", scenario: "A browser submits a new display name and a user ID.", steps: ["Take identity from the authenticated session rather than trusting the client-supplied user ID.", "Validate display-name length and permitted characters.", "Authorize the specific object update on the server before writing it."], result: "The server derives authority from trusted context and treats request fields as untrusted data." },
      lab: { title: "Map one web trust boundary", objective: "Make server controls visible in a small design review.", prompt: "Use a local toy app or diagram of a profile update endpoint.", steps: ["List request fields and which party controls each.", "Mark authentication, authorization, validation, output, and storage boundaries.", "Write positive and negative tests for the object permission."], completion: "The browser does not supply the authority used to authorize its own request.", hint: "Use synthetic accounts and records for testing." },
      glossary: [["Trust boundary", "A point where input or authority crosses between components with different trust."], ["Object-level authorization", "A permission check tied to a specific resource and action."], ["Output encoding", "Escaping data for the grammar of the output context." ]]
    },
    {
      id: "security-secure-design-review", track: "security", title: "Secure design review & abuse cases",
      description: "Review a feature through assets, trust boundaries, misuse cases, and testable controls.",
      summary: "A small design review can catch missing ownership, authorization, recovery, and logging decisions before implementation.",
      focus: ["data flows", "abuse cases", "control verification"], prerequisites: "Threat modeling, web trust boundaries, and secure input.",
      sections: [
        ["Review the feature's real flow", "Start with the user goal, data flows, roles, external dependencies, and failure behavior. Mark where untrusted input enters and where a component gains authority. Ask which assets could be read, changed, or made unavailable.", "An abuse case describes a capability and path, not a vague adversary label. Include replay, duplicate requests, stale state, overlong input, unauthorized object IDs, and operational failure where relevant."],
        ["Turn findings into verifiable decisions", "For each risk, name an owner, control, and test. A requirement such as “only an editor may publish” should identify how the server knows the role and how a denied request is tested. Document tradeoffs and residual risk rather than silently relying on an assumption.", "Use lightweight reviews before implementation and revisit them when scope, deployment, or external dependencies change. A design review is not a guarantee; it is a way to make decisions visible and testable."]
      ],
      exercise: "Review a fictional file-upload feature and identify three abuse cases, one mitigation each, and a test that verifies every mitigation.",
      takeaway: "Design security is a set of explicit decisions about authority, data, failure, and verification.",
      practiceSteps: ["Draw components and trust boundaries.", "Write misuse scenarios with concrete assets and impact.", "Assign a test and owner to each mitigation."],
      pitfalls: ["A checklist without owners and verification becomes paperwork.", "A security control can introduce availability or privacy costs."],
      checkpoint: { question: "What turns a design concern into an actionable review item?", answer: "A specific asset and scenario, an owner, a control, and a way to verify the control." },
      checkpoints: [{ question: "When should a design review be repeated?", answer: "When the architecture, deployment, data flow, role model, or major dependency changes." }],
      workedExample: { title: "Review file upload", scenario: "An app accepts documents and stores them for other users to download.", steps: ["Identify who may upload and who may retrieve each object.", "Define file-size, type, storage, scanning, and filename rules.", "Test unauthorized access, oversized input, malformed files, and safe download handling."], result: "The review covers authorization, resource limits, content handling, and privacy together." },
      lab: { title: "Run a small design review", objective: "Create a short, testable security review record.", prompt: "Pick a feature in a local or fictional application.", steps: ["List assets, roles, inputs, and external dependencies.", "Write two abuse cases and one operational failure case.", "Assign mitigations, owners, and verification tests."], completion: "Every issue has an explicit decision and evidence that could confirm the fix.", hint: "Keep the review proportionate to the feature's impact and exposure." },
      glossary: [["Abuse case", "A concrete description of how a feature could be misused."], ["Residual risk", "Risk that remains after controls are applied."], ["Security requirement", "A testable condition intended to protect an asset or boundary." ]]
    },
    {
      id: "security-backup-recovery", track: "security", title: "Backups, recovery & resilience",
      description: "Design for restoration, not just successful backup jobs.",
      summary: "A backup is useful only if it is protected, complete, and restorable within the required recovery objectives.",
      focus: ["RPO and RTO", "immutable/offline copies", "restore testing"], prerequisites: "Availability, incident response, and asset inventory.",
      sections: [
        ["Define recovery objectives", "Recovery point objective (RPO) describes how much data loss is tolerable; recovery time objective (RTO) describes how long service may be unavailable. These should follow business impact and owner decisions, not be guessed from storage defaults.", "Protect backup credentials and storage separately from the systems being backed up. An attacker or accident that can delete production data should not automatically be able to erase every recovery copy."],
        ["Test restoration as a real operation", "A green backup status does not prove the data can be restored or that application dependencies will work. Run periodic restore tests, verify integrity, measure time, and document failures. Test credentials, encryption keys, configuration, and dependencies as well as raw data.", "Recovery plans should name who can authorize a restore, where the clean environment comes from, and how the service is validated before returning to users."]
      ],
      exercise: "Write a recovery plan for a fictional file service, specifying RPO, RTO, backup separation, restore test, and owner approval.",
      takeaway: "Resilience is measured by a verified recovery path, not by the existence of backup files.",
      practiceSteps: ["Identify critical data and acceptable loss/downtime.", "Map credentials and access paths for backup storage.", "Schedule and record a restore test."],
      pitfalls: ["A backup that cannot be decrypted or restored is not a recovery capability.", "Shared admin credentials can let an incident reach backup copies."],
      checkpoint: { question: "What does a restore test prove that a backup success message does not?", answer: "That the data can be recovered and the application can be validated under the tested conditions." },
      checkpoints: [{ question: "What do RPO and RTO measure?", answer: "RPO is acceptable data loss; RTO is acceptable recovery time." }],
      workedExample: { title: "Plan a clean restore", scenario: "A fictional service has encrypted backups but has not practiced a restore.", steps: ["Confirm the recovery keys and access owner are available.", "Restore to an isolated clean environment and verify data integrity.", "Run application checks and record elapsed time against the RTO."], result: "The exercise tests dependencies and authority, not only whether an archive exists." },
      lab: { title: "Create a tabletop recovery plan", objective: "Make a restore test measurable without touching production.", prompt: "Design a recovery exercise using synthetic backup data.", steps: ["Write the asset, RPO, and RTO.", "List who authorizes access and where keys are stored.", "Define integrity checks and a success criterion for the restored service."], completion: "Another operator can execute the exercise and report whether objectives were met.", hint: "Use a disposable environment and test data for the exercise." },
      glossary: [["RPO", "The maximum acceptable data loss measured in time."], ["RTO", "The target time to restore a service after disruption."], ["Restore test", "An exercise that verifies backup data and processes can recover a usable system." ]]
    }
  ];

  window.OFFSET_ADD_COURSE_MODULES = (items) => {
    window.OFFSET_LESSONS.push(...items.map(moduleFrom));
  };
  window.OFFSET_ADD_COURSE_MODULES(topics);
})();
