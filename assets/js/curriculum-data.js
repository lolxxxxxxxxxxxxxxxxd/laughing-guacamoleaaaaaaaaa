"use strict";

(() => {
  const tracks = [
    { id: "cpp", label: "C++", title: "Modern C++", description: "Core language, standard library, object design, and reliable builds." },
    { id: "c", label: "C", title: "C programming", description: "Data, pointers, memory ownership, and the C build model." },
    { id: "lowlevel", label: "Low-level", title: "Low-level foundations", description: "Representation, processes, machine code, ABIs, and executable formats." },
    { id: "windows", label: "Windows", title: "Windows systems", description: "Win32, processes, memory, security boundaries, and diagnostics." },
    { id: "security", label: "Security", title: "Security foundations", description: "Threat models, networks, secure coding, and the vulnerability lifecycle." },
    { id: "blue-team", label: "Blue team", title: "Blue team operations", description: "Telemetry, triage, detection engineering, response, and hardening." },
    { id: "red-team", label: "Red team", title: "Authorized testing", description: "Scope-first assessment methodology using owned systems and training labs." },
    { id: "osint", label: "OSINT", title: "Open-source research", description: "Ethical collection, source validation, privacy, and evidence handling." }
  ];

  function module(item) {
    const track = tracks.find((entry) => entry.id === item.track);
    return {
      id: item.id,
      track: item.track,
      label: track.label,
      title: item.title,
      time: item.time || "8 MIN",
      level: item.level || "CORE",
      description: item.description,
      summary: item.summary,
      focus: item.focus,
      sections: [
        { heading: item.heading || "Build the model", paragraphs: [item.explain] },
        { heading: item.practiceHeading || "Practice with intent", paragraphs: [item.practice] }
      ],
      exercise: item.exercise,
      takeaway: item.takeaway,
      codeTitle: item.codeTitle,
      code: item.code,
      resources: item.resources || []
    };
  }

  const topics = [
    {
      id: "objects-and-classes", track: "cpp", title: "Classes, objects & invariants", time: "10 MIN",
      description: "Group state with the operations that keep it valid.", summary: "A class defines a type; an object is one value of that type. Good class design makes valid states easy to create and invalid states difficult to represent.",
      focus: ["class vs object", "public interface", "invariants"], heading: "Put the contract in the type",
      explain: "A class groups data and operations behind an interface. Its invariant is a condition that must remain true for every live object. Keep representation private when callers should not manipulate it directly, and expose operations that preserve the invariant.",
      practice: "Start with a small value type, such as a bounded counter. List the states that are valid, then decide which constructor and member functions are needed to keep every update within those rules.",
      exercise: "Design a Temperature type that stores Celsius and rejects values below absolute zero. Write down its invariant before writing its interface.",
      takeaway: "An object is more useful when its public operations protect a clear invariant.",
      resources: [{ label: "C++ Core Guidelines: classes", url: "https://isocpp.github.io/CppCoreGuidelines/CppCoreGuidelines#S-class" }]
    },
    {
      id: "constructors-and-invariants", track: "cpp", title: "Constructors & initialization", time: "9 MIN",
      description: "Make objects valid as soon as they come into existence.", summary: "Constructors establish an object's initial state. Member initializer lists initialize members directly and make the order and requirements visible.",
      focus: ["member initializer lists", "const members", "construction order"], heading: "Initialize, do not patch together",
      explain: "Members are initialized in the order they are declared, not the order written in the initializer list. A constructor should leave the object ready to use. Prefer brace initialization when it helps catch narrowing conversions, and give members sensible defaults where possible.",
      practice: "When reviewing a constructor, compare declaration order with initializer-list order. If construction can fail, decide whether the type should report failure with a result value, an exception, or a factory function.",
      exercise: "Add two members to a class and write a constructor that initializes them in declaration order. Explain what would happen if the order were reversed.",
      takeaway: "A constructor is the first line of defense for an object's invariant.",
      codeTitle: "initialization.cpp", code: "#include <iostream>\n#include <string>\n#include <utility>\n\nstruct User {\n    std::string name;\n    int access_level{};\n\n    User(std::string user_name, int level)\n        : name{std::move(user_name)}, access_level{level} {}\n};\n\nint main() {\n    const User user{\"Ada\", 2};\n    std::cout << user.name << \": level \" << user.access_level << '\\n';\n}"
    },
    {
      id: "enum-and-modeling", track: "cpp", title: "Enums & domain modeling", time: "7 MIN",
      description: "Replace unexplained integers with named states.", summary: "An enumeration gives a finite set of values names. Scoped enums keep those names contained and prevent accidental implicit conversion to integers.",
      focus: ["enum class", "explicit states", "switch exhaustiveness"], heading: "Give states names",
      explain: "A value such as 3 does not explain whether it means connected, retrying, or failed. An enum class records the domain in the type system. When adding a new state, compiler warnings can help find switches that need another case.",
      practice: "Model a connection state with a scoped enum. Keep formatting separate from the value itself, and decide what a caller should do for every state.",
      exercise: "Create a TrafficLight enum class and write a switch that handles each enumerator.", takeaway: "A well-named type is documentation the compiler can check."
    },
    {
      id: "strings-and-text", track: "cpp", title: "Strings, bytes & encodings", time: "11 MIN",
      description: "Know the difference between text, bytes, and code units.", summary: "A string is a sequence of code units, not automatically a sequence of human-perceived characters. Input encoding and output encoding must be understood at system boundaries.",
      focus: ["std::string", "UTF-8", "length vs characters"], heading: "Text is data with an encoding",
      explain: "std::string stores char code units and is commonly used for UTF-8 bytes, but it does not validate or count Unicode grapheme clusters for you. A displayed symbol may use several bytes or code points. Treat external text as untrusted input and define the encoding at every boundary.",
      practice: "Use std::string for byte-oriented UTF-8 data only when the rest of the program agrees. Validate or normalize where required; do not assume that byte length equals visible character count.",
      exercise: "Write down how a file, terminal, and network message enter your program. State the encoding you expect at each boundary.", takeaway: "A string container does not make encoding assumptions disappear.",
      resources: [{ label: "cppreference: std::basic_string", url: "https://en.cppreference.com/w/cpp/string/basic_string" }]
    },
    {
      id: "file-streams", track: "cpp", title: "Files & stream state", time: "10 MIN",
      description: "Open files deliberately and check every operation that can fail.", summary: "File streams expose state that tells you whether opening and reading succeeded. A robust parser distinguishes end-of-file from malformed input and from an I/O error.",
      focus: ["std::ifstream", "stream state", "line-oriented parsing"], heading: "Treat file I/O as fallible",
      explain: "A path can be missing, permissions can deny access, and data can be truncated or malformed. Check the stream after opening and structure loops around the read operation. Avoid parsing by assuming every line has the shape you expected.",
      practice: "For a small text format, read a complete line, validate its fields, and report the line number when the record is invalid. Keep parsing separate from processing.",
      exercise: "Create a program that opens a named file and reports a clear error when it cannot be opened.", takeaway: "I/O is an operation with failure modes, not a guaranteed value."
    },
    {
      id: "exceptions-errors", track: "cpp", title: "Errors, results & exceptions", time: "12 MIN",
      description: "Choose an error model that makes failure hard to ignore.", summary: "Exceptions and explicit result values solve different problems. The right choice depends on whether failure is exceptional, expected, and recoverable at the call site.",
      focus: ["preconditions", "error propagation", "RAII during unwinding"], heading: "Make failure part of the interface",
      explain: "A function that can fail should make that possibility clear. Exceptions are useful when a failure interrupts normal work and can be handled at a meaningful boundary. A result type can make expected alternatives explicit. Neither approach removes the need to document preconditions.",
      practice: "Trace an error from its point of detection to the layer that can recover. Avoid catching an exception only to discard it, and avoid returning a magic value that is also valid data.",
      exercise: "For a configuration loader, list three failures and identify which layer can explain or recover from each one.", takeaway: "Report errors where the program has enough context to respond."
    },
    {
      id: "move-semantics", track: "cpp", title: "Move semantics without the myth", time: "10 MIN",
      description: "Understand what std::move does—and what it does not do.", summary: "std::move is a cast that enables a move operation to be selected. The object is not moved until a move constructor or move assignment actually runs.",
      focus: ["value categories", "move operations", "valid moved-from state"], heading: "A cast is not an operation",
      explain: "std::move converts an expression to an xvalue. That can allow an overload to transfer resources instead of copying them. A moved-from standard-library object remains valid but its value is generally unspecified; do not use it as though it kept the old contents.",
      practice: "Prefer letting values move naturally through return-by-value and standard containers. Add a custom move operation only when the type owns a resource and the default behavior is not correct.",
      exercise: "Explain why std::move(name) alone does not prove that a move occurred. Identify the overload that would need to receive the expression.",
      takeaway: "Use std::move to express permission to move, not as a performance spell.",
      resources: [{ label: "cppreference: std::move", url: "https://en.cppreference.com/w/cpp/utility/move" }]
    },
    {
      id: "smart-pointers", track: "cpp", title: "Smart pointers & ownership", time: "11 MIN",
      description: "Represent who owns a resource instead of managing it by convention.", summary: "A unique_ptr expresses exclusive ownership, while shared_ptr expresses shared lifetime. Raw pointers and references are usually better for non-owning access.",
      focus: ["unique_ptr", "shared_ptr tradeoffs", "borrowed references"], heading: "Ownership is a design decision",
      explain: "When a resource has one owner, unique_ptr makes destruction automatic and transfer explicit. shared_ptr adds reference-counted lifetime but can obscure ownership and create cycles. Use a raw pointer or reference to observe an object when the caller guarantees its lifetime.",
      practice: "Draw an ownership graph before choosing a pointer type. If two objects own each other through shared_ptr, the cycle can prevent destruction; a weak_ptr can represent a non-owning observation.",
      exercise: "For a document editor with one application owner and several views, decide which references own the document and which merely observe it.",
      takeaway: "Prefer one obvious owner; make borrowing visible in the interface.",
      codeTitle: "unique-owner.cpp", code: "#include <memory>\n\nstruct Session {};\n\nint main() {\n    auto session = std::make_unique<Session>();\n    // session owns the object until this scope ends.\n}"
    },
    {
      id: "lambdas-callables", track: "cpp", title: "Lambdas & callable objects", time: "9 MIN",
      description: "Capture only the state a callback needs and for no longer than it lives.", summary: "A lambda creates a callable object. Its capture list determines which local values it stores and whether they are copied, referenced, or moved.",
      focus: ["capture by value", "capture by reference", "callback lifetime"], heading: "Captures have lifetime rules",
      explain: "Capturing by reference is safe only while the referenced object outlives every invocation. A callback stored for later can outlive the function that created it. Capturing by value gives the callable its own copy; init-capture can move an owned value into it.",
      practice: "When a callback is asynchronous or stored in an object, inspect its captures and invocation lifetime together. Avoid capturing this unless the object's lifetime is guaranteed by the callback contract.",
      exercise: "Write one lambda that safely captures an integer by value and one that would be unsafe if stored after its enclosing function returns.",
      takeaway: "Review a lambda's capture list like a small ownership declaration."
    },
    {
      id: "testing-assertions", track: "cpp", title: "Tests, assertions & sanitizers", time: "12 MIN",
      description: "Use small repeatable checks to catch regressions and undefined behavior.", summary: "Tests verify observable behavior. Assertions check assumptions during development, while sanitizers can expose memory errors that ordinary output tests miss.",
      focus: ["unit tests", "assert preconditions", "AddressSanitizer"], heading: "Make behavior repeatable",
      explain: "A useful test states an input and an expected result. Keep tests deterministic and isolate them from the network, wall-clock time, and mutable global state. Assertions are not a substitute for validating untrusted input because release builds may disable them.",
      practice: "Run a small suite after each change. When possible, enable address and undefined-behavior sanitizers in a local development build, then investigate the first reported invalid access rather than suppressing it.",
      exercise: "Write a boundary test for an empty collection, a single item, and an out-of-range index.",
      takeaway: "A passing test is evidence for a case, not proof that every case is safe."
    },
    {
      id: "build-linking", track: "cpp", title: "Build systems, compiling & linking", time: "13 MIN",
      description: "Follow source files through compilation, linking, and the final executable.", summary: "A build turns translation units into object files and combines them with libraries. A linker error usually means a declaration and its definition do not line up across that boundary.",
      focus: ["translation units", "headers vs definitions", "linker diagnostics"], heading: "One project, many translation units",
      explain: "Each source file is compiled independently after preprocessing. Headers communicate declarations; source files provide definitions. The linker resolves references between object files. Include guards or #pragma once prevent a header from being processed repeatedly in one translation unit.",
      practice: "Keep non-inline function definitions in one source file, include a header from its users, and build all required source files together. Treat the first useful linker diagnostic as a missing or mismatched symbol clue.",
      exercise: "Create a header declaring add(int, int), implement it in another file, and call it from main.cpp.",
      takeaway: "A declaration tells the compiler what exists; a definition supplies the implementation."
    },
    {
      id: "c-pointers-arrays", track: "c", title: "C arrays, pointers & bounds", time: "10 MIN",
      description: "Keep a pointer and its valid range connected in your design.", summary: "In most expressions, an array converts to a pointer to its first element, but the array size is not carried along. C interfaces often pass a pointer and a length as a pair.",
      focus: ["array-to-pointer conversion", "length parameters", "one-past pointer"], heading: "A pointer does not know the allocation size",
      explain: "The expression sizeof array works only while the actual array type is available; after a function parameter adjusts to a pointer, sizeof gives the pointer size. A valid range is commonly represented by a pointer plus an element count, or by begin and end pointers.",
      practice: "Validate the count before indexing. Forming a one-past pointer is permitted for traversal, but dereferencing it is not. Keep the count sourced from the same allocation or container that owns the data.",
      exercise: "Write a function that receives an int pointer and a count, then returns the sum without reading beyond the range.",
      takeaway: "Carry the length with a C pointer; do not try to infer it later.",
      codeTitle: "bounded-range.c", code: "#include <stddef.h>\n\nint sum_values(const int *values, size_t count) {\n    int sum = 0;\n    for (size_t i = 0; i < count; ++i) {\n        sum += values[i];\n    }\n    return sum;\n}\n\nint main(void) {\n    const int values[] = {2, 4, 6};\n    return sum_values(values, 3) == 12 ? 0 : 1;\n}"
    },
    {
      id: "c-strings", track: "c", title: "C strings & bounded input", time: "10 MIN",
      description: "Treat NUL-terminated text as a buffer with a real capacity.", summary: "A C string is a character sequence ending at the first NUL byte. The pointer alone does not describe the buffer capacity, so every copy and read needs an explicit bound.",
      focus: ["NUL terminator", "buffer capacity", "fgets and length checks"], heading: "Text buffers need a size",
      explain: "Functions such as strlen scan until a terminator and assume the memory is valid. A destination buffer must have room for data and the final NUL byte. Prefer APIs that receive a capacity, then validate the resulting length before using the data.",
      practice: "Use fgets for bounded line input and check its return value. If the line may be longer than the buffer, detect truncation and drain or reject the remainder rather than silently treating it as a complete record.",
      exercise: "Read a line into a fixed-size array and report whether it fit completely.", takeaway: "A buffer's capacity is part of the contract, not an implementation detail."
    },
    {
      id: "c-structs-enums", track: "c", title: "C structs, enums & interfaces", time: "9 MIN",
      description: "Use named structures and explicit status values to clarify C APIs.", summary: "A struct groups related fields but does not enforce private invariants. A function interface can still make ownership, mutability, and failure conditions explicit.",
      focus: ["struct layout", "enum status", "const-qualified pointers"], heading: "Describe the data and the contract",
      explain: "C structs are useful for related fields, while enums give status codes names. A pointer-to-const communicates that a function will not modify the pointed-to object through that parameter. Comments should state whether pointers may be null and who owns allocated memory.",
      practice: "For a parser result, return a status enum and write outputs only on success. Document the lifetime of any pointer stored in the result so callers know when it becomes invalid.",
      exercise: "Design a C struct for a 2D point and a function that computes its distance without modifying either input.",
      takeaway: "C relies on clear API contracts where the language has no ownership type system."
    },
    {
      id: "c-allocation", track: "c", title: "C allocation & ownership", time: "12 MIN",
      description: "Pair every allocation with one clear owner and one release path.", summary: "malloc returns uninitialized storage or a null pointer. The caller must check for failure, initialize the object, and ensure every successful allocation is eventually released exactly once.",
      focus: ["malloc and free", "allocation failure", "single ownership"], heading: "Resource ownership is manual in C",
      explain: "A pointer returned by malloc must be passed to free once, and only after its last use. Freeing too early creates a dangling pointer; freeing twice or freeing a non-owned pointer is undefined behavior. Realloc can move the allocation, so use a temporary pointer for its result.",
      practice: "Structure functions so ownership transfer is obvious. On a multi-step failure path, release all resources already acquired. Set a pointer to null after freeing only when that convention helps prevent accidental reuse.",
      exercise: "Draw the success and failure paths for allocating two buffers and opening one file. Mark who releases each resource.",
      takeaway: "Every resource needs an owner, a lifetime, and a failure cleanup path."
    },
    {
      id: "c-error-handling", track: "c", title: "C return codes & error handling", time: "9 MIN",
      description: "Check what a function reports before trusting its output parameters.", summary: "C APIs commonly report success through a return value and write results through pointer parameters. Ignoring either channel can turn a simple failure into corrupted state.",
      focus: ["return values", "errno", "output parameters"], heading: "Check before using a result",
      explain: "A return value may be a count, a status, or a sentinel; read the documentation for the exact contract. errno is meaningful only when the API says it is, and it should be captured promptly. Do not assume an output parameter was initialized after failure.",
      practice: "Wrap repetitive checks in small helpers only when they preserve the original error information. Keep cleanup paths explicit and avoid replacing a useful system error with a generic message too early.",
      exercise: "Find a standard-library call that can fail and document its success indicator, error channel, and output guarantees.",
      takeaway: "An API call is not successful just because it returned to the caller."
    },
    {
      id: "c-headers-linking", track: "c", title: "C headers & the linker", time: "11 MIN",
      description: "Separate declarations from definitions and include only what a file needs.", summary: "A header publishes declarations to other translation units. A source file supplies definitions, and the linker combines the resulting object files.",
      focus: ["include guards", "extern declarations", "one definition"], heading: "Headers are interfaces",
      explain: "A header should be safe to include more than once, commonly through an include guard. Put declarations and types there; keep ordinary function definitions in a single .c file unless they are intentionally static inline. Avoid defining the same external symbol in multiple translation units.",
      practice: "Build each source file separately before linking. This helps distinguish a compiler error in one translation unit from an unresolved or duplicate symbol reported by the linker.",
      exercise: "Split a tiny C program into main.c, math.c, and math.h, then identify which stage catches a missing declaration and which catches a missing definition.",
      takeaway: "The compiler checks each translation unit; the linker checks how they fit together."
    },
    {
      id: "c-undefined-behavior", track: "c", title: "Undefined behavior in C", time: "11 MIN",
      description: "Learn why an invalid operation is not a reliable way to test a program.", summary: "Undefined behavior means the language imposes no requirements on the result. Compilers may optimize under the assumption that undefined behavior never occurs.",
      focus: ["signed overflow", "invalid pointer use", "sanitizers"], heading: "Undefined does not mean unpredictable-but-consistent",
      explain: "Out-of-bounds access, use-after-free, and signed integer overflow are examples of undefined behavior. A program may appear to work in one build and fail after optimization or on another machine. The absence of a crash is not evidence that the operation was valid.",
      practice: "Use compiler warnings and sanitizers during development. When a sanitizer finds a fault, reduce the input and fix the earliest invalid operation instead of relying on the observed output.",
      exercise: "Write down one example of undefined behavior and one defined edge case that looks similar. Explain the difference.",
      takeaway: "Do not build program logic around behavior the language leaves undefined."
    },
    {
      id: "binary-and-hex", track: "lowlevel", title: "Bits, bytes & hexadecimal", time: "8 MIN",
      description: "Read memory dumps and flags without losing track of the bit width.", summary: "A byte is commonly eight bits, and hexadecimal represents each four-bit group with one digit. Always state the width when interpreting a value or mask.",
      focus: ["binary to hex", "bit masks", "signed display"], heading: "Hex is a compact view of bits",
      explain: "The value 0x2A is 00101010 in eight bits. A bit mask selects positions, while a shift moves them. The same bit pattern can have different meanings depending on width and signedness, so a bare hex value is incomplete context.",
      practice: "Group binary digits into fours when converting to hex. When inspecting a field, write its width and mask, then verify the shifted result with a tiny test or the site's number converter.",
      exercise: "Convert 0xA5 to eight binary bits. Identify the high and low nibbles and write a mask for the low nibble.",
      takeaway: "State the width and interpretation, not just the hexadecimal digits.", resources: [{ label: "Open the number converter", url: "./reference.html" }]
    },
    {
      id: "integer-representation", track: "lowlevel", title: "Integer representation & overflow", time: "11 MIN",
      description: "Reason about widths, two's complement, and arithmetic overflow.", summary: "Machine integers have finite width. Signed and unsigned arithmetic follow different rules, and a cast can change how the same bits are interpreted.",
      focus: ["integer widths", "two's complement", "conversion rules"], heading: "A machine integer is a bounded value",
      explain: "A 32-bit unsigned integer has 2^32 possible bit patterns, while the signed range is narrower. Unsigned arithmetic wraps modulo its width; signed overflow in C and C++ is undefined. Converting an untrusted large value to a smaller type can truncate it.",
      practice: "Validate lengths and indexes before converting them. Prefer fixed-width integer types when a serialized format specifies a width, and check arithmetic before computing allocation sizes or offsets.",
      exercise: "Show why count * element_size can overflow before a memory allocation. Write a safe precondition using division.",
      takeaway: "Check both the value range and the type conversion at every boundary."
    },
    {
      id: "endianness-layout", track: "lowlevel", title: "Endianness, alignment & layout", time: "10 MIN",
      description: "Understand how values are laid out without assuming a portable struct format.", summary: "Endianness describes byte order for multi-byte values. Alignment and padding affect object layout, which is why raw struct bytes are not a portable wire format.",
      focus: ["little vs big endian", "padding", "serialization"], heading: "Object layout is not a file format",
      explain: "On a little-endian system, the least significant byte is stored at the lowest address. Compilers may insert padding to satisfy alignment. Writing a struct directly to disk can leak padding bytes and break across compilers, architectures, or versions.",
      practice: "Define a serialized format field by field with explicit widths and byte order. Parse each field with bounds checks rather than casting an arbitrary byte pointer to a struct pointer.",
      exercise: "For a 32-bit value 0x12345678, write its byte sequence in little-endian and big-endian order.",
      takeaway: "Serialize values deliberately; do not confuse in-memory layout with a stable format."
    },
    {
      id: "virtual-memory", track: "lowlevel", title: "Virtual memory & address spaces", time: "12 MIN",
      description: "Separate a process's virtual addresses from physical RAM.", summary: "A process uses a virtual address space that the operating system and hardware translate through page tables. A pointer is meaningful in the address space and lifetime of its process.",
      focus: ["pages", "address translation", "protection bits"], heading: "Addresses are process-relative",
      explain: "Two processes can use the same virtual address while mapping different physical pages. Page permissions can separate readable, writable, and executable regions. A mapped address can still be invalid if the mapping is absent, protected, or no longer alive.",
      practice: "Use a debugger or operating-system tools to inspect your own process. Relate a faulting instruction to the address it touched and the region's permission; do not infer meaning from an address alone.",
      exercise: "Explain why copying a pointer value from one process to another does not copy the pointed-to object.",
      takeaway: "A virtual address needs a process, mapping, permission, and valid lifetime."
    },
    {
      id: "registers-and-flags", track: "lowlevel", title: "Registers, flags & instruction state", time: "10 MIN",
      description: "Read a short x86-64 instruction sequence as state changes.", summary: "Registers hold working values, and flags record properties of an operation. Assembly is easier to read when each instruction is translated into a small state update.",
      focus: ["general-purpose registers", "RIP", "condition flags"], heading: "Follow the state, one instruction at a time",
      explain: "On x86-64, general-purpose registers may hold values, pointers, or temporary results. RIP identifies the next instruction. Arithmetic and comparison instructions update flags that conditional branches inspect; the same register can have different roles under different calling conventions.",
      practice: "At a breakpoint, record the relevant registers before and after one instruction. Use symbols and source mapping when available, then verify the assembly against the high-level operation instead of guessing from a mnemonic alone.",
      exercise: "Annotate a three-instruction sequence with the input and output value of each register.", takeaway: "A disassembly is a traceable sequence of state transitions."
    },
    {
      id: "calling-conventions", track: "lowlevel", title: "Calling conventions & stack frames", time: "12 MIN",
      description: "Track arguments, return values, and preserved registers across a call.", summary: "A calling convention defines how functions pass arguments, return values, and preserve machine state. A stack frame is a compiler-generated implementation detail, not a fixed C++ object model.",
      focus: ["argument registers", "caller vs callee saves", "stack alignment"], heading: "A function call is a contract at the ABI level",
      explain: "The ABI specifies register assignments, stack alignment, and which registers a function must preserve. Windows x64 and System V AMD64 differ. Optimizations can omit a traditional frame pointer, inline functions, or keep values only in registers.",
      practice: "Identify the target platform and ABI before interpreting call arguments. Compare a debug and optimized build to see how source-level structure may change while the externally visible calling contract remains.",
      exercise: "Look up the argument registers for one platform and list what a caller must assume survives a function call.",
      takeaway: "Calling conventions are platform contracts; do not mix assumptions from different ABIs."
    },
    {
      id: "assembly-reading", track: "lowlevel", title: "Reading assembly with source", time: "11 MIN",
      description: "Use compiler output to connect source expressions to machine instructions.", summary: "Assembly is most useful when paired with the source, compiler version, optimization level, and target architecture that produced it.",
      focus: ["compiler output", "control flow", "optimization levels"], heading: "Ask a narrow question of the disassembly",
      explain: "Start with a small function and compare debug and optimized output. Follow branches, data movement, and calls. Compiler Explorer can show how a specific expression changes across compilers, but assembly from one build is not a universal promise.",
      practice: "Change one source construct at a time. Keep the target and flags fixed, then explain each output difference. Use a debugger for runtime state and documentation for instruction semantics.",
      exercise: "Compare a loop with a library algorithm in Compiler Explorer and note which conclusions depend on the selected compiler and flags.",
      takeaway: "Assembly describes one build; preserve the conditions that produced it.", resources: [{ label: "Open Compiler Explorer", url: "./compiler.html" }]
    },
    {
      id: "linker-loader", track: "lowlevel", title: "Linkers, loaders & relocations", time: "13 MIN",
      description: "Follow symbols from object files to a process image.", summary: "The linker resolves symbols and produces an executable or library. The loader maps it into a process, applies required relocations, and prepares execution according to the platform format.",
      focus: ["symbols", "relocations", "dynamic libraries"], heading: "Build time and load time are different",
      explain: "Static linking copies required object code into the output; dynamic linking leaves references to shared libraries that are resolved by the platform loader. Relocations adjust addresses when code or data cannot be placed at a fixed location.",
      practice: "Inspect a program you built with a symbol or dependency viewer. Distinguish an unresolved symbol at link time from a missing shared library at launch time.",
      exercise: "Draw the path from source declaration to object symbol to loaded function call.", takeaway: "A successful compile does not guarantee that the loader can start the program."
    },
    {
      id: "binary-formats", track: "lowlevel", title: "PE, ELF & executable structure", time: "13 MIN",
      description: "Recognize headers, sections, imports, and architecture metadata.", summary: "PE and ELF are different executable formats with their own headers, tables, and loader rules. A file extension is only a hint; the bytes and metadata determine the format.",
      focus: ["magic values", "sections and segments", "imports and symbols"], heading: "Start with format metadata",
      explain: "A PE image has DOS and PE headers, sections, and data directories. ELF uses headers, program headers, and section tables. Tools may display different views because loaders care about mapped segments while linkers and debuggers also use section metadata.",
      practice: "Analyze a harmless executable you compiled yourself. Record its architecture, entry point, imports, and section permissions. Never execute an unknown sample just to learn its file structure.",
      exercise: "Compare a small PE and ELF and list which metadata describes architecture, sections, and imported symbols.",
      takeaway: "Identify the format and architecture before interpreting offsets or tables.",
      resources: [{ label: "Microsoft PE format", url: "https://learn.microsoft.com/en-us/windows/win32/debug/pe-format" }, { label: "ELF specification overview", url: "https://refspecs.linuxfoundation.org/elf/elf.pdf" }]
    },
    {
      id: "windows-process-threads", track: "windows", title: "Windows processes & threads", time: "11 MIN",
      description: "Separate process resources from the threads that execute instructions.", summary: "A process owns an address space and operating-system resources. Threads are schedulable execution contexts within that process, each with its own stack and register state.",
      focus: ["process address space", "thread context", "lifetime"], heading: "Execution and ownership are related but distinct",
      explain: "A process groups an executable image, virtual address space, handles, and security context. A thread has its own execution state and stack. Creating a thread does not make shared data safe; synchronization and lifetime still need explicit design.",
      practice: "Use a debugger or Process Explorer on a program you own. Observe process and thread IDs, then compare a thread's call stack with the process-wide modules and handles.",
      exercise: "Draw which parts of a process are shared by its threads and which execution state belongs to each thread.", takeaway: "A process is a resource container; a thread is an execution path.",
      resources: [{ label: "Microsoft: processes and threads", url: "https://learn.microsoft.com/en-us/windows/win32/procthread/processes-and-threads" }]
    },
    {
      id: "windows-handles-sync", track: "windows", title: "Handles, ownership & synchronization", time: "10 MIN",
      description: "Treat Windows handles as owned resources with explicit cleanup.", summary: "A Windows handle refers to an operating-system object through a process-specific table. The correct close operation depends on the API that created it.",
      focus: ["HANDLE", "CloseHandle", "critical sections and mutexes"], heading: "A handle is not a raw pointer",
      explain: "Handles are opaque values and should not be dereferenced. Document whether a function borrows or transfers a handle, and close it with the API's documented release function. Synchronization objects coordinate access but do not automatically protect unrelated state.",
      practice: "Wrap owned handles in a small RAII type in C++, or use a single cleanup path in C. Keep lock scope small and define what data the lock protects.",
      exercise: "Review a function that creates a file handle and list every path on which it must be closed.",
      takeaway: "Handle lifetime and shared-state synchronization are separate obligations."
    },
    {
      id: "windows-virtual-memory", track: "windows", title: "Windows virtual memory", time: "12 MIN",
      description: "Learn the lifecycle of reserving, committing, protecting, and releasing pages.", summary: "Windows virtual-memory APIs operate on page ranges and protection states. Their contracts differ from C++ object lifetime and heap allocation.",
      focus: ["VirtualAlloc", "page protections", "VirtualFree"], heading: "Memory has both a mapping and an object lifetime",
      explain: "VirtualAlloc can reserve address space and commit pages; changing protection is a separate operation with strict page alignment rules. A mapped page does not imply that a C++ object has been constructed there or that its lifetime is valid.",
      practice: "For ordinary application data, prefer the language allocator or standard containers. Study virtual-memory calls in a small owned program, check every return value, and release exactly the region you acquired.",
      exercise: "Write a lifecycle diagram for reserve, commit, use, decommit, and release. Mark which steps can fail.", takeaway: "OS-level memory mappings do not replace language-level object lifetime rules.",
      resources: [{ label: "Microsoft: VirtualAlloc", url: "https://learn.microsoft.com/en-us/windows/win32/api/memoryapi/nf-memoryapi-virtualalloc" }]
    },
    {
      id: "windows-files-acl", track: "windows", title: "Windows files, paths & ACLs", time: "10 MIN",
      description: "Handle paths, sharing modes, and access checks explicitly.", summary: "A file operation can fail because of path interpretation, sharing, permissions, or the current security context. Access control lists define allowed operations for principals.",
      focus: ["CreateFile contracts", "sharing flags", "ACLs and tokens"], heading: "A path is not a permission grant",
      explain: "Windows paths can have device, UNC, relative, and extended-length forms. CreateFile's desired access and sharing flags affect whether another handle can open the same file. The process token and ACL participate in access decisions.",
      practice: "Use APIs that accept explicit lengths where available and avoid building paths from unchecked input. When debugging access denied, inspect the effective identity and the object's access rules rather than retrying with elevated privileges by default.",
      exercise: "List the error cases for opening a file read-only and identify which Windows tool or API would help distinguish them.",
      takeaway: "Access is evaluated from identity, object policy, and requested operation together."
    },
    {
      id: "windows-registry-services", track: "windows", title: "Registry, services & configuration", time: "10 MIN",
      description: "Understand persistence and service configuration as administrative surfaces.", summary: "The registry stores hierarchical configuration, while services run under configured accounts and privileges. Both are important to operations and defensive auditing.",
      focus: ["registry hives", "service identity", "least privilege"], heading: "Configuration changes have security consequences",
      explain: "Registry paths can be scoped to a user or the machine. Services have startup configuration, executable paths, and service identities. A writable service path or excessive service privilege can create a security weakness even without unusual code.",
      practice: "Inventory a service or registry setting in a disposable VM. Record the owner, permissions, startup behavior, and expected change process; do not modify production endpoints as an experiment.",
      exercise: "Create a checklist for reviewing a service's account, executable path, and write permissions.", takeaway: "Configuration is part of the attack surface and the audit trail."
    },
    {
      id: "windows-etw", track: "windows", title: "Windows event tracing & ETW", time: "12 MIN",
      description: "Use supported telemetry to understand behavior before reaching for hooks.", summary: "Event Tracing for Windows is a provider-based tracing system used by Windows components and applications. Consumers can collect events with less disruption than modifying a target process.",
      focus: ["providers", "sessions", "event consumers"], heading: "Observe through supported channels",
      explain: "ETW separates event providers from tracing sessions and consumers. Events have schemas and timestamps that help correlate activity. A trace is useful only when its source, collection settings, and clock context are understood.",
      practice: "Capture a short trace from your own application or a documented Windows provider. Collect only the events needed, protect sensitive trace files, and stop the session when the test is complete.",
      exercise: "Plan a trace for a slow file operation: identify a provider, the question you want answered, and how you will protect the collected data.",
      takeaway: "Prefer documented telemetry over altering another program's execution."
    },
    {
      id: "windows-tokens", track: "windows", title: "Windows tokens & access checks", time: "11 MIN",
      description: "Understand how identity and privileges influence an operation.", summary: "An access token represents a security context, including identity, groups, and privileges. Windows checks that context against an object's security descriptor when an operation is requested.",
      focus: ["user and group SIDs", "privileges", "security descriptors"], heading: "Identity is more than an account name",
      explain: "The effective token can include group SIDs, integrity level, and enabled privileges. An access check evaluates requested rights against a security descriptor. Administrator membership does not mean every operation should run elevated.",
      practice: "Use least privilege and inspect the actual process token when troubleshooting. Avoid copying access tokens or changing security context outside a controlled, authorized test.",
      exercise: "Explain the difference between an account being an administrator and a process running with an elevated token.",
      takeaway: "Ask which token and which right are involved in an access decision."
    },
    {
      id: "windows-debugging", track: "windows", title: "Debugging a Windows program", time: "12 MIN",
      description: "Build a reproducible debugging loop around symbols, exceptions, and logs.", summary: "A useful debugger session starts from a reproducible symptom and a build with matching symbols. The first-chance exception and call stack often reveal more than the final crash dialog.",
      focus: ["PDB symbols", "call stacks", "first-chance exceptions"], heading: "Make the failure reproducible",
      explain: "Symbols map addresses to functions and source lines. A call stack shows the current chain of calls but can be incomplete when symbols are missing or optimized code changes the frame. Record the exact executable, PDB, build flags, and input that produced the failure.",
      practice: "Debug a toy program you built. Set a breakpoint, inspect a variable, step across a function call, and save the minimal reproduction before changing code.",
      exercise: "Write a bug report containing the build ID, exact steps, expected behavior, actual behavior, and the first useful stack frame.",
      takeaway: "A debugger is strongest when the binary and symbols match the source."
    },
    {
      id: "security-triad", track: "security", title: "Confidentiality, integrity & availability", time: "8 MIN",
      description: "Use security goals to explain what a control is protecting.", summary: "The CIA triad is a compact way to reason about confidentiality, integrity, and availability. A useful security requirement names the asset, threat, and acceptable impact.",
      focus: ["assets and impact", "CIA goals", "security controls"], heading: "Start with the asset and the harm",
      explain: "Confidentiality limits who can learn information; integrity protects correctness and provenance; availability keeps a service usable. Most real incidents affect more than one goal. A control is meaningful only in relation to an asset and a threat.",
      practice: "For a small application, identify its most sensitive data, the changes that must be trustworthy, and the downtime it can tolerate. Use those answers to prioritize protections.",
      exercise: "Pick a personal notes app and write one threat scenario for each CIA goal.", takeaway: "Security design starts with assets, likely threats, and impact."
    },
    {
      id: "network-dns-http", track: "security", title: "DNS, HTTP & network boundaries", time: "12 MIN",
      description: "Follow a request across name resolution, transport, and application layers.", summary: "DNS resolves names to records, TCP or QUIC carries transport data, and HTTP defines application messages. A firewall rule alone does not explain whether an application request is trustworthy.",
      focus: ["DNS records", "HTTP request flow", "ports vs services"], heading: "Trace the layers separately",
      explain: "A client may resolve multiple addresses, negotiate a transport connection, establish TLS, and send an HTTP request. Each stage has its own timeout, identity, and failure modes. A port number is a convention, not proof of the protocol or process behind it.",
      practice: "Use browser developer tools or a packet capture of your own traffic to map a request. Avoid capturing other people's traffic; redact cookies, tokens, and personal data before sharing traces.",
      exercise: "Draw the steps between entering a URL and receiving an HTTP response. Mark where DNS, TLS, and application authentication occur.",
      takeaway: "Diagnose the layer that failed before changing a security control."
    },
    {
      id: "tls-certificates", track: "security", title: "TLS, certificates & trust", time: "11 MIN",
      description: "Separate encryption from endpoint identity and application authorization.", summary: "TLS protects a connection and authenticates an endpoint according to certificate validation. It does not prove that an application is safe or that a user is authorized for every action.",
      focus: ["certificate chain", "hostname verification", "authorization after TLS"], heading: "Encryption is not the whole trust model",
      explain: "A client validates a certificate chain and the name it intended to reach. Disabling certificate verification removes a key protection and is not an acceptable production workaround. Application permissions remain a separate decision after the secure channel is established.",
      practice: "When diagnosing a certificate error, check the requested hostname, system clock, trust chain, and proxy configuration. Do not train users to click through warnings or install unknown root certificates.",
      exercise: "Explain what a valid TLS certificate does guarantee and list two things it does not guarantee.",
      takeaway: "A secure channel protects communication; it does not certify the behavior of the service."
    },
    {
      id: "vulnerability-lifecycle", track: "security", title: "Vulnerability lifecycle & patching", time: "11 MIN",
      description: "Move from a report to a verified fix with an evidence trail.", summary: "Vulnerability management connects asset inventory, severity, exploit evidence, exposure, remediation, and validation. A score alone is not a complete risk decision.",
      focus: ["asset exposure", "severity vs risk", "verification"], heading: "Prioritize context, not only a number",
      explain: "A vulnerability's impact depends on the affected asset, reachable attack surface, available mitigations, and business consequence. Known-exploited status is important evidence. A patch is not complete until the deployed version and relevant configuration are verified.",
      practice: "Track each finding from discovery through owner, planned action, due date, and retest. Preserve the source of the finding and avoid sending exploit payloads to production systems without an approved plan.",
      exercise: "Create a remediation record for a fictional internet-facing library flaw, including evidence and a retest condition.",
      takeaway: "A closed ticket should mean the risk was actually rechecked."
    },
    {
      id: "secure-input", track: "security", title: "Input validation & safe parsing", time: "10 MIN",
      description: "Validate length, encoding, range, and meaning before using input.", summary: "Input validation should be specific to the operation and happen before data crosses a trust boundary. Sanitizing text without understanding its destination can create a false sense of safety.",
      focus: ["length limits", "canonicalization", "allowlisted formats"], heading: "Validation is a contract",
      explain: "Check size before allocation, parse into a type that can represent the value, and reject ambiguous encodings when they matter. Normalize once at a defined boundary. For SQL, shell commands, and HTML, use the platform's parameterized or context-aware API instead of string concatenation.",
      practice: "Give each field an allowlisted format and range. Return a clear error on invalid input and keep the original value only when auditing policy requires it and storage is appropriate.",
      exercise: "Write validation rules for a port number and a short filename. Include length, character set, and numeric range.",
      takeaway: "Validate according to the value's intended use, not with one generic filter."
    },
    {
      id: "secure-auth-sessions", track: "security", title: "Authentication, authorization & sessions", time: "12 MIN",
      description: "Keep identity checks separate from permission checks.", summary: "Authentication establishes an identity; authorization decides what that identity may do. Session tokens are bearer secrets and must be scoped, protected, and revocable.",
      focus: ["authn vs authz", "least privilege", "session lifecycle"], heading: "A valid login is not permission for every action",
      explain: "Check authorization on the server for every sensitive operation. Use short-lived, unpredictable session identifiers, protect them in transit, rotate them after privilege changes, and invalidate them on logout or account recovery.",
      practice: "Write an access-control matrix for roles and actions. Test both allowed and denied cases, including object-level checks where one user must not access another user's record.",
      exercise: "For a shared project site, list three server-side authorization checks that should not be delegated to the browser.",
      takeaway: "The client can request an action; the trusted service decides whether it is allowed."
    },
    {
      id: "supply-chain-basics", track: "security", title: "Dependencies & software supply chain", time: "11 MIN",
      description: "Know what your build downloads and how to reproduce it.", summary: "A dependency graph includes direct packages, transitive packages, build tools, and distribution channels. Pinning and verifying inputs improves traceability but does not make a package trustworthy by itself.",
      focus: ["dependency inventory", "lockfiles", "provenance"], heading: "Your program includes more than your source",
      explain: "A reproducible build records versions and toolchains. Review package ownership and update activity, minimize unused dependencies, and verify checksums or signatures when the ecosystem provides them. Secrets should never be embedded into the build output or repository history.",
      practice: "Generate a software bill of materials for a small project and identify who owns each dependency. Plan how security updates are reviewed and tested.",
      exercise: "Draw the dependency chain from one direct library through its transitive dependencies to the build tool.",
      takeaway: "Reduce, record, and review the inputs that become part of your software."
    },
    {
      id: "security-incident-report", track: "security", title: "Write a useful security finding", time: "9 MIN",
      description: "Communicate impact, evidence, and a practical fix without overselling certainty.", summary: "A good finding tells the owner what happened, what evidence supports it, who could be affected, and how to verify a fix. Reproducibility matters more than dramatic language.",
      focus: ["reproduction steps", "impact and scope", "remediation and retest"], heading: "Evidence makes a finding actionable",
      explain: "Record the affected component and version, preconditions, expected and observed behavior, impact, and a minimal reproduction. Redact secrets and personal data. Distinguish confirmed facts from hypotheses, and avoid publishing details before coordination is complete.",
      practice: "Write the report for the engineer who must fix the issue. Include one targeted remediation and a concrete retest that would demonstrate the behavior is resolved.",
      exercise: "Turn a vague note—'input is insecure'—into a scoped, evidence-based report template.",
      takeaway: "A finding should help someone reproduce, prioritize, and fix the problem."
    },
    {
      id: "blue-logs-first-response", track: "blue-team", title: "Logs & first-response questions", time: "9 MIN",
      description: "Establish what happened, when, and on which system before drawing a conclusion.", summary: "Logs are partial observations, not ground truth. A first response preserves relevant evidence, confirms scope, and builds a timeline with explicit time zones and data sources.",
      focus: ["timestamps", "host identity", "evidence preservation"], heading: "Start with context, not a verdict",
      explain: "Check the host, user, clock offset, collection source, and retention window. Correlate independent events where possible. Preserve original records and record every action taken during triage so later reviewers can separate evidence from analyst interpretation.",
      practice: "Use a fictional or training log set. Create a timeline with source IDs and confidence notes; do not upload real endpoint logs containing personal or company data to public services.",
      exercise: "List the first five questions you would ask after an alert reports an unusual process start.", takeaway: "A timeline with provenance is more useful than an unsupported label."
    },
    {
      id: "blue-windows-event-logs", track: "blue-team", title: "Windows event logs & Sysmon", time: "12 MIN",
      description: "Learn what endpoint telemetry can show and what it cannot.", summary: "Windows event logs and Sysmon can record process, network, and system activity when configured. Collection settings, retention, and host coverage affect what an analyst can conclude.",
      focus: ["event channels", "Sysmon configuration", "coverage gaps"], heading: "Telemetry is a designed system",
      explain: "An event's meaning depends on its provider, event ID, version, and fields. Sysmon does not record every possible action by default, and event absence does not prove an action did not happen. Configuration changes can alter volume and coverage.",
      practice: "Deploy telemetry in a disposable VM and generate benign test activity. Verify that the expected event arrives centrally, note dropped or filtered events, and protect collected logs as sensitive data.",
      exercise: "Choose one event source for process creation and document its useful fields and blind spots.",
      takeaway: "Know the collection path and its blind spots before treating an event as evidence.",
      resources: [{ label: "Microsoft Sysinternals Sysmon", url: "https://learn.microsoft.com/en-us/sysinternals/downloads/sysmon" }]
    },
    {
      id: "blue-process-triage", track: "blue-team", title: "Triage a process tree", time: "10 MIN",
      description: "Use parent-child relationships and command-line context to scope an alert.", summary: "A process tree records creation relationships, but a parent process is not automatically responsible for every child behavior. Validate the executable, user, time, and surrounding events.",
      focus: ["parent and child", "command line", "signed binary context"], heading: "A process tree is a lead, not a conviction",
      explain: "Correlate process IDs with host and time because identifiers can be reused. Examine image path, signature, hash, command line, user context, and neighboring events. Legitimate administrative tools can be used in unusual ways, so context matters.",
      practice: "Start from an alert in a training dataset and expand one generation at a time. Record why each relationship matters and what additional evidence would raise or lower confidence.",
      exercise: "Create a short triage table with process, parent, user, path, timestamp, and confidence columns.", takeaway: "Combine lineage with identity and behavior before escalating a conclusion."
    },
    {
      id: "blue-detection-engineering", track: "blue-team", title: "Detection engineering & Sigma", time: "12 MIN",
      description: "Turn a threat behavior into a testable detection with known limitations.", summary: "A detection should describe behavior, data requirements, expected false positives, and a validation plan. Sigma provides a portable rule format for many log backends.",
      focus: ["behavioral hypothesis", "data source", "false positives"], heading: "Write the hypothesis before the query",
      explain: "A rule is only as useful as its telemetry and tuning. State the behavior you want to detect, the systems covered, and the benign cases likely to match. A successful syntax check does not prove the rule catches the intended event.",
      practice: "Use a lab or public test dataset to validate positive and negative examples. Version the rule, document its data-source assumptions, and measure alert volume before broad deployment.",
      exercise: "Write a plain-language detection hypothesis for an unexpected executable launched from a user-writable directory.",
      takeaway: "A detection is a tested hypothesis with explicit coverage and noise.",
      resources: [{ label: "Sigma rule specification", url: "https://sigmahq.io/docs/" }]
    },
    {
      id: "blue-network-triage", track: "blue-team", title: "Network alert triage", time: "11 MIN",
      description: "Correlate DNS, connection, and endpoint data without treating an IP as a person.", summary: "A network indicator can be shared by many services or change ownership over time. Triage requires time-bounded enrichment and corroboration from the affected endpoint.",
      focus: ["DNS context", "destination and time", "false attribution"], heading: "Indicators need a timestamp",
      explain: "Cloud hosting, CDNs, VPNs, NAT, and dynamic addressing make single-IP attribution unreliable. Preserve the query time, resolver, source host, destination port, and protocol. A domain lookup now may not reflect what was returned during the alert.",
      practice: "Use historical or lab data, cite each source, and keep enrichment separate from observed facts. Escalate based on a coherent chain of evidence rather than one reputation score.",
      exercise: "List what you would need to distinguish a blocked update service from a suspicious outbound connection.",
      takeaway: "An indicator is a clue whose context can expire or be shared."
    },
    {
      id: "blue-incident-response", track: "blue-team", title: "Incident response: prepare to recover", time: "12 MIN",
      description: "Use a repeatable response loop that protects evidence and restores service safely.", summary: "Incident response includes preparation, detection, analysis, containment, eradication, recovery, and lessons learned. The order and authority for each action should be agreed before an emergency.",
      focus: ["roles and escalation", "containment tradeoffs", "recovery criteria"], heading: "Containment is an operational decision",
      explain: "Isolating a machine can stop spread but may interrupt a business process or destroy volatile evidence. Preserve what is needed, follow the incident plan, and coordinate with the system owner. Recovery should include validation and monitoring, not just a reboot.",
      practice: "Run a tabletop exercise with fictional facts. Define who can authorize containment, how evidence is preserved, how users are notified, and what conditions allow the system back into service.",
      exercise: "Create a one-page response checklist for a suspected compromised training VM.",
      takeaway: "Prepared roles and recovery criteria reduce improvisation under pressure."
    },
    {
      id: "blue-host-hardening", track: "blue-team", title: "Windows hardening & baselines", time: "10 MIN",
      description: "Reduce unnecessary exposure and verify configuration drift over time.", summary: "Hardening is a set of supported configuration choices matched to a system's role. Baselines must be tested for compatibility and continuously checked for drift.",
      focus: ["least privilege", "attack surface", "change control"], heading: "Reduce what does not need to be exposed",
      explain: "Disable unused services, patch supported software, restrict administrative access, and enable security features appropriate to the environment. A setting that breaks a critical workflow is not a useful baseline until the workflow is understood and a safer alternative is chosen.",
      practice: "Compare a disposable VM to a documented Microsoft security baseline. Record deviations with an owner and reason; test changes before applying them to managed systems.",
      exercise: "Pick three hardening controls and write down the threat each one reduces and the operational risk it could introduce.",
      takeaway: "Secure configuration is measured, documented, and maintained—not applied blindly."
    },
    {
      id: "blue-threat-intel", track: "blue-team", title: "Threat intelligence & indicators", time: "10 MIN",
      description: "Evaluate source quality, confidence, age, and defensive action before sharing an IOC.", summary: "Threat intelligence is contextual information used to make a decision. A hash, domain, or IP without source, collection time, and confidence is difficult to use responsibly.",
      focus: ["source provenance", "confidence and age", "sharing restrictions"], heading: "An indicator is not an explanation",
      explain: "Indicators expire and can be reused by benign infrastructure. Record where an indicator came from, when it was observed, what behavior it represents, and what action is justified. Respect licensing, privacy, and handling labels when sharing.",
      practice: "Compare two public reports about the same campaign. Separate observed technical facts from attribution claims and note what evidence would change your confidence.",
      exercise: "Create an indicator record with type, value, source, first-seen time, confidence, expiry, and defensive use.",
      takeaway: "Use threat intelligence to guide investigation, not to replace it."
    },
    {
      id: "blue-yara-basics", track: "blue-team", title: "YARA rules for defensive research", time: "11 MIN",
      description: "Write narrow content-matching rules and test them against benign and known samples.", summary: "YARA describes patterns in files or memory for research and triage. A rule can over-match, under-match, or be evaded, so it needs a clear purpose and a representative test corpus.",
      focus: ["strings and conditions", "false positives", "safe sample handling"], heading: "A rule needs a test set",
      explain: "A rule's strings should be distinctive enough for its intended corpus and its condition should express the minimum evidence needed. Avoid scanning untrusted samples on a production endpoint as an experiment; use a disposable, isolated analysis environment.",
      practice: "Test with known benign files, a controlled sample, and nearby variants. Record the rule version, sample provenance, and expected matches. Do not publish sensitive or private files as test artifacts.",
      exercise: "Draft a rule for a harmless text fixture you create yourself, then add a negative test that should not match.",
      takeaway: "A detection rule is only useful when its scope and false positives are understood."
    },
    {
      id: "red-scope-and-rules", track: "red-team", title: "Authorization, scope & rules of engagement", time: "10 MIN",
      description: "Write down permission, boundaries, contacts, and stop conditions before testing.", summary: "A security test is authorized only within its explicit scope. Rules of engagement define allowed targets, methods, timing, data handling, and how to stop safely.",
      focus: ["written authorization", "in-scope assets", "stop conditions"], heading: "Permission is a technical prerequisite",
      explain: "A domain name or IP address does not imply permission. Written scope should identify the owner, assets, time window, approved techniques, excluded systems, emergency contacts, and reporting path. Stop when activity affects an out-of-scope system or sensitive data.",
      practice: "For learning, use a local lab or an explicitly designated training platform. Keep a copy of the scope next to your notes and verify that every target still belongs to the authorized range.",
      exercise: "Draft a one-page scope for testing a local demo app, including explicit exclusions and a stop condition.",
      takeaway: "No scope, no test. Authorization comes before tooling."
    },
    {
      id: "red-asset-inventory", track: "red-team", title: "Asset inventory & attack-surface review", time: "9 MIN",
      description: "Map the systems an owner has approved before testing their security assumptions.", summary: "Attack-surface review starts with an authoritative asset list and the business purpose of each service. Unverified discovery can easily cross into infrastructure the requester does not own.",
      focus: ["owned assets", "service purpose", "change windows"], heading: "Discovery must stay inside scope",
      explain: "Build from the owner's inventory, DNS records, and configuration exports before considering active checks. Confirm third-party hosting and shared infrastructure with the owner. Every result should include the source and time it was observed.",
      practice: "In a lab, inventory your own services and ports, then compare them with the intended design. Do not scan public address ranges or use third-party data to target people.",
      exercise: "Create an asset table with owner, service, exposure, business purpose, and verification source.",
      takeaway: "A reliable asset list is safer and more useful than unbounded scanning."
    },
    {
      id: "red-web-lab", track: "red-team", title: "Web security in a training lab", time: "12 MIN",
      description: "Study common web weaknesses against intentionally vulnerable applications.", summary: "A safe web-security exercise uses a purpose-built training target such as OWASP Juice Shop or WebGoat. The objective is to understand the weakness and its fix, not to test random live sites.",
      focus: ["request and response flow", "lab isolation", "fix verification"], heading: "Use targets designed for practice",
      explain: "Use a local container or dedicated training environment and keep it separate from personal accounts and data. Learn how input handling, authorization, and session design fail, then verify the server-side correction with a regression test.",
      practice: "Choose one intentionally vulnerable lesson, document the local setup, reproduce only the provided exercise, and finish by explaining the secure coding fix in your own words.",
      exercise: "Set up a local OWASP Juice Shop instance and write a lab report template before beginning the lesson.",
      takeaway: "Practice against a lab target; apply the lesson as a defensive fix.",
      resources: [{ label: "OWASP Juice Shop project", url: "https://owasp.org/www-project-juice-shop/" }, { label: "PortSwigger Web Security Academy", url: "https://portswigger.net/web-security" }]
    },
    {
      id: "red-auth-review", track: "red-team", title: "Review authentication in an owned app", time: "11 MIN",
      description: "Test login and recovery flows in a local application with synthetic accounts.", summary: "Authentication review checks account lifecycle, rate limits, recovery, and session invalidation. Testing must use accounts and systems explicitly supplied for the exercise.",
      focus: ["synthetic accounts", "rate-limit behavior", "session invalidation"], heading: "Test the design, not real people's accounts",
      explain: "Use synthetic users and non-production credentials. Check whether recovery links expire, session identifiers rotate after login, and authorization is enforced server-side. Avoid credential stuffing, password spraying, or testing real accounts.",
      practice: "Use a local training app and a short approved test plan. Record expected limits and stop if the test affects shared infrastructure or real users.",
      exercise: "Write test cases for logout, password reset, and access to another synthetic user's resource.",
      takeaway: "Authentication testing is bounded by the owner-approved accounts and environment."
    },
    {
      id: "red-validation-report", track: "red-team", title: "Validate a finding & report it", time: "10 MIN",
      description: "Minimize impact and deliver enough evidence for an owner to reproduce a lab finding.", summary: "Validation should answer a specific security question with the smallest safe test. A clear report distinguishes confirmed behavior from speculation and includes a concrete remediation.",
      focus: ["minimal reproduction", "impact evidence", "remediation"], heading: "Stop once the question is answered",
      explain: "Do not access more data than needed to establish impact. Preserve relevant request and response evidence with sensitive values redacted. Identify the affected version and preconditions, then confirm the owner has a safe way to reproduce the finding.",
      practice: "Use a written report with summary, scope, evidence, impact, remediation, and retest sections. Coordinate disclosure through the owner-approved channel and follow the agreed timeline.",
      exercise: "Write a finding for a fictional training app that exposes a synthetic record to the wrong role.",
      takeaway: "A minimal, reproducible report is more valuable than a dramatic demonstration."
    },
    {
      id: "red-purple-team", track: "red-team", title: "Purple-team validation", time: "10 MIN",
      description: "Turn an authorized exercise into a joint detection and prevention improvement.", summary: "Purple teaming connects a controlled behavior to the telemetry and response that should detect it. The goal is a measurable improvement, not a score or an evasion contest.",
      focus: ["test hypothesis", "telemetry mapping", "defensive retest"], heading: "Make the exercise useful to defenders",
      explain: "Agree on one behavior, one lab system, and one expected data source. Run the benign simulation during the approved window, compare the result to the detection hypothesis, and record whether prevention, alerting, and response worked.",
      practice: "Use vendor-provided simulations or a purpose-built lab. Share the test plan with defenders, protect logs, and stop if the observed environment differs from the agreed scope.",
      exercise: "Define a safe simulation for a process-creation detection and describe the evidence that proves the alert path works.",
      takeaway: "A successful exercise leaves the defensive control better than it found it."
    },
    {
      id: "red-engagement-lifecycle", track: "red-team", title: "Assessment workflow & debrief", time: "9 MIN",
      description: "Plan, test, communicate, and close an engagement without losing evidence or scope.", summary: "A responsible assessment has intake, authorization, planning, execution, evidence handling, reporting, retest, and closeout. Each phase needs an owner and a record.",
      focus: ["pre-engagement checks", "evidence handling", "debrief and retest"], heading: "The work includes the closeout",
      explain: "Confirm rules of engagement and emergency contacts immediately before testing. Track actions and timestamps. At closeout, return or securely delete agreed data, communicate unresolved risks, and verify that temporary test accounts or infrastructure are removed.",
      practice: "Rehearse the workflow with a tabletop exercise. Make a checklist that includes scope reconfirmation and a technical stop switch before any tool is run.",
      exercise: "Write a closeout checklist for a one-day local lab assessment.",
      takeaway: "Responsible testing includes data handling and cleanup, not only discovery."
    },
    {
      id: "osint-ethics", track: "osint", title: "OSINT ethics, consent & minimization", time: "9 MIN",
      description: "Research organizations and public-interest questions without turning tools into doxxing workflows.", summary: "Open-source information can still be personal or sensitive. Define a legitimate question, collect the minimum evidence, respect platform rules, and avoid targeting private individuals.",
      focus: ["purpose and consent", "data minimization", "harm review"], heading: "Publicly visible does not mean harmless",
      explain: "Information scattered across sites can become more sensitive when aggregated. Avoid collecting home addresses, personal contact details, or private-account data. Consider who could be harmed by publication and whether the research question can be answered with less data.",
      practice: "Use fictional identities, your own accounts, or a public-interest organizational question. Keep a collection log, redact incidental personal data, and stop if the investigation begins identifying a private person.",
      exercise: "Write an OSINT research charter that names a permitted question and three categories of data you will not collect.",
      takeaway: "Scope, consent, and minimization apply to open-source research too."
    },
    {
      id: "osint-source-validation", track: "osint", title: "Source validation & provenance", time: "10 MIN",
      description: "Record where a claim came from and how independently it was checked.", summary: "A screenshot, repost, or search snippet is not the same as an original source. Provenance records the URL, capture time, author or publisher, and any transformations made.",
      focus: ["primary sources", "independent corroboration", "confidence notes"], heading: "Separate observation from interpretation",
      explain: "Find the earliest available source, preserve its timestamp and context, and verify that another source is genuinely independent. Search results can be stale or personalized. State uncertainty and avoid repeating a claim merely because many sites copied it.",
      practice: "Keep a source log with claim, URL, access time, quoted evidence, archive reference if appropriate, and confidence. Redact identifiers that are not required to answer the research question.",
      exercise: "Take a fictional breaking-news claim and list what evidence would be needed before treating it as confirmed.",
      takeaway: "A conclusion is only as strong as its traceable evidence chain."
    },
    {
      id: "osint-domain-footprints", track: "osint", title: "Domain records & passive footprinting", time: "10 MIN",
      description: "Use public registration and DNS records to understand an organization's published infrastructure.", summary: "Registration records, DNS answers, and certificate transparency logs can reveal public infrastructure, but records may be redacted, shared, or outdated.",
      focus: ["WHOIS/RDAP", "DNS records", "time and attribution limits"], heading: "Public records need careful interpretation",
      explain: "A hosting provider or certificate entry does not prove who controls a system. DNS changes, privacy services, shared hosting, and stale caches can mislead. Keep checks passive and within a clearly authorized organizational scope.",
      practice: "For a domain you own, compare authoritative DNS, registrar data, and certificate records. Note observation times and avoid turning a discovered third-party hostname into an unapproved test target.",
      exercise: "Create a passive inventory for a domain you control with record type, value, source, time, and confidence.",
      takeaway: "An infrastructure clue is not authorization or proof of ownership.",
      resources: [{ label: "ICANN lookup", url: "https://lookup.icann.org/" }, { label: "Certificate Transparency search", url: "https://crt.sh/" }]
    },
    {
      id: "osint-metadata", track: "osint", title: "Metadata & privacy review", time: "9 MIN",
      description: "Check what a document or image reveals before you publish it.", summary: "Files can contain author names, timestamps, software details, GPS coordinates, and revision history. Metadata should be reviewed on files you own or are authorized to handle.",
      focus: ["EXIF and document properties", "redaction limits", "safe sharing"], heading: "The visible page may not be the whole file",
      explain: "A cropped image can retain location metadata; a document can retain comments or prior revisions. Removing metadata is not the same as securely redacting the visible content. Keep an untouched original only when retention is appropriate and authorized.",
      practice: "Create a test document with synthetic data, inspect its properties locally, then export a clean copy. Verify the result before sharing and avoid uploading private files to unknown metadata services.",
      exercise: "Make a checklist for reviewing an image and a PDF before posting them publicly.",
      takeaway: "Inspect and minimize metadata before releasing a file."
    },
    {
      id: "osint-visual-verification", track: "osint", title: "Image verification & geolocation limits", time: "11 MIN",
      description: "Verify a public-interest image without identifying uninvolved people or exposing private locations.", summary: "Visual verification compares observable details with independent sources. Geolocation can create real safety risks, so use only information necessary for a legitimate, public-interest question.",
      focus: ["original context", "landmarks and timestamps", "privacy risk"], heading: "A match needs more than a familiar landmark",
      explain: "Check the earliest publication, weather and shadow consistency, visible signage, and whether the scene could be from another date. Do not publish precise locations of private residences, vulnerable people, or sensitive facilities.",
      practice: "Practice with a purpose-made public dataset or historical event images. Record supporting and contradicting evidence, and keep the final location no more precise than the question requires.",
      exercise: "Design a verification worksheet with fields for source, date, visible clues, counter-evidence, and privacy review.",
      takeaway: "Verification should reduce uncertainty without creating avoidable harm.",
      resources: [{ label: "Bellingcat Online Investigation Toolkit", url: "https://bellingcat.gitbook.io/toolkit" }]
    },
    {
      id: "osint-reporting", track: "osint", title: "OSINT notes & evidence handling", time: "9 MIN",
      description: "Make research reproducible while protecting data that does not belong in the report.", summary: "A good research note records what was observed, when it was observed, and how it supports a conclusion. Keep collected data proportional to the question and securely dispose of unnecessary copies.",
      focus: ["timestamps and URLs", "reproducible queries", "redaction and retention"], heading: "Keep a defensible notebook",
      explain: "Record exact URLs, access times, search terms, and relevant page context. Separate direct observations from inference and note failed attempts. Respect terms of service and applicable law; do not bypass access controls or impersonate someone to obtain information.",
      practice: "Use a report template with purpose, scope, sources, evidence, confidence, limitations, and retention plan. Share only the details necessary for the intended audience.",
      exercise: "Create a one-page notebook entry for a fictional public organization using only synthetic or official public data.",
      takeaway: "Good OSINT is careful recordkeeping plus a decision to collect less."
    }
  ];

  const existing = window.OFFSET_LESSONS || [];
  const additions = topics.map((item, index) => {
    const entry = module(item);
    entry.number = String(existing.length + index + 1).padStart(2, "0");
    return entry;
  });

  window.OFFSET_TRACKS = tracks;
  window.OFFSET_LESSONS = [...existing, ...additions];
})();
