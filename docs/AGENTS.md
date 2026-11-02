
# Engineering Guidelines

Prioritize correctness, maintainability, security and minimal changes.
Adapt decisions to the project's actual architecture, stack and conventions.

## 1. Understand Before Changing
- Read applicable AGENTS.md files and relevant project files.
- Identify the stack, existing patterns, entry points and available tests.
- Inspect only files relevant to the task.
- Prefer targeted searches over broad repository exploration.
- Distinguish verified facts from assumptions.

## 2. Scope and Requirements
- Follow the user's exact objective.
- Make the smallest change that solves the problem.
- Avoid unrelated refactoring, cleanup or dependency changes.
- Preserve existing behavior unless changing it is explicitly requested.
- Ask only when missing information could cause significant or irreversible mistakes.

## 3. Architecture and Code Quality
- Follow existing project conventions and architecture.
- Prefer simple, explicit and maintainable solutions.
- Reuse existing utilities, components and dependencies.
- Avoid unnecessary abstractions, layers, interfaces and design patterns.
- Keep responsibilities clear and dependencies explicit.
- Do not introduce complexity for hypothetical requirements.

## 4. Correctness and Compatibility
- Preserve APIs, business rules, data formats, permissions and integrations.
- Confirm suspected bugs before fixing them.
- Evaluate compatibility before changing schemas, persistence or public contracts.
- Protect existing data and user changes.
- Make migrations and destructive operations safe and reversible.

## 5. Security and Performance
- Protect credentials, personal data and sensitive information.
- Validate untrusted inputs and preserve security controls.
- Avoid unnecessary network calls, processing and resource consumption.
- Optimize based on relevant evidence, not speculation.
- Avoid unnecessary caching, concurrency and dependencies.

## 6. Implementation
- Make incremental, focused changes.
- Avoid modifying unrelated files.
- Keep types and error handling consistent with the project.
- Do not suppress relevant errors or introduce redundant checks.
- Update documentation only when behavior, configuration or usage changes.

## 7. Verification
- Run the most relevant tests and checks for modified code.
- Use existing project scripts and conventions.
- Avoid unrelated or unnecessarily expensive test suites.
- Never claim a test or command passed unless executed.
- Report verification limitations explicitly.

## 8. Tools and Efficiency
- Minimize unnecessary tool calls and repeated inspections.
- Do not read entire files when targeted sections are sufficient.
- Do not spawn subagents unless they provide clear value.
- Avoid repeated searches and duplicate verification.
- Prefer direct implementation over lengthy planning for simple tasks.
- Keep responses and summaries concise.

## 9. Communication
- Work autonomously on reversible, low-risk decisions.
- Ask before significant, ambiguous or irreversible changes.
- Report modified files, important decisions, tests and remaining issues.
- Do not claim completion without verification.

## Completion Criteria
- Requested requirements are met.
- Existing contracts are preserved or intentionally changed.
- Relevant verification is completed or limitations disclosed.
- No unnecessary collateral changes remain.
