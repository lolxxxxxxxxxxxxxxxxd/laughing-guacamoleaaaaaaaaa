"use strict";

window.OFFSET_LESSONS = [
  {
    id: "first-program",
    track: "cpp",
    label: "Foundations",
    number: "01",
    title: "Your first C++ program",
    time: "6 MIN",
    level: "START HERE",
    description: "Meet main, include a library, and make a program say hello.",
    summary: "A C++ program is text that a compiler translates into instructions a computer can run. Start with the smallest useful program, then learn what each line is doing.",
    focus: ["What a compiler does", "The main function", "Writing to standard output"],
    sections: [
      {
        heading: "A program has an entry point",
        paragraphs: ["For a hosted C++ program, execution starts in main. The braces mark the function body; statements inside it run in order. A return value of 0 conventionally tells the operating system that the program finished successfully."]
      },
      {
        heading: "Use a library instead of reinventing it",
        paragraphs: ["The #include line makes declarations from the iostream library available. std::cout is the standard output stream, and the insertion operator (<<) sends values to it. The newline escape, \\n, ends the line.", "Try changing the message in the example, then run it in the playground below. A compiler error is feedback too: read the first useful line and compare it with the code you meant to write."]
      }
    ],
    codeTitle: "hello.cpp",
    code: "#include <iostream>\n\nint main() {\n    std::cout << \"Hello, world!\\n\";\n    return 0;\n}",
    exercise: "Change the message, then print a second line with another std::cout statement.",
    takeaway: "The compiler checks your source; the resulting program runs from main."
  },
  {
    id: "values-and-types",
    track: "cpp",
    label: "Foundations",
    number: "02",
    title: "Values, types & variables",
    time: "9 MIN",
    level: "BEGINNER",
    description: "Give data a type, a name, and a lifetime you can reason about.",
    summary: "Variables are named objects. Their types describe what values they can hold and which operations make sense for them.",
    focus: ["Common built-in types", "Brace initialization", "const and auto"],
    sections: [
      {
        heading: "Choose a type that says what you mean",
        paragraphs: ["Use int for whole-number counts, double for fractional numeric values, bool for true-or-false state, and std::string for text. A type is more than a storage size: it is part of the rules the compiler checks."]
      },
      {
        heading: "Prefer clear initialization",
        paragraphs: ["Brace initialization, such as int attempts{3};, makes initialization visible and rejects some narrowing conversions. Add const when a value should not change. auto asks the compiler to infer the type from the initializer; it does not make C++ dynamically typed."]
      }
    ],
    codeTitle: "values.cpp",
    code: "#include <iostream>\n#include <string>\n\nint main() {\n    const int attempts{3};\n    const std::string topic{\"C++\"};\n    std::cout << topic << \": \" << attempts << \" tries\\n\";\n}",
    exercise: "Add a bool named finished and print it. What does the program display for true?",
    takeaway: "Initialize objects where you declare them; make unchanging values const."
  },
  {
    id: "decisions-and-loops",
    track: "cpp",
    label: "Foundations",
    number: "03",
    title: "Decisions & loops",
    time: "10 MIN",
    level: "BEGINNER",
    description: "Make a program branch on conditions and repeat work deliberately.",
    summary: "Control flow decides which statements run and how often. Conditions are expressions that can be evaluated as true or false.",
    focus: ["if / else", "for loops", "Avoiding off-by-one errors"],
    sections: [
      {
        heading: "Choose a path with if",
        paragraphs: ["An if statement runs its body when its condition is true. else if checks another condition only when earlier branches did not match; else handles the remaining case. Use braces even for a one-line body so the structure stays easy to see."]
      },
      {
        heading: "Repeat a known number of times",
        paragraphs: ["A for loop groups initialization, a continuation condition, and an update. In for (int i{0}; i < 3; ++i), the body runs for i values 0, 1, and 2. The less-than check is why there are three iterations, not four."]
      }
    ],
    codeTitle: "control-flow.cpp",
    code: "#include <iostream>\n\nint main() {\n    for (int number{1}; number <= 5; ++number) {\n        if (number % 2 == 0) {\n            std::cout << number << \" is even\\n\";\n        } else {\n            std::cout << number << \" is odd\\n\";\n        }\n    }\n}",
    exercise: "Change the loop so it counts from 0 through 10. Add a branch for multiples of 3.",
    takeaway: "Write down the first and last values of a loop when checking its bounds."
  },
  {
    id: "functions",
    track: "cpp",
    label: "Foundations",
    number: "04",
    title: "Functions & small interfaces",
    time: "9 MIN",
    level: "BEGINNER",
    description: "Turn a repeated idea into a named operation with clear inputs and output.",
    summary: "Functions let you give a useful name to a piece of work. A good function makes its inputs, result, and side effects easy to spot.",
    focus: ["Parameters and return values", "Declarations and definitions", "One job per function"],
    sections: [
      {
        heading: "Make the operation explicit",
        paragraphs: ["A function declaration describes how to call a function: its name, parameter types, and return type. The definition supplies the body. When a function returns a value, the caller can use that value in a larger expression or store it."]
      },
      {
        heading: "Keep the interface small",
        paragraphs: ["Prefer a function that receives what it needs and returns a result over one that quietly depends on changing global state. That makes it easier to test and reuse. Parameter passing choices matter; start with simple values, then learn references when you need to avoid a copy or modify an existing object."]
      }
    ],
    codeTitle: "functions.cpp",
    code: "#include <iostream>\n\nint square(int value) {\n    return value * value;\n}\n\nint main() {\n    const int result{square(6)};\n    std::cout << result << '\\n';\n}",
    exercise: "Write a function that accepts two int values and returns the larger one.",
    takeaway: "A function signature is a contract between the caller and the function."
  },
  {
    id: "references-and-pointers",
    track: "cpp",
    label: "Foundations",
    number: "05",
    title: "References & pointers",
    time: "12 MIN",
    level: "CORE CONCEPT",
    description: "Understand aliases, addresses, nullability, and the lifetime behind them.",
    summary: "References and pointers can refer to other objects, but they express different guarantees. Neither one owns an object by itself.",
    focus: ["Reference aliases", "Nullable pointers", "Object lifetime"],
    sections: [
      {
        heading: "A reference is an alias",
        paragraphs: ["A reference such as int& alias{value}; names an existing object. It must be initialized and is not reseated to refer to another object. A const reference can observe an object without copying it or allowing changes through that reference."]
      },
      {
        heading: "A pointer is an address with rules",
        paragraphs: ["A pointer stores an address and may be null, so check it before dereferencing when null is a valid state. The pointed-to object must still be alive. A raw pointer usually communicates access, not ownership; use an owning standard-library type when an object must be managed."]
      }
    ],
    codeTitle: "references.cpp",
    code: "#include <iostream>\n\nint main() {\n    int score{10};\n    int& alias{score};\n    alias += 5;\n\n    const int* view{&score};\n    std::cout << *view << '\\n';\n}",
    exercise: "Change the pointer to point at nullptr. What check would you need before dereferencing it?",
    takeaway: "Never use a reference or pointer after the object it refers to has expired."
  },
  {
    id: "lifetime-and-raii",
    track: "cpp",
    label: "Modern C++",
    number: "06",
    title: "Lifetime, ownership & RAII",
    time: "13 MIN",
    level: "MODERN C++",
    description: "Let object lifetime manage resources instead of relying on matching cleanup calls.",
    summary: "RAII ties a resource's lifetime to an object's lifetime. Constructors acquire; destructors release. This works for memory, locks, files, and many other resources.",
    focus: ["Resource ownership", "Scope and destructors", "unique_ptr vs shared_ptr"],
    sections: [
      {
        heading: "Make cleanup automatic",
        paragraphs: ["A local object is destroyed when its scope ends, including when control leaves through an exception. A resource-managing object's destructor can release what its constructor acquired. This is Resource Acquisition Is Initialization: a lifetime design technique, not just a memory trick."]
      },
      {
        heading: "Prefer clear ownership",
        paragraphs: ["Use std::unique_ptr when one owner controls a dynamically allocated object. Use std::shared_ptr only when shared lifetime is actually required. For ordinary collections and values, prefer direct objects and standard containers; manual new and delete are rarely the right first choice."]
      }
    ],
    codeTitle: "ownership.cpp",
    code: "#include <iostream>\n#include <memory>\n\nstruct Session {\n    ~Session() { std::cout << \"closed\\n\"; }\n};\n\nint main() {\n    auto session{std::make_unique<Session>()};\n    std::cout << \"working\\n\";\n}",
    exercise: "Predict the output order. Then move the unique_ptr into a helper function and observe when Session is destroyed.",
    takeaway: "Make ownership visible in types; let scope perform reliable cleanup."
  },
  {
    id: "containers-and-algorithms",
    track: "cpp",
    label: "Modern C++",
    number: "07",
    title: "Containers & algorithms",
    time: "11 MIN",
    level: "MODERN C++",
    description: "Use standard-library building blocks before writing your own data structures.",
    summary: "The standard library gives you containers for storing data and algorithms for working on ranges. Composing them makes intent clearer and reduces hand-written loops.",
    focus: ["std::vector", "Iterators and ranges", "Algorithms over raw loops"],
    sections: [
      {
        heading: "Choose a container for the job",
        paragraphs: ["std::vector is a good default for a sequence of values: it stores elements contiguously and grows as needed. std::array is fixed-size; std::map and std::unordered_map associate keys with values. Pick a container based on operations and guarantees you need."]
      },
      {
        heading: "Say what operation you want",
        paragraphs: ["Standard algorithms such as std::sort and std::find work over iterator ranges. C++20 ranges add a more direct way to express many pipelines. Learn the algorithm's preconditions and complexity, then use it instead of writing a subtly different version by hand."]
      }
    ],
    codeTitle: "containers.cpp",
    code: "#include <algorithm>\n#include <iostream>\n#include <vector>\n\nint main() {\n    std::vector<int> scores{8, 3, 5, 1};\n    std::sort(scores.begin(), scores.end());\n\n    for (int score : scores) {\n        std::cout << score << ' ';\n    }\n}",
    exercise: "Use std::find to check whether the sorted vector contains 5. Include the correct header.",
    takeaway: "Prefer standard containers and algorithms; they carry tested behavior and useful guarantees."
  },
  {
    id: "templates-and-concepts",
    track: "cpp",
    label: "Modern C++",
    number: "08",
    title: "Templates & concepts",
    time: "12 MIN",
    level: "MODERN C++",
    description: "Write reusable code while keeping requirements visible to the compiler and reader.",
    summary: "Templates let code work with types or values known at compile time. Concepts let you state the operations a template expects in a readable, checkable way.",
    focus: ["Function templates", "Type deduction", "C++20 concepts"],
    sections: [
      {
        heading: "Parameterize the type",
        paragraphs: ["A function template describes a family of functions. When you call it, the compiler deduces template arguments from the call and instantiates a concrete version. This is compile-time reuse, not runtime type erasure."]
      },
      {
        heading: "State what a template needs",
        paragraphs: ["Before concepts, template errors could appear far from the call site. A C++20 concept can state a constraint such as std::integral, making the intended set of types clearer and diagnostics more useful. Keep generic code as simple as its use cases allow."]
      }
    ],
    codeTitle: "templates.cpp",
    code: "#include <concepts>\n#include <iostream>\n\ntemplate <std::integral T>\nT twice(T value) {\n    return value + value;\n}\n\nint main() {\n    std::cout << twice(21) << '\\n';\n}",
    exercise: "Try calling twice with an int and a double. Which call satisfies the integral constraint?",
    takeaway: "Use templates for genuine reuse, and concepts to make generic requirements explicit."
  },
  {
    id: "winapi-basics",
    track: "windows",
    label: "Windows systems",
    number: "09",
    title: "Win32 APIs & handles",
    time: "10 MIN",
    level: "SYSTEMS",
    description: "Learn how Windows represents resources and reports the result of an API call.",
    summary: "Win32 is a broad set of interfaces for interacting with Windows. The useful first habits are understanding handles, checking return values, and asking the API for error details.",
    focus: ["Documented API contracts", "Opaque handles", "Return values and GetLastError"],
    sections: [
      {
        heading: "Treat the documentation as the contract",
        paragraphs: ["A Windows API documents its parameters, return value, ownership rules, and failure behavior. Read those details before calling it. Many APIs use a HANDLE-like value as an opaque token; do not assume it is a pointer you can inspect or alter."]
      },
      {
        heading: "Check results and own cleanup",
        paragraphs: ["Check a function's documented failure value before using its result. When an API reports an extended error through GetLastError, capture it immediately after the failed call. Wrap owned handles in a small RAII type so CloseHandle is called exactly once on the correct paths.", "The sample below is portable C++ that models the discipline. Actual Windows calls need the Windows SDK and a Windows compiler; this browser compiler targets a Linux environment."]
      }
    ],
    codeTitle: "result-checking.cpp · portable sketch",
    code: "#include <iostream>\n\nint main() {\n    const bool operation_succeeded{true};\n    if (!operation_succeeded) {\n        std::cerr << \"operation failed\\n\";\n        return 1;\n    }\n    std::cout << \"check the contract first\\n\";\n}",
    exercise: "Pick a Win32 API in the official docs. Find its failure return value and its cleanup requirements.",
    takeaway: "A successful-looking return value is only meaningful when you know the API's documented contract."
  },
  {
    id: "pe-and-dlls",
    track: "windows",
    label: "Windows systems",
    number: "10",
    title: "PE files, DLLs & loading",
    time: "12 MIN",
    level: "SYSTEMS",
    description: "Get a map of the Portable Executable format and the loader's basic responsibilities.",
    summary: "A Windows executable is structured data, not a mystery blob. The PE format describes headers, sections, imports, exports, and information the loader uses to prepare an image.",
    focus: ["PE headers and sections", "Imports and exports", "Loader responsibilities"],
    sections: [
      {
        heading: "Read the structure before the instructions",
        paragraphs: ["The PE headers describe architecture, section layout, and directories such as imports and exports. Sections commonly separate code, read-only data, and writable data, but section names are conventions—not a security boundary by themselves."]
      },
      {
        heading: "The loader connects modules",
        paragraphs: ["A DLL can expose named exports for other modules to use. An executable's import information names dependencies and functions; the loader maps modules, resolves imports, and applies relocations where needed. Architecture mismatches, missing dependencies, and initialization order all matter when debugging load failures."]
      }
    ],
    codeTitle: "A simplified import relationship",
    code: "// Conceptual only: the operating-system loader does this work.\n\n// app.exe declares that it imports a function from a DLL.\n// The loader resolves the import for this process.\n// The program calls the documented function through its import.\n\n// Inspect your own sample binaries with a PE viewer or debugger.",
    exercise: "Build a tiny program you own, then inspect its headers and imports with a reputable PE viewer. Compare x86 and x64 builds.",
    takeaway: "Start with file structure and documented loading behavior before interpreting machine code."
  },
  {
    id: "winapi-hooking",
    track: "windows",
    label: "Windows systems",
    number: "11",
    title: "API hooking & instrumentation",
    time: "14 MIN",
    level: "ADVANCED TOPIC",
    description: "Understand the idea behind observing or redirecting calls—starting with code you own.",
    summary: "Hooking is a broad instrumentation technique: a call path is observed or redirected so behavior can be measured, tested, or adapted. Learn the model and trade-offs before reaching for a patching technique.",
    focus: ["IAT, vtable, and inline concepts", "Instrumentation trade-offs", "Permission and process boundaries"],
    sections: [
      {
        heading: "There is more than one kind of hook",
        paragraphs: ["An import-table hook changes which function address a module calls through its imports. A vtable hook changes a virtual dispatch target. An inline hook alters instructions at a function entry. They have different scope, compatibility, and failure modes; architecture, compiler output, and memory protections all matter."]
      },
      {
        heading: "Prefer supported observation first",
        paragraphs: ["For software you own, start with a wrapper, dependency injection, a debugger breakpoint, ETW, or a documented instrumentation library. Those methods are easier to review and less fragile than modifying executable memory. Test only in a disposable process or lab you control.", "This example is a safe wrapper around a function pointer in the same program. It demonstrates observing a call without patching a Windows API, injecting into another process, or bypassing a protection."]
      }
    ],
    codeTitle: "instrumentation-wrapper.cpp · same-process example",
    code: "#include <iostream>\n\nusing Operation = int (*)(int);\n\nint add_one(int value) {\n    return value + 1;\n}\n\nint observe_call(Operation target, int value) {\n    std::cout << \"called with \" << value << '\\n';\n    return target(value);\n}\n\nint main() {\n    std::cout << observe_call(add_one, 4) << '\\n';\n}",
    exercise: "Add a second function with the same signature and pass it to observe_call. Compare the trace and result.",
    takeaway: "Learn call interception with transparent, same-process instrumentation before studying lower-level hooks."
  },
  {
    id: "memory-safety",
    track: "security",
    label: "Security",
    number: "12",
    title: "Memory safety in C++",
    time: "12 MIN",
    level: "DEFENSIVE",
    description: "Recognize lifetime, bounds, and integer issues before they become vulnerabilities.",
    summary: "Many serious native-code bugs are ordinary mistakes at a boundary: a value is out of range, an object has expired, or an input was trusted too early. Safer defaults make those bugs harder to write.",
    focus: ["Bounds and lifetimes", "Input validation", "Sanitizers and static analysis"],
    sections: [
      {
        heading: "Make invalid states harder to express",
        paragraphs: ["Use standard containers such as std::vector and std::string instead of unmanaged buffers when they fit. Check sizes before arithmetic or indexing, validate input at trust boundaries, and keep ownership explicit. A pointer can be non-null and still be invalid; lifetime is part of the contract."]
      },
      {
        heading: "Let tools find what review misses",
        paragraphs: ["Use compiler warnings, static analysis, and sanitizers such as AddressSanitizer in a local development build. They complement tests; they do not prove a program is safe. Treat warnings and crashes as evidence to investigate, not as a reason to silence the tool without understanding the cause."]
      }
    ],
    codeTitle: "bounds-first.cpp",
    code: "#include <iostream>\n#include <vector>\n\nint main() {\n    const std::vector<int> values{4, 8, 15};\n    const std::size_t index{1};\n\n    if (index < values.size()) {\n        std::cout << values[index] << '\\n';\n    }\n}",
    exercise: "Try an index equal to values.size(). Explain why the check prevents an out-of-bounds access.",
    takeaway: "Prefer bounded abstractions, validate input, and use analysis tools throughout development."
  },
  {
    id: "debugging-and-reversing",
    track: "security",
    label: "Security",
    number: "13",
    title: "Debugging & reverse engineering",
    time: "13 MIN",
    level: "DEFENSIVE",
    description: "Build a repeatable workflow for understanding a program you are authorized to inspect.",
    summary: "Reverse engineering is careful observation and hypothesis testing. Start with known inputs and outputs, symbols, logs, and a debugger; use disassembly when it answers a specific question.",
    focus: ["Reproduce before guessing", "Symbols and call stacks", "Source, assembly, and optimization"],
    sections: [
      {
        heading: "Make the behavior repeatable",
        paragraphs: ["Record the program version, environment, exact inputs, and expected versus observed behavior. Reproduce the issue in a small test when possible. A reliable repro makes a debugger session much more informative."]
      },
      {
        heading: "Move between abstraction levels",
        paragraphs: ["With source and symbols, inspect the call stack, variables, and ownership transitions. When those are unavailable, compare strings, imports, control flow, and disassembly to answer a focused question. Optimized code may reorder or remove source-level operations, so do not expect a one-to-one line mapping."]
      }
    ],
    codeTitle: "A calm debugging checklist",
    code: "1. Reproduce with the smallest input you can.\n2. Capture the first error and exact build settings.\n3. Check the call stack and object lifetime.\n4. Form one hypothesis; change one thing.\n5. Retest and keep the result.\n\nUse symbols and binaries you own or have permission to analyze.",
    exercise: "Write down a bug's expected behavior, actual behavior, and one observation that would distinguish two possible causes.",
    takeaway: "A debugger is most useful when you bring a specific question and a repeatable case."
  },
  {
    id: "threat-modeling",
    track: "security",
    label: "Security",
    number: "14",
    title: "Threat modeling for small programs",
    time: "9 MIN",
    level: "DEFENSIVE",
    description: "Identify what matters, where trust changes, and what could go wrong before coding.",
    summary: "Threat modeling is a practical design habit. It helps a developer decide which assets to protect, where untrusted input enters, and which mitigations deserve attention.",
    focus: ["Assets and boundaries", "Misuse cases", "Mitigations and trade-offs"],
    sections: [
      {
        heading: "Draw the boundary",
        paragraphs: ["List the data and operations that matter. Sketch the program's components and mark where input crosses from a user, file, network, or another process. Those transitions are places to validate assumptions and limit authority."]
      },
      {
        heading: "Ask what could fail",
        paragraphs: ["For each boundary, ask what happens with malformed, oversized, stale, or unexpected input. Choose a proportionate mitigation: bounds checks, safer types, reduced privileges, logging, or clear recovery behavior. Revisit the model when the program or its environment changes."]
      }
    ],
    codeTitle: "A five-question starting point",
    code: "1. What are we protecting?\n2. Who or what can provide input?\n3. Where does data cross a trust boundary?\n4. What could fail or be misused?\n5. What is the simplest useful mitigation?",
    exercise: "Threat-model a command-line file converter. Name one asset, one untrusted input, and one defensive check.",
    takeaway: "Security improves when assumptions are named early and checked at the boundary."
  },
  {
    id: "safe-lab",
    track: "security",
    label: "Security",
    number: "15",
    title: "Set up a safe learning lab",
    time: "8 MIN",
    level: "LAB PRACTICE",
    description: "Keep experiments isolated, reproducible, and limited to systems you are allowed to test.",
    summary: "A good lab makes it easy to experiment and easy to recover. Start with software you wrote yourself and a disposable environment before inspecting anything less familiar.",
    focus: ["Permission and scope", "Snapshots and isolation", "Keep notes and clean up"],
    sections: [
      {
        heading: "Define scope before opening a tool",
        paragraphs: ["Use your own code, intentionally vulnerable training projects, or systems where you have explicit permission. Write down what is in scope and what is not. Never test on a public service or someone else's computer just because it is reachable."]
      },
      {
        heading: "Make experiments reversible",
        paragraphs: ["Use a disposable virtual machine or local test process, take a snapshot, and keep sensitive data out of the environment. Disable shared folders or networking when they are not needed. Record what you changed and restore the clean state when the exercise is done."]
      }
    ],
    codeTitle: "Before you experiment",
    code: "□ I own this system or have permission.\n□ The target and activity are in scope.\n□ I can restore the environment.\n□ No secrets or personal data are exposed.\n□ I know how to stop and clean up.",
    exercise: "Write a one-paragraph scope statement for a lab built around a toy program you compile yourself.",
    takeaway: "Keep the target local, the permission explicit, and the environment disposable."
  }
];
