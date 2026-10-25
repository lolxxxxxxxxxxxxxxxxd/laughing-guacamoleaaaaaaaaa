"use strict";

(() => {
  const d = window.OFFSET_LESSON_DEPTH;
  window.OFFSET_REGISTER_DEPTH({
    "first-program": d(
      "None.",
      [["Compilation stages", "A hosted C++ program passes through preprocessing, compilation, linking, loading, and execution. Preprocessing handles directives such as include. Each source file becomes a translation unit that the compiler checks and translates. The linker resolves symbols between object files and libraries. The loader prepares the executable and dependencies. Keep these stages separate while debugging: an unknown identifier is usually a compile error; an undefined reference is usually a link error; a crash is a runtime error."],
      ["Trace the starter program", "The include line makes declarations from iostream available. main is the entry point for a hosted program. std::cout names the standard output stream, and operator << inserts values into it. The string literal contains a newline escape, so output ends with a line break. Returning zero conventionally signals success. Change only the message first, compile, and observe the exact result before changing the program structure."]],
      ["A successful compile does not prove that linking or execution will succeed.", "The include directive provides declarations; it does not paste a complete library implementation into your file."],
      { question: "Which phase normally reports an undefined reference to a function defined in another source file?", answer: "Linking. Compilation can accept the declaration; the linker still needs the function definition in an object file or library." },
      ["Change the output and compile again.", "Introduce one syntax error and identify the first useful diagnostic.", "Write down which stage handles a missing header, missing definition, and runtime crash."],
      { time: "20–25 MIN" }
    ),
    "values-and-types": d(
      "The first program and basic expressions.",
      [["Objects, initialization, and type boundaries", "A declaration creates an object with a type and a lifetime. Initialization establishes the object's first value; assignment changes a value that already exists. Prefer initializing at the declaration so there is no interval in which the object has no meaningful state. Brace initialization rejects many narrowing conversions, such as placing a fractional value in an integer. Types also affect arithmetic: signed/unsigned conversions can change comparison results, so validate ranges before converting external input."],
      ["Choosing const and auto", "Use const when a value should not change through a name. Use auto when the initializer makes the type obvious, such as an iterator returned by an algorithm; avoid it when the type communicates an important interface decision. auto is still statically typed: the compiler determines the type at compile time. For numeric input, choose a type whose range fits the domain and check the conversion before using the value as a size, index, or allocation count."]],
      ["An uninitialized scalar is not a safe placeholder.", "auto does not make C++ dynamically typed or remove conversion rules."],
      { question: "What does const int count{3} guarantee through the name count?", answer: "The program cannot modify the object through count after initialization; this is a language rule, not a promise about physical memory." },
      ["Change a local value to const and try to assign to it later.", "Use auto for an iterator and inspect the resulting type in a debugger.", "Test a negative signed value before converting it to an unsigned size."],
      { time: "20–25 MIN" }
    ),
    "decisions-and-loops": d(
      "Variables, comparisons, and output.",
      [["Conditions are expressions", "An if condition is evaluated before its body. A chain of if/else-if branches selects the first matching case; a switch expresses a choice among discrete values. The condition's types matter because C++ applies conversions before comparison. Prefer explicit braces and clear conditions so the control-flow graph is visible during review."],
      ["State a loop invariant", "A loop invariant is a fact that should remain true before and after every iteration. For an index loop over a container, the useful invariant is often that all positions before i have been processed and i is still below size. A half-open condition i < size visits zero through size - 1. Trace zero, one, and boundary-sized inputs to reveal loops that never start or run one time too many."]],
      ["Using <= for a count commonly adds an invalid iteration.", "Decrementing an unsigned counter at zero wraps instead of becoming negative."],
      { question: "For a vector whose size is four, what are the valid indexes?", answer: "Zero through three. The value four is the one-past boundary, not an element." },
      ["Trace the loop with counts zero, one, and four.", "Rewrite a counted loop as a range-based loop when the index is not needed.", "Test the branch value and the values immediately below and above it."],
      { time: "20–25 MIN" }
    ),
    "functions": d(
      "Expressions, types, and returning a value from main.",
      [["A signature is a contract", "A function declaration states its name, parameter types, and return type. A definition supplies the body. The compiler checks a call against the declaration; the linker later needs one matching definition when the function is not inline or defined in the same translation unit. Keep a function focused on one meaningful operation so callers can understand its result and side effects."],
      ["Choose parameter passing deliberately", "Small scalar inputs such as int are normally passed by value. A larger read-only object may be passed by const reference to avoid copying, provided the object outlives the call. Use a non-const reference only when mutation is part of the contract. Prefer returning a result by value over output parameters when that is natural. A function should not quietly depend on mutable global state if its inputs can be explicit."]],
      ["Returning a reference to a local object leaves the caller with a dangling reference.", "A const reference prevents mutation through that name; it does not make the original object immutable everywhere."],
      { question: "Why is returning a local int by value safe while returning its address is not?", answer: "The caller receives an independent value. A pointer to the local would refer to storage whose lifetime ended when the function returned." },
      ["Write a pure function that accepts two integers and returns a result.", "Test equal inputs and inputs where either value is larger.", "Move the declaration to a header and the definition to a source file."],
      { time: "20–25 MIN" }
    ),
    "references-and-pointers": d(
      "Object lifetime and basic variable declarations.",
      [["Aliases, nullable addresses, and lifetime", "A reference is an alias: it must be initialized and cannot be reseated. A pointer stores an address and may be null, changed, or invalid. Neither one owns its target by itself. The target must remain alive for every access. Scope, container invalidation, and ownership determine validity; a pointer that is non-null can still dangle."],
      ["Select the interface that states the guarantee", "Use a reference when an object is required and null is not meaningful. Use a pointer when absence or reseating is part of the contract. If an operation consumes a sequence, pass a span or container so the range is represented with its bounds. Use an owning type when lifetime must transfer. Do not return the address of a local object, and do not keep a borrowed pointer past the owner's lifetime."]],
      ["A null check does not prove a non-null pointer is still alive.", "A reference does not extend the lifetime of the object it aliases."],
      { question: "What does a raw T* normally mean in a modern interface?", answer: "A non-owning observation unless the API explicitly documents ownership transfer or another policy." },
      ["Write one function requiring an object by const reference.", "Write another accepting an optional pointer and handle null explicitly.", "Explain why returning the address of a local variable is invalid."],
      { time: "25–30 MIN" }
    ),
    "lifetime-and-raii": d(
      "Classes, constructors, and object scope.",
      [["Deterministic lifetime is the resource strategy", "RAII connects a resource to an object's lifetime. Construction establishes ownership; destruction releases the resource. Fully constructed local objects are destroyed on normal scope exit and during exception unwinding. The same pattern works for memory, files, mutexes, sockets, and transactions. The key property is one clear owner and a deterministic release operation, not the use of a particular pointer type."],
      ["Prefer the Rule of Zero", "Let standard members manage resources whenever possible: vector owns its allocation, unique_ptr owns one dynamic object, and lock_guard owns a lock interval. If a class manually owns a resource, its copy and move behavior must be deliberate. Copying a raw handle value does not duplicate the underlying resource safely. Use shared ownership only when multiple independent components truly control lifetime; cycles need weak references or another ownership design."]],
      ["Manually deleting a pointer still owned by unique_ptr causes double destruction.", "shared_ptr does not make concurrent access to the pointed-to object thread-safe."],
      { question: "Why does lock_guard release its mutex on an early return?", answer: "Its destructor runs when the local object's scope ends, including when control leaves the scope early." },
      ["Add an early return in a scope containing lock_guard and trace cleanup.", "Replace a raw owning pointer with unique_ptr.", "Draw a shared_ptr cycle and explain why its reference count cannot reach zero."],
      { time: "25–30 MIN" }
    ),
    "containers-and-algorithms": d(
      "Loops, templates, and basic references.",
      [["Containers own elements; iterators describe positions", "A container defines storage, access, and invalidation guarantees. vector is a strong default for sequences because it is contiguous and efficient to traverse and append to. Reallocation may invalidate iterators, references, and pointers to its elements. Algorithms state requirements about iterator category and ordering; complexity and invalidation guarantees are part of the contract, not optional details."],
      ["Half-open ranges compose", "The range [first, last) includes first and excludes last. That convention makes empty ranges and adjacent subranges easy to represent; end is a boundary and must not be dereferenced. Use standard algorithms such as sort and find when their preconditions match. A comparator for sort must impose a strict weak ordering. Keep iterators only across operations documented not to invalidate them."]],
      ["Using an iterator after vector reallocation is invalid even if the old address still looks readable.", "A comparator that violates strict weak ordering breaks algorithms such as sort."],
      { question: "In [begin, end), is end a valid element?", answer: "No. It marks the one-past boundary; the range includes begin and excludes end." },
      ["Sort a vector and then locate an element with std::find.", "Force a vector reallocation and identify which observers are invalidated.", "Compare vector and map lookup for the operation your program needs."],
      { time: "25–30 MIN" }
    ),
    "templates-and-concepts": d(
      "Functions, type deduction, and compiler diagnostics.",
      [["Templates generate code at compile time", "A template is a recipe. The compiler deduces template arguments and instantiates a specialization for a use. This can produce separate machine code for different types; it does not add runtime type checks by itself. Template definitions generally need to be visible where instantiation occurs, which is why templates are commonly defined in headers. Concepts make the permitted operations visible in the interface."],
      ["Constrain the operations actually required", "A good generic function states the minimum operations it needs. Use standard concepts such as integral or ranges::range when they match the contract. Constraints are checked during substitution, not at runtime. Avoid making a template more general than its supported use cases. If one special case is clearer as an overload, prefer that over complicated metaprogramming."]],
      ["A declaration alone does not prove every type is supported; instantiation checks actual expressions.", "Concepts constrain compile-time operations but do not validate runtime input."],
      { question: "When is a function template body checked for a concrete type?", answer: "When the compiler instantiates the template for a use." },
      ["Try a template with a type that lacks a required operation.", "Add a concept describing the operation the function needs.", "Keep the simplest constraint that explains the supported domain."],
      { time: "25–30 MIN" }
    ),
    "objects-and-classes": d(
      "Variables, functions, and access control.",
      [["Types are boundaries around valid state", "A class defines a type and its invariants; an object is one instance with its own lifetime and state. Encapsulation protects decisions callers should not violate. A public interface should express operations in the domain, while private representation can change without forcing every caller to change. If fields vary independently and no invariant exists, a simple struct may be clearer."],
      ["Design from the invariant outward", "For a bounded counter, specify the allowed range, decide what increment does at the upper boundary, and choose a result that makes failure visible. A getter that exposes mutable storage can undermine the invariant. Prefer returning values or const views. Test transitions, not only initial construction: valid update, boundary, and rejected transition."]],
      ["Public fields plus trivial getters and setters do not automatically create a useful abstraction.", "An invariant must hold after every public operation, not only immediately after construction."],
      { question: "Why keep a class representation private?", answer: "So public operations can preserve invariants and the implementation can change without coupling every caller." },
      ["State the invariant for a bounded counter.", "Design behavior at the upper boundary.", "Test construction, a normal update, and a rejected transition."],
      { time: "25–30 MIN", codeTitle: "counter.cpp", code: "#include <iostream>\n#include <stdexcept>\n\nclass Counter {\npublic:\n    static constexpr int maximum{10};\n    explicit Counter(int initial = 0) : value_{initial} {\n        if (initial < 0 || initial > maximum) throw std::out_of_range{\"counter range\"};\n    }\n    bool increment() {\n        if (value_ == maximum) return false;\n        ++value_;\n        return true;\n    }\n    int value() const noexcept { return value_; }\nprivate:\n    int value_{};\n};\n\nint main() {\n    Counter clicks{9};\n    clicks.increment();\n    std::cout << clicks.value() << '\\n';\n}" }
    ),
    "constructors-and-invariants": d(
      "Member declarations, object lifetime, and initialization syntax.",
      [["Construction is an invariant boundary", "A constructor should leave an object usable, not create a partially initialized shell callers must repair. Members initialize in declaration order, regardless of the textual order in the initializer list. A member omitted from the list is default-initialized; for scalar members that can mean an indeterminate value. In-class initializers provide defaults, while the initializer list handles dependencies and required arguments."],
      ["Initialization order is part of the type's behavior", "Use explicit on single-argument constructors unless implicit conversion is intentional. Validate inputs before storing an invalid state. If construction can fail, choose an error model consistent with the rest of the program. Store resources in RAII members as soon as acquired, so a later failure automatically cleans up earlier acquisitions."]],
      ["Reordering an initializer list does not change member initialization order.", "Publishing this or calling virtual functions before full construction exposes an incomplete object."],
      { question: "In what order are data members initialized?", answer: "Their declaration order in the class." },
      ["Compare declaration order with initializer-list order.", "Add an explicit one-argument constructor and test implicit conversion.", "Test invalid construction and ensure no partially valid object escapes."],
      { time: "25–30 MIN" }
    ),
    "enum-and-modeling": d(
      "Basic types, switch statements, and named constants.",
      [["Finite domains deserve finite types", "enum class models a finite set of named states. Unlike an unscoped enum, its enumerators do not leak into the surrounding namespace and do not implicitly convert to integers. Choose names that describe the domain, not implementation positions. If values cross an ABI or are serialized, define representation and versioning rules rather than assuming the compiler's default mapping is a permanent wire format."],
      ["Make state handling exhaustive", "A switch can make transitions visible. Handle every enumerator and decide what happens for an invalid value introduced by deserialization or a cast. Compiler warnings for missing cases are useful, but a default branch can suppress some warnings. Keep conversion to display text separate so presentation is not confused with the stored value."]],
      ["Casting an arbitrary integer to an enum does not prove it is a declared enumerator.", "Using numeric enum positions as a stable file format creates accidental compatibility requirements."],
      { question: "What does enum class prevent that a plain enum commonly allows?", answer: "Implicit conversion to int and unscoped enumerator names." },
      ["Add a state and update each switch.", "Test handling for an unknown deserialized integer.", "Write a text conversion function that does not depend on numeric ordering."],
      { time: "20–25 MIN", codeTitle: "state.cpp", code: "#include <iostream>\n\nenum class State { ready, busy, failed };\n\nint main() {\n    const State state{State::busy};\n    switch (state) {\n    case State::ready: std::cout << \"ready\\n\"; break;\n    case State::busy: std::cout << \"busy\\n\"; break;\n    case State::failed: std::cout << \"failed\\n\"; break;\n    }\n}" }
    ),
    "strings-and-text": d(
      "Character types, arrays, and external input.",
      [["Text has encoding, ownership, and length units", "std::string owns a sequence of char code units; it does not promise that each byte is one character. UTF-8 uses one to four bytes per Unicode scalar value, and a visible grapheme can contain multiple scalar values. size() reports code units, not user-perceived characters. string_view is non-owning and must not outlive its backing storage."],
      ["Make boundaries explicit", "Define an encoding at each boundary: file bytes, network bytes, terminal input, and UI display may have different contracts. Validate UTF-8 when required and normalize only when the application's equality rules require it. Do not use byte count as a password-character limit or display-column count without stating that policy. For asynchronous work, ensure the owner outlives every view."]],
      ["string_view does not own or extend the lifetime of its data.", "A byte-oriented substring can split a multi-byte UTF-8 sequence."],
      { question: "What does std::string::size() measure for UTF-8 stored in std::string?", answer: "The number of char code units, commonly bytes; Unicode character segmentation is a separate operation." },
      ["Compare byte length with visible length for a multi-byte UTF-8 symbol.", "Analyze why a string_view into a temporary is invalid after the full expression.", "Document the encoding and length unit for one file or network field."],
      { time: "25–30 MIN", codeTitle: "text.cpp", code: "#include <iostream>\n#include <string>\n#include <string_view>\n\nstd::string greet(std::string_view name) {\n    return \"Hello, \" + std::string{name} + \"!\";\n}\n\nint main() {\n    const std::string name{\"Ada\"};\n    std::cout << greet(name) << '\\n';\n}" }
    ),
    "file-streams": d(
      "C++ streams, paths, and line-oriented input.",
      [["Streams report state; they do not guarantee success", "A file stream is a stateful interface to an external resource. Opening can fail because a path is wrong, permissions deny access, the file is absent, or the environment differs. Stream state distinguishes successful extraction, end-of-file, and other failures. The common while (stream >> value) pattern tests extraction itself; checking eof() before reading can process stale data."],
      ["Parse records with explicit failure paths", "For line-oriented formats, read a line and parse it as a record so you can report a line number. Validate every field and reject malformed or truncated records. A delimiter-based format does not automatically handle quoted delimiters. Keep parsing separate from side effects so a bad record cannot partially update important state. For binary formats, define byte order and widths rather than dumping object memory."]],
      ["Testing eof() before extraction is a common source of duplicate or stale processing.", "Writing a C++ struct's raw bytes is not a portable serialization format."],
      { question: "Why is while (input >> value) better than while (!input.eof())?", answer: "It tests whether extraction for the current iteration succeeded." },
      ["Open a missing file and print a useful diagnostic.", "Create valid and malformed records and report the bad line number.", "Test an empty file and a final line without a trailing newline."],
      { time: "25–30 MIN", codeTitle: "stream-state.cpp", code: "#include <iostream>\n#include <sstream>\n\nint main() {\n    std::istringstream input{\"10 20 invalid 40\"};\n    int value{};\n    while (input >> value) std::cout << value << '\\n';\n    if (input.fail() && !input.eof()) {\n        std::cerr << \"input was malformed\\n\";\n        return 1;\n    }\n}" }
    ),
    "exceptions-errors": d(
      "Function interfaces, return values, and RAII.",
      [["Errors are part of an interface", "Error handling is a control-flow contract. An exception propagates failure until a layer can recover; a result value makes alternatives explicit at the call site. Exceptions fit failures that prevent a function from completing its promised task, while expected choices such as found versus missing may be clearer as a result. Preserve context and do not convert a specific failure into an ambiguous magic value."],
      ["Choose a recovery boundary", "RAII ensures constructed objects clean up during stack unwinding. A function should avoid leaving shared state half-updated if it fails. The strong guarantee leaves state unchanged; the basic guarantee preserves invariants while state may change. Catch where the program can add context, retry, or report failure—not in every helper and not merely to suppress the error."]],
      ["Catching and discarding an exception hides it from the layer that could respond.", "A return code is not safer by itself; callers can still ignore it."],
      { question: "Where should an exception usually be caught?", answer: "At a boundary that can recover, add context, or report failure." },
      ["List expected and exceptional failures for a configuration parser.", "Choose a result type for an ordinary not-found outcome.", "Add an RAII resource and test that failure still releases it."],
      { time: "25–30 MIN", codeTitle: "error-boundary.cpp", code: "#include <iostream>\n#include <stdexcept>\n\nint divide(int numerator, int denominator) {\n    if (denominator == 0) throw std::invalid_argument{\"zero denominator\"};\n    return numerator / denominator;\n}\n\nint main() {\n    try {\n        std::cout << divide(12, 3) << '\\n';\n    } catch (const std::invalid_argument& error) {\n        std::cerr << error.what() << '\\n';\n        return 1;\n    }\n}" }
    ),
    "move-semantics": d(
      "Value categories, constructors, and object lifetime.",
      [["Value categories guide overload selection", "An expression has a value category that influences overload resolution. std::move is effectively a cast to an xvalue; it does not itself transfer bytes or call a move constructor. The selected operation decides what happens. A move may transfer a resource, but for small value types it can be equivalent to copying. Return-value optimization and value semantics often remove the need to write std::move in returns."],
      ["Moved-from objects remain valid, not unchanged", "After a move, the source remains valid but its value is generally unspecified unless documented otherwise. It can be destroyed or assigned a new value; do not assume old contents remain. A custom move operation must leave the source safely destructible and maintain invariants. Prefer the Rule of Zero and measure performance before adding custom move code."]],
      ["Adding std::move everywhere can inhibit copy elision or select an unintended overload.", "Reading a moved-from string as though it retained old contents is not portable."],
      { question: "Which statement about std::move is correct?", answer: "It casts an expression to an xvalue so a move operation may be selected." },
      ["Compare overload resolution for an lvalue and std::move(lvalue).", "Move a string into a destination, then use the source only in guaranteed ways.", "Remove a redundant std::move from a local return and inspect the result."],
      { time: "25–30 MIN", codeTitle: "move.cpp", code: "#include <iostream>\n#include <string>\n#include <utility>\n\nint main() {\n    std::string source{\"a resource-owning string\"};\n    std::string destination{std::move(source)};\n    std::cout << destination << '\\n';\n    source = \"reassigned\";\n    std::cout << source << '\\n';\n}" }
    ),
    "smart-pointers": d(
      "Pointers, object lifetime, and destructors.",
      [["Pointer types describe ownership policy", "A smart pointer represents an ownership policy. unique_ptr expresses one movable owner; shared_ptr maintains a reference-counted shared lifetime; weak_ptr observes a shared object without keeping it alive. A raw pointer or reference is usually a non-owning borrow. Choosing among them is a design question: who is responsible for destruction, and which components need to keep the object alive?"],
      ["Prefer one owner and explicit borrows", "Use make_unique or make_shared to construct an object and its owner in one expression. A shared_ptr cycle prevents the reference count from reaching zero, so model non-owning back-references with weak_ptr. Passing unique_ptr by value can signal transfer; passing T& or T* usually signals borrowing. Do not store a borrowed pointer longer than its owner. For local objects and collections, direct values are often simpler than pointers."]],
      ["shared_ptr does not make access to the pointed-to object thread-safe.", "A raw pointer returned by get() does not extend the smart pointer's ownership."],
      { question: "Which type is the normal default when exactly one component owns a dynamic object?", answer: "std::unique_ptr; it makes exclusive ownership and transfer explicit." },
      ["Draw an ownership graph for an application and three non-owning views.", "Replace a shared back-reference with weak_ptr when it would form a cycle.", "Classify each function parameter as owning, borrowing, or shared ownership."],
      { time: "25–30 MIN" }
    ),
    "lambdas-callables": d(
      "Functions, object lifetime, and value/reference semantics.",
      [["A lambda is an object with stored state", "A lambda expression creates a closure object. Its capture list defines the stored state and its ownership relationship to surrounding variables. Capturing by value stores a copy; init-capture can move a value into the closure. Capturing by reference stores an alias, so every invocation depends on the original object still existing. The closure's lifetime may be much longer than the line where it was created."],
      ["Review capture and invocation lifetimes together", "A callback passed to a synchronous algorithm usually runs before the surrounding scope exits. A callback stored for later, placed on a queue, or used by another thread has a different lifetime contract. Avoid capturing a local by reference in deferred work. Capturing this does not keep the object alive; a separate ownership or cancellation/join guarantee is required. Keep captures narrow so reviewers can see dependencies."]],
      ["A lambda stored in a member can outlive a reference-captured local.", "Capturing this copies the pointer, not the pointed-to object or its lifetime."],
      { question: "Why can capture-by-reference be unsafe in a callback saved for later?", answer: "The referenced local may be destroyed before the callback is invoked." },
      ["Write a synchronous lambda that captures an integer by copy.", "Write a deferred callback and state the lifetime guarantee for every capture.", "Replace a broad [&] capture with explicit captures and compare intent."],
      { time: "25–30 MIN", codeTitle: "lambda.cpp", code: "#include <algorithm>\n#include <iostream>\n#include <vector>\n\nint main() {\n    const int minimum{5};\n    const std::vector<int> values{2, 5, 8, 1};\n    const auto found{std::find_if(values.begin(), values.end(),\n        [minimum](int value) { return value >= minimum; })};\n    if (found != values.end()) std::cout << *found << '\\n';\n}" }
    ),
    "testing-assertions": d(
      "Functions, control flow, and deterministic output.",
      [["Tests express behavioral contracts", "A test is an executable claim about observable behavior. Separate inputs, outputs, and side effects so tests can repeat the same case. Include boundary, failure, and regression cases; a happy path rarely exercises the contracts most likely to break. Assertions are useful for programmer assumptions during development, but assert can be disabled in release builds and must not replace validation of untrusted input."],
      ["Tools increase evidence, not certainty", "AddressSanitizer can catch many out-of-bounds and use-after-free errors; UndefinedBehaviorSanitizer catches selected undefined operations. They observe executed paths and supported operations. A clean run is evidence, not proof. Keep the failing input and tool output, reduce the case, and fix the first invalid operation rather than suppressing the report."]],
      ["An assert statement is not a security check for external input.", "A passing test for one sample does not establish correctness for every input."],
      { question: "What does a passing sanitizer run prove?", answer: "No instrumented error was found on the executed paths in that run; it is evidence, not a proof of safety." },
      ["Test empty, one-element, typical, and boundary inputs.", "Run a sanitizer build with a deliberately faulty local test, then fix it.", "Keep a regression test for the original bug."],
      { time: "25–30 MIN", codeTitle: "assert.cpp", code: "#include <cassert>\n\nint square(int value) { return value * value; }\n\nint main() {\n    assert(square(0) == 0);\n    assert(square(4) == 16);\n    assert(square(-3) == 9);\n}" }
    ),
    "build-linking": d(
      "Functions, headers, compiler commands, and source files.",
      [["Compilation and linking answer different questions", "A translation unit is a source file after preprocessing, together with its headers. Each translation unit is compiled independently. The linker resolves external symbols between object files and libraries. A declaration tells the compiler what type and name to expect; a definition supplies storage or a function body. Missing object files create unresolved references; duplicate non-inline definitions create duplicate symbols."],
      ["Make the build graph explicit", "Headers should be self-contained, guarded, and mostly declarative. Put ordinary non-inline function definitions in one source file; include the header from caller and implementation to catch interface drift. A build system names the target and source files and tracks dependencies. A clean build checks that no stale object file is hiding a missing dependency."]],
      ["Including a .cpp file to avoid learning the linker creates one translation unit and can cause duplicate definitions.", "Compiling one file successfully does not guarantee all required objects are linked."],
      { question: "What is the normal role of a header/source split?", answer: "The header declares an interface; one source file defines the implementation." },
      ["Create a small add.hpp/add.cpp/main.cpp project.", "Build from a clean directory and inspect an unresolved symbol when a source is omitted.", "Add an include guard and compile a file that includes the header twice."],
      { time: "30–35 MIN" }
    )
  });
})();
