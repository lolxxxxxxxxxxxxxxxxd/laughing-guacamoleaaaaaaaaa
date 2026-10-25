"use strict";

const STORAGE_KEYS = {
  progress: "fieldnotes.progress.v1",
  editorCpp: "fieldnotes.editor.cpp.v1",
  editorC: "fieldnotes.editor.c.v1"
};

const DEFAULT_PROGRAMS = {
  cpp: "#include <iostream>\n\nint main() {\n    std::cout << \"Hello from C++!\\n\";\n    return 0;\n}",
  c: "#include <stdio.h>\n\nint main(void) {\n    puts(\"Hello from C!\");\n    return 0;\n}"
};

const STANDARD_OPTIONS = {
  cpp: [
    ["-std=c++20", "C++20"],
    ["-std=c++23", "C++23"]
  ],
  c: [
    ["-std=c17", "C17"],
    ["-std=c23", "C23"]
  ]
};

const EXAMPLE_PROGRAMS = {
  cpp: {
    hello: DEFAULT_PROGRAMS.cpp,
    collection: "#include <algorithm>\n#include <iostream>\n#include <vector>\n\nint main() {\n    std::vector<int> values{8, 3, 5, 1};\n    std::sort(values.begin(), values.end());\n\n    for (int value : values) {\n        std::cout << value << ' ';\n    }\n}",
    input: "#include <iostream>\n#include <string>\n\nint main() {\n    std::string name;\n    std::cout << \"Name? \";\n    std::getline(std::cin, name);\n    std::cout << \"Hello, \" << name << '\\n';\n}",
    calculator: "#include <iomanip>\n#include <iostream>\n\nint main() {\n    double first{};\n    double second{};\n    if (!(std::cin >> first >> second)) {\n        std::cerr << \"Enter two numbers.\\n\";\n        return 1;\n    }\n    std::cout << std::fixed << std::setprecision(2) << first + second << '\\n';\n}",
    search: "#include <algorithm>\n#include <iostream>\n#include <vector>\n\nint main() {\n    const std::vector<int> values{4, 8, 15, 16, 23, 42};\n    const int target{15};\n    const auto found{std::find(values.begin(), values.end(), target)};\n    std::cout << (found != values.end() ? \"found\" : \"not found\") << '\\n';\n}",
    pointer: "#include <iostream>\n\nint main() {\n    int score{42};\n    const int* address{&score};\n    std::cout << \"value: \" << *address << '\\n';\n}"
  },
  c: {
    hello: DEFAULT_PROGRAMS.c,
    collection: "#include <stdio.h>\n\nint main(void) {\n    int values[] = {8, 3, 5, 1};\n    const size_t count = sizeof values / sizeof values[0];\n\n    for (size_t i = 0; i < count; ++i) {\n        printf(\"%d \", values[i]);\n    }\n    putchar('\\n');\n}",
    input: "#include <stdio.h>\n\nint main(void) {\n    char name[64];\n    fputs(\"Name? \", stdout);\n    if (fgets(name, sizeof name, stdin) != NULL) {\n        printf(\"Hello, %s\", name);\n    }\n}",
    calculator: "#include <stdio.h>\n\nint main(void) {\n    double first;\n    double second;\n    if (scanf(\"%lf %lf\", &first, &second) != 2) {\n        fputs(\"Enter two numbers.\\n\", stderr);\n        return 1;\n    }\n    printf(\"%.2f\\n\", first + second);\n}",
    search: "#include <stddef.h>\n#include <stdio.h>\n\nint main(void) {\n    const int values[] = {4, 8, 15, 16, 23, 42};\n    const size_t count = sizeof values / sizeof values[0];\n    const int target = 15;\n    size_t index = 0;\n    while (index < count && values[index] != target) ++index;\n    puts(index < count ? \"found\" : \"not found\");\n}",
    pointer: "#include <stdio.h>\n\nint main(void) {\n    int score = 42;\n    const int *address = &score;\n    printf(\"value: %d\\n\", *address);\n}"
  }
};

const EXAMPLE_LABELS = {
  hello: "Hello, world",
  collection: "Collection / array",
  input: "Read input",
  calculator: "Add two numbers",
  search: "Find a value",
  pointer: "Pointer basics"
};

