---
name: "cc-engineering-principles"
description: >-
  Core software engineering principles reference: SOLID, DRY/KISS/YAGNI,
  Clean Code, design patterns catalogue, and code smell reference. Use when
  the user needs principle guidance, pattern selection, or code quality
  assessment.
user-invokable: false
---

# Engineering Principles

Reference knowledge for foundational software engineering principles,
design patterns, and code quality heuristics.

---

## SOLID Principles

| Principle                     | One-line definition                                                               |
| ----------------------------- | --------------------------------------------------------------------------------- |
| **S** — Single Responsibility | A class/module should have one reason to change.                                  |
| **O** — Open/Closed           | Open for extension, closed for modification.                                      |
| **L** — Liskov Substitution   | Subtypes must be substitutable for their base types without altering correctness. |
| **I** — Interface Segregation | Clients should not depend on interfaces they do not use.                          |
| **D** — Dependency Inversion  | Depend on abstractions, not concretions.                                          |

### Single Responsibility Principle (SRP)

**Violation pattern**: One class handles business logic, persistence,
and formatting.

```
// Violation
class UserService {
  validate(user) { ... }       // business rule
  saveToDatabase(user) { ... } // persistence
  formatForEmail(user) { ... } // presentation
}
```

**Fix**: Separate into `UserValidator`, `UserRepository`, `UserEmailFormatter`
— each owned by a different reason to change.

**Key question**: "If this responsibility changes, what else changes?" If
multiple unrelated things change together, SRP is violated.

### Open/Closed Principle (OCP)

**Violation pattern**: Adding a new case requires editing existing logic.

```
// Violation: every new shape forces an edit to area()
function area(shape) {
  if (shape.type === 'circle') return Math.PI * shape.r ** 2;
  if (shape.type === 'rect')   return shape.w * shape.h;
  // add triangle → edit this function
}
```

**Fix**: Polymorphism or strategy pattern — each shape owns its `area()`
calculation. New shapes extend without modifying existing code.

### Liskov Substitution Principle (LSP)

**Violation pattern**: A subclass weakens preconditions or strengthens
postconditions relative to the parent.

```
// Violation: Square is NOT a valid substitution for Rectangle
class Rectangle { setWidth(w); setHeight(h); area() → w*h }
class Square extends Rectangle {
  setWidth(w)  { super.setWidth(w); super.setHeight(w); } // surprise side effect
  setHeight(h) { super.setWidth(h); super.setHeight(h); }
}
```

**Fix**: Do not inherit when the substitution breaks caller assumptions.
Use composition or a shared interface instead.

### Interface Segregation Principle (ISP)

**Violation pattern**: An interface forces implementors to handle methods
they do not need.

```
// Violation: Printer is forced to implement scan() and fax()
interface Machine { print(); scan(); fax(); }
class SimplePrinter implements Machine {
  fax()  { throw new Error("Not supported"); } // forced
  scan() { throw new Error("Not supported"); } // forced
}
```

**Fix**: Split into `Printable`, `Scannable`, `Faxable`. Implement only
what the class actually does.

### Dependency Inversion Principle (DIP)

**Violation pattern**: High-level module directly instantiates low-level
dependencies.

```
// Violation: OrderService is hardwired to MySQLDatabase
class OrderService {
  constructor() { this.db = new MySQLDatabase(); } // concrete
}
```

**Fix**: Inject an abstraction (`Database` interface). `OrderService`
depends on the interface; the concrete `MySQLDatabase` satisfies it.
Enables testing with a mock database.

---

## Secondary Principles

### DRY — Don't Repeat Yourself

Every piece of knowledge should have a single, unambiguous representation
in the system. Duplication forces parallel changes that will eventually
diverge.

**Misapplication**: DRY does not mean "never write similar-looking code."
Two blocks of code may look the same but represent different concepts that
will evolve independently — premature DRY creates wrong abstractions.
Ask: "If this changes, would both copies always need to change?"

### KISS — Keep It Simple, Stupid

The simplest solution that correctly solves the problem is preferable to
a clever or general one. Complexity is debt — it accumulates interest in
maintenance, debugging, and onboarding time.

**Test**: Can a developer unfamiliar with this area understand it in under
5 minutes? If not, it is likely too complex.

### YAGNI — You Aren't Gonna Need It

Do not build features, abstractions, or generalisations for requirements
that do not yet exist. Speculative development produces dead code and
premature abstractions that constrain future design.

**Exception**: Foundational extensibility points that cost little now and
avoid a painful rewrite later are acceptable — but the bar for "little
cost" is high.

### Law of Demeter (Principle of Least Knowledge)

A method should only talk to: itself, its parameters, objects it creates,
and its direct component objects. Chain calls (`a.getB().getC().doThing()`)
signal structure knowledge leaking across layers.

**Fix pattern**: Add a method on the closest object that does the work,
hiding the chain.

---

## Clean Code Principles

### Naming

- Names should reveal intent. If a name requires a comment to explain it,
  rename it.
- Use domain language — `customer`, `invoice`, `shipment` — not
  `data`, `obj`, `temp`.
- Boolean names should read as assertions: `isValid`, `hasPermission`,
  `shouldRetry`.
- Functions: use verb phrases — `calculateTotal()`, `sendNotification()`.
- Avoid misleading names: `accountList` should be a `List`, not a map.
- Length scales with scope: short names (i, n) are acceptable in tiny
  scopes; longer names belong in wider scopes.

### Functions

