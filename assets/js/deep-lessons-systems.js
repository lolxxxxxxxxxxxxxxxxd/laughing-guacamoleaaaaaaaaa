"use strict";

(() => {
  const d = window.OFFSET_LESSON_DEPTH;
  window.OFFSET_REGISTER_DEPTH({
    "winapi-basics": d(
      "C++ functions, return values, and RAII.",
      [["An API call is a documented contract", "Win32 functions define parameter types, valid ranges, return conventions, ownership, and failure behavior. A HANDLE is an opaque token in the calling process, not a pointer to memory that user code should inspect. Some APIs return null or INVALID_HANDLE_VALUE on failure; others return a Boolean or a count. Read the exact contract rather than assuming all functions use the same pattern."],
      ["Capture errors at the right time", "If a documented API reports extended error information through GetLastError, call it immediately after detecting that API's failure. Another call can overwrite the thread's last-error value. Convert the code to a diagnostic while preserving the operation, inputs, and process context. Wrap owned handles so cleanup occurs once on all paths; a borrowed handle must not be closed by a function that does not own it."]],
      ["A non-null handle is not automatically a valid handle for every operation.", "Calling GetLastError after a successful call can return an unrelated stale value."],
      { question: "When should GetLastError usually be read?", answer: "Immediately after an API documents failure through that function, before another call can overwrite the thread's error value." },
      ["Pick a documented Win32 function and write down its exact failure sentinel.", "Create an owned-handle cleanup checklist for each exit path.", "Separate API failure from the explanatory message shown to a user."],
      { time: "25–30 MIN" }
    ),
    "pe-and-dlls": d(
      "Hexadecimal, file offsets, and basic executable concepts.",
      [["The PE file is a set of related tables", "A PE image begins with headers that identify architecture and locate data directories, followed by sections that map file data into an image. File offsets and virtual addresses are different coordinate systems; a section's raw-data offset is not interchangeable with its loaded address. Import and export directories describe links between modules, while relocations allow an image to be mapped away from its preferred base."],
      ["Read metadata before drawing conclusions", "A section name such as .text is a convention, not proof of its content or permissions. Compare the file view with the mapped image and record whether a value is a file offset, RVA, or VA. The loader resolves imports and relocations according to the format and system policy. Start with a harmless binary you built yourself; never execute an unknown sample just to inspect its headers."]],
      ["A file offset and an RVA are not the same address.", "An import entry explains a dependency; it does not prove the dependency is safe or present."],
      { question: "What extra value is needed to turn an RVA into a VA for a loaded image?", answer: "The image's actual load base; VA equals base plus RVA for the relevant mapped image." },
      ["Inspect a program you compiled and record its machine type and entry point.", "Map one section's raw offset and RVA without mixing their units.", "Compare imports in two builds with different library usage."],
      { time: "25–30 MIN" }
    ),
    "winapi-hooking": d(
      "Function pointers, call stacks, and permission boundaries.",
      [["Instrumentation changes what a call path means", "An import-table hook changes an address a module calls through its imports; a vtable hook changes virtual dispatch; an inline hook alters executable instructions. These mechanisms differ in scope, compatibility, race behavior, and cleanup. Architecture, compiler output, memory protection, and module lifetime all matter. A hook that appears to work in one build may fail when code layout or optimization changes."],
      ["Start with a transparent observation point", "For software you own, prefer a wrapper, dependency injection, a debugger breakpoint, ETW, or a supported instrumentation library. These choices make the observation point reviewable and avoid patching another process. If you study a low-level mechanism, keep the target a toy process you built, define a restore path, and record the exact binary and environment. Do not use the material to bypass protections or interfere with third-party software."]],
      ["A function pointer wrapper does not reproduce all the ABI and lifetime hazards of an inline patch.", "Changing executable memory can race with another thread and leave a process unstable."],
      { question: "Which is the safer first experiment for observing a call in your own program?", answer: "Wrap an owned function pointer or use a debugger breakpoint before modifying executable memory." },
      ["Wrap a function pointer in a test program and log inputs and outputs.", "Repeat the experiment with a second implementation of the same interface.", "Write down what changes when the observer is removed."],
      { time: "30–35 MIN" }
    ),
    "binary-and-hex": d(
      "Integer values, binary notation, and bitwise operators.",
      [["Hexadecimal is a compact spelling of bit patterns", "One hexadecimal digit represents four bits, so a byte is exactly two hex digits. The spelling does not say whether a value is signed, how wide it is, or what the bits mean. A bit mask selects positions; shifts move bits within a type's width. Write the width and interpretation beside a value when reading memory, flags, or file fields."],
      ["Work from width to meaning", "Convert a value by grouping bits into nibbles, then check each mask against the documented field. Avoid shifting by a negative count or by an amount greater than or equal to the type width. Bitwise operators on signed values can be surprising; use unsigned fixed-width values for raw bit fields and convert only after validating the domain."]],
      ["A hex value without width can be ambiguous.", "Bitwise flags should not be confused with arithmetic addition."],
      { question: "How many bits does each hexadecimal digit encode?", answer: "Four bits, which is why two hex digits represent one eight-bit byte." },
      ["Convert 0xA5 to eight binary bits.", "Mask and extract the high and low nibbles of one byte.", "Use the reference converter to verify a negative value's displayed representation separately from its type."],
      { time: "20–25 MIN" }
    ),
    "integer-representation": d(
      "Binary, decimal, fixed-width types, and arithmetic.",
      [["Finite-width arithmetic has language rules", "A machine integer represents a finite set of values. Unsigned arithmetic wraps modulo its width; signed overflow in C and C++ is undefined. Conversions can discard high bits or change the interpretation of a bit pattern. Before allocating count * element_size bytes, prove the multiplication cannot overflow; before converting a parsed value, prove it fits the destination range."],
      ["Check values at representation boundaries", "For serialized data, use an explicitly sized integer type and specify byte order. For sizes and indexes, use size_t only after validating signed input; converting a negative number to unsigned produces a large value. A cast does not repair an invalid range. Keep parsing, validation, and conversion as distinct steps so reviewers can see where trust is established."]],
      ["Unsigned wrap is defined but can still produce a security bug.", "A cast to a smaller integer type may truncate rather than report failure."],
      { question: "Why check count <= SIZE_MAX / element_size before multiplying?", answer: "It proves the byte-count multiplication cannot wrap before allocation." },
      ["Find one signed-to-unsigned conversion in a sample and state its valid range.", "Write a precondition for a safe allocation-size calculation.", "Test the largest accepted value and the first rejected value."],
      { time: "25–30 MIN" }
    ),
    "endianness-layout": d(
      "Bytes, integer widths, and alignment.",
      [["Memory layout is not a serialization contract", "Endianness describes the order of bytes in a multi-byte value. Alignment may require padding between fields or at the end of a structure. Compilers can choose padding to satisfy the target ABI, so writing an in-memory struct directly to disk can include unspecified padding and vary across architectures, compiler versions, or settings."],
      ["Decode formats field by field", "A portable file or network format specifies field widths, byte order, and versioning. Parse with explicit bounds checks, then convert into native objects. Do not cast an arbitrary byte pointer to a struct pointer: alignment, aliasing, and representation may all be wrong. When inspecting a dump, record whether each offset is relative to the file, image, or section."]],
      ["Two builds of the same source can have different sizeof(struct) values.", "Host endianness should not be assumed for a protocol field."],
      { question: "Why is writing a C++ struct's raw bytes a poor portable file format?", answer: "Padding, alignment, endianness, and representation can vary; fields need explicit encoding." },
      ["Write 0x12345678 as bytes in little-endian and big-endian order.", "Inspect a struct with sizeof and offsetof, then identify its padding.", "Design an explicit parser for a two-field byte buffer with truncated-input checks."],
      { time: "25–30 MIN" }
    ),
    "virtual-memory": d(
      "Pointers, processes, and hexadecimal addresses.",
      [["A process uses virtual addresses", "A process's virtual address space is translated through page tables; the same virtual address can map to different physical pages in different processes. Page permissions govern whether a mapping can be read, written, or executed. A pointer is meaningful only in the process that owns the mapping and while the mapping and language-level object remain alive."],
      ["Separate mapping lifetime from object lifetime", "An address may be mapped but not contain a constructed C++ object of the type you intend to access. Conversely, a C++ object may be destroyed while its storage remains allocated. Debug a fault by identifying the instruction, address, mapping, permissions, and object lifetime. Use ordinary containers for application memory unless an OS-level mapping is specifically required."]],
      ["Copying a pointer value between processes does not copy the object.", "A readable page is not proof that a C++ object is alive at that address."],
      { question: "Why can two processes use the same numeric virtual address for different data?", answer: "Each process has its own address-space mappings, which can map that address to different physical pages." },
      ["Draw a virtual-to-physical translation for two processes.", "Inspect a toy process you own and relate a faulting address to page permissions.", "Explain why a pointer becomes invalid after its mapping is released."],
      { time: "25–30 MIN" }
    ),
    "registers-and-flags": d(
      "Integer arithmetic, assembly mnemonics, and a target architecture.",
      [["Registers are temporary machine state", "General-purpose registers hold values, pointers, and temporary results. The instruction pointer identifies the next instruction. Arithmetic and comparison instructions update flags that conditional branches inspect. A register's role is contextual: the same register may hold an argument at a function boundary and a temporary value inside the function."],
      ["Translate instructions into state changes", "Read a short sequence by recording relevant registers before and after each instruction. Check operand width, signedness, and flag behavior in an architecture reference. Do not infer source-level intent from one mnemonic without considering surrounding instructions and compiler optimization. Keep the architecture and ABI fixed when comparing outputs."]],
      ["A register name alone does not tell you whether a value is a pointer or integer.", "A conditional jump depends on flags from an earlier instruction, which may not be the visually closest instruction."],
      { question: "What does the instruction pointer help identify?", answer: "The current or next instruction in the execution stream, according to the architecture's state model." },
      ["Annotate a three-instruction sequence with register inputs and outputs.", "Trace a comparison through the flags it sets and the conditional branch that reads them.", "Compare debug and optimized assembly for one small expression."],
      { time: "25–30 MIN" }
    ),
    "calling-conventions": d(
      "Functions, registers, stack basics, and a named target ABI.",
      [["A function call has an ABI contract", "A calling convention defines how arguments are passed, where results are returned, which registers are preserved, and how the stack is aligned. Windows x64 and System V AMD64 differ. A debugger's register values are meaningful only when interpreted using the correct target ABI and call boundary."],
      ["Stack frames are an implementation choice", "Optimized code can omit a frame pointer, inline a function, keep values in registers, or reorder operations while preserving observable behavior. Debug symbols improve the mapping but do not force machine instructions to mirror source lines. Identify the target, compiler settings, and symbol version before concluding that a frame is corrupt."]],
      ["Do not apply Linux System V register rules to a Windows x64 call.", "A missing frame pointer does not automatically mean the stack is damaged."],
      { question: "What must you identify before reading function arguments in a register dump?", answer: "The platform ABI and the function's call boundary." },
      ["Look up argument and preserved registers for one ABI.", "At a breakpoint, record which values survive a call.", "Compare a debug build and optimized build of the same function."],
      { time: "25–30 MIN" }
    ),
    "assembly-reading": d(
      "C++ functions, compiler output, and a fixed architecture.",
      [["Assembly answers a narrow question about one build", "Compiler output depends on source, compiler version, optimization flags, target architecture, and libraries. Use source and assembly side by side to ask how one expression is implemented. A comparison loop, virtual call, or bounds check can look very different after optimization, and a single build is not a language guarantee."],
      ["Change one variable at a time", "Hold compiler, flags, and target constant while changing one source construct. Follow data movement, branches, and calls; consult an instruction reference for semantics. If the assembly looks surprising, reduce the example and verify the generated result with runtime tests or a debugger. Compiler Explorer is useful for comparison, but it is not a substitute for testing the shipped binary."]],
      ["A compiler's current output is not a promise that future versions emit the same instructions.", "An instruction mnemonic may have different effects at different operand widths."],
      { question: "What should remain fixed when comparing two assembly listings?", answer: "Compiler, flags, target architecture, and surrounding conditions, except for the one variable being investigated." },
      ["Compare a loop and a standard algorithm at the same optimization level.", "Annotate the data flow through one function.", "Re-run the comparison after changing only one compiler option."],
      { time: "25–30 MIN" }
    ),
    "linker-loader": d(
      "Object files, symbols, executable formats, and process startup.",
      [["Link time and load time are different", "The linker resolves symbols among object files and libraries, chooses layout, and records relocations. The operating-system loader maps the executable and dependencies into a process, applies required relocations, and prepares execution. A missing definition at link time differs from a missing DLL or shared library when the process starts."],
      ["Follow one symbol through the pipeline", "Start with a declaration, find its object-file symbol, inspect the final executable's imports or dynamic dependencies, then observe the loaded module in a process you own. Static linking includes code in the output; dynamic linking leaves a dependency to resolve at load time. Record architecture and runtime paths because they affect resolution."]],
      ["A successful link does not prove the program's dependencies exist on the target machine.", "A library name alone does not identify the exact file or version the loader selected."],
      { question: "Which stage normally reports a missing dynamic library at program startup?", answer: "The loader/runtime startup path, after compilation and linking have completed." },
      ["Draw source declaration → object symbol → linked image → loaded module.", "Compare static and dynamic dependencies for two builds of your own program.", "Inspect a startup failure and separate link diagnostics from loader diagnostics."],
      { time: "25–30 MIN" }
    ),
    "binary-formats": d(
      "Hexadecimal, offsets, virtual addresses, and executable files.",
      [["PE and ELF describe different executable layouts", "PE uses DOS and PE headers, sections, and data directories. ELF uses its own headers, program headers, and section tables. A loader cares about mapped segments; linkers and debuggers may also use section and symbol metadata. A file extension is only a hint; inspect magic bytes and architecture before interpreting offsets."],
      ["Name every coordinate system", "A file offset locates bytes in the file; an RVA is relative to an image base; a VA is an address in a process. Convert between them using the format's section mapping rules, not a guess. Analyze a harmless executable you built, record the source of the sample, and do not execute unknown files as a shortcut to learning the format."]],
      ["A file offset and an RVA are not interchangeable.", "Section names and permissions do not prove the actual purpose of every byte."],
      { question: "What is required to turn an RVA into a loaded virtual address?", answer: "The mapped image base, subject to the PE mapping rules: VA is based on image base plus RVA." },
      ["Identify architecture, entry point, sections, and imports in a sample you compiled.", "Translate one section's raw offset and RVA without mixing units.", "Compare a PE file and an ELF file at the metadata level."],
      { time: "30–35 MIN" }
    ),
    "windows-process-threads": d(
      "Processes, threads, virtual memory, and basic scheduling.",
      [["A process is a resource container", "A Windows process owns a virtual address space, handles, an executable image, and a security context. A thread is an execution context scheduled by the operating system, with its own stack and register state. Several threads can share process memory, which makes synchronization and lifetime decisions essential."],
      ["Shared memory is not automatically safe", "A race occurs when unsynchronized accesses conflict and at least one writes. Use a synchronization primitive whose scope matches the shared invariant, and define which data it protects. Inspect process and thread IDs, call stacks, and handle lists only in software you own or are authorized to examine."]],
      ["A thread is not an isolated process; it can observe shared state.", "A process ID or thread ID can be reused after its object exits."],
      { question: "Which state is generally private to a thread in a process?", answer: "Its execution context and stack; the process address space and many handles are shared." },
      ["Draw a process with two threads and mark shared and per-thread state.", "Use a debugger on your own program to compare two call stacks.", "Identify a shared variable and document its synchronization rule."],
      { time: "25–30 MIN" }
    ),
    "windows-handles-sync": d(
      "RAII, function contracts, and concurrent shared state.",
      [["A handle is an opaque resource token", "A HANDLE refers to an operating-system object through a process-specific table. It is not a pointer to inspect. The API that creates a handle defines the matching close operation and whether ownership is transferred or borrowed. Closing a borrowed handle can break another component; failing to close an owned handle can leak a resource."],
      ["Separate handle lifetime from synchronization", "Wrap owned handles in a small RAII type in C++, or use one cleanup path in C. A mutex protects a defined invariant over shared state; it does not automatically protect every object in the process. Keep lock scope small, use RAII locks, and do not call unknown callbacks while holding a lock."]],
      ["Do not call CloseHandle on a resource whose ownership you only borrowed.", "A lock does not protect data accessed outside the same synchronization protocol."],
      { question: "What are two separate questions when reviewing a HANDLE field?", answer: "Who owns and closes it, and what synchronization protects any shared state associated with it." },
      ["List every exit path after creating a handle.", "Wrap one owned handle in an RAII type in a toy Windows project.", "Write down which fields a mutex protects and who must acquire it."],
      { time: "25–30 MIN" }
    ),
    "windows-virtual-memory": d(
      "Virtual memory, page boundaries, and C++ object lifetime.",
      [["Reserve, commit, protect, and release are distinct operations", "VirtualAlloc can reserve address space or commit pages; protection controls access rights, and release has its own contract. Addresses and sizes are page-granular in important operations. A successful mapping does not imply a C++ object has been constructed there, nor that its object lifetime has begun."],
      ["Use the narrowest abstraction that fits", "For ordinary data, standard containers and allocators are safer than direct page management. When studying virtual-memory APIs in a local program, check every result, record the exact region and size, and release only what you acquired. Never make memory executable as a workaround for a design issue; executable permissions have security consequences."]],
      ["Mapped storage and a live C++ object are different concepts.", "Releasing or changing protection on a page can invalidate every pointer into that range."],
      { question: "Does a committed page automatically contain a constructed C++ object?", answer: "No. Storage mapping and language-level object lifetime are separate." },
      ["Draw the reserve/commit/use/release lifecycle and mark failure points.", "Compare a vector allocation with a page mapping in a toy program.", "Check that each acquired range has one release path."],
      { time: "25–30 MIN" }
    ),
    "windows-files-acl": d(
      "Paths, file handles, process tokens, and access checks.",
      [["A file open combines several decisions", "CreateFile parameters request desired access, sharing behavior, disposition, and flags. A path can be relative, UNC, device, or extended-length. The effective token and the file's security descriptor participate in access checks. An access-denied result is not enough to explain which of these conditions failed."],
      ["Diagnose identity and policy together", "When investigating an access failure, record the requested operation, effective identity, path form, sharing mode, and relevant ACL. Avoid escalating privileges by default; first identify the least permission required. When building paths from input, validate components and avoid ambiguous traversal or device names."]],
      ["A path that exists does not imply the caller may open it.", "Sharing-mode conflicts can fail even when the ACL grants access."],
      { question: "What should be checked before requesting elevated privileges for an access-denied error?", answer: "The API's requested access and sharing flags, the effective token, the object ACL, and the exact path." },
      ["Create a troubleshooting table for missing path, denied ACL, and sharing conflict.", "Inspect a file you own and identify its access rules.", "Use a least-privilege test account in a disposable VM."],
      { time: "25–30 MIN" }
    ),
    "windows-registry-services": d(
      "Windows configuration, user/machine scope, and least privilege.",
      [["Configuration is part of the attack surface", "Registry keys can be scoped to a user or the machine, and their permissions control who can change settings. A service adds an executable path, startup policy, service account, and privilege set. A writable path or excessive service privilege can create a weakness even when the service code is ordinary."],
      ["Review changes as operational behavior", "Inventory a service or registry setting in a disposable VM. Record the owner, permissions, startup behavior, and expected change process. Test a baseline before applying it broadly; disabling a service without understanding its role can interrupt recovery or business workflows."]],
      ["A registry value's location alone does not tell you its effective security impact.", "Changing a production service without an approved plan can cause outages."],
      { question: "Which service properties matter in a defensive review?", answer: "Its executable path, write permissions, startup configuration, service identity, and granted privileges." },
      ["Create a service review checklist.", "Inspect one service's account and binary path in a lab VM.", "Record an intended configuration change and its rollback plan."],
      { time: "25–30 MIN" }
    ),
    "windows-etw": d(
      "Event providers, sessions, timestamps, and data handling.",
      [["ETW separates producers from collection", "Event Tracing for Windows lets providers emit structured events that sessions collect and consumers read. A provider's event schema, version, timestamp, and fields determine what an event means. Collection settings can filter or drop data, so an absent event does not prove an action never happened."],
      ["Design the observation before collecting", "State the question, choose a documented provider, collect only the needed event classes, and check whether events reach the consumer. Record time zone and clock context when correlating events. Trace files may contain paths, account names, and other sensitive data; store and share them accordingly."]],
      ["A trace is not complete ground truth; coverage and filters matter.", "Long or broad collection can capture sensitive data and create performance overhead."],
      { question: "What does the absence of an ETW event establish?", answer: "Only that the configured collection did not observe it; provider coverage and filters may explain the absence." },
      ["Plan a short trace for one file operation in your own program.", "Record provider, question, expected fields, duration, and storage plan.", "Compare the event stream with a known benign test action."],
      { time: "25–30 MIN" }
    ),
    "windows-tokens": d(
      "Windows identities, security descriptors, and access rights.",
      [["Access checks use a security context", "A Windows access token represents identity, group SIDs, integrity information, and enabled privileges. An object's security descriptor describes its owner and access rules. The requested right matters: read, write, execute, and administrative actions are distinct. A user account name alone does not fully describe the process's effective token."],
      ["Least privilege is an operational design", "Inspect the actual process token when diagnosing access. Avoid running elevated by default; grant the narrow right needed for the specific operation. Integrity level and privilege state can affect behavior in addition to group membership. Treat token and ACL inspection as read-only diagnostics unless a change is explicitly authorized."]],
      ["Administrator membership does not mean every process is elevated.", "A successful authentication does not imply authorization for every object or operation."],
      { question: "What determines whether a process can perform a protected operation?", answer: "The effective token, requested access right, and the object's security descriptor and access-check rules." },
      ["Compare a standard and elevated token in a test VM.", "Write an access matrix for two roles and three operations.", "Explain why an authenticated user may still receive access denied."],
      { time: "25–30 MIN" }
    ),
    "windows-debugging": d(
      "Reproducible builds, symbols, exceptions, and call stacks.",
      [["A debugger needs matching artifacts", "Symbols map addresses to functions, types, and source locations. A PDB must match the executable build; mismatched symbols can make a plausible call stack misleading. Optimized builds may inline functions or keep values in registers, so a source variable can be unavailable even when the machine code is correct."],
      ["Reproduce before changing code", "Record the exact executable, PDB, build flags, input, and environment. Break at the first relevant exception, inspect the call stack and ownership transitions, and reduce the input. Change one hypothesis at a time. A crash dialog is a symptom; the first invalid operation is often earlier in the trace."]],
      ["A source line in a stack does not prove that line caused the original corruption.", "Using symbols from another build can produce false variable and stack information."],
      { question: "Why must a PDB match the executable being debugged?", answer: "Symbols describe addresses and types for a specific build; mismatched artifacts can map code to incorrect names or lines." },
      ["Build a toy program with debug symbols and set a breakpoint.", "Record a minimal crash reproduction and first useful stack frame.", "Compare the same function in a debug and optimized build."],
      { time: "25–30 MIN" }
    ),
  });
})();
