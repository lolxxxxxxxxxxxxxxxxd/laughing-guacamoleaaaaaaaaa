"use strict";

(() => {
  const d = window.OFFSET_LESSON_DEPTH;
  window.OFFSET_REGISTER_DEPTH({
    "c-pointers-arrays": d(
      "C arrays, pointer expressions, and size_t.",
      [["Array bounds are not carried by a pointer", "An array has a size as part of its type, but most expressions convert it to a pointer to its first element. Function parameters written as T array[] are adjusted to T*, so the callee does not receive the original array length. A robust interface carries pointer and count together, or begin/end pointers. The valid range is half-open: first included, end one past the last element."],
      ["Treat pointer and length as one contract", "Before indexing, establish index < count. When count comes from untrusted input, validate it before multiplying by an element size; size_t arithmetic can wrap. A one-past pointer may be formed for iteration but must not be dereferenced. Keep pointer, length, and owner together where possible. C does not enforce this relationship, so it belongs in the interface and its tests."]],
      ["sizeof on a function parameter adjusted to T* gives pointer size, not caller array length.", "A one-past pointer is legal to form but illegal to read or write through."],
      { question: "For const int* values and size_t count, which indexes are valid?", answer: "Zero through count - 1 when count is nonzero; the pointer itself does not reveal the allocation length." },
      ["Test count zero and one.", "Add a bound check before every index operation.", "Check count <= SIZE_MAX / sizeof(*values) before computing allocation bytes."],
      { time: "25–30 MIN" }
    ),
    "c-strings": d(
      "C arrays, char pointers, and input functions.",
      [["NUL termination is part of the representation", "A C string is a sequence of char values terminated by the first NUL byte. A char pointer does not tell a function how many bytes are writable. A destination of capacity N can hold at most N - 1 payload bytes plus the terminator. Every input and copy operation must preserve that bound, and every read must stay inside the object's lifetime."],
      ["Bound every operation by capacity", "fgets accepts a capacity and reads at most one less than that many characters, but a returned line may be truncated. Detect whether the delimiter was seen, then decide whether to drain, reject, or continue the record. Do not call strlen until a terminator is known to exist inside valid memory. For binary data, use an explicit length because an embedded zero ends a C string early."]],
      ["strncpy is not a universal safe-string function; it may leave the destination without a NUL terminator.", "A fixed-size input buffer still needs a policy for overlong input."],
      { question: "For char name[32], what is the maximum payload length of a valid C string?", answer: "31 bytes before the terminating NUL, because the terminator uses one byte of the array." },
      ["Read a short line and verify the terminator.", "Test a line exactly at capacity and one character longer.", "Report truncation rather than silently accepting a partial identifier."],
      { time: "25–30 MIN" }
    ),
    "c-structs-enums": d(
      "C declarations, functions, pointers, and separate compilation.",
      [["C aggregates group data; interfaces carry the contract", "A struct groups fields but does not automatically enforce an invariant or hide representation. An enum gives integer constants meaningful names. An API contract must still state which pointers may be null, which fields a function mutates, who owns allocated memory, and which returns signal failure. const on a pointer-to-data communicates that the function will not modify data through that parameter."],
      ["Document ownership and failure states", "Prefer a named status enum and return value for operation success, then write output parameters only when the contract says they are valid. If a function returns a pointer into an input buffer, document that it is borrowed and how long it remains valid. Use fixed-width integers when a file or protocol specifies width; native struct padding and enum representation are not a portable serialization format."]],
      ["A struct's in-memory bytes are not automatically a stable file format.", "A function returning a borrowed pointer must not imply ownership to callers."],
      { question: "What is missing from a parameter declared only as char*?", answer: "Its capacity, ownership, nullability, and whether the function may modify it." },
      ["Design a result struct and status enum for a parser.", "Document which fields are valid on success and failure.", "Compare struct layout across builds, then design explicit serialization instead."],
      { time: "25–30 MIN", codeTitle: "record.c", code: "#include <stdio.h>\n\nenum Status { STATUS_OK, STATUS_INVALID };\nstruct Point { double x; double y; };\n\nstatic enum Status translate(struct Point* point, double dx, double dy) {\n    if (point == NULL) return STATUS_INVALID;\n    point->x += dx;\n    point->y += dy;\n    return STATUS_OK;\n}\n\nint main(void) {\n    struct Point point = {2.0, 3.0};\n    if (translate(&point, 1.0, -1.0) != STATUS_OK) return 1;\n    printf(\"%.1f %.1f\\n\", point.x, point.y);\n}" }
    ),
    "c-allocation": d(
      "C pointers, sizeof, and function return values.",
      [["Allocation creates a manual ownership obligation", "malloc requests bytes and returns either suitably aligned uninitialized storage or null. Check multiplication for overflow before computing the byte count. On success, one owner must call free exactly once after the final use. On failure, there is no allocation to release. realloc is special: store its result in a temporary so the original allocation remains available if resizing fails."],
      ["Keep cleanup paths explicit", "Every path after a successful allocation needs cleanup. In C this often means one exit label or small helpers that make ownership transfer explicit. Do not read uninitialized bytes, return a pointer to a local array, or free a borrowed pointer. If a function returns allocated memory, document who frees it and which allocator to use. In C++, prefer containers and RAII instead of manual allocation."]],
      ["Assigning realloc directly to the only pointer can lose the original allocation on failure.", "Computing count * sizeof(T) before checking overflow can allocate too little."],
      { question: "Why store realloc's result in a temporary pointer?", answer: "On failure realloc returns null and leaves the original allocation intact; overwriting the only pointer would lose it." },
      ["Check count <= SIZE_MAX / sizeof(*items) before multiplication.", "Handle allocation failure before using the pointer.", "Exercise success and failure cleanup paths."],
      { time: "25–30 MIN", codeTitle: "allocation.c", code: "#include <stdint.h>\n#include <stdio.h>\n#include <stdlib.h>\n\nint main(void) {\n    const size_t count = 4;\n    if (count > SIZE_MAX / sizeof(int)) return 1;\n    int* values = malloc(count * sizeof *values);\n    if (values == NULL) return 1;\n    for (size_t i = 0; i < count; ++i) values[i] = (int)i;\n    printf(\"%d\\n\", values[3]);\n    free(values);\n}" }
    ),
    "c-error-handling": d(
      "Functions, return values, errno, and output parameters.",
      [["Status and data are separate channels", "C APIs frequently report status in the return value and place data in output parameters. These are separate channels: inspect status before trusting output. Some APIs set errno, but only documentation can promise that, and unrelated library calls may change it. Capture errno immediately after a failing operation and translate it into a useful diagnostic while context is available."],
      ["Preserve the first useful error", "Use distinct return values for success and failure when the result domain allows it. If a function returns a count, do not overload a valid count as an error sentinel without documentation. Initialize output parameters to a defined state where useful, and state whether they are modified on partial failure. When results belong together, returning a struct can be clearer than several unrelated pointer parameters."]],
      ["Ignoring a return code turns a recoverable failure into later invalid state.", "errno is not guaranteed to describe an error after every function call."],
      { question: "When should a caller read errno?", answer: "Immediately after an API documents that the failed call sets it; later calls may overwrite it." },
      ["Check the documented failure sentinel.", "Keep a system error separate from a user-facing explanation.", "Test success and failure without reading invalid output values."],
      { time: "20–25 MIN", codeTitle: "parse-int.c", code: "#include <errno.h>\n#include <stdio.h>\n#include <stdlib.h>\n\nint main(void) {\n    const char* text = \"42\";\n    char* end = NULL;\n    errno = 0;\n    const long value = strtol(text, &end, 10);\n    if (errno != 0 || end == text || *end != '\\0') {\n        fputs(\"invalid integer\\n\", stderr);\n        return 1;\n    }\n    printf(\"%ld\\n\", value);\n}" }
    ),
    "c-headers-linking": d(
      "C declarations, function definitions, and compiler commands.",
      [["Headers distribute declarations; the linker finds definitions", "A header is a source-level interface included by translation units. Include guards prevent repeated declarations in one translation unit, while a source file usually owns one external function definition. The linker sees symbols, not intention: a missing object file creates an unresolved reference; two non-inline definitions create duplicate symbols. Compile each .c file independently to catch missing includes before linking."],
      ["Build one translation unit at a time", "Keep a header self-contained by including the types it uses. Use extern declarations only when the linkage contract requires them. Avoid defining mutable globals in headers. A static function in a header creates a separate internal copy in each translation unit; that can be intentional for tiny helpers, but it is not a replacement for an ordinary external definition."]],
      ["A header guard prevents repeated inclusion but not duplicate definitions across source files.", "A header that relies on prior includes can compile only by accident."],
      { question: "Where should an ordinary externally linked C function usually be defined?", answer: "Once in a .c file, with its declaration in a header included by its callers." },
      ["Split an interface declaration and implementation.", "Compile the caller alone, then link both object files.", "Remove one object file and inspect the unresolved-symbol diagnostic."],
      { time: "25–30 MIN" }
    ),
    "c-undefined-behavior": d(
      "C integer types, pointers, arrays, and compiler optimizations.",
      [["Undefined behavior removes the language guarantee", "Undefined behavior is an operation for which the C standard imposes no requirements. It is not a stable but surprising result. The optimizer may assume undefined cases do not occur and transform surrounding code. Common sources include out-of-bounds access, use-after-free, invalid shifts, signed overflow, and dereferencing an invalid pointer. A program that appears to work in an unoptimized build has not established that the operation is defined."],
      ["Fix the first invalid operation", "Separate defined edge cases from undefined operations. Validate an index before access; check signed bounds before arithmetic; validate a shift count against the type width. Warnings and sanitizers identify some mistakes on executed paths, but their silence is not proof. Keep the first failing input and fix the invalid operation rather than patching only the observed symptom."]],
      ["A crash is not required for undefined behavior to exist.", "Adding volatile or disabling optimization does not make an invalid operation correct."],
      { question: "What is the safest conclusion when a program appears to work after an out-of-bounds read?", answer: "It still has undefined behavior; one build's output is not guaranteed across inputs, versions, or optimization levels." },
      ["Replace the access with a checked range operation.", "Build with a sanitizer and reproduce the smallest failing input.", "Add a regression test for the valid boundary immediately before the error."],
      { time: "25–30 MIN" }
    )
  });
})();