const CPP_HEADERS = ["algorithm", "array", "bit", "cassert", "cstddef", "cstdint", "cmath", "concepts", "filesystem", "fstream", "iomanip", "iostream", "map", "memory", "optional", "string", "string_view", "tuple", "utility", "vector"];
const C_HEADERS = ["assert.h", "ctype.h", "math.h", "stdbool.h", "stddef.h", "stdint.h", "stdio.h", "stdlib.h", "string.h", "time.h"];

const CPP_COMPLETIONS = [
  ["std::cout", "output stream"], ["std::cin", "input stream"], ["std::cerr", "error stream"],
  ["std::string", "text"], ["std::string_view", "non-owning text"], ["std::vector", "dynamic sequence"],
  ["std::array", "fixed-size sequence"], ["std::map", "ordered key/value container"],
  ["std::unique_ptr", "single-owner pointer"], ["std::make_unique", "create a unique_ptr"],
  ["std::optional", "optional value"], ["std::move", "cast to an rvalue"], ["std::sort", "sort a range"],
  ["std::find", "find a value in a range"], ["std::size_t", "unsigned size type"],
  ["auto", "deduce the type"], ["bool", "boolean type"], ["class", "declare a class"],
  ["const", "read-only through this name"], ["constexpr", "compile-time expression"],
  ["double", "floating-point type"], ["for", "for loop"], ["if", "conditional"],
  ["int", "integer type"], ["main", "program entry point"], ["nullptr", "null pointer value"],
  ["return", "return from a function"], ["struct", "declare a struct"],
  ["template", "generic code"], ["using", "introduce a name"], ["void", "no value"], ["while", "while loop"]
].map(([label, detail]) => ({ label, detail, insertText: label }));

const C_COMPLETIONS = [
  ["printf", "formatted output · stdio.h"], ["fprintf", "formatted stream output"],
  ["puts", "write a string and newline"], ["fgets", "read a bounded line"],
  ["scanf", "formatted input · validate results"], ["malloc", "allocate bytes · stdlib.h"],
  ["free", "release allocated bytes"], ["size_t", "unsigned size type"],
  ["NULL", "null pointer macro"], ["bool", "include stdbool.h"], ["char", "character type"],
  ["const", "read-only through this name"], ["double", "floating-point type"],
  ["for", "for loop"], ["if", "conditional"], ["int", "integer type"],
  ["main", "program entry point"], ["return", "return from a function"],
  ["sizeof", "size of a type or object"], ["struct", "declare a struct"], ["void", "no value"],
  ["while", "while loop"]
].map(([label, detail]) => ({ label, detail, insertText: label }));

const CPP_KEYWORDS = new Set("alignas alignof auto bool break case catch char class const constexpr continue decltype default delete do double else enum explicit export extern false float for friend if inline int long namespace new nullptr private protected public register return short signed sizeof static static_assert struct switch template this thread_local throw true try typedef typename union unsigned using virtual void volatile while concept requires".split(" "));
const CPP_TYPES = new Set("bool char char8_t char16_t char32_t double float int long short signed unsigned void wchar_t size_t".split(" "));
const C_KEYWORDS = new Set("auto break case char const continue default do double else enum extern float for goto if inline int long register restrict return short signed sizeof static struct switch typedef union unsigned void volatile while _Bool _Complex _Generic".split(" "));
const C_TYPES = new Set("char double float int long short signed unsigned void _Bool size_t".split(" "));

window.OFFSET_EDITOR_DATA = {
  storageKeys: { c: STORAGE_KEYS.editorC, cpp: STORAGE_KEYS.editorCpp },
  standards: STANDARD_OPTIONS,
  examples: EXAMPLE_PROGRAMS,
  exampleLabels: EXAMPLE_LABELS,
  cppHeaders: CPP_HEADERS,
  cHeaders: C_HEADERS,
  cppCompletions: CPP_COMPLETIONS,
  cCompletions: C_COMPLETIONS,
  cppKeywords: CPP_KEYWORDS,
  cKeywords: C_KEYWORDS,
  cppTypes: CPP_TYPES,
  cTypes: C_TYPES
};