- A function does one thing. If you cannot describe it in a single sentence
  without "and", it does too. many things.
- Target fewer than 20 lines. Functions longer than 40 lines are almost
  always doing too much.
- Limit parameters to three or fewer. More than three signals the function
  needs to be decomposed or the parameters should be grouped into an object.
- No flag arguments (`bool sendEmail`). Flags mean the function does two
  things; write two functions.
- Side effects must be obvious from the name or documented. Hidden side
  effects are one of the most common sources of bugs.

### Error Handling

- Errors are part of the interface. Handle them explicitly; do not let
  exceptions propagate silently.
- Do not ignore caught exceptions unless the silence is intentional and
  documented.
- Fail fast at system boundaries (user input, external APIs). Validate
  early, handle errors close to the source.
- Return types and exceptions should not both encode failure — pick one
  mechanism per function and be consistent.
- Do not use exceptions for control flow (e.g., catching a
  `RecordNotFoundException` to check if a record exists).

### Comments

- Comments should explain why, not what. What is visible from the code.
- Delete commented-out code. Version control preserves history.
- TODO comments are acceptable but must include a reference (issue number
  or owner) or they become permanent.
- The best comment is a better name or a smaller function.

---

## Design Patterns Catalogue

### Creational Patterns

| Pattern              | When to use                                                             |
| -------------------- | ----------------------------------------------------------------------- |
| **Factory Method**   | Subclasses decide which concrete class to instantiate                   |
| **Abstract Factory** | Create families of related objects without specifying concrete classes  |
| **Builder**          | Construct complex objects step-by-step; same process, different results |
| **Singleton**        | Exactly one instance needed (use sparingly; hinders testability)        |
| **Prototype**        | Clone existing objects rather than constructing from scratch            |

### Structural Patterns

| Pattern       | When to use                                                           |
| ------------- | --------------------------------------------------------------------- |
| **Adapter**   | Make incompatible interfaces work together                            |
| **Bridge**    | Separate abstraction from implementation so they vary independently   |
| **Composite** | Treat individual objects and compositions of objects uniformly (tree) |
| **Decorator** | Add behaviour to objects at runtime without subclassing               |
| **Facade**    | Provide a simplified interface to a complex subsystem                 |
| **Flyweight** | Share common state across many fine-grained objects to save memory    |
| **Proxy**     | Control access to another object (lazy load, access control, caching) |

### Behavioral Patterns

| Pattern                     | When to use                                                             |
| --------------------------- | ----------------------------------------------------------------------- |
| **Chain of Responsibility** | Pass a request along a chain of handlers until one handles it           |
| **Command**                 | Encapsulate a request as an object; supports undo, queuing, logging     |
| **Iterator**                | Access elements of a collection sequentially without exposing structure |
| **Mediator**                | Reduce direct dependencies between objects by routing via a central hub |
| **Memento**                 | Capture and restore an object's state without violating encapsulation   |
| **Observer**                | Notify dependents automatically when an object's state changes          |
| **State**                   | Let an object alter its behaviour when its internal state changes       |
| **Strategy**                | Define a family of algorithms; make them interchangeable at runtime     |
| **Template Method**         | Define the skeleton of an algorithm; subclasses fill in the steps       |
| **Visitor**                 | Add operations to objects without modifying their classes               |
| **Interpreter**             | Define a grammar and an interpreter for a simple language               |
| **Null Object**             | Avoid null checks by providing a default do-nothing object              |

**Pattern selection guide**:

- "I need to choose between algorithms at runtime" → **Strategy**
- "I need to notify multiple things when something changes" → **Observer**
- "I have a complex construction sequence" → **Builder**
- "I need to add behaviour without subclassing" → **Decorator**
- "I need to simplify a complex API" → **Facade**
- "I need to translate between interfaces" → **Adapter**
- "I need to support undo" → **Command** + **Memento**

---

## Code Smell Reference

| Smell                  | Signal                                                         | Direction                                           |
| ---------------------- | -------------------------------------------------------------- | --------------------------------------------------- |
| Long Method            | Function >40 lines or multiple levels of abstraction           | Extract Method                                      |
| Large Class            | Class with >10 fields or >20 methods                           | Extract Class / decompose by responsibility         |
| Long Parameter List    | >3–4 parameters                                                | Introduce Parameter Object or decompose             |
| Divergent Change       | One class changes for multiple unrelated reasons               | Split class per SRP                                 |
| Shotgun Surgery        | One change requires touching many classes                      | Move related behaviour to one place                 |
| Feature Envy           | Methods that use another class's data more than their own      | Move Method to the data it envies                   |
| Data Clumps            | Same group of fields always appear together                    | Extract into a named object                         |
| Primitive Obsession    | Using primitives for domain concepts (strings for IDs, emails) | Introduce domain types                              |
| Switch Statements      | Repeated switch/if-else on type                                | Polymorphism or Strategy                            |
| Parallel Inheritance   | Adding a subclass in one hierarchy forces one in another       | Merge hierarchies or use composition                |
| Lazy Class             | Class too small to justify existence                           | Inline Class                                        |
| Speculative Generality | Abstractions for requirements that do not exist                | Remove (YAGNI)                                      |
| Temporary Field        | Fields only set under some conditions; null otherwise          | Extract Class or Null Object                        |
| Message Chains         | `a.getB().getC().doThing()`                                    | Apply Law of Demeter; delegate through intermediary |
| Middle Man             | Class delegates almost all methods to another                  | Remove delegation layer; call the underlying object |
