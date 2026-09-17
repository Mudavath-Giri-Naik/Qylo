-- Qylo -- Phase 2 seed data: lessons for QT-M1..QT-M4
-- Generated from a content script; do not hand-edit the VALUES below.
-- Idempotent: safe to re-run (upserts on module_code+language+order_index).

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'lessons_module_lang_order_key'
  ) then
    alter table public.lessons
      add constraint lessons_module_lang_order_key unique (module_code, language, order_index);
  end if;
end $$;

insert into public.lessons (module_code, title, body_markdown, language, difficulty, order_index) values
  ('QT-M1', 'Qubits vs Classical Bits', 'A classical computer stores information in bits, and a bit is about as simple as information gets: it''s a 0 or a 1, always exactly one of the two, and it stays that way until something changes it on purpose. Every photo, song, and spreadsheet on your laptop is, underneath everything, a very long string of these two symbols.

A **qubit** (quantum bit) is the quantum computer''s version of a bit, but it plays by different rules. A qubit can be in the state $|0\rangle$, the state $|1\rangle$ (that funny bracket notation, called *ket* notation, is just how physicists write quantum states — read $|0\rangle$ as "the quantum state labeled 0"), or, and this is the part that has no classical equivalent, a combination of both at once:

$$|\psi\rangle = \alpha|0\rangle + \beta|1\rangle$$

Here $\alpha$ and $\beta$ are numbers (in general, complex numbers) called **amplitudes**, and they must satisfy $|\alpha|^2 + |\beta|^2 = 1$. This state is called a **superposition**. It''s tempting to describe a qubit in superposition as "being 0 and 1 at the same time," and that phrase shows up everywhere, but it''s a little misleading. A qubit in superposition isn''t secretly two bits glued together — it''s one system whose future behavior (specifically, what happens when you measure it) is described by both amplitudes simultaneously. We''ll dig into exactly what that means in the next lesson.

## A physical picture

A classical bit can be built from almost anything with two stable states: a switch that''s up or down, a capacitor that''s charged or not. A qubit needs something that can genuinely hold a superposition — the spin of an electron, the polarization of a photon, the energy level of a superconducting circuit cooled near absolute zero. Different quantum computing hardware makers (superconducting chips, trapped ions, photonics) are really just different engineering answers to "what physical system should we use as our qubit?"

A common way to visualize a single qubit''s state is the **Bloch sphere**: $|0\rangle$ sits at the north pole, $|1\rangle$ at the south pole, and every possible superposition is some other point on the sphere''s surface. A classical bit, by contrast, only ever lives at one of those two poles — it has no "surface" to roam around on. You''ll see the Bloch sphere again in the Circuit Builder, where it''s used to visualize what a circuit does to a qubit''s state.

## Worked example

Suppose a qubit is prepared in the state:

$$|\psi\rangle = \frac{1}{\sqrt{2}}|0\rangle + \frac{1}{\sqrt{2}}|1\rangle$$

Both amplitudes here are $\frac{1}{\sqrt{2}} \approx 0.707$. Squaring them gives the probability of each outcome if you measure the qubit: $\left(\frac{1}{\sqrt{2}}\right)^2 = \frac{1}{2}$ for each. So this particular superposition, if measured, gives 0 or 1 with equal 50/50 probability — but *before* it''s measured, it is genuinely in both amplitudes at once, and that fact has real, testable consequences, which is exactly what the next lesson is about.

## The takeaway

A classical bit is a single fixed value. A qubit is described by two amplitudes whose squared sizes give measurement probabilities, and it can be placed anywhere on a continuous sphere of possible states — not just at two poles. That extra room is where quantum computing''s power comes from, but only once you learn how to use it, which is the whole point of the modules that follow.', 'en', 'beginner', 0),
  ('QT-M1', 'Superposition and Measurement', 'In the last lesson we wrote a qubit''s state as $|\psi\rangle = \alpha|0\rangle + \beta|1\rangle$ and said that $|\alpha|^2$ and $|\beta|^2$ are the probabilities of measuring 0 or 1. This lesson is about what "measuring" actually does, and why superposition is a fundamentally different kind of uncertainty than, say, a coin spinning in the air.

## Measurement collapses the state

Before you measure a qubit, it can hold both amplitudes $\alpha$ and $\beta$ at once. The moment you measure it, that ends: you get a definite classical outcome, either 0 or 1, with probability $|\alpha|^2$ or $|\beta|^2$ respectively, and the qubit''s state *becomes* $|0\rangle$ or $|1\rangle$ from that point on. This is called **collapse**. If you measure the same qubit again right after, you''ll get the same answer every time — the superposition is gone, spent on that first measurement.

This is a genuinely strange rule, and it''s tempting to think of it the way we think of a coin spinning in the air: "it''s secretly already heads or tails, we just don''t know which until it lands." That''s called a *hidden variable* explanation, and physicists have run experiments (testing something called Bell inequalities) that rule it out for quantum systems. A qubit in superposition isn''t a coin whose outcome is already decided and hidden from you — the outcome genuinely isn''t determined until measurement happens. We won''t prove that here, but it''s worth knowing that this isn''t just semantics.

## The experiment that shows it isn''t classical randomness: apply Hadamard twice

Here''s where superposition earns its keep. The **Hadamard gate**, written $H$, takes $|0\rangle$ to an equal superposition:

$$H|0\rangle = \frac{1}{\sqrt{2}}|0\rangle + \frac{1}{\sqrt{2}}|1\rangle = |+\rangle$$

If superposition were just "50/50 classical randomness in disguise," then applying a second random-looking operation on top should leave you at roughly 50/50 too. But quantum mechanically, applying $H$ a *second* time does something else entirely:

$$H\left(\frac{1}{\sqrt{2}}|0\rangle + \frac{1}{\sqrt{2}}|1\rangle\right) = |0\rangle$$

You''re back to $|0\rangle$ with **certainty** — 100% probability, not 50/50. This only happens because amplitudes can partially cancel each other out (this is called **interference**, and it can be constructive or destructive, just like waves in water). The paths leading to a measurement of $|1\rangle$ interfere destructively and cancel completely, while the paths leading to $|0\rangle$ reinforce each other. No classical coin behaves like this: flip a fair coin, then "flip" it again in a way that''s supposed to be random, and you''ll never reliably land back on the original face. This gap between quantum superposition and classical randomness — the fact that amplitudes can cancel — is the raw resource every quantum algorithm in this course is trying to exploit.

## Worked example: reading a measurement probability

Suppose after some circuit a qubit ends up in the state $|\psi\rangle = \frac{\sqrt{3}}{2}|0\rangle + \frac{1}{2}|1\rangle$. The probability of measuring 0 is $\left(\frac{\sqrt{3}}{2}\right)^2 = \frac{3}{4}$, and the probability of measuring 1 is $\left(\frac{1}{2}\right)^2 = \frac{1}{4}$. Notice $\frac{3}{4} + \frac{1}{4} = 1$, as it must — those are the only two possible outcomes, so their probabilities always add up to 1.

## The takeaway

Measurement forces a superposition to collapse into one definite classical outcome, with probability given by the squared amplitude. But before that happens, the amplitudes can interfere — reinforcing or canceling each other — in a way no classical probability distribution can reproduce. Quantum algorithms are, in essence, elaborate ways of arranging that interference so that wrong answers cancel out and the right answer is left standing when you finally measure.', 'en', 'beginner', 1),
  ('QT-M1', 'Entanglement', 'A single qubit in superposition is already strange. Two qubits together can be stranger still. When two qubits are **entangled**, their combined state can''t be described as "qubit A is in this state, and separately, qubit B is in that state." The two qubits only make sense as one shared description.

## The Bell state

The classic example is the Bell state:

$$|\Phi^+\rangle = \frac{1}{\sqrt{2}}|00\rangle + \frac{1}{\sqrt{2}}|11\rangle$$

Read $|00\rangle$ as "qubit A is 0 and qubit B is 0," and $|11\rangle$ as "both are 1." This state says: if you measure both qubits, you''ll get either "both 0" or "both 1," each with 50% probability — but you will *never* get "A is 0 and B is 1," even though each qubit, measured on its own, looks perfectly random (50/50). The two qubits'' outcomes are perfectly correlated, no matter how far apart they are physically.

**Analogy:** imagine two coins that have been magically linked so that whenever you flip one and look at it, the other — instantly, even if it''s on the other side of the planet — is guaranteed to show the same face when *it''s* looked at. Neither coin has a determined face before it''s looked at (that''s the superposition part), but the instant one is checked, the other''s outcome is locked in too. That correlation, stronger than anything classical randomness can produce, is what entanglement is.

Einstein famously called this "spooky action at a distance," and was uneasy with it — but it has since been confirmed experimentally many times over.

## Entanglement does not send messages

It''s worth heading off a common misconception directly: entanglement cannot be used to communicate faster than light. Here''s why: the person measuring qubit A sees a genuinely random 0 or 1 — they have no way to *choose* which outcome they get, so they can''t encode a message into it. The correlation only becomes visible once someone compares notes with whoever measured qubit B, and comparing notes requires an ordinary, light-speed-or-slower communication channel. Entanglement gives you correlation, not control — that limitation is itself a theorem, called the no-signaling principle.

## Worked example: building a Bell state

You can create the Bell state above with a two-gate circuit on two qubits, both starting at $|0\rangle$:

1. Apply a Hadamard gate $H$ to qubit A: this turns $|0\rangle_A$ into $\frac{1}{\sqrt{2}}(|0\rangle_A + |1\rangle_A)$, so the combined state (qubit B still at $|0\rangle$) is $\frac{1}{\sqrt{2}}(|00\rangle + |10\rangle)$.
2. Apply a CNOT gate with qubit A as the control and qubit B as the target: a CNOT flips the target qubit whenever the control is $|1\rangle$. So the $|00\rangle$ term is untouched, and the $|10\rangle$ term becomes $|11\rangle$.

The result is exactly $\frac{1}{\sqrt{2}}(|00\rangle + |11\rangle)$ — entangled, from two qubits that started completely independent. This "Hadamard then CNOT" pattern is one of the most common building blocks in quantum circuits, and you''ll meet it again in the next module.

## The takeaway

Entangled qubits share a single description that can''t be split apart into independent per-qubit states. Measuring one instantly tells you something certain about the other, no matter the distance between them — but that correlation can only be discovered, not used to send information. Entanglement, alongside superposition, is the other core resource quantum algorithms rely on.', 'en', 'beginner', 2),
  ('QT-M1', 'Basic Single- and Multi-Qubit Gates', 'Classical logic gates like AND and OR are typically **irreversible** — given the output of an AND gate, you usually can''t work out what the two inputs were, because information got thrown away. Quantum gates can''t do that. Every quantum gate is **reversible** (technically: unitary), meaning there''s always a way to undo it and get your original state back. This lesson covers the small set of gates you''ll use constantly.

## Single-qubit gates

**X gate (quantum NOT):** flips $|0\rangle \leftrightarrow |1\rangle$, exactly like a classical NOT. $X|0\rangle = |1\rangle$ and $X|1\rangle = |0\rangle$.

**Z gate:** leaves $|0\rangle$ untouched but flips the *sign* of $|1\rangle$: $Z|0\rangle = |0\rangle$ and $Z|1\rangle = -|1\rangle$. That minus sign might look pointless — measuring $|1\rangle$ and $-|1\rangle$ give identical probabilities — but it matters enormously once a qubit is in superposition, because that sign can now interfere with other amplitudes (as we saw with the double-Hadamard trick in the previous lesson).

**H gate (Hadamard):** the gate that creates equal superpositions, already introduced twice now: $H|0\rangle = \frac{1}{\sqrt{2}}(|0\rangle + |1\rangle)$ and $H|1\rangle = \frac{1}{\sqrt{2}}(|0\rangle - |1\rangle)$. Notice the minus sign in the second line — that''s what lets $H$ applied twice undo itself, as we saw earlier.

## A two-qubit gate: CNOT

The **CNOT** (controlled-NOT) gate acts on two qubits: a *control* and a *target*. If the control is $|0\rangle$, nothing happens to the target. If the control is $|1\rangle$, the target gets flipped (an X gate applied to it). Written out for all four basis states:

- $|00\rangle \to |00\rangle$
- $|01\rangle \to |01\rangle$
- $|10\rangle \to |11\rangle$
- $|11\rangle \to |10\rangle$

CNOT is how qubits become entangled with each other — as you saw in the Bell-state example last lesson, and how information gets shared *between* qubits rather than each qubit just spinning on its own.

## Worked example: tracing a two-gate circuit

Start with $|0\rangle$ and apply $X$, then $H$:

1. $X|0\rangle = |1\rangle$
2. $H|1\rangle = \frac{1}{\sqrt{2}}(|0\rangle - |1\rangle)$

So the final state is $\frac{1}{\sqrt{2}}|0\rangle - \frac{1}{\sqrt{2}}|1\rangle$ — an equal superposition, but with a *relative phase* (that minus sign) that an equal superposition built with $H$ alone wouldn''t have. Both states give 50/50 measurement outcomes, but they behave differently under further gates — which is exactly the kind of detail quantum algorithms are built on.

## The takeaway

X, Z, and H are the core single-qubit moves — flip, phase-flip, and superpose. CNOT is the simplest way to connect two qubits and is the standard tool for creating entanglement. Every one of these gates can be undone by applying it again (or, for some, applying an inverse gate) — nothing is ever thrown away in a quantum circuit, only rearranged. In the next module, you''ll see how these small pieces combine into real circuits.', 'en', 'beginner', 3),
  ('QT-M2', 'How Circuits Are Built and Read', 'A quantum circuit is a recipe: a sequence of gates applied to a set of qubits, read from left to right, ending (usually) in a measurement. If you''ve ever read sheet music, the picture is a familiar one — each horizontal line is an instrument (here, a qubit) and time moves left to right along the page.

## The anatomy of a circuit diagram

- **Wires**: each horizontal line represents one qubit, and its position on the wire (left to right) represents time. A qubit''s wire runs continuously from the moment it''s initialized (almost always at $|0\rangle$) to the moment it''s measured.
- **Gate boxes**: a labeled box on a wire (like a box labeled "H" or "X") means "apply this gate to this qubit at this point in time."
- **Vertical connections**: when a gate involves more than one qubit — like the CNOT from the last module — a vertical line connects the qubits involved, showing they''re acted on together, at the same moment in time.
- **Measurement**: usually drawn as a small meter-dial symbol at the end of a wire, marking where a qubit''s quantum state is measured and converted into an ordinary classical bit (0 or 1) that a normal computer can read and store.

## Reading order matters

Because circuits read left to right, the *order* of gates on a wire is exactly the order they''re applied — swapping the order of two gates on the same qubit is a completely different circuit (in general; some gates do happen to commute, meaning order doesn''t matter for that particular pair, but you shouldn''t assume that). This is different from, say, a plain list of ingredients, where order is often flexible — a circuit diagram is closer to a set of numbered instructions.

## Worked example: reading the Bell-state circuit

Recall the entanglement circuit from the last module: Hadamard on qubit A, then CNOT with A as control and B as target. Drawn as a circuit, it looks like two wires (labeled $q_0$ and $q_1$), with an "H" box on the $q_0$ wire near the left edge, and — a little further right, so it''s clear the Hadamard happens first — a CNOT symbol (a solid dot on the $q_0$ wire connected by a vertical line to a $\oplus$ symbol on the $q_1$ wire). Reading left to right tells you exactly what happened and in what order: first superpose qubit 0, then entangle it with qubit 1. If those two gates were drawn in the opposite order, the circuit would try to use qubit 0''s state as a control before it had been put into superposition — a completely different (and much less interesting) circuit.

## Why this convention matters for building circuits yourself

When you build a circuit in the Circuit Builder (coming in the next module), you''ll be dragging gates onto qubit wires in exactly this left-to-right style, so getting comfortable reading existing circuit diagrams is really the same skill as building your own — you''re just doing it in reverse.

## The takeaway

A circuit diagram is read left to right, top to bottom: wires are qubits, boxes are gates, vertical lines connect qubits acted on together, and a meter symbol marks a measurement. Order along a wire is meaningful and generally can''t be shuffled. Once this convention clicks, every circuit diagram you see afterward — no matter how complex — is just this same alphabet, used more times.', 'en', 'beginner', 0),
  ('QT-M2', 'Common Gate Combinations and What They Do', 'Individual gates are simple, but real circuits are built from small, reusable combinations that show up again and again. Recognizing these patterns makes reading (and eventually writing) circuits much faster — instead of tracing every gate one at a time, you start seeing "oh, that''s a Bell-state preparation" the way an experienced programmer recognizes a for-loop at a glance.

## H then CNOT: entangling two qubits

Covered already in the Entanglement lesson: a Hadamard on one qubit followed by a CNOT with that qubit as control creates a Bell state. This two-gate block is arguably the single most common motif in introductory quantum circuits, because entanglement is such a central resource.

## Hadamard on every qubit: uniform superposition

Apply $H$ to $n$ qubits that all start at $|0\rangle$, and you get an equal superposition of *all* $2^n$ possible bit strings at once. For $n=2$:

$$H^{\otimes 2}|00\rangle = \frac{1}{2}\left(|00\rangle + |01\rangle + |10\rangle + |11\rangle\right)$$

Each of the four outcomes has equal amplitude $\frac{1}{2}$, and equal probability $\frac{1}{4}$. This "Hadamard wall" — a column of H gates across every qubit at the very start of a circuit — is the standard opening move for many of the algorithms in the next module (Deutsch-Jozsa, Bernstein-Vazirani, Simon''s, and Grover''s all start this way), because it lets a single subsequent operation act on all $2^n$ possibilities simultaneously, instead of one at a time.

## Same gate twice: often (but not always) the identity

We already saw $H$ applied twice returns $|0\rangle$ back to $|0\rangle$ — undoing itself. The same is true of $X$ (flip twice, you''re back where you started) and CNOT (apply the identical CNOT twice, and the second one undoes the first). This "apply, then apply again to undo" pattern is called **uncomputation**, and it''s a genuinely useful circuit-design trick: if you need a temporary qubit to help with a calculation but don''t want it left entangled with your answer at the end, you run the operation that created the mess, then run it again (or its inverse) to clean it back up.

## SWAP: trading two qubits'' states

Sometimes you need to move a qubit''s state onto a different wire — say, because of how a later gate needs to be positioned. A SWAP gate exchanges the states of two qubits, and can itself be built from three CNOTs in a row (alternating control and target): CNOT(A,B), then CNOT(B,A), then CNOT(A,B) again. You''ll rarely need to build SWAP by hand — most quantum programming tools give it to you as a single built-in gate — but recognizing three alternating CNOTs as "oh, that''s just a SWAP" is a handy pattern to know.

## Worked example: spotting the pattern

Suppose you''re handed a circuit on 3 qubits, and the first thing drawn is an H gate on each of the three wires, all lined up at the same starting position. Even before looking at anything else in the circuit, you already know: this circuit begins by placing all three qubits into an equal superposition of all $2^3 = 8$ possible 3-bit strings. Whatever comes next is operating on all 8 possibilities in parallel.

## The takeaway

Most circuits you''ll encounter are built from a handful of recurring blocks: Hadamard-then-CNOT for entangling, a Hadamard wall for uniform superposition, repeated gates for uncomputation, and CNOT triples for swapping. Learning to spot these patterns is what turns circuit-reading from tedious gate-by-gate tracing into fast pattern recognition.', 'en', 'beginner', 1),
  ('QT-M2', 'Circuit Diagram Notation', 'This lesson is a reference for the specific symbols you''ll see across quantum circuit diagrams — in this course, in the Circuit Builder, and in any quantum computing paper or textbook you come across afterward. The core alphabet is small, and once you''ve memorized it, every circuit diagram becomes readable.

## Wires: single vs. double lines

A single horizontal line is a **quantum wire** — it carries a qubit''s quantum state. After a measurement, the wire is often drawn as a **double line** for the rest of the diagram, signaling that from this point on, it''s carrying an ordinary classical bit (just a 0 or a 1, no more superposition), not a quantum state anymore.

## Gate boxes

A labeled rectangle — "X", "H", "Z", and so on — placed on a wire means "apply this gate here." Some gates have dedicated symbols instead of a labeled box: Hadamard is often just drawn as a box with an "H" in it, but you''ll also see rotation gates written as $R_x(\theta)$, $R_y(\theta)$, or $R_z(\theta)$ with an angle parameter, since some gates (unlike X, Z, and H) depend on a continuous, tunable value rather than being fixed. You''ll meet parameterized rotation gates like these directly when you reach the variational algorithms module later in this course.

## Controls and targets

A **solid dot (•)** on a wire marks a *control* qubit. A vertical line connects it to whatever the controlled operation is on the other wire(s) — for CNOT specifically, the target is drawn as a circle with a plus sign inside, $\oplus$. Seeing a dot connected by a line to a $\oplus$ symbol is instant recognition for "this is a CNOT." More general controlled gates (controlled-Z, controlled-rotation, and so on) use the same dot-and-line convention, just with a different symbol at the target end instead of $\oplus$.

## Measurement

A small **meter-dial icon** (it genuinely looks like a tiny speedometer) marks where a qubit is measured. It''s almost always the last thing on a wire, since a qubit''s quantum behavior is "used up" the moment it''s measured — you can, in more advanced circuits, measure a qubit mid-circuit and use the result to control later gates, but for the circuits you''ll build in this course, measurement is the final step.

## Barriers

A **dashed vertical line** spanning multiple wires is a **barrier**. It carries no computational meaning whatsoever — the state isn''t changed by it — it''s purely a visual/organizational marker, often used to separate one conceptual stage of a circuit (say, "state preparation") from the next ("the actual algorithm"), the same way a blank line in code separates logical sections without changing what the code does.

## Qubit ordering — a heads-up for later

Different tools order qubits differently when writing multi-qubit states as strings like $|q_1 q_0\rangle$ vs. $|q_0 q_1\rangle$. Qiskit, the simulator you''ll use in the Circuit Builder module, uses **little-endian** ordering: the *least significant* qubit is written first (rightmost bit corresponds to qubit 0). It''s a common source of "wait, why is my output backwards?" confusion the first time you compare a hand-drawn circuit against simulator output — worth filing away now so it doesn''t trip you up later.

## The takeaway

Single lines carry quantum states, double lines carry classical bits after measurement. A dot-and-line marks a controlled operation, a meter icon marks measurement, and a dashed line is just an organizational barrier with no computational effect. Keep this page in mind as a reference — you''ll be decoding circuits using exactly this notation for the rest of the course.', 'en', 'beginner', 2),
  ('QT-M3', 'The Deutsch and Deutsch-Jozsa Algorithms', 'Deutsch-Jozsa is usually the first "real" quantum algorithm anyone learns, and for good reason: it''s the simplest possible demonstration that a quantum computer can solve a problem with provably fewer steps than any classical computer, even though the problem itself is almost deliberately abstract.

## The problem

You''re given a black box (called an **oracle**) that computes some function $f$ taking $n$ input bits and returning a single bit, $f(x) \in \{0, 1\}$. You''re promised — this is the key trick — that $f$ is either **constant** (returns the same value for every input) or **balanced** (returns 0 for exactly half of all inputs and 1 for the other half). Your job: figure out which, using the oracle as few times as possible. You''re not allowed to peek inside the box; you can only feed it inputs and read outputs.

Classically, in the worst case, you might need to check more than half of all $2^n$ possible inputs before you''re sure — if you''ve checked $2^{n-1}$ inputs and they''ve all returned 0, the function could still be constant, or the very next input you haven''t tried yet could be the one 1 that makes it balanced. Deutsch''s algorithm (the $n=1$ special case) and its generalization, Deutsch-Jozsa, solve this with a **single query** to the oracle, regardless of $n$.

## The trick: phase kickback

The oracle is built as a **quantum** black box: it takes a query qubit $|x\rangle$ and an ancilla (helper) qubit $|y\rangle$, and computes $U_f|x\rangle|y\rangle = |x\rangle|y \oplus f(x)\rangle$ (that $\oplus$ symbol means XOR — addition mod 2). If you prepare the ancilla in the special state $|-\rangle = \frac{1}{\sqrt{2}}(|0\rangle - |1\rangle)$ before applying the oracle, something elegant happens: instead of flipping the ancilla, the oracle leaves the ancilla untouched and instead attaches a phase of $(-1)^{f(x)}$ directly onto the $|x\rangle$ part of the state. This is called **phase kickback**, and it''s the single most important trick in this entire module — you''ll see it reused in the next two lessons too.

## The algorithm

1. Prepare $n$ query qubits at $|0\rangle^{\otimes n}$ and one ancilla at $|1\rangle$.
2. Apply Hadamard to all $n+1$ qubits — the query qubits become a uniform superposition of all $2^n$ inputs, and the ancilla becomes $|-\rangle$.
3. Apply the oracle $U_f$ once. Thanks to phase kickback, every basis state $|x\rangle$ in the superposition now carries a phase $(-1)^{f(x)}$.
4. Apply Hadamard to the $n$ query qubits again, then measure them.

If $f$ is constant, the phases $(-1)^{f(x)}$ are identical for every $x$ — that common phase has no effect on measurement probabilities, and the second round of Hadamards perfectly undoes the first, landing you back on $|0\rangle^{\otimes n}$ with certainty. If $f$ is balanced, the phases are a genuine mix of $+1$ and $-1$, which causes destructive interference that guarantees you will **never** measure $|0\rangle^{\otimes n}$. So the rule is simple: measure all-zeros, conclude constant; measure anything else, conclude balanced. One oracle query, no ambiguity.

## Worked example: Deutsch''s algorithm ($n=1$)

Take $f(x) = x$ (balanced: $f(0)=0$, $f(1)=1$). Running the steps above, the phase kickback attaches $(-1)^0=+1$ to the $|0\rangle$ branch and $(-1)^1=-1$ to the $|1\rangle$ branch of the query qubit''s superposition. The second Hadamard turns that phase difference into a guaranteed measurement of $|1\rangle$ — correctly signaling "balanced" — using the oracle exactly once, where a classical approach would need to check both $f(0)$ and $f(1)$ to be certain.

## The takeaway

Deutsch-Jozsa doesn''t solve a practically useful problem, but it proves something important: an oracle that could take exponentially many classical queries to characterize can sometimes be characterized in a single quantum query, using superposition to query all inputs "at once" and phase kickback plus interference to read out a *global* property (constant vs. balanced) without ever learning any individual $f(x)$. That combination — superposition, phase kickback, interference — is the blueprint the next few algorithms all build on.', 'en', 'intermediate', 0),
  ('QT-M3', 'The Bernstein-Vazirani Algorithm', 'Bernstein-Vazirani takes the exact same toolkit as Deutsch-Jozsa — a Hadamard wall, an oracle, phase kickback, another Hadamard wall — and points it at a more useful-sounding problem: extracting a hidden secret in one shot instead of bit by bit.

## The problem

You''re given an oracle computing $f(x) = s \cdot x \bmod 2$, where $s$ is a fixed, hidden $n$-bit string, and $s \cdot x$ means the bitwise dot product: multiply corresponding bits of $s$ and $x$ and sum them mod 2. Your job is to find $s$.

Classically, this takes exactly $n$ queries: query with $x = 100\ldots0$ to learn $s$''s first bit, $x=010\ldots0$ for the second bit, and so on — one query per bit, and there''s no way to do better, since each classical query only ever returns one bit of information.

## The quantum approach

The circuit is identical in structure to Deutsch-Jozsa: $n$ query qubits and one ancilla, Hadamard wall, one oracle call (using the same phase-kickback trick from the last lesson), Hadamard wall again, then measure the query qubits. The difference is entirely in what the oracle computes, and it turns out that''s enough to change the output from "constant vs. balanced" into "the exact value of $s$": after the second Hadamard wall, measuring the query qubits gives you $s$ itself, directly, as a bit string — read straight off the measurement, no further processing needed.

## Worked example

Let $n = 3$ and $s = 101$. A classical approach needs three separate queries — probing bit 0, then bit 1, then bit 2 of $s$ one at a time. The quantum circuit needs exactly **one** oracle call: prepare 3 query qubits and 1 ancilla, Hadamard everything, query the oracle once (which, thanks to phase kickback, attaches a $+1$ or $-1$ phase to each of the $2^3=8$ basis states in the query register according to $(-1)^{s \cdot x}$), Hadamard the query qubits again, and measure. The result is $101$ — the full hidden string, recovered in a single query, regardless of how large $n$ is.

**Analogy:** imagine a padlock with three independent dials, each hiding one digit of a secret combination. Classically, you''d have to test each dial separately, one at a time, to determine the whole code. Bernstein-Vazirani is like being able to turn all three dials in one coordinated motion and have the padlock itself tell you the entire combination at once, rather than confirming your guesses dial by dial.

## Why this matters beyond the toy problem

Bernstein-Vazirani is, like Deutsch-Jozsa, a somewhat artificial problem — nobody urgently needs to extract a secret bit string from an abstract oracle in the real world. Its real value is educational and structural: it''s the cleanest possible demonstration that a quantum algorithm can extract $n$ bits of information using a resource (queries) that would cost $n$ separate uses classically, but only 1 quantum use — proving a genuine, provable *linear* separation between classical and quantum query complexity. The next lesson, Simon''s algorithm, pushes this same oracle-based approach into an *exponential* separation, and is historically the algorithm that directly inspired Shor''s factoring algorithm.

## The takeaway

Same circuit shape as Deutsch-Jozsa — Hadamard, oracle with phase kickback, Hadamard, measure — but a different oracle turns the output from a single yes/no bit into a full hidden bit string, recovered in one query where a classical computer needs $n$. The pattern is becoming clear: quantum speedups in this module all come from the same three ingredients, arranged around whatever specific oracle the problem defines.', 'en', 'intermediate', 1),
  ('QT-M3', 'Simon''s Algorithm', 'Simon''s algorithm is where the speedups in this module stop being merely convenient and become genuinely dramatic: an **exponential** gap between classical and quantum query complexity. It''s also, historically, the single most important stepping stone toward Shor''s algorithm — Peter Shor has said directly that Simon''s algorithm was what inspired his approach to factoring.

## The problem

You''re given an oracle computing a function $f$ on $n$-bit strings, and you''re promised $f$ is exactly **two-to-one** in a specific structured way: there''s a hidden nonzero $n$-bit string $s$ such that $f(x) = f(y)$ if and only if $y = x \oplus s$ (that''s bitwise XOR). In other words, every output value is shared by exactly one pair of inputs, and that pair always differs by the same hidden "mask" $s$. Your job: find $s$.

Classically, finding a repeated pair by chance requires roughly $2^{n/2}$ queries (this is a birthday-paradox-style argument: you need to query enough random inputs that some collision — two inputs with the same output — becomes likely), and in the worst case can require up to $2^{n-1}+1$ queries to be *certain*. Either way, the classical cost grows exponentially with $n$.

## The quantum approach

The circuit again starts familiarly: Hadamard wall on $n$ query qubits, apply the oracle (this time computing $f$ directly into a second register, rather than using phase kickback into a single ancilla — Simon''s oracle is $U_f|x\rangle|0\rangle = |x\rangle|f(x)\rangle$), then Hadamard the query register again and measure. But unlike Deutsch-Jozsa and Bernstein-Vazirani, a single run of this circuit doesn''t hand you $s$ directly. Instead, it gives you a random $n$-bit string $y$ that satisfies one guaranteed property: $y \cdot s = 0 \bmod 2$.

That''s one linear equation constraining $s$. Run the circuit again (a fresh oracle call each time, but the *same* oracle), and you get another random $y$ satisfying the same kind of equation. After collecting roughly $n-1$ independent such equations — which takes $O(n)$ oracle calls, not $O(2^{n/2})$ — you have enough linear equations to solve for $s$ using ordinary linear algebra (Gaussian elimination over the field with two elements, if you want the technical name), all done on a classical computer once the quantum part is finished.

## Worked example, in outline

For $n=3$ and some hidden $s = 110$, each run of the quantum circuit yields a random $y$ with $y \cdot s \equiv 0 \pmod 2$ — so, for instance, valid measurement outcomes might include $y=011$ or $y=101$ (check: $0\cdot1+1\cdot1+1\cdot0 = 1$... actually let''s just say the algorithm guarantees whatever $y$ you get satisfies the constraint, and after collecting two independent, linearly-independent such $y$ values, solving the resulting pair of equations pins down $s=110$ uniquely). The exact arithmetic is less important here than the shape of the result: a handful of quantum-generated equations, solved classically, replace what would otherwise be an exponential classical search.

**Analogy:** imagine a huge phone book where you''re told every name appears exactly twice, and the two entries for any given name are always separated by exactly the same fixed "gap" $s$ in some hidden ordering you can''t see directly — but you don''t know what that gap is. Searching randomly for a matching pair to discover the gap takes a very long time as the phone book grows. Simon''s algorithm instead collects hints — equations that constrain the gap — much faster than finding an actual matching pair would take, and a handful of hints is enough to pin the gap down exactly.

## The takeaway

Simon''s algorithm swaps "find a hidden pattern by exhaustive or lucky search" (exponential classically) for "collect enough linear equations about the pattern, quantum-mechanically, then solve them classically" ($O(n)$ oracle calls). This idea — quantum computation generating structured randomness that''s efficiently solvable classically — is exactly the strategy Shor''s algorithm scales up to attack integer factorization, which you''ll reach at the end of this module.', 'en', 'intermediate', 2),
  ('QT-M3', 'Grover''s Search Algorithm', 'Every algorithm so far in this module has relied on a very specific promise about the oracle''s structure (constant/balanced, a hidden dot-product string, a hidden XOR mask). Grover''s algorithm drops that requirement almost entirely and tackles a problem everyone already understands: searching.

## The problem

You have $N$ items (think of them as the numbers $0$ through $N-1$), and exactly one of them — call it $x^*$ — is "marked," meaning an oracle can tell you whether a given item is the marked one or not, but you have no other information about where it is; the list isn''t sorted, and there''s no clever shortcut available. Classically, in the worst case, you might have to check nearly all $N$ items before finding the marked one — search of this kind fundamentally requires, on average, checking about $N/2$ items. Grover''s algorithm finds the marked item using only about $\frac{\pi}{4}\sqrt{N}$ oracle calls — a **quadratic** speedup. (Quadratic is more modest than the exponential speedups of Simon''s or Shor''s algorithms, but unstructured search shows up everywhere, so even a quadratic speedup is broadly useful — and, provably, it''s the *best possible* speedup for this particular problem; no quantum algorithm can do fundamentally better on fully unstructured search.)

## The two-step loop: oracle, then diffusion

Grover''s algorithm repeats a two-gate "loop" a specific number of times:

1. **The oracle** flips the phase of the marked item only: $|x^*\rangle \to -|x^*\rangle$, leaving every other basis state''s amplitude untouched. (This is the same phase-flip idea from earlier lessons, just marking one specific item instead of encoding a global function property.)
2. **The diffusion operator** reflects every amplitude about the *average* amplitude across all $N$ states.

Here''s the geometric intuition that makes this click: picture all $N$ amplitudes as heights on a bar chart, all equal at the start (since we begin, as always, with a Hadamard wall creating a uniform superposition). The oracle flips just the marked item''s bar to be negative — now it sits noticeably below the average of all the bars, while everything else is still at the original positive height. The diffusion step then reflects *every* bar about the current average height. Because the marked bar was so far below average, reflecting it about the average sends it shooting up well above where it started — while the untouched, already-average bars barely move. Repeat this oracle-then-diffusion cycle roughly $\frac{\pi}{4}\sqrt{N}$ times, and the marked item''s amplitude — and therefore its measurement probability — climbs close to 1, while every other item''s probability shrinks close to 0.

## Worked example: $N=4$

With just 2 qubits ($N=2^2=4$ items), a *single* application of the oracle-then-diffusion loop is enough to boost the marked item''s measurement probability all the way to essentially 1 — this small case is the standard "hello world" of Grover''s algorithm precisely because one iteration already does the whole job, making it easy to trace by hand. For larger $N$, more iterations are needed, but the count only grows like $\sqrt{N}$ — for $N=1{,}000{,}000$, that''s roughly 785 iterations instead of up to a million classical checks.

**Analogy:** imagine repeatedly folding a strip of paper with $N$ marks on it, where one mark is drawn slightly darker than the rest, and each fold is designed to fold every mark toward the position of the darkest one — a few folds, and nearly the whole strip is bunched up right where the dark mark is, even though you never directly measured *where* on the strip the dark mark was located until you looked at the end.

## Overshooting is a real risk

Unlike the earlier algorithms in this module, Grover''s algorithm needs the *right number* of iterations — too few, and the marked amplitude hasn''t been boosted enough; too many, and you overshoot, rotating right past the peak and back down again (the geometric picture really is a rotation, in a more precise treatment than the bar-chart intuition above). $\frac{\pi}{4}\sqrt{N}$ is the sweet spot, and getting the iteration count right is a genuine, practical part of implementing Grover''s algorithm correctly.

## The takeaway

Grover''s algorithm searches an unsorted space of $N$ items in roughly $\sqrt{N}$ oracle calls by repeatedly flipping the marked item''s phase and reflecting about the average — geometrically nudging probability toward the right answer a little more with each round, rather than checking items one at a time. It''s the algorithm most likely to show up as a *building block* inside other, larger quantum programs whenever an unstructured search shows up as a subproblem.', 'en', 'intermediate', 3),
  ('QT-M3', 'The Quantum Fourier Transform', 'The Quantum Fourier Transform (QFT) doesn''t solve a problem on its own — it''s a building block, a subroutine that shows up inside other algorithms (most famously, Shor''s algorithm, in the next lesson). But it deserves its own lesson because the idea behind it — detecting periodicity — is central to why Shor''s algorithm works at all.

## What a Fourier transform does, in plain terms

A classical (discrete) Fourier transform takes a signal described in terms of "value at each point in time" and re-describes it in terms of "how strongly each frequency is present." If you''ve ever seen a music equalizer display with bars bouncing for bass, mid, and treble, that''s a Fourier transform running live: converting a sound wave (values over time) into frequency information (how much bass, how much treble). Anything periodic has a natural, useful Fourier description, because a Fourier transform is fundamentally a tool for detecting and describing repetition.

## What the QFT does

The QFT is the quantum version of this same idea, acting on the amplitudes of a quantum state instead of a classical signal. Given a state $\sum_x c_x |x\rangle$, the QFT produces a new state whose amplitudes are the discrete Fourier transform of the original amplitudes $c_x$. The reason this matters for algorithms: if the original amplitudes have some hidden periodic structure (a pattern that repeats every $r$ steps, for some unknown $r$), the QFT concentrates the resulting amplitudes onto a small number of states related to $r$ — turning "a period hidden throughout a huge superposition" into "a small number of measurement outcomes that reveal the period," which is exactly the kind of readout problem you saw at the end of the Simon''s algorithm lesson.

## Why do it quantum-mechanically at all?

A classical Fourier transform over $N=2^n$ points takes on the order of $N \log N$ operations with the fast Fourier transform algorithm (already quite efficient) — but that''s still exponential in $n$, the number of qubits, since $N=2^n$. The QFT achieves the same transform using only $O(n^2)$ quantum gates — exponentially fewer gates than even the *fast* classical Fourier transform needs, when both are compared in terms of the number of qubits/bits $n$. The catch, and it''s an important one: you can''t just read out all $N$ Fourier-transformed amplitudes at the end, because measuring a quantum state only ever gives you one basis state, chosen randomly according to the (now Fourier-transformed) probabilities — you lose the rest. The QFT''s efficiency is only useful when you don''t need the *entire* transformed spectrum, just certain global information about it (like: where''s the peak, i.e., what''s the period) — which happens to be exactly what period-finding algorithms need.

## The circuit, briefly

The QFT circuit is built from two ingredients you already know, plus one new one: Hadamard gates (to create superposition on each qubit), **controlled phase rotation gates** (a new, parameterized two-qubit gate that rotates the phase of the target qubit by an angle depending on the control), applied between every pair of qubits with carefully chosen angles, and finally a set of SWAP gates at the end to reverse the qubit ordering into the conventional order. The controlled-phase rotations are what actually encode frequency information into the amplitudes; the Hadamards and SWAPs are structural.

**Analogy:** think of the QFT as a prism. White light (a signal mixing many frequencies) goes in one side, and a spread-out rainbow (the individual frequency components, separated out and made visible) comes out the other side. You didn''t have to inspect the light wave-by-wave over time to learn its frequency content — the prism does the separating for you, physically, all at once. The QFT does the same job for the amplitudes of a quantum state, physically separating frequency information out of a state that otherwise hides it, using superposition and interference instead of glass and refraction.

## The takeaway

The QFT converts amplitude patterns from a "value at each point" description into a "how strong is each frequency" description, exponentially faster (in terms of gates needed relative to qubit count) than any classical Fourier transform — but only usable when you need aggregate, global information (like a hidden period) rather than the full transformed output. That''s precisely the situation Shor''s algorithm finds itself in, which is exactly where you''re headed next.', 'en', 'advanced', 4),
  ('QT-M3', 'Shor''s Algorithm', 'Shor''s algorithm is the reason quantum computing became a topic of interest well outside of physics departments: it factors large integers exponentially faster than the best known classical algorithm, and a huge amount of modern cryptography (RSA encryption, in particular) is secure specifically *because* factoring large numbers is believed to be classically hard. A sufficiently large, reliable quantum computer running Shor''s algorithm would be able to break that kind of encryption — which is precisely why "post-quantum cryptography" (new encryption schemes believed to resist even quantum attacks) has become an active, urgent field.

## The problem

Given a large composite number $N$ (say, a 2048-bit number that''s the product of two large primes, similar to what protects an RSA key), find its prime factors. The best known classical algorithms (like the general number field sieve) take time that grows *sub-exponentially* but still explosively with the size of $N$ — fast enough to make very large numbers practically unfactorable with any classical computer anyone expects to build.

## The classical-to-quantum reduction: factoring is period-finding in disguise

Shor''s genuinely brilliant insight was mathematical, not quantum: he showed that factoring $N$ can be reduced to a *different* problem — finding the period of a specific function — which a quantum computer, unlike a classical one, can solve efficiently. Here''s the reduction, in outline:

1. Pick a random integer $a$ that shares no common factors with $N$ (if you accidentally pick one that does share a factor, congratulations — you''ve already found a factor of $N$ directly, no quantum computer needed).
2. Consider the function $f(x) = a^x \bmod N$. This function is **periodic**: there''s some smallest positive integer $r$ (called the *order* of $a$ modulo $N$) such that $f(x+r) = f(x)$ for all $x$ — the sequence $a^0, a^1, a^2, \ldots \pmod N$ eventually repeats, and $r$ is exactly how long it takes to repeat.
3. If you can find $r$, and if $r$ happens to be even (which it is, often enough, for this to work reliably with a few retries), then $\gcd(a^{r/2}-1,\ N)$ and $\gcd(a^{r/2}+1,\ N)$ are, with high probability, nontrivial factors of $N$ — an entirely classical calculation (the greatest common divisor, computable efficiently with the ancient Euclidean algorithm) once $r$ is known.

Everything above is pure number theory — no quantum computer involved yet. Finding $r$ efficiently is the one and only step that needs a quantum computer, and it needs one specifically because $f(x)=a^x \bmod N$ has an enormous, hidden period that classical computers have no efficient way to detect for large $N$.

## The quantum part: period-finding with the QFT

This is where the Quantum Fourier Transform from the last lesson does its work. The quantum circuit prepares a superposition of many values of $x$, computes $f(x) = a^x \bmod N$ for all of them at once (using modular exponentiation, implemented as a reversible quantum circuit — this step, in practice, is the most gate-expensive part of the whole algorithm), and the resulting state has amplitude concentrated on the values of $x$ that are consistent with the function''s hidden period $r$. Applying the QFT to this state — exactly as described in the previous lesson — concentrates the measurement probability onto a small number of outcomes tightly related to $r$. A classical post-processing step (using a number-theory technique called continued fractions) then extracts the exact value of $r$ from that measurement outcome, with high probability, after typically only a few repeats of the whole quantum procedure.

## Worked example, in outline

Take $N=15$ (small enough to factor by eye, which is exactly why it''s the standard textbook and even real-hardware demonstration case) and $a=7$. The sequence $7^x \bmod 15$ is $1, 7, 4, 13, 1, 7, 4, 13, \ldots$ — it repeats with period $r=4$. Since $r$ is even, compute $\gcd(7^2-1, 15) = \gcd(48,15) = 3$ and $\gcd(7^2+1,15)=\gcd(50,15)=5$ — and indeed, $15 = 3 \times 5$. The quantum part of Shor''s algorithm is exactly a fast, general way of discovering that $r=4$ without ever computing the whole repeating sequence by hand, which becomes essential once $N$ is a thousand digits long instead of two.

## The takeaway

Shor''s algorithm doesn''t factor numbers directly — it reduces factoring to period-finding (pure classical number theory) and then solves the period-finding step using the Quantum Fourier Transform, which is exponentially faster than any known classical approach at detecting the hidden period involved. That combination — a clever classical reduction, paired with a genuinely quantum subroutine for the one hard step — is a template you''ll see again: look for the piece of a problem that''s really "find a hidden period or structure," because that''s the piece a quantum computer might handle exponentially faster.', 'en', 'advanced', 5),
  ('QT-M4', 'QAOA (Quantum Approximate Optimization Algorithm)', 'Every algorithm in the previous module assumed a large, reliable, error-corrected quantum computer — the kind that mostly still exists on whiteboards and roadmaps rather than on lab benches today. QAOA belongs to a different family, designed specifically for the noisy, limited quantum hardware that actually exists right now, often called the **NISQ** era (Noisy Intermediate-Scale Quantum). Instead of running one long, delicate quantum computation, QAOA runs many *short* quantum computations, orchestrated by an ordinary classical computer in a feedback loop.

## The problem: combinatorial optimization

QAOA targets combinatorial optimization problems — pick the best arrangement out of an enormous number of discrete possibilities. The classic teaching example is **Max-Cut**: given a graph (dots connected by lines), split the dots into two groups so as to maximize the number of connecting lines that cross between the two groups. This sounds like a puzzle, but the same underlying structure shows up in logistics, scheduling, portfolio selection, and chip design — anywhere you''re choosing among a huge number of discrete options to maximize or minimize some score.

## The hybrid loop

QAOA alternates between the quantum computer and a classical optimizer:

1. **Prepare** a uniform superposition across all possible answers (a Hadamard wall, exactly as in previous lessons — this is the standard "start by considering everything at once" opening move).
2. **Apply a cost unitary**, controlled by a tunable classical parameter $\gamma$: this step encodes the problem being solved (for Max-Cut, it applies phase rotations related to which pairs of dots are connected by a line) directly into the amplitudes.
3. **Apply a mixer unitary**, controlled by a second tunable parameter $\beta$: typically a layer of X-rotations that spreads amplitude back around between different candidate answers, so the algorithm doesn''t get stuck favoring only the answers touched by step 2.
4. **Measure**, and use a classical computer to compute how good that particular measured answer actually is (its "cost," e.g., how many edges got cut in Max-Cut).
5. **Classically adjust** $\gamma$ and $\beta$ (using a classical optimization routine, the same general kind of algorithm used to train ordinary machine learning models) to try to improve the cost, and go back to step 2 with the new parameters.

Steps 2 and 3 can be repeated for $p$ layers before measuring (each with its own $\gamma_i, \beta_i$ parameters) — more layers generally give a better approximation to the true best answer, at the cost of a longer, noisier circuit that''s harder both to run and to classically optimize. Choosing $p$ is a genuine practical trade-off, not a settled constant.

## Why "approximate"

Unlike Grover''s or Shor''s algorithms, which are built to find the *exact* right answer, QAOA is explicitly an **approximate** method — it''s designed to find a good answer, not guaranteed to find the provably best one, in exchange for being runnable on today''s imperfect, limited-size, noisy hardware. That trade-off — worse guarantees, but usable right now instead of only "once large fault-tolerant quantum computers exist" — is the entire reason NISQ-era algorithms like QAOA exist as their own active research area.

**Analogy:** think of QAOA like tasting and adjusting a dish while cooking, rather than following an exact, already-perfected recipe. You try a version (run the quantum circuit with the current $\gamma, \beta$), taste it (measure, and score the result), and adjust the seasoning (update the parameters), repeating the try-taste-adjust loop until the dish is good enough — not necessarily provably optimal, but arrived at through iterative feedback rather than blind, one-shot calculation.

## The takeaway

QAOA solves combinatorial optimization problems approximately, using a short quantum circuit (cost layer + mixer layer, repeated $p$ times) whose parameters are tuned by an ordinary classical optimizer in a feedback loop — quantum hardware proposes candidate answers and evaluates a cost function, classical software steers the search. This hybrid quantum-classical pattern, not a single long pure-quantum computation, is exactly what makes QAOA (and its close cousin VQE, next) practical on today''s hardware.', 'en', 'advanced', 0),
  ('QT-M4', 'VQE (Variational Quantum Eigensolver)', 'VQE shares QAOA''s core structure — a short quantum circuit with tunable parameters, wrapped in a classical optimization loop — but points it at a different, and arguably even more commercially anticipated, target: simulating quantum chemistry to find the lowest possible energy of a molecule.

## The problem: finding a ground state energy

Every molecule can be described by a mathematical object called a **Hamiltonian**, which encodes all the energy interactions between its electrons and nuclei. The **ground state energy** — the lowest possible energy the system can have — determines a huge amount of a molecule''s real-world chemistry and behavior: reaction rates, stability, how it might bind to other molecules (relevant for drug design), and more. Calculating ground state energies precisely is a fundamentally quantum mechanical problem, and it''s one that gets exponentially harder for classical computers as molecules get bigger — which is exactly the kind of problem people hope quantum computers will eventually be good at, since a quantum computer''s native "language" is much closer to the physics being simulated.

## The variational principle

VQE leans on a genuinely elegant piece of physics called the **variational principle**: for *any* trial quantum state you can prepare, the expected energy you''d measure for that state is guaranteed to be greater than or equal to the true ground state energy — never lower. That means: the lower you can push the measured expected energy by improving your trial state, the closer you''re provably getting to the true answer, and you always know which direction "better" is (lower), even without knowing the true ground state energy in advance.

## The hybrid loop

1. **Prepare a parameterized trial state** (called an **ansatz** — a French-derived word essentially meaning "educated guess" or "trial form") using a quantum circuit whose gates depend on tunable parameters $\theta$ — often rotation gates like $R_y(\theta_i)$ layered with entangling gates like CNOT, arranged in a pattern chosen to be flexible enough to represent a wide range of possible states.
2. **Measure the expectation value** of the molecule''s Hamiltonian on this trial state — in practice, this means running the circuit many times and combining several different measurement settings, since a Hamiltonian is generally a sum of several simpler pieces that each need to be measured separately, then added together classically.
3. **Feed that number to a classical optimizer**, which adjusts $\theta$ to try to lower the measured energy, using the same broad family of classical optimization techniques used throughout machine learning.
4. **Repeat**, running the updated circuit, measuring again, adjusting again, until the energy stops improving (much) — at which point you''ve found an approximation to the ground state energy, and the variational principle guarantees you haven''t accidentally gone *below* the true answer; you''ve only approached it from above.

## Worked example, in outline

For the simplest possible molecule, hydrogen ($H_2$), the ground state energy is already known precisely from classical methods — which is exactly why $H_2$ is the standard "hello world" of VQE: a small quantum computer runs a modest ansatz circuit (often just one or two qubits after some standard chemistry simplifications), measures the energy, a classical optimizer nudges the rotation angles, and after a handful of iterations, the measured energy converges to match the known, classically pre-computed answer — proving the method works before anyone points it at a molecule too large for classical computers to check.

**Analogy:** picture tuning a guitar string by ear rather than with a strict formula: you pluck it (prepare the trial state and measure), listen to how far it is from the note you want (evaluate against the variational principle''s "lower is better" guide), and turn the tuning peg a little (classical optimizer updates $\theta$) — repeating pluck, listen, adjust until the string settles on the right note. You never calculated the exact peg position in advance; you converged on it through guided iteration, always moving toward, never past, the target.

## The takeaway

VQE finds approximate ground state energies of molecules using the same hybrid loop as QAOA — a short, parameterized quantum circuit evaluated on real (or simulated) hardware, with a classical optimizer steering the parameters — leaning on the variational principle to guarantee steady, one-directional progress toward the true answer. Along with QAOA, it''s one of the leading candidates for a genuinely useful application of quantum computers within the NISQ era, well before the large, fully fault-tolerant machines that algorithms like Shor''s would need are available.', 'en', 'advanced', 1),
  ('QT-M1', 'क्विट बनाम क्लासिकल बिट (Qubits vs Classical Bits)', 'क्लासिकल कंप्यूटर जानकारी को बिट्स में संग्रहीत करता है, और बिट जानकारी की सबसे सरल इकाई है: यह या तो 0 है या 1, हमेशा इन दोनों में से बिल्कुल एक, और जब तक इसे जानबूझकर बदला न जाए तब तक यह वैसा ही रहता है। आपके लैपटॉप की हर तस्वीर, गाना और स्प्रेडशीट, अंदर से, इन्हीं दो चिह्नों की एक बहुत लंबी शृंखला है।

**क्विट (qubit, यानी क्वांटम बिट)** क्वांटम कंप्यूटर का बिट है, लेकिन इसके नियम अलग हैं। एक क्विट $|0\rangle$ अवस्था में हो सकता है, $|1\rangle$ अवस्था में हो सकता है (वह ब्रैकेट नोटेशन, जिसे *केट* नोटेशन कहते हैं, बस क्वांटम अवस्था लिखने का भौतिकविदों का तरीका है — $|0\rangle$ को "0 नामक क्वांटम अवस्था" के रूप में पढ़ें), या — और यही वह हिस्सा है जिसका क्लासिकल जगत में कोई समकक्ष नहीं है — दोनों का एक साथ संयोजन:

$$|\psi\rangle = \alpha|0\rangle + \beta|1\rangle$$

यहाँ $\alpha$ और $\beta$ संख्याएँ हैं (सामान्यतः जटिल संख्याएँ) जिन्हें **आयाम (amplitudes)** कहा जाता है, और इन्हें $|\alpha|^2 + |\beta|^2 = 1$ की शर्त पूरी करनी होती है। इस अवस्था को **सुपरपोज़िशन (superposition)** कहते हैं। यह कहना आकर्षक लगता है कि सुपरपोज़िशन में क्विट "एक ही समय में 0 और 1 दोनों है," और यह वाक्यांश हर जगह मिलता है, लेकिन यह थोड़ा भ्रामक है। सुपरपोज़िशन में क्विट गुप्त रूप से दो बिट्स आपस में चिपके हुए नहीं है — यह एक ही सिस्टम है जिसका भविष्य का व्यवहार (विशेष रूप से, मापन पर क्या होता है) दोनों आयामों द्वारा एक साथ वर्णित होता है। इसका ठीक-ठीक अर्थ हम अगले पाठ में समझेंगे।

## एक भौतिक चित्र

क्लासिकल बिट लगभग किसी भी ऐसी चीज़ से बनाया जा सकता है जिसकी दो स्थिर अवस्थाएँ हों: एक स्विच जो ऊपर या नीचे है, एक कैपेसिटर जो चार्ज है या नहीं। क्विट को ऐसी किसी चीज़ की ज़रूरत होती है जो वास्तव में सुपरपोज़िशन धारण कर सके — इलेक्ट्रॉन का स्पिन, फ़ोटॉन का ध्रुवीकरण (polarization), या परम शून्य के निकट ठंडे किए गए सुपरकंडक्टिंग सर्किट का ऊर्जा स्तर। अलग-अलग क्वांटम कंप्यूटिंग हार्डवेयर निर्माता (सुपरकंडक्टिंग चिप्स, ट्रैप्ड आयन, फोटोनिक्स) असल में "क्विट के लिए हमें किस भौतिक सिस्टम का उपयोग करना चाहिए?" इस सवाल के अलग-अलग इंजीनियरिंग जवाब ही हैं।

एक क्विट की अवस्था को देखने का एक सामान्य तरीका **ब्लॉख स्फीयर (Bloch sphere)** है: $|0\rangle$ उत्तरी ध्रुव पर बैठता है, $|1\rangle$ दक्षिणी ध्रुव पर, और हर संभव सुपरपोज़िशन गोले की सतह पर कोई और बिंदु है। इसके विपरीत, क्लासिकल बिट हमेशा इन्हीं दो ध्रुवों में से किसी एक पर रहता है — इसके पास घूमने के लिए कोई "सतह" नहीं है। सर्किट बिल्डर में आप ब्लॉख स्फीयर को फिर से देखेंगे, जहाँ इसका उपयोग यह दिखाने के लिए किया जाता है कि कोई सर्किट क्विट की अवस्था के साथ क्या करता है।

## हल किया हुआ उदाहरण

मान लीजिए एक क्विट इस अवस्था में तैयार किया गया है:

$$|\psi\rangle = \frac{1}{\sqrt{2}}|0\rangle + \frac{1}{\sqrt{2}}|1\rangle$$

यहाँ दोनों आयाम $\frac{1}{\sqrt{2}} \approx 0.707$ हैं। इन्हें वर्ग करने पर मापन के समय प्रत्येक परिणाम की प्रायिकता मिलती है: प्रत्येक के लिए $\left(\frac{1}{\sqrt{2}}\right)^2 = \frac{1}{2}$। तो यह विशेष सुपरपोज़िशन, यदि मापा जाए, तो 0 या 1 समान 50/50 प्रायिकता के साथ देता है — लेकिन मापन से *पहले*, यह वास्तव में दोनों आयामों में एक साथ है, और यह तथ्य वास्तविक, परीक्षण-योग्य परिणाम रखता है, जो ठीक अगले पाठ का विषय है।

## सार

क्लासिकल बिट एक स्थिर, निश्चित मान है। क्विट दो आयामों द्वारा वर्णित होता है जिनके वर्ग मापन की प्रायिकता देते हैं, और इसे संभावित अवस्थाओं के एक सतत गोले पर कहीं भी रखा जा सकता है — केवल दो ध्रुवों पर नहीं। यही अतिरिक्त जगह क्वांटम कंप्यूटिंग की शक्ति का स्रोत है — लेकिन तभी जब आप इसका उपयोग करना सीखें, जो आगे आने वाले मॉड्यूलों का पूरा उद्देश्य है।', 'hi', 'beginner', 0),
  ('QT-M1', 'सुपरपोज़िशन और मापन (Superposition and Measurement)', 'पिछले पाठ में हमने क्विट की अवस्था $|\psi\rangle = \alpha|0\rangle + \beta|1\rangle$ लिखी थी और कहा था कि $|\alpha|^2$ और $|\beta|^2$ क्रमशः 0 या 1 मापने की प्रायिकताएँ हैं। यह पाठ इस बारे में है कि "मापना" वास्तव में क्या करता है, और सुपरपोज़िशन हवा में घूमते सिक्के जैसी अनिश्चितता से मौलिक रूप से अलग क्यों है।

## मापन अवस्था को "संकुचित" (collapse) कर देता है

मापने से पहले, क्विट $\alpha$ और $\beta$ दोनों आयामों को एक साथ धारण कर सकता है। जिस क्षण आप इसे मापते हैं, यह समाप्त हो जाता है: आपको एक निश्चित क्लासिकल परिणाम मिलता है, या तो 0 या 1, क्रमशः $|\alpha|^2$ या $|\beta|^2$ प्रायिकता के साथ, और उस क्षण से क्विट की अवस्था $|0\rangle$ या $|1\rangle$ *बन जाती है*। इसे **कोलैप्स (collapse)** कहा जाता है। यदि आप उसी क्विट को तुरंत फिर से मापें, तो हर बार आपको वही उत्तर मिलेगा — सुपरपोज़िशन खत्म हो चुका है, वह पहले मापन में ही खर्च हो गया।

यह वाकई एक अजीब नियम है, और इसे उसी तरह सोचना आकर्षक लगता है जैसे हम हवा में घूमते सिक्के के बारे में सोचते हैं: "यह गुप्त रूप से पहले से ही हेड या टेल है, बस हमें तब तक पता नहीं जब तक यह ज़मीन पर न गिरे।" इसे *हिडन वेरिएबल (hidden variable)* स्पष्टीकरण कहा जाता है, और भौतिकविदों ने ऐसे प्रयोग किए हैं (जिन्हें बेल असमानताओं का परीक्षण कहा जाता है) जो क्वांटम सिस्टम के लिए इसे खारिज कर देते हैं। सुपरपोज़िशन में क्विट ऐसा सिक्का नहीं है जिसका परिणाम पहले से तय हो और आपसे छुपाया गया हो — परिणाम वास्तव में मापन होने तक निर्धारित ही नहीं होता। हम यहाँ इसे सिद्ध नहीं करेंगे, लेकिन यह जानना ज़रूरी है कि यह केवल शब्दों का खेल नहीं है।

## वह प्रयोग जो दिखाता है कि यह क्लासिकल रैंडमनेस नहीं है: हैडामार्ड को दो बार लगाना

यहीं सुपरपोज़िशन अपनी असली पहचान दिखाता है। **हैडामार्ड गेट (Hadamard gate)**, जिसे $H$ लिखा जाता है, $|0\rangle$ को समान सुपरपोज़िशन में ले जाता है:

$$H|0\rangle = \frac{1}{\sqrt{2}}|0\rangle + \frac{1}{\sqrt{2}}|1\rangle = |+\rangle$$

यदि सुपरपोज़िशन केवल "छुपी हुई 50/50 क्लासिकल रैंडमनेस" होती, तो इसके ऊपर दूसरी रैंडम-सी दिखने वाली क्रिया लगाने पर भी आप लगभग 50/50 पर ही रहते। लेकिन क्वांटम रूप से, $H$ को *दूसरी* बार लगाना बिल्कुल अलग परिणाम देता है:

$$H\left(\frac{1}{\sqrt{2}}|0\rangle + \frac{1}{\sqrt{2}}|1\rangle\right) = |0\rangle$$

आप **निश्चितता** के साथ $|0\rangle$ पर वापस आ जाते हैं — 100% प्रायिकता, 50/50 नहीं। ऐसा केवल इसलिए होता है क्योंकि आयाम एक-दूसरे को आंशिक रूप से निरस्त (cancel) कर सकते हैं (इसे **व्यतिकरण (interference)** कहा जाता है, और यह ठीक पानी की लहरों की तरह रचनात्मक या विनाशकारी हो सकता है)। $|1\rangle$ मापने की ओर ले जाने वाले रास्ते विनाशकारी रूप से व्यतिकरण करते हैं और पूरी तरह निरस्त हो जाते हैं, जबकि $|0\rangle$ की ओर ले जाने वाले रास्ते एक-दूसरे को सुदृढ़ करते हैं। कोई भी क्लासिकल सिक्का ऐसा व्यवहार नहीं करता: एक निष्पक्ष सिक्के को उछालें, फिर उसे किसी ऐसे तरीके से फिर "उछालें" जो रैंडम माना जाता है — आप कभी भरोसे के साथ मूल पहलू पर वापस नहीं आएँगे। क्वांटम सुपरपोज़िशन और क्लासिकल रैंडमनेस के बीच का यह अंतर — कि आयाम एक-दूसरे को निरस्त कर सकते हैं — वह कच्चा संसाधन है जिसका उपयोग इस कोर्स का हर क्वांटम एल्गोरिद्म करने की कोशिश करता है।

## हल किया हुआ उदाहरण: मापन प्रायिकता पढ़ना

मान लीजिए किसी सर्किट के बाद एक क्विट $|\psi\rangle = \frac{\sqrt{3}}{2}|0\rangle + \frac{1}{2}|1\rangle$ अवस्था में पहुँच जाता है। 0 मापने की प्रायिकता $\left(\frac{\sqrt{3}}{2}\right)^2 = \frac{3}{4}$ है, और 1 मापने की प्रायिकता $\left(\frac{1}{2}\right)^2 = \frac{1}{4}$ है। ध्यान दें $\frac{3}{4} + \frac{1}{4} = 1$ है, जैसा होना ही चाहिए — ये ही एकमात्र दो संभव परिणाम हैं, इसलिए इनकी प्रायिकताओं का योग हमेशा 1 होता है।

## सार

मापन सुपरपोज़िशन को एक निश्चित क्लासिकल परिणाम में संकुचित कर देता है, जिसकी प्रायिकता आयाम के वर्ग से मिलती है। लेकिन ऐसा होने से पहले, आयाम व्यतिकरण कर सकते हैं — एक-दूसरे को सुदृढ़ या निरस्त करते हुए — इस तरह से जो कोई क्लासिकल प्रायिकता वितरण दोहरा नहीं सकता। क्वांटम एल्गोरिद्म, संक्षेप में, इसी व्यतिकरण को इस तरह व्यवस्थित करने की विस्तृत विधियाँ हैं ताकि गलत उत्तर निरस्त हो जाएँ और अंत में मापते समय सही उत्तर ही शेष बचे।', 'hi', 'beginner', 1),
  ('QT-M1', 'एंटैंगलमेंट (Entanglement)', 'सुपरपोज़िशन में एक अकेला क्विट पहले से ही अजीब है। दो क्विट मिलकर और भी अजीब हो सकते हैं। जब दो क्विट **एंटैंगल्ड (entangled)** होते हैं, तो उनकी संयुक्त अवस्था को "क्विट A इस अवस्था में है, और अलग से, क्विट B उस अवस्था में है" के रूप में वर्णित नहीं किया जा सकता। दोनों क्विट केवल एक साझा विवरण के रूप में ही समझ में आते हैं।

## बेल अवस्था (Bell state)

सबसे प्रसिद्ध उदाहरण बेल अवस्था है:

$$|\Phi^+\rangle = \frac{1}{\sqrt{2}}|00\rangle + \frac{1}{\sqrt{2}}|11\rangle$$

$|00\rangle$ को "क्विट A भी 0 है और क्विट B भी 0 है" के रूप में पढ़ें, और $|11\rangle$ को "दोनों 1 हैं।" यह अवस्था कहती है: यदि आप दोनों क्विट मापें, तो आपको या तो "दोनों 0" या "दोनों 1" मिलेगा, प्रत्येक 50% प्रायिकता के साथ — लेकिन आपको *कभी* "A है 0 और B है 1" नहीं मिलेगा, भले ही प्रत्येक क्विट को अकेले मापने पर वह पूरी तरह रैंडम (50/50) दिखे। दोनों क्विट के परिणाम पूरी तरह सहसंबंधित हैं, चाहे वे भौतिक रूप से कितनी ही दूर क्यों न हों।

**उपमा (analogy):** कल्पना कीजिए दो सिक्के जो जादुई रूप से इस तरह जुड़े हैं कि जब भी आप एक को उछालकर देखें, दूसरा — तुरंत, चाहे वह पृथ्वी के दूसरे छोर पर ही क्यों न हो — जब *उसे* देखा जाएगा तो वही पहलू दिखाना सुनिश्चित है। देखे जाने से पहले किसी भी सिक्के का पहलू निर्धारित नहीं है (यह सुपरपोज़िशन वाला हिस्सा है), लेकिन जिस क्षण एक को देखा जाता है, दूसरे का परिणाम भी तय हो जाता है। यह सहसंबंध, जो किसी भी क्लासिकल रैंडमनेस से कहीं अधिक मज़बूत है, वही एंटैंगलमेंट है।

आइंस्टाइन ने इसे प्रसिद्ध रूप से "दूरी पर डरावनी क्रिया (spooky action at a distance)" कहा था, और इससे असहज थे — लेकिन इसकी पुष्टि अब कई बार प्रयोगात्मक रूप से हो चुकी है।

## एंटैंगलमेंट संदेश नहीं भेज सकता

एक आम गलतफहमी को सीधे दूर करना ज़रूरी है: एंटैंगलमेंट का उपयोग प्रकाश से तेज़ संचार के लिए नहीं किया जा सकता। कारण यह है: क्विट A मापने वाला व्यक्ति वास्तव में रैंडम 0 या 1 देखता है — उसके पास यह *चुनने* का कोई तरीका नहीं है कि उसे कौन-सा परिणाम मिले, इसलिए वह उसमें कोई संदेश एन्कोड नहीं कर सकता। सहसंबंध तभी दिखाई देता है जब कोई व्यक्ति क्विट B मापने वाले से अपने नोट्स की तुलना करता है, और नोट्स की तुलना के लिए एक सामान्य, प्रकाश-गति या उससे धीमे संचार माध्यम की ज़रूरत होती है। एंटैंगलमेंट आपको सहसंबंध देता है, नियंत्रण नहीं — यह सीमा खुद एक प्रमेय है, जिसे नो-सिग्नलिंग सिद्धांत कहा जाता है।

## हल किया हुआ उदाहरण: बेल अवस्था बनाना

ऊपर वाली बेल अवस्था दो क्विट पर, दोनों को $|0\rangle$ से शुरू करके, एक दो-गेट सर्किट से बनाई जा सकती है:

1. क्विट A पर हैडामार्ड गेट $H$ लगाएँ: इससे $|0\rangle_A$, $\frac{1}{\sqrt{2}}(|0\rangle_A + |1\rangle_A)$ बन जाता है, तो संयुक्त अवस्था (क्विट B अभी भी $|0\rangle$ पर) $\frac{1}{\sqrt{2}}(|00\rangle + |10\rangle)$ है।
2. क्विट A को कंट्रोल और क्विट B को टारगेट बनाकर CNOT गेट लगाएँ: CNOT टारगेट क्विट को तभी पलटता है जब कंट्रोल $|1\rangle$ हो। तो $|00\rangle$ पद अछूता रहता है, और $|10\rangle$ पद $|11\rangle$ बन जाता है।

परिणाम बिल्कुल $\frac{1}{\sqrt{2}}(|00\rangle + |11\rangle)$ है — दो पूरी तरह स्वतंत्र शुरुआत करने वाले क्विट से एंटैंगल्ड अवस्था। यह "पहले हैडामार्ड, फिर CNOT" पैटर्न क्वांटम सर्किट में सबसे आम निर्माण-खंडों (building blocks) में से एक है, और आप इसे अगले मॉड्यूल में फिर मिलेंगे।

## सार

एंटैंगल्ड क्विट एक साझा विवरण रखते हैं जिसे स्वतंत्र प्रति-क्विट अवस्थाओं में अलग नहीं किया जा सकता। एक को मापना तुरंत दूसरे के बारे में कुछ निश्चित बता देता है, चाहे उनके बीच की दूरी कुछ भी हो — लेकिन इस सहसंबंध को केवल *खोजा* जा सकता है, जानकारी भेजने के लिए *उपयोग* नहीं किया जा सकता। सुपरपोज़िशन के साथ-साथ, एंटैंगलमेंट वह दूसरा मूल संसाधन है जिस पर क्वांटम एल्गोरिद्म निर्भर करते हैं।', 'hi', 'beginner', 2),
  ('QT-M1', 'मूल एकल और बहु-क्विट गेट (Basic Single- and Multi-Qubit Gates)', 'AND और OR जैसे क्लासिकल लॉजिक गेट आमतौर पर **अपरिवर्तनीय (irreversible)** होते हैं — AND गेट का आउटपुट देखकर आप आमतौर पर यह नहीं बता सकते कि दोनों इनपुट क्या थे, क्योंकि जानकारी फेंक दी गई। क्वांटम गेट ऐसा नहीं कर सकते। हर क्वांटम गेट **परिवर्तनीय (reversible)** होता है (तकनीकी रूप से: यूनिटरी), यानी इसे हमेशा उल्टा करके मूल अवस्था वापस पाई जा सकती है। यह पाठ उन कुछ गेटों को कवर करता है जिनका आप लगातार उपयोग करेंगे।

## एकल-क्विट गेट

**X गेट (क्वांटम NOT):** $|0\rangle \leftrightarrow |1\rangle$ को पलटता है, बिल्कुल क्लासिकल NOT की तरह। $X|0\rangle = |1\rangle$ और $X|1\rangle = |0\rangle$।

**Z गेट:** $|0\rangle$ को अछूता छोड़ता है लेकिन $|1\rangle$ का *चिह्न (sign)* पलट देता है: $Z|0\rangle = |0\rangle$ और $Z|1\rangle = -|1\rangle$। वह ऋण चिह्न बेकार लग सकता है — $|1\rangle$ और $-|1\rangle$ मापने पर समान प्रायिकता मिलती है — लेकिन एक बार जब क्विट सुपरपोज़िशन में हो, तो यह बहुत मायने रखता है, क्योंकि अब वह चिह्न अन्य आयामों के साथ व्यतिकरण कर सकता है (जैसा हमने पिछले पाठ में डबल-हैडामार्ड ट्रिक में देखा)।

**H गेट (हैडामार्ड):** वह गेट जो समान सुपरपोज़िशन बनाता है, जिसे अब तक दो बार पेश किया जा चुका है: $H|0\rangle = \frac{1}{\sqrt{2}}(|0\rangle + |1\rangle)$ और $H|1\rangle = \frac{1}{\sqrt{2}}(|0\rangle - |1\rangle)$। दूसरी पंक्ति में ऋण चिह्न पर ध्यान दें — यही वह चीज़ है जो $H$ को दो बार लगाने पर खुद को निरस्त करने देती है, जैसा हमने पहले देखा।

## एक दो-क्विट गेट: CNOT

**CNOT (कंट्रोल्ड-NOT)** गेट दो क्विट पर काम करता है: एक *कंट्रोल* और एक *टारगेट*। यदि कंट्रोल $|0\rangle$ है, तो टारगेट पर कुछ नहीं होता। यदि कंट्रोल $|1\rangle$ है, तो टारगेट पलट जाता है (उस पर X गेट लगता है)। सभी चार आधार अवस्थाओं के लिए:

- $|00\rangle \to |00\rangle$
- $|01\rangle \to |01\rangle$
- $|10\rangle \to |11\rangle$
- $|11\rangle \to |10\rangle$

CNOT ही वह तरीका है जिससे क्विट एक-दूसरे से एंटैंगल होते हैं — जैसा आपने पिछले पाठ के बेल-अवस्था उदाहरण में देखा — और जानकारी क्विट के *बीच* साझा होती है, न कि हर क्विट अलग-थलग घूमता रहे।

## हल किया हुआ उदाहरण: दो-गेट सर्किट को ट्रेस करना

$|0\rangle$ से शुरू करें और $X$, फिर $H$ लगाएँ:

1. $X|0\rangle = |1\rangle$
2. $H|1\rangle = \frac{1}{\sqrt{2}}(|0\rangle - |1\rangle)$

तो अंतिम अवस्था है $\frac{1}{\sqrt{2}}|0\rangle - \frac{1}{\sqrt{2}}|1\rangle$ — एक समान सुपरपोज़िशन, लेकिन एक *सापेक्ष चरण (relative phase)* (वह ऋण चिह्न) के साथ, जो केवल $H$ से बनाए गए समान सुपरपोज़िशन में नहीं होता। दोनों अवस्थाएँ मापने पर 50/50 परिणाम देती हैं, लेकिन आगे के गेटों के अंतर्गत वे अलग व्यवहार करती हैं — और यही वह बारीकी है जिस पर क्वांटम एल्गोरिद्म बनाए जाते हैं।

## सार

X, Z, और H मूल एकल-क्विट क्रियाएँ हैं — पलटना, चरण-पलटना, और सुपरपोज़ करना। CNOT दो क्विट को जोड़ने का सबसे सरल तरीका है और एंटैंगलमेंट बनाने का मानक उपकरण है। इन गेटों में से हर एक को दोबारा लगाकर (या कुछ के लिए, विपरीत गेट लगाकर) पूर्ववत किया जा सकता है — क्वांटम सर्किट में कभी कुछ फेंका नहीं जाता, केवल पुनर्व्यवस्थित किया जाता है। अगले मॉड्यूल में, आप देखेंगे कि ये छोटे टुकड़े कैसे मिलकर असली सर्किट बनाते हैं।', 'hi', 'beginner', 3),
  ('QT-M2', 'सर्किट कैसे बनते और पढ़े जाते हैं (How Circuits Are Built and Read)', 'एक क्वांटम सर्किट एक नुस्खा (recipe) है: क्विट के एक समूह पर लगाए गए गेटों का क्रम, जिसे बाएँ से दाएँ पढ़ा जाता है, और (आमतौर पर) मापन पर समाप्त होता है। यदि आपने कभी स्वरलिपि (sheet music) पढ़ी है, तो यह चित्र आपके लिए जाना-पहचाना होगा — हर क्षैतिज रेखा एक वाद्य यंत्र (यहाँ, एक क्विट) है और समय पृष्ठ पर बाएँ से दाएँ बढ़ता है।

## सर्किट डायग्राम की संरचना

- **वायर (wires):** हर क्षैतिज रेखा एक क्विट को दर्शाती है, और वायर पर उसकी स्थिति (बाएँ से दाएँ) समय को दर्शाती है। एक क्विट का वायर उसके शुरू होने (लगभग हमेशा $|0\rangle$ पर) से लेकर मापे जाने तक लगातार चलता है।
- **गेट बॉक्स:** वायर पर एक लेबल वाला बॉक्स (जैसे "H" या "X" लिखा बॉक्स) का मतलब है "इस समय बिंदु पर इस क्विट पर यह गेट लगाओ।"
- **ऊर्ध्वाधर जुड़ाव (vertical connections):** जब कोई गेट एक से अधिक क्विट को शामिल करता है — जैसे पिछले मॉड्यूल का CNOT — तो एक ऊर्ध्वाधर रेखा शामिल क्विट को जोड़ती है, यह दिखाते हुए कि उन पर एक साथ, एक ही समय पर क्रिया हो रही है।
- **मापन (measurement):** आमतौर पर वायर के अंत में एक छोटे मीटर-डायल जैसे चिह्न से दर्शाया जाता है, जो यह चिह्नित करता है कि क्विट की क्वांटम अवस्था कहाँ मापी जाती है और एक सामान्य क्लासिकल बिट (0 या 1) में बदली जाती है, जिसे एक साधारण कंप्यूटर पढ़ और संग्रहीत कर सकता है।

## पढ़ने का क्रम मायने रखता है

क्योंकि सर्किट बाएँ से दाएँ पढ़े जाते हैं, किसी वायर पर गेटों का *क्रम* बिल्कुल वही क्रम है जिसमें वे लगाए जाते हैं — एक ही क्विट पर दो गेटों का क्रम बदलना पूरी तरह अलग सर्किट बना देता है (सामान्यतः; कुछ गेट संयोगवश कम्यूट करते हैं, यानी उस विशेष जोड़े के लिए क्रम मायने नहीं रखता, लेकिन आपको यह मान नहीं लेना चाहिए)। यह, मान लीजिए, सामग्री की एक साधारण सूची से अलग है, जहाँ क्रम अक्सर लचीला होता है — सर्किट डायग्राम क्रमांकित निर्देशों के एक सेट के अधिक निकट है।

## हल किया हुआ उदाहरण: बेल-अवस्था सर्किट पढ़ना

पिछले मॉड्यूल के एंटैंगलमेंट सर्किट को याद करें: क्विट A पर हैडामार्ड, फिर A को कंट्रोल और B को टारगेट बनाकर CNOT। सर्किट के रूप में खींचा जाए, तो यह दो वायर ($q_0$ और $q_1$ लेबल किए हुए) जैसा दिखता है, जिसमें बाईं ओर के पास $q_0$ वायर पर एक "H" बॉक्स है, और — थोड़ा और दाईं ओर, ताकि स्पष्ट हो कि हैडामार्ड पहले होता है — एक CNOT चिह्न ($q_0$ वायर पर एक ठोस बिंदु, जो एक ऊर्ध्वाधर रेखा द्वारा $q_1$ वायर पर एक $\oplus$ चिह्न से जुड़ा है)। बाएँ से दाएँ पढ़ना बिल्कुल बता देता है कि क्या हुआ और किस क्रम में: पहले क्विट 0 को सुपरपोज़ करें, फिर इसे क्विट 1 के साथ एंटैंगल करें। यदि ये दोनों गेट विपरीत क्रम में खींचे जाते, तो सर्किट क्विट 0 की अवस्था को सुपरपोज़िशन में डालने से पहले ही कंट्रोल के रूप में उपयोग करने की कोशिश करता — एक पूरी तरह अलग (और बहुत कम दिलचस्प) सर्किट।

## यह परंपरा खुद सर्किट बनाते समय क्यों मायने रखती है

जब आप सर्किट बिल्डर में (अगले मॉड्यूल में आने वाला) कोई सर्किट बनाएँगे, तो आप बिल्कुल इसी बाएँ-से-दाएँ शैली में क्विट वायर पर गेट खींचेंगे, इसलिए मौजूदा सर्किट डायग्राम पढ़ने में सहज होना असल में अपना खुद का सर्किट बनाने के समान कौशल है — आप बस इसे उल्टे क्रम में कर रहे हैं।

## सार

सर्किट डायग्राम बाएँ से दाएँ, ऊपर से नीचे पढ़ा जाता है: वायर क्विट हैं, बॉक्स गेट हैं, ऊर्ध्वाधर रेखाएँ एक साथ क्रिया किए गए क्विट को जोड़ती हैं, और एक मीटर चिह्न मापन को चिह्नित करता है। वायर पर क्रम सार्थक होता है और आमतौर पर फेरबदल नहीं किया जा सकता। एक बार यह परंपरा समझ में आ जाए, तो आगे देखा जाने वाला हर सर्किट डायग्राम — चाहे कितना भी जटिल हो — बस यही वर्णमाला है, बस ज़्यादा बार इस्तेमाल हुई।', 'hi', 'beginner', 0),
  ('QT-M2', 'सामान्य गेट संयोजन और उनका काम (Common Gate Combinations and What They Do)', 'अलग-अलग गेट सरल होते हैं, लेकिन असली सर्किट छोटे, बार-बार उपयोग होने वाले संयोजनों से बनते हैं जो लगातार दिखाई देते हैं। इन पैटर्न को पहचानना सर्किट पढ़ना (और अंततः लिखना) बहुत तेज़ बना देता है — हर गेट को एक-एक करके ट्रेस करने के बजाय, आपको दिखने लगता है "अरे, यह तो बेल-अवस्था तैयार करना है," ठीक वैसे ही जैसे एक अनुभवी प्रोग्रामर एक नज़र में for-loop पहचान लेता है।

## पहले H फिर CNOT: दो क्विट को एंटैंगल करना

एंटैंगलमेंट पाठ में यह पहले ही कवर किया जा चुका है: एक क्विट पर हैडामार्ड, उसके बाद उसी क्विट को कंट्रोल बनाकर CNOT, बेल अवस्था बनाता है। यह दो-गेट खंड शुरुआती क्वांटम सर्किट में सबसे आम रूपांकन (motif) है, क्योंकि एंटैंगलमेंट ऐसा केंद्रीय संसाधन है।

## हर क्विट पर हैडामार्ड: समान सुपरपोज़िशन

$|0\rangle$ से शुरू होने वाले $n$ क्विट पर $H$ लगाएँ, और आपको सभी $2^n$ संभावित बिट स्ट्रिंग का एक साथ समान सुपरपोज़िशन मिलता है। $n=2$ के लिए:

$$H^{\otimes 2}|00\rangle = \frac{1}{2}\left(|00\rangle + |01\rangle + |10\rangle + |11\rangle\right)$$

चारों परिणामों में से हर एक का आयाम समान $\frac{1}{2}$ है, और प्रायिकता समान $\frac{1}{4}$ है। यह "हैडामार्ड दीवार" — सर्किट की बिल्कुल शुरुआत में हर क्विट पर H गेटों का एक स्तंभ — अगले मॉड्यूल के कई एल्गोरिद्म (डॉयश-जोज़ा, बर्नस्टाइन-वज़ीरानी, साइमन का, और ग्रोवर का — सभी इसी तरह शुरू होते हैं) के लिए मानक शुरुआती चाल है, क्योंकि यह एक अगली क्रिया को सभी $2^n$ संभावनाओं पर एक साथ, एक-एक करके नहीं, क्रिया करने देती है।

## एक ही गेट दो बार: अक्सर (लेकिन हमेशा नहीं) पहचान (identity)

हमने पहले ही देखा कि $H$ को दो बार लगाने पर $|0\rangle$, $|0\rangle$ पर वापस आ जाता है — खुद को निरस्त करते हुए। यही बात $X$ (दो बार पलटें, आप वहीं वापस पहुँच जाते हैं जहाँ से शुरू किया था) और CNOT (वही CNOT दो बार लगाएँ, और दूसरा पहले को निरस्त कर देता है) के लिए भी सच है। इस "लगाओ, फिर पूर्ववत करने के लिए फिर लगाओ" पैटर्न को **अनकंप्यूटेशन (uncomputation)** कहा जाता है, और यह एक वास्तव में उपयोगी सर्किट-डिज़ाइन तरकीब है: यदि आपको किसी गणना में मदद के लिए एक अस्थायी क्विट चाहिए लेकिन अंत में उसे अपने उत्तर के साथ एंटैंगल्ड नहीं छोड़ना चाहते, तो आप वह क्रिया चलाते हैं जिसने गड़बड़ी पैदा की, फिर उसे साफ करने के लिए इसे फिर से (या इसका विलोम) चलाते हैं।

## SWAP: दो क्विट की अवस्थाएँ बदलना

कभी-कभी आपको किसी क्विट की अवस्था को किसी दूसरे वायर पर ले जाने की ज़रूरत होती है — मान लीजिए, इसलिए क्योंकि बाद के किसी गेट को कहीं और स्थित होने की ज़रूरत है। SWAP गेट दो क्विट की अवस्थाओं की अदला-बदली करता है, और इसे खुद लगातार तीन CNOT (कंट्रोल और टारगेट बदलते हुए) से बनाया जा सकता है: CNOT(A,B), फिर CNOT(B,A), फिर फिर से CNOT(A,B)। आपको शायद ही कभी SWAP को हाथ से बनाना पड़े — अधिकांश क्वांटम प्रोग्रामिंग टूल इसे एक ही बिल्ट-इन गेट के रूप में देते हैं — लेकिन तीन बदलते CNOT को "अरे, यह तो बस एक SWAP है" के रूप में पहचानना एक उपयोगी पैटर्न है।

## हल किया हुआ उदाहरण: पैटर्न पहचानना

मान लीजिए आपको 3 क्विट पर एक सर्किट दिया जाता है, और सबसे पहली चीज़ जो खींची गई है वह हर तीनों वायर पर एक H गेट है, सभी एक ही शुरुआती स्थिति पर पंक्तिबद्ध। बाकी सर्किट में कुछ भी देखने से पहले ही, आप जान जाते हैं: यह सर्किट तीनों क्विट को सभी $2^3 = 8$ संभावित 3-बिट स्ट्रिंग के समान सुपरपोज़िशन में रखकर शुरू होता है। आगे जो भी हो, वह सभी 8 संभावनाओं पर समानांतर रूप से क्रिया कर रहा है।

## सार

आपके सामने आने वाले अधिकांश सर्किट कुछ बार-बार आने वाले खंडों से बने होते हैं: एंटैंगल करने के लिए हैडामार्ड-फिर-CNOT, समान सुपरपोज़िशन के लिए हैडामार्ड दीवार, अनकंप्यूटेशन के लिए दोहराए गए गेट, और अदला-बदली के लिए CNOT त्रिक। इन पैटर्न को पहचानना सीखना ही सर्किट-पढ़ने को गेट-दर-गेट उबाऊ ट्रेसिंग से तेज़ पैटर्न-पहचान में बदल देता है।', 'hi', 'beginner', 1),
  ('QT-M2', 'सर्किट डायग्राम नोटेशन (Circuit Diagram Notation)', 'यह पाठ उन विशिष्ट चिह्नों का संदर्भ है जो आप क्वांटम सर्किट डायग्राम में हर जगह देखेंगे — इस कोर्स में, सर्किट बिल्डर में, और बाद में आपके सामने आने वाले किसी भी क्वांटम कंप्यूटिंग शोधपत्र या पाठ्यपुस्तक में। मूल वर्णमाला छोटी है, और एक बार इसे याद कर लेने पर, हर सर्किट डायग्राम पढ़ने योग्य बन जाता है।

## वायर: एकल बनाम दोहरी रेखाएँ

एक एकल क्षैतिज रेखा एक **क्वांटम वायर** है — यह क्विट की क्वांटम अवस्था को वहन करती है। मापन के बाद, वायर को डायग्राम के बाकी हिस्से के लिए अक्सर **दोहरी रेखा** के रूप में खींचा जाता है, यह संकेत देते हुए कि इस बिंदु से आगे, यह एक सामान्य क्लासिकल बिट (बस 0 या 1, अब और सुपरपोज़िशन नहीं) वहन कर रही है, अब क्वांटम अवस्था नहीं।

## गेट बॉक्स

एक लेबल वाला आयत — "X", "H", "Z", वगैरह — किसी वायर पर रखा हुआ मतलब है "यहाँ यह गेट लगाओ।" कुछ गेटों के लेबल वाले बॉक्स के बजाय अपने समर्पित चिह्न होते हैं: हैडामार्ड को अक्सर बस "H" लिखे बॉक्स के रूप में खींचा जाता है, लेकिन आप रोटेशन गेट भी $R_x(\theta)$, $R_y(\theta)$, या $R_z(\theta)$ के रूप में एक कोण पैरामीटर के साथ लिखे हुए देखेंगे, क्योंकि कुछ गेट (X, Z, और H के विपरीत) एक निश्चित नहीं बल्कि एक सतत, समायोज्य (tunable) मान पर निर्भर करते हैं। इस कोर्स के बाद के वेरिएशनल एल्गोरिद्म मॉड्यूल में पहुँचने पर आप ऐसे पैरामीटरयुक्त रोटेशन गेटों से सीधे मिलेंगे।

## कंट्रोल और टारगेट

किसी वायर पर एक **ठोस बिंदु (•)** एक *कंट्रोल* क्विट को चिह्नित करता है। एक ऊर्ध्वाधर रेखा इसे दूसरे वायर पर होने वाली नियंत्रित क्रिया से जोड़ती है — विशेष रूप से CNOT के लिए, टारगेट को अंदर एक प्लस चिह्न वाले वृत्त, $\oplus$, के रूप में खींचा जाता है। एक बिंदु को रेखा द्वारा $\oplus$ चिह्न से जुड़ा देखना तुरंत "यह एक CNOT है" की पहचान करा देता है। अधिक सामान्य नियंत्रित गेट (कंट्रोल्ड-Z, कंट्रोल्ड-रोटेशन, वगैरह) वही बिंदु-और-रेखा परंपरा उपयोग करते हैं, बस टारगेट सिरे पर $\oplus$ के बजाय एक अलग चिह्न के साथ।

## मापन

एक छोटा **मीटर-डायल चिह्न** (यह वाकई एक छोटे स्पीडोमीटर जैसा दिखता है) यह चिह्नित करता है कि क्विट कहाँ मापा जाता है। यह लगभग हमेशा वायर पर आखिरी चीज़ होती है, क्योंकि क्विट का क्वांटम व्यवहार मापे जाने के क्षण "इस्तेमाल" हो जाता है — अधिक उन्नत सर्किट में, आप सर्किट के बीच में क्विट को माप सकते हैं और परिणाम का उपयोग बाद के गेटों को नियंत्रित करने के लिए कर सकते हैं, लेकिन इस कोर्स में आप जो सर्किट बनाएँगे, उनमें मापन अंतिम चरण है।

## बैरियर (Barriers)

कई वायर तक फैली एक **डैश्ड ऊर्ध्वाधर रेखा** एक **बैरियर** है। इसका कोई कम्प्यूटेशनल अर्थ बिल्कुल नहीं है — इससे अवस्था नहीं बदलती — यह पूरी तरह एक दृश्य/संगठनात्मक चिह्न है, जिसका उपयोग अक्सर सर्किट के एक वैचारिक चरण (मान लीजिए, "अवस्था तैयारी") को अगले ("असली एल्गोरिद्म") से अलग करने के लिए किया जाता है, ठीक वैसे ही जैसे कोड में एक खाली रेखा तार्किक खंडों को अलग करती है बिना यह बदले कि कोड क्या करता है।

## क्विट क्रम — आगे के लिए एक सूचना

अलग-अलग टूल बहु-क्विट अवस्थाओं को $|q_1 q_0\rangle$ बनाम $|q_0 q_1\rangle$ जैसी स्ट्रिंग में लिखते समय क्विट को अलग-अलग क्रम में रखते हैं। सर्किट बिल्डर मॉड्यूल में आप जिस सिम्युलेटर, Qiskit, का उपयोग करेंगे, वह **लिटल-एंडियन (little-endian)** क्रम उपयोग करता है: *सबसे कम महत्वपूर्ण* क्विट पहले लिखा जाता है (सबसे दाईं ओर का बिट क्विट 0 से मेल खाता है)। जब आप पहली बार हाथ से बनाए गए सर्किट की तुलना सिम्युलेटर आउटपुट से करते हैं, तो यह "रुको, मेरा आउटपुट उल्टा क्यों है?" जैसे भ्रम का एक आम स्रोत है — इसे अभी नोट कर लेना अच्छा है ताकि बाद में यह आपको परेशान न करे।

## सार

एकल रेखाएँ क्वांटम अवस्थाएँ वहन करती हैं, दोहरी रेखाएँ मापन के बाद क्लासिकल बिट वहन करती हैं। एक बिंदु-और-रेखा एक नियंत्रित क्रिया को चिह्नित करती है, एक मीटर चिह्न मापन को चिह्नित करता है, और एक डैश्ड रेखा बिना किसी कम्प्यूटेशनल प्रभाव वाला बस एक संगठनात्मक बैरियर है। इस पृष्ठ को एक संदर्भ के रूप में याद रखें — आप कोर्स के बाकी हिस्से में सर्किट को बिल्कुल इसी नोटेशन का उपयोग करके समझेंगे।', 'hi', 'beginner', 2),
  ('QT-M1', 'క్విట్‌లు vs క్లాసికల్ బిట్‌లు (Qubits vs Classical Bits)', 'క్లాసికల్ కంప్యూటర్ సమాచారాన్ని బిట్‌లలో నిల్వ చేస్తుంది, మరియు బిట్ అనేది సమాచారానికి అత్యంత సరళమైన రూపం: ఇది 0 లేదా 1, ఎప్పుడూ ఈ రెండింటిలో ఖచ్చితంగా ఒకటే, మరియు ఉద్దేశపూర్వకంగా మార్చే వరకు అలాగే ఉంటుంది. మీ ల్యాప్‌టాప్‌లోని ప్రతి ఫోటో, పాట, స్ప్రెడ్‌షీట్ — అంతరంగంలో — ఈ రెండు గుర్తుల యొక్క చాలా పొడవైన వరుస మాత్రమే.

**క్విట్ (qubit, క్వాంటం బిట్)** అనేది క్వాంటం కంప్యూటర్ యొక్క బిట్, కానీ దీని నియమాలు వేరు. ఒక క్విట్ $|0\rangle$ స్థితిలో గానీ, $|1\rangle$ స్థితిలో గానీ ఉండగలదు (ఆ బ్రాకెట్ నొటేషన్‌ను *కెట్* నొటేషన్ అంటారు, ఇది భౌతిక శాస్త్రవేత్తలు క్వాంటం స్థితులను రాసే విధానం మాత్రమే — $|0\rangle$ ను "0 అనే క్వాంటం స్థితి"గా చదవండి), లేదా — ఇక్కడే క్లాసికల్ ప్రపంచంలో సమానమైనది ఏదీ లేని భాగం — రెండింటి కలయికగా ఒకేసారి:

$$|\psi\rangle = \alpha|0\rangle + \beta|1\rangle$$

ఇక్కడ $\alpha$ మరియు $\beta$ లను **యాంప్లిట్యూడ్‌లు (amplitudes)** అని పిలిచే సంఖ్యలు (సాధారణంగా, కాంప్లెక్స్ సంఖ్యలు), మరియు ఇవి $|\alpha|^2 + |\beta|^2 = 1$ అనే షరతును తప్పక పాటించాలి. ఈ స్థితిని **సూపర్‌పొజిషన్ (superposition)** అంటారు. సూపర్‌పొజిషన్‌లో ఉన్న క్విట్‌ను "ఒకేసారి 0 మరియు 1 రెండూ" అని వర్ణించడం ఆకర్షణీయంగా అనిపిస్తుంది, ఈ మాట ప్రతిచోటా కనిపిస్తుంది కూడా, కానీ ఇది కొంచెం తప్పుదారి పట్టించేది. సూపర్‌పొజిషన్‌లో ఉన్న క్విట్ రహస్యంగా రెండు బిట్‌లు అంటుకుని ఉన్నది కాదు — ఇది ఒకే వ్యవస్థ, దాని భవిష్యత్ ప్రవర్తన (ప్రత్యేకంగా, కొలిచినప్పుడు ఏమి జరుగుతుంది) రెండు యాంప్లిట్యూడ్‌ల ద్వారా ఏకకాలంలో వివరించబడుతుంది. దీని ఖచ్చితమైన అర్థాన్ని తర్వాతి పాఠంలో లోతుగా చూద్దాం.

## ఒక భౌతిక చిత్రం

క్లాసికల్ బిట్‌ను రెండు స్థిరమైన స్థితులు ఉన్న దాదాపు దేనితోనైనా నిర్మించవచ్చు: పైకి లేదా కిందికి ఉండే స్విచ్, ఛార్జ్ అయిన లేదా కాని కెపాసిటర్. క్విట్‌కు నిజంగా సూపర్‌పొజిషన్‌ను కలిగి ఉండగల ఏదో ఒకటి కావాలి — ఎలక్ట్రాన్ స్పిన్, ఫోటాన్ ధ్రువణం (polarization), లేదా సంపూర్ణ శూన్యం దగ్గర చల్లబరచిన సూపర్‌కండక్టింగ్ సర్క్యూట్ యొక్క శక్తి స్థాయి. వేర్వేరు క్వాంటం కంప్యూటింగ్ హార్డ్‌వేర్ తయారీదారులు (సూపర్‌కండక్టింగ్ చిప్‌లు, ట్రాప్డ్ అయాన్లు, ఫోటానిక్స్) నిజానికి "క్విట్‌గా ఏ భౌతిక వ్యవస్థను వాడాలి?" అనే ప్రశ్నకు వేర్వేరు ఇంజినీరింగ్ సమాధానాలు మాత్రమే.

ఒక్క క్విట్ స్థితిని చూపించడానికి సాధారణంగా ఉపయోగించే మార్గం **బ్లాక్ స్పియర్ (Bloch sphere)**: $|0\rangle$ ఉత్తర ధ్రువం వద్ద, $|1\rangle$ దక్షిణ ధ్రువం వద్ద ఉంటాయి, మరియు సాధ్యమయ్యే ప్రతి సూపర్‌పొజిషన్ గోళం ఉపరితలంపై మరొక బిందువు. దీనికి భిన్నంగా, క్లాసికల్ బిట్ ఎల్లప్పుడూ ఆ రెండు ధ్రువాలలో ఒకదానిలోనే ఉంటుంది — దానికి తిరుగాడటానికి "ఉపరితలం" లేదు. సర్క్యూట్ బిల్డర్‌లో మీరు బ్లాక్ స్పియర్‌ను మళ్ళీ చూస్తారు, అక్కడ ఒక సర్క్యూట్ క్విట్ స్థితికి ఏమి చేస్తుందో చూపించడానికి దీన్ని ఉపయోగిస్తారు.

## పరిష్కరించిన ఉదాహరణ

ఒక క్విట్ ఈ స్థితిలో తయారు చేయబడిందని అనుకుందాం:

$$|\psi\rangle = \frac{1}{\sqrt{2}}|0\rangle + \frac{1}{\sqrt{2}}|1\rangle$$

ఇక్కడ రెండు యాంప్లిట్యూడ్‌లు $\frac{1}{\sqrt{2}} \approx 0.707$. వీటిని వర్గం చేస్తే కొలిచినప్పుడు ప్రతి ఫలితం యొక్క సంభావ్యత వస్తుంది: ప్రతిదానికీ $\left(\frac{1}{\sqrt{2}}\right)^2 = \frac{1}{2}$. కాబట్టి ఈ ప్రత్యేక సూపర్‌పొజిషన్, కొలిస్తే, 0 లేదా 1 ను సమాన 50/50 సంభావ్యతతో ఇస్తుంది — కానీ కొలవక *ముందు*, ఇది నిజంగా రెండు యాంప్లిట్యూడ్‌లలో ఒకేసారి ఉంటుంది, మరియు ఈ వాస్తవం నిజమైన, పరీక్షించదగిన పర్యవసానాలను కలిగి ఉంటుంది — ఇదే తర్వాతి పాఠం విషయం.

## సారాంశం

క్లాసికల్ బిట్ ఒక స్థిరమైన, నిర్ణీత విలువ. క్విట్‌ను రెండు యాంప్లిట్యూడ్‌లు వర్ణిస్తాయి, వాటి వర్గాలు కొలత సంభావ్యతలను ఇస్తాయి, మరియు దీన్ని సాధ్యమయ్యే స్థితుల నిరంతర గోళంపై ఎక్కడైనా ఉంచవచ్చు — కేవలం రెండు ధ్రువాల వద్ద మాత్రమే కాదు. ఈ అదనపు స్థలమే క్వాంటం కంప్యూటింగ్ శక్తికి మూలం — కానీ దాన్ని ఎలా ఉపయోగించాలో నేర్చుకున్న తర్వాతే, అదే తర్వాతి మాడ్యూళ్ళ మొత్తం లక్ష్యం.', 'te', 'beginner', 0),
  ('QT-M1', 'సూపర్‌పొజిషన్ మరియు కొలత (Superposition and Measurement)', 'గత పాఠంలో మనం క్విట్ స్థితిని $|\psi\rangle = \alpha|0\rangle + \beta|1\rangle$ గా రాశాం మరియు $|\alpha|^2$, $|\beta|^2$ లు వరుసగా 0 లేదా 1 కొలిచే సంభావ్యతలని చెప్పాం. ఈ పాఠం "కొలవడం" నిజంగా ఏమి చేస్తుందో, మరియు గాలిలో తిరుగుతున్న నాణెం లాంటి అనిశ్చితి కంటే సూపర్‌పొజిషన్ ఎందుకు ప్రాథమికంగా భిన్నమైనదో వివరిస్తుంది.

## కొలత స్థితిని "కుప్పకూలుస్తుంది" (collapse)

కొలవడానికి ముందు, క్విట్ $\alpha$ మరియు $\beta$ అనే రెండు యాంప్లిట్యూడ్‌లను ఒకేసారి కలిగి ఉండగలదు. మీరు దాన్ని కొలిచే క్షణంలో అది ముగుస్తుంది: మీకు ఖచ్చితమైన క్లాసికల్ ఫలితం వస్తుంది, 0 లేదా 1, వరుసగా $|\alpha|^2$ లేదా $|\beta|^2$ సంభావ్యతతో, మరియు ఆ క్షణం నుండి క్విట్ స్థితి $|0\rangle$ లేదా $|1\rangle$ *అవుతుంది*. దీన్ని **కొలాప్స్ (collapse)** అంటారు. అదే క్విట్‌ను వెంటనే మళ్ళీ కొలిస్తే, ప్రతిసారీ మీకు అదే సమాధానం వస్తుంది — సూపర్‌పొజిషన్ పోయింది, అది మొదటి కొలతలోనే ఖర్చయిపోయింది.

ఇది నిజంగా విచిత్రమైన నియమం, మరియు దీన్ని గాలిలో తిరుగుతున్న నాణెం గురించి మనం ఆలోచించే విధంగానే ఆలోచించడం ఆకర్షణీయంగా అనిపిస్తుంది: "ఇది కిందపడేవరకూ మనకు తెలియకపోయినా, ఇది ఇప్పటికే రహస్యంగా బొమ్మ లేదా బొరుసు." దీన్ని *హిడెన్ వేరియబుల్ (hidden variable)* వివరణ అంటారు, మరియు భౌతిక శాస్త్రవేత్తలు దీన్ని క్వాంటం వ్యవస్థలకు తోసిపుచ్చే ప్రయోగాలు (బెల్ అసమానతలను పరీక్షించడం అనే దాన్ని) చేశారు. సూపర్‌పొజిషన్‌లో ఉన్న క్విట్ ఫలితం ముందే నిర్ణయించి మీ నుండి దాచిన నాణెం కాదు — కొలత జరిగేవరకూ ఫలితం నిజంగా నిర్ణయించబడనే లేదు. దీన్ని మనం ఇక్కడ నిరూపించము, కానీ ఇది కేవలం పదాల ఆటే కాదని తెలుసుకోవడం విలువైనది.

## ఇది క్లాసికల్ యాదృచ్ఛికత కాదని చూపే ప్రయోగం: హడమార్డ్‌ను రెండుసార్లు వేయడం

ఇక్కడే సూపర్‌పొజిషన్ తన అసలు గుణాన్ని చూపిస్తుంది. **హడమార్డ్ గేట్ (Hadamard gate)**, $H$ అని రాస్తారు, $|0\rangle$ ను సమాన సూపర్‌పొజిషన్‌లోకి తీసుకువెళ్తుంది:

$$H|0\rangle = \frac{1}{\sqrt{2}}|0\rangle + \frac{1}{\sqrt{2}}|1\rangle = |+\rangle$$

సూపర్‌పొజిషన్ కేవలం "దాగిన 50/50 క్లాసికల్ యాదృచ్ఛికత" మాత్రమే అయితే, దానిపై రెండవసారి యాదృచ్ఛికంగా కనిపించే మరో క్రియను వేసినా మీరు దాదాపు 50/50 వద్దే ఉండాలి. కానీ క్వాంటం పరంగా, $H$ ను *రెండవసారి* వేయడం పూర్తిగా వేరే విషయం చేస్తుంది:

$$H\left(\frac{1}{\sqrt{2}}|0\rangle + \frac{1}{\sqrt{2}}|1\rangle\right) = |0\rangle$$

మీరు **ఖచ్చితత్వం**తో $|0\rangle$ కు తిరిగి వస్తారు — 100% సంభావ్యత, 50/50 కాదు. యాంప్లిట్యూడ్‌లు ఒకదానొకటి పాక్షికంగా రద్దు చేసుకోగలవు కాబట్టే ఇది జరుగుతుంది (దీన్ని **వ్యతికరణం (interference)** అంటారు, మరియు ఇది నీటిలోని అలల మాదిరిగానే నిర్మాణాత్మకంగా లేదా వినాశకరంగా ఉండవచ్చు). $|1\rangle$ ను కొలవడానికి దారితీసే మార్గాలు వినాశకరంగా వ్యతికరణం చెంది పూర్తిగా రద్దవుతాయి, అయితే $|0\rangle$ కు దారితీసే మార్గాలు ఒకదానొకటి బలపరుచుకుంటాయి. ఏ క్లాసికల్ నాణెం కూడా ఇలా ప్రవర్తించదు: ఒక సరైన నాణేన్ని తిప్పండి, తర్వాత దాన్ని యాదృచ్ఛికమని భావించే మరో పద్ధతిలో మళ్ళీ "తిప్పండి" — మీరు నమ్మకంగా మొదటి ముఖానికి తిరిగి రారు. క్వాంటం సూపర్‌పొజిషన్ మరియు క్లాసికల్ యాదృచ్ఛికత మధ్య ఉన్న ఈ తేడా — యాంప్లిట్యూడ్‌లు రద్దుకాగలవు అనే వాస్తవం — ఈ కోర్సులోని ప్రతి క్వాంటం అల్గారిథమ్ ఉపయోగించుకోవాలని ప్రయత్నించే ముడి వనరు.

## పరిష్కరించిన ఉదాహరణ: కొలత సంభావ్యతను చదవడం

ఏదో సర్క్యూట్ తర్వాత ఒక క్విట్ $|\psi\rangle = \frac{\sqrt{3}}{2}|0\rangle + \frac{1}{2}|1\rangle$ స్థితిలో ఉందనుకుందాం. 0 కొలిచే సంభావ్యత $\left(\frac{\sqrt{3}}{2}\right)^2 = \frac{3}{4}$, మరియు 1 కొలిచే సంభావ్యత $\left(\frac{1}{2}\right)^2 = \frac{1}{4}$. $\frac{3}{4} + \frac{1}{4} = 1$ అని గమనించండి, ఇది ఖచ్చితంగా ఉండాలి — ఇవి మాత్రమే సాధ్యమయ్యే రెండు ఫలితాలు, కాబట్టి వాటి సంభావ్యతల మొత్తం ఎప్పుడూ 1 అవుతుంది.

## సారాంశం

కొలత సూపర్‌పొజిషన్‌ను ఖచ్చితమైన క్లాసికల్ ఫలితంగా కుప్పకూలుస్తుంది, దాని సంభావ్యత యాంప్లిట్యూడ్ వర్గం నుండి వస్తుంది. కానీ అది జరగడానికి ముందు, యాంప్లిట్యూడ్‌లు వ్యతికరణం చెందగలవు — ఒకదానొకటి బలపరుచుకుంటూ లేదా రద్దు చేసుకుంటూ — ఏ క్లాసికల్ సంభావ్యత విభజన కూడా పునరావృతం చేయలేని విధంగా. క్వాంటం అల్గారిథమ్‌లు, సంక్షిప్తంగా, ఈ వ్యతికరణాన్ని అమర్చే విస్తృతమైన మార్గాలు, తప్పు సమాధానాలు రద్దయిపోయి, చివరకు కొలిచేటప్పుడు సరైన సమాధానం మాత్రమే మిగిలేలా చేయడం కోసం.', 'te', 'beginner', 1),
  ('QT-M1', 'ఎంటాంగిల్‌మెంట్ (Entanglement)', 'సూపర్‌పొజిషన్‌లో ఒంటరి క్విట్ ఇప్పటికే విచిత్రంగా ఉంటుంది. రెండు క్విట్‌లు కలిసి ఇంకా విచిత్రంగా ఉండగలవు. రెండు క్విట్‌లు **ఎంటాంగుల్డ్ (entangled)** అయినప్పుడు, వాటి కలిపిన స్థితిని "క్విట్ A ఈ స్థితిలో ఉంది, వేరుగా క్విట్ B ఆ స్థితిలో ఉంది" అని వర్ణించలేము. ఈ రెండు క్విట్‌లు కేవలం ఒకే భాగస్వామ్య వివరణగా మాత్రమే అర్థవంతంగా ఉంటాయి.

## బెల్ స్థితి (Bell state)

అత్యంత ప్రసిద్ధ ఉదాహరణ బెల్ స్థితి:

$$|\Phi^+\rangle = \frac{1}{\sqrt{2}}|00\rangle + \frac{1}{\sqrt{2}}|11\rangle$$

$|00\rangle$ ను "క్విట్ A కూడా 0, క్విట్ B కూడా 0" అని చదవండి, $|11\rangle$ ను "రెండూ 1" అని చదవండి. ఈ స్థితి చెప్పేది: మీరు రెండు క్విట్‌లనూ కొలిస్తే, మీకు "రెండూ 0" లేదా "రెండూ 1" వస్తాయి, ప్రతిదీ 50% సంభావ్యతతో — కానీ మీకు *ఎప్పుడూ* "A అనేది 0 మరియు B అనేది 1" రాదు, ప్రతి క్విట్‌ను ఒంటరిగా కొలిచినప్పుడు అది పూర్తిగా యాదృచ్ఛికంగా (50/50) కనిపించినా సరే. ఈ రెండు క్విట్‌ల ఫలితాలు భౌతికంగా ఎంత దూరంలో ఉన్నా పరిపూర్ణంగా సహసంబంధం కలిగి ఉంటాయి.

**సారూప్యత (analogy):** రెండు నాణేలను ఊహించండి, ఇవి మాయాజాలంగా ఎలా అనుసంధానించబడ్డాయంటే, మీరు ఒకదాన్ని తిప్పి చూసినప్పుడల్లా, రెండోది — తక్షణమే, భూమి యొక్క వేరొక చివర ఉన్నా సరే — *దాన్ని* చూసినప్పుడు అదే ముఖాన్ని చూపిస్తుందని హామీ ఉంటుంది. చూసేముందు ఏ నాణేనికీ నిర్ణీతమైన ముఖం ఉండదు (ఇది సూపర్‌పొజిషన్ భాగం), కానీ ఒకదాన్ని చూసిన క్షణమే, రెండోదాని ఫలితం కూడా స్థిరపడుతుంది. ఏ క్లాసికల్ యాదృచ్ఛికత కూడా ఉత్పత్తి చేయలేనంత బలమైన ఈ సహసంబంధమే ఎంటాంగిల్‌మెంట్.

ఐన్‌స్టీన్ దీన్ని ప్రసిద్ధంగా "దూరం నుండి భయానక చర్య (spooky action at a distance)" అని పిలిచాడు, మరియు దీనితో అసౌకర్యంగా భావించాడు — కానీ అప్పటి నుండి ఇది ప్రయోగాత్మకంగా చాలాసార్లు నిర్ధారించబడింది.

## ఎంటాంగిల్‌మెంట్ సందేశాలు పంపదు

ఒక సాధారణ అపోహను నేరుగా తొలగించడం ముఖ్యం: ఎంటాంగిల్‌మెంట్‌ను కాంతి కంటే వేగంగా సమాచారం పంపడానికి ఉపయోగించలేము. కారణం ఇది: క్విట్ A ను కొలిచే వ్యక్తికి నిజంగా యాదృచ్ఛికమైన 0 లేదా 1 కనిపిస్తుంది — వారికి తమకు ఏ ఫలితం రావాలో *ఎంచుకునే* మార్గం లేదు, కాబట్టి వారు దానిలో ఏ సందేశాన్నీ ఎన్‌కోడ్ చేయలేరు. క్విట్ B ను కొలిచిన వారితో ఎవరైనా తమ నోట్లను పోల్చుకున్నప్పుడే సహసంబంధం కనిపిస్తుంది, మరియు నోట్లను పోల్చుకోవడానికి సాధారణ, కాంతి-వేగం లేదా అంతకంటే నెమ్మది సమాచార మార్గం అవసరం. ఎంటాంగిల్‌మెంట్ మీకు సహసంబంధాన్ని ఇస్తుంది, నియంత్రణను కాదు — ఈ పరిమితే ఒక సిద్ధాంతం, దీన్ని నో-సిగ్నలింగ్ సూత్రం అంటారు.

## పరిష్కరించిన ఉదాహరణ: బెల్ స్థితిని నిర్మించడం

పైన ఉన్న బెల్ స్థితిని రెండు క్విట్‌లపై, రెండూ $|0\rangle$ నుండి మొదలుపెట్టి, రెండు-గేట్ సర్క్యూట్‌తో సృష్టించవచ్చు:

1. క్విట్ A పై హడమార్డ్ గేట్ $H$ వేయండి: దీనివల్ల $|0\rangle_A$, $\frac{1}{\sqrt{2}}(|0\rangle_A + |1\rangle_A)$ అవుతుంది, కాబట్టి కలిపిన స్థితి (క్విట్ B ఇప్పటికీ $|0\rangle$ వద్ద) $\frac{1}{\sqrt{2}}(|00\rangle + |10\rangle)$.
2. క్విట్ A ను కంట్రోల్‌గా, క్విట్ B ను టార్గెట్‌గా చేసి CNOT గేట్ వేయండి: కంట్రోల్ $|1\rangle$ అయినప్పుడు CNOT టార్గెట్ క్విట్‌ను తిప్పుతుంది. కాబట్టి $|00\rangle$ పదం మారదు, మరియు $|10\rangle$ పదం $|11\rangle$ అవుతుంది.

ఫలితం సరిగ్గా $\frac{1}{\sqrt{2}}(|00\rangle + |11\rangle)$ — పూర్తిగా స్వతంత్రంగా మొదలైన రెండు క్విట్‌ల నుండి ఎంటాంగుల్డ్ స్థితి. ఈ "ముందు హడమార్డ్, తర్వాత CNOT" నమూనా క్వాంటం సర్క్యూట్‌లలో అత్యంత సాధారణ నిర్మాణ-భాగాలలో ఒకటి, మరియు దీన్ని మీరు తర్వాతి మాడ్యూల్‌లో మళ్ళీ కలుస్తారు.

## సారాంశం

ఎంటాంగుల్డ్ క్విట్‌లు స్వతంత్ర ప్రతి-క్విట్ స్థితులుగా విడగొట్టలేని ఒకే వివరణను పంచుకుంటాయి. ఒకదాన్ని కొలవడం రెండోదాని గురించి ఏదో ఖచ్చితమైనదాన్ని తక్షణమే తెలియజేస్తుంది, వాటి మధ్య దూరం ఎంత ఉన్నా — కానీ ఈ సహసంబంధాన్ని *కనుగొనడం* మాత్రమే సాధ్యం, సమాచారం పంపడానికి *ఉపయోగించడం* కాదు. సూపర్‌పొజిషన్‌తో పాటు, ఎంటాంగిల్‌మెంట్ క్వాంటం అల్గారిథమ్‌లు ఆధారపడే మరో ప్రధాన వనరు.', 'te', 'beginner', 2),
  ('QT-M1', 'ప్రాథమిక సింగిల్- మరియు మల్టీ-క్విట్ గేట్‌లు (Basic Single- and Multi-Qubit Gates)', 'AND మరియు OR వంటి క్లాసికల్ లాజిక్ గేట్‌లు సాధారణంగా **తిరిగివ్వలేనివి (irreversible)** — AND గేట్ యొక్క అవుట్‌పుట్ చూసి రెండు ఇన్‌పుట్‌లు ఏమిటో సాధారణంగా మీరు తెలుసుకోలేరు, ఎందుకంటే సమాచారం పారవేయబడింది. క్వాంటం గేట్‌లు అలా చేయలేవు. ప్రతి క్వాంటం గేట్ **తిరిగివ్వదగినది (reversible)** (సాంకేతికంగా: యూనిటరీ), అంటే దాన్ని ఎల్లప్పుడూ రద్దుచేసి మీ అసలు స్థితిని తిరిగి పొందవచ్చు. ఈ పాఠం మీరు నిరంతరం ఉపయోగించే కొన్ని గేట్‌లను కవర్ చేస్తుంది.

## సింగిల్-క్విట్ గేట్‌లు

**X గేట్ (క్వాంటం NOT):** $|0\rangle \leftrightarrow |1\rangle$ ను తిప్పుతుంది, సరిగ్గా క్లాసికల్ NOT లాగే. $X|0\rangle = |1\rangle$ మరియు $X|1\rangle = |0\rangle$.

**Z గేట్:** $|0\rangle$ ను మార్చకుండా వదిలేస్తుంది కానీ $|1\rangle$ యొక్క *గుర్తు (sign)* ను తిప్పుతుంది: $Z|0\rangle = |0\rangle$ మరియు $Z|1\rangle = -|1\rangle$. ఆ మైనస్ గుర్తు పనికిరానిదిగా అనిపించవచ్చు — $|1\rangle$ మరియు $-|1\rangle$ లను కొలిస్తే ఒకే సంభావ్యతలు వస్తాయి — కానీ క్విట్ సూపర్‌పొజిషన్‌లో ఉన్నప్పుడు ఇది చాలా ముఖ్యం అవుతుంది, ఎందుకంటే ఇప్పుడు ఆ గుర్తు ఇతర యాంప్లిట్యూడ్‌లతో వ్యతికరణం చెందగలదు (గత పాఠంలో డబుల్-హడమార్డ్ ట్రిక్‌లో మనం చూసినట్లుగా).

**H గేట్ (హడమార్డ్):** సమాన సూపర్‌పొజిషన్‌లను సృష్టించే గేట్, ఇప్పటికే రెండుసార్లు పరిచయం చేయబడింది: $H|0\rangle = \frac{1}{\sqrt{2}}(|0\rangle + |1\rangle)$ మరియు $H|1\rangle = \frac{1}{\sqrt{2}}(|0\rangle - |1\rangle)$. రెండో లైన్‌లోని మైనస్ గుర్తును గమనించండి — దీనివల్లే $H$ ను రెండుసార్లు వేసినప్పుడు అది తనను తానే రద్దు చేసుకోగలదు, ఇది మనం ఇంతకు ముందు చూశాం.

## ఒక రెండు-క్విట్ గేట్: CNOT

**CNOT (కంట్రోల్డ్-NOT)** గేట్ రెండు క్విట్‌లపై పనిచేస్తుంది: ఒక *కంట్రోల్* మరియు ఒక *టార్గెట్*. కంట్రోల్ $|0\rangle$ అయితే, టార్గెట్‌కు ఏమీ జరగదు. కంట్రోల్ $|1\rangle$ అయితే, టార్గెట్ తిరగబడుతుంది (దానిపై X గేట్ వేసినట్లు). నాలుగు బేసిస్ స్థితులన్నింటికీ రాస్తే:

- $|00\rangle \to |00\rangle$
- $|01\rangle \to |01\rangle$
- $|10\rangle \to |11\rangle$
- $|11\rangle \to |10\rangle$

గత పాఠంలోని బెల్-స్థితి ఉదాహరణలో మీరు చూసినట్లు, CNOT అనేది క్విట్‌లు ఒకదానితో ఒకటి ఎంటాంగుల్ అయ్యే మార్గం, మరియు ప్రతి క్విట్ ఒంటరిగా తిరుగుతూ ఉండటం కాకుండా, సమాచారం క్విట్‌ల *మధ్య* పంచుకోబడే మార్గం.

## పరిష్కరించిన ఉదాహరణ: రెండు-గేట్ సర్క్యూట్‌ను ట్రేస్ చేయడం

$|0\rangle$ నుండి మొదలుపెట్టి $X$, తర్వాత $H$ వేయండి:

1. $X|0\rangle = |1\rangle$
2. $H|1\rangle = \frac{1}{\sqrt{2}}(|0\rangle - |1\rangle)$

కాబట్టి చివరి స్థితి $\frac{1}{\sqrt{2}}|0\rangle - \frac{1}{\sqrt{2}}|1\rangle$ — సమాన సూపర్‌పొజిషన్, కానీ ఒక *సాపేక్ష దశ (relative phase)* (ఆ మైనస్ గుర్తు)తో, ఇది కేవలం $H$ తో మాత్రమే నిర్మించిన సమాన సూపర్‌పొజిషన్‌లో ఉండదు. రెండు స్థితులూ కొలిస్తే 50/50 ఫలితాలను ఇస్తాయి, కానీ తదుపరి గేట్‌ల కింద అవి వేర్వేరుగా ప్రవర్తిస్తాయి — క్వాంటం అల్గారిథమ్‌లు నిర్మించబడేది సరిగ్గా ఇలాంటి సూక్ష్మ విషయాలపైనే.

## సారాంశం

X, Z, మరియు H ప్రధాన సింగిల్-క్విట్ చర్యలు — తిప్పడం, దశ-తిప్పడం, మరియు సూపర్‌పొజ్ చేయడం. రెండు క్విట్‌లను కలపడానికి CNOT సరళమైన మార్గం మరియు ఎంటాంగిల్‌మెంట్ సృష్టించడానికి ప్రామాణిక సాధనం. ఈ గేట్‌లలో ప్రతి ఒక్కటీ దాన్ని మళ్ళీ వేయడం ద్వారా (లేదా కొన్నింటికి, విలోమ గేట్‌ను వేయడం ద్వారా) రద్దు చేయవచ్చు — క్వాంటం సర్క్యూట్‌లో ఎప్పుడూ ఏదీ పారవేయబడదు, కేవలం పునఃక్రమబద్ధీకరించబడుతుంది. తర్వాతి మాడ్యూల్‌లో, ఈ చిన్న భాగాలు కలిసి నిజమైన సర్క్యూట్‌లుగా ఎలా మారతాయో మీరు చూస్తారు.', 'te', 'beginner', 3),
  ('QT-M2', 'సర్క్యూట్‌లు ఎలా నిర్మించబడతాయి మరియు చదవబడతాయి (How Circuits Are Built and Read)', 'ఒక క్వాంటం సర్క్యూట్ ఒక వంటకం (recipe): క్విట్‌ల సమూహంపై వేసిన గేట్‌ల వరుస, ఎడమ నుండి కుడికి చదవబడుతుంది, మరియు (సాధారణంగా) కొలతతో ముగుస్తుంది. మీరు ఎప్పుడైనా సంగీత నొటేషన్ (sheet music) చదివి ఉంటే, ఈ చిత్రం మీకు పరిచయమే — ప్రతి క్షితిజసమాంతర రేఖ ఒక వాయిద్యం (ఇక్కడ, ఒక క్విట్) మరియు సమయం పేజీలో ఎడమ నుండి కుడికి కదులుతుంది.

## సర్క్యూట్ డయాగ్రామ్ నిర్మాణం

- **వైర్‌లు (wires):** ప్రతి క్షితిజసమాంతర రేఖ ఒక క్విట్‌ను సూచిస్తుంది, మరియు వైర్‌పై దాని స్థానం (ఎడమ నుండి కుడికి) సమయాన్ని సూచిస్తుంది. ఒక క్విట్ యొక్క వైర్ అది మొదలైన క్షణం నుండి (దాదాపు ఎల్లప్పుడూ $|0\rangle$ వద్ద) కొలిచే క్షణం వరకు నిరంతరంగా సాగుతుంది.
- **గేట్ బాక్సులు:** వైర్‌పై లేబుల్ చేయబడిన బాక్స్ (ఉదాహరణకు "H" లేదా "X" అని లేబుల్ చేసిన బాక్స్) అంటే "ఈ సమయంలో ఈ క్విట్‌పై ఈ గేట్‌ను వేయండి" అని అర్థం.
- **నిలువు అనుసంధానాలు (vertical connections):** ఒక గేట్ ఒకటి కంటే ఎక్కువ క్విట్‌లను కలిగి ఉన్నప్పుడు — గత మాడ్యూల్‌లోని CNOT లాగా — ఒక నిలువు రేఖ సంబంధిత క్విట్‌లను కలుపుతుంది, అవి ఒకేసారి, ఒకే సమయంలో పనిచేయబడుతున్నాయని చూపిస్తుంది.
- **కొలత (measurement):** సాధారణంగా వైర్ చివర ఒక చిన్న మీటర్-డయల్ గుర్తుతో గీయబడుతుంది, ఇది క్విట్ యొక్క క్వాంటం స్థితి ఎక్కడ కొలవబడి, సాధారణ కంప్యూటర్ చదవగల మరియు నిల్వ చేయగల ఒక సాధారణ క్లాసికల్ బిట్ (0 లేదా 1) గా మార్చబడుతుందో గుర్తిస్తుంది.

## చదివే క్రమం ముఖ్యం

సర్క్యూట్‌లు ఎడమ నుండి కుడికి చదవబడతాయి కాబట్టి, ఒక వైర్‌పై గేట్‌ల *క్రమం* అవి వేయబడిన క్రమమే — ఒకే క్విట్‌పై రెండు గేట్‌ల క్రమాన్ని మార్చడం పూర్తిగా వేరే సర్క్యూట్ (సాధారణంగా; కొన్ని గేట్‌లు కమ్యూట్ అవుతాయి, అంటే ఆ ప్రత్యేక జతకు క్రమం పట్టింపు లేదు, కానీ మీరు దాన్ని ఊహించకూడదు). ఇది, ఉదాహరణకు, ఒక సాధారణ పదార్థాల జాబితా కంటే భిన్నం, అక్కడ క్రమం తరచుగా అనువైనది — సర్క్యూట్ డయాగ్రామ్ నంబర్ చేసిన సూచనల సమూహానికి మరింత దగ్గరగా ఉంటుంది.

## పరిష్కరించిన ఉదాహరణ: బెల్-స్థితి సర్క్యూట్‌ను చదవడం

గత మాడ్యూల్‌లోని ఎంటాంగిల్‌మెంట్ సర్క్యూట్‌ను గుర్తుచేసుకోండి: క్విట్ A పై హడమార్డ్, తర్వాత A ను కంట్రోల్‌గా, B ను టార్గెట్‌గా చేసి CNOT. సర్క్యూట్‌గా గీస్తే, ఇది రెండు వైర్‌లు ($q_0$ మరియు $q_1$ లేబుల్ చేయబడినవి) లాగా కనిపిస్తుంది, ఎడమ అంచుకు దగ్గరగా $q_0$ వైర్‌పై "H" బాక్స్ ఉంటుంది, మరియు — కొంచెం కుడివైపుకు, హడమార్డ్ ముందుగా జరుగుతుందని స్పష్టం చేయడానికి — ఒక CNOT గుర్తు ($q_0$ వైర్‌పై ఒక ఘన బిందువు, నిలువు రేఖ ద్వారా $q_1$ వైర్‌పై $\oplus$ గుర్తుతో కలుపబడింది). ఎడమ నుండి కుడికి చదవడం ఏమి జరిగిందో, ఏ క్రమంలో జరిగిందో ఖచ్చితంగా చెబుతుంది: ముందుగా క్విట్ 0 ను సూపర్‌పొజ్ చేయండి, తర్వాత దాన్ని క్విట్ 1 తో ఎంటాంగుల్ చేయండి. ఈ రెండు గేట్‌లు వ్యతిరేక క్రమంలో గీయబడితే, సర్క్యూట్ క్విట్ 0 స్థితిని సూపర్‌పొజిషన్‌లో పెట్టకముందే దాన్ని కంట్రోల్‌గా ఉపయోగించడానికి ప్రయత్నిస్తుంది — పూర్తిగా వేరే (మరియు చాలా తక్కువ ఆసక్తికరమైన) సర్క్యూట్.

## మీరే సర్క్యూట్‌లు నిర్మించేటప్పుడు ఈ సంప్రదాయం ఎందుకు ముఖ్యం

మీరు సర్క్యూట్ బిల్డర్‌లో (తర్వాతి మాడ్యూల్‌లో వచ్చేది) ఒక సర్క్యూట్‌ను నిర్మించేటప్పుడు, మీరు సరిగ్గా ఇదే ఎడమ-నుండి-కుడి శైలిలో క్విట్ వైర్‌లపై గేట్‌లను లాగుతారు, కాబట్టి ఇప్పటికే ఉన్న సర్క్యూట్ డయాగ్రామ్‌లను చదవడంలో సౌకర్యంగా ఉండటం నిజానికి మీ సొంత సర్క్యూట్‌ను నిర్మించడం అదే నైపుణ్యం — మీరు దాన్ని రివర్స్‌లో చేస్తున్నారు అంతే.

## సారాంశం

సర్క్యూట్ డయాగ్రామ్ ఎడమ నుండి కుడికి, పైనుండి కిందికి చదవబడుతుంది: వైర్‌లు క్విట్‌లు, బాక్సులు గేట్‌లు, నిలువు రేఖలు కలిసి పనిచేసే క్విట్‌లను కలుపుతాయి, మరియు మీటర్ గుర్తు కొలతను సూచిస్తుంది. వైర్‌పై క్రమం అర్థవంతమైనది మరియు సాధారణంగా మార్చకూడదు. ఈ సంప్రదాయం అర్థమైన తర్వాత, ఎంత సంక్లిష్టంగా ఉన్నా, తర్వాత మీరు చూసే ప్రతి సర్క్యూట్ డయాగ్రామ్ ఇదే వర్ణమాల, కేవలం ఎక్కువసార్లు ఉపయోగించబడింది.', 'te', 'beginner', 0),
  ('QT-M2', 'సాధారణ గేట్ కలయికలు మరియు అవి ఏమి చేస్తాయి (Common Gate Combinations and What They Do)', 'వ్యక్తిగత గేట్‌లు సరళమైనవి, కానీ నిజమైన సర్క్యూట్‌లు చిన్న, పదేపదే ఉపయోగించే కలయికల నుండి నిర్మించబడతాయి, ఇవి మళ్ళీమళ్ళీ కనిపిస్తాయి. ఈ నమూనాలను గుర్తించడం సర్క్యూట్‌లను చదవడం (మరియు చివరికి రాయడం) చాలా వేగవంతం చేస్తుంది — ప్రతి గేట్‌ను ఒక్కొక్కటిగా ట్రేస్ చేసే బదులు, అనుభవజ్ఞుడైన ప్రోగ్రామర్ ఒక్క చూపులో for-loop ను గుర్తించినట్లే, "అరే, ఇది బెల్-స్థితి తయారీ" అని మీకు కనిపించడం మొదలవుతుంది.

## ముందు H తర్వాత CNOT: రెండు క్విట్‌లను ఎంటాంగుల్ చేయడం

ఎంటాంగిల్‌మెంట్ పాఠంలో ఇది ఇప్పటికే కవర్ చేయబడింది: ఒక క్విట్‌పై హడమార్డ్, తర్వాత ఆ క్విట్‌ను కంట్రోల్‌గా చేసి CNOT, బెల్ స్థితిని సృష్టిస్తుంది. ఎంటాంగిల్‌మెంట్ ఇంత కేంద్రీయ వనరు కాబట్టి, ఈ రెండు-గేట్ బ్లాక్ ప్రారంభ క్వాంటం సర్క్యూట్‌లలో బహుశా అత్యంత సాధారణ మూలాంశం (motif).

## ప్రతి క్విట్‌పై హడమార్డ్: ఏకరూప సూపర్‌పొజిషన్

$|0\rangle$ వద్ద మొదలయ్యే $n$ క్విట్‌లపై $H$ వేయండి, మీకు సాధ్యమయ్యే అన్ని $2^n$ బిట్ స్ట్రింగ్‌ల ఏకరూప సూపర్‌పొజిషన్ ఒకేసారి వస్తుంది. $n=2$ కోసం:

$$H^{\otimes 2}|00\rangle = \frac{1}{2}\left(|00\rangle + |01\rangle + |10\rangle + |11\rangle\right)$$

నాలుగు ఫలితాలలో ప్రతిదానికీ సమాన యాంప్లిట్యూడ్ $\frac{1}{2}$, మరియు సమాన సంభావ్యత $\frac{1}{4}$ ఉంటుంది. ఈ "హడమార్డ్ గోడ" — సర్క్యూట్ ప్రారంభంలోనే ప్రతి క్విట్‌పై H గేట్‌ల స్తంభం — తర్వాతి మాడ్యూల్‌లోని అనేక అల్గారిథమ్‌లకు (డ్యూష్-జోసా, బర్న్‌స్టయిన్-వజీరాని, సైమన్స్, మరియు గ్రోవర్స్ — అన్నీ ఇలాగే మొదలవుతాయి) ప్రామాణిక ప్రారంభ ఎత్తు, ఎందుకంటే ఇది తదుపరి ఒక్క ఆపరేషన్‌ను ఒకేసారి అన్ని $2^n$ అవకాశాలపై పనిచేయనిస్తుంది, ఒక్కొక్కటిగా కాదు.

## ఒకే గేట్ రెండుసార్లు: తరచుగా (కానీ ఎప్పుడూ కాదు) ఐడెంటిటీ

$H$ ను రెండుసార్లు వేసినప్పుడు $|0\rangle$, $|0\rangle$ కు తిరిగి వస్తుందని — తనను తానే రద్దు చేసుకుంటూ — మనం ఇప్పటికే చూశాం. $X$ కు కూడా ఇదే నిజం (రెండుసార్లు తిప్పండి, మీరు మొదలుపెట్టిన చోటికే తిరిగి వస్తారు) మరియు CNOT కు కూడా (అదే CNOT ను రెండుసార్లు వేయండి, రెండోది మొదటిదాన్ని రద్దు చేస్తుంది). ఈ "వేయండి, తర్వాత రద్దు చేయడానికి మళ్ళీ వేయండి" నమూనాను **అన్‌కంప్యుటేషన్ (uncomputation)** అంటారు, మరియు ఇది నిజంగా ఉపయోగకరమైన సర్క్యూట్-డిజైన్ ఉపాయం: ఒక గణనకు సహాయం చేయడానికి మీకు తాత్కాలిక క్విట్ అవసరమైతే కానీ చివరిలో మీ సమాధానంతో అది ఎంటాంగుల్డ్‌గా ఉండకూడదనుకుంటే, గందరగోళాన్ని సృష్టించిన ఆపరేషన్‌ను నడుపుతారు, తర్వాత దాన్ని శుభ్రం చేయడానికి దాన్ని (లేదా దాని విలోమాన్ని) మళ్ళీ నడుపుతారు.

## SWAP: రెండు క్విట్‌ల స్థితులను మార్చుకోవడం

కొన్నిసార్లు మీరు ఒక క్విట్ స్థితిని వేరే వైర్‌కు తరలించాలి — ఉదాహరణకు, తర్వాతి గేట్ వేరే చోట ఉండాల్సి రావడం వల్ల. SWAP గేట్ రెండు క్విట్‌ల స్థితులను మార్చుకుంటుంది, మరియు దీన్ని వరుసగా మూడు CNOT ల నుండి (కంట్రోల్ మరియు టార్గెట్‌లను మార్చుకుంటూ) నిర్మించవచ్చు: CNOT(A,B), తర్వాత CNOT(B,A), తర్వాత మళ్ళీ CNOT(A,B). మీరు చేతితో SWAP ను నిర్మించాల్సిన అవసరం చాలా అరుదు — చాలా క్వాంటం ప్రోగ్రామింగ్ సాధనాలు దీన్ని ఒకే బిల్ట్-ఇన్ గేట్‌గా ఇస్తాయి — కానీ మూడు మారుతున్న CNOT లను "అరే, ఇది కేవలం SWAP" అని గుర్తించడం ఉపయోగకరమైన నమూనా.

## పరిష్కరించిన ఉదాహరణ: నమూనాను గుర్తించడం

మీకు 3 క్విట్‌లపై ఒక సర్క్యూట్ ఇవ్వబడిందనుకోండి, మరియు గీయబడిన మొదటి విషయం మూడు వైర్‌లలో ప్రతిదానిపై H గేట్, అన్నీ ఒకే ప్రారంభ స్థానంలో వరుసలో ఉన్నాయి. సర్క్యూట్‌లో మరేదీ చూడకముందే, మీకు ఇప్పటికే తెలుసు: ఈ సర్క్యూట్ మూడు క్విట్‌లనూ సాధ్యమయ్యే అన్ని $2^3 = 8$ 3-బిట్ స్ట్రింగ్‌ల ఏకరూప సూపర్‌పొజిషన్‌లో ఉంచడం ద్వారా మొదలవుతుంది. తర్వాత ఏమి వచ్చినా, అది అన్ని 8 అవకాశాలపై సమాంతరంగా పనిచేస్తోంది.

## సారాంశం

మీరు ఎదుర్కొనే చాలా సర్క్యూట్‌లు కొన్ని పదేపదే వచ్చే బ్లాకుల నుండి నిర్మించబడతాయి: ఎంటాంగుల్ చేయడానికి హడమార్డ్-తర్వాత-CNOT, ఏకరూప సూపర్‌పొజిషన్ కోసం హడమార్డ్ గోడ, అన్‌కంప్యుటేషన్ కోసం పునరావృత గేట్‌లు, మరియు మార్చుకోవడానికి CNOT త్రయాలు. ఈ నమూనాలను గుర్తించడం నేర్చుకోవడమే సర్క్యూట్-చదవడాన్ని విసుగైన గేట్-బై-గేట్ ట్రేసింగ్ నుండి వేగవంతమైన నమూనా-గుర్తింపుగా మారుస్తుంది.', 'te', 'beginner', 1),
  ('QT-M2', 'సర్క్యూట్ డయాగ్రామ్ నొటేషన్ (Circuit Diagram Notation)', 'ఈ పాఠం మీరు క్వాంటం సర్క్యూట్ డయాగ్రామ్‌లలో ప్రతిచోటా చూసే నిర్దిష్ట గుర్తుల కోసం ఒక సూచిక — ఈ కోర్సులో, సర్క్యూట్ బిల్డర్‌లో, మరియు తర్వాత మీరు తారసపడే ఏ క్వాంటం కంప్యూటింగ్ పరిశోధనా పత్రం లేదా పాఠ్యపుస్తకంలోనైనా. ప్రధాన వర్ణమాల చిన్నది, మరియు ఒకసారి దాన్ని గుర్తుపెట్టుకున్న తర్వాత, ప్రతి సర్క్యూట్ డయాగ్రామ్ చదవదగినదిగా మారుతుంది.

## వైర్‌లు: సింగిల్ vs డబుల్ రేఖలు

ఒక సింగిల్ క్షితిజసమాంతర రేఖ ఒక **క్వాంటం వైర్** — ఇది క్విట్ యొక్క క్వాంటం స్థితిని మోస్తుంది. కొలత తర్వాత, డయాగ్రామ్‌లో మిగిలిన భాగానికి వైర్ తరచుగా **డబుల్ రేఖ**గా గీయబడుతుంది, ఈ బిందువు నుండి ముందుకు, ఇది క్వాంటం స్థితిని కాకుండా, సాధారణ క్లాసికల్ బిట్ (కేవలం 0 లేదా 1, ఇక సూపర్‌పొజిషన్ కాదు) ను మోస్తోందని సూచిస్తుంది.

## గేట్ బాక్సులు

ఒక వైర్‌పై ఉంచిన లేబుల్ చేసిన దీర్ఘచతురస్రం — "X", "H", "Z", మొదలైనవి — అంటే "ఇక్కడ ఈ గేట్‌ను వేయండి" అని అర్థం. కొన్ని గేట్‌లకు లేబుల్ చేసిన బాక్స్ బదులుగా వాటి స్వంత గుర్తులు ఉంటాయి: హడమార్డ్‌ను తరచుగా "H" అని రాసిన బాక్స్‌గా గీస్తారు, కానీ మీరు రొటేషన్ గేట్‌లను $R_x(\theta)$, $R_y(\theta)$, లేదా $R_z(\theta)$ గా కోణ పారామీటర్‌తో రాసినట్లు కూడా చూస్తారు, ఎందుకంటే కొన్ని గేట్‌లు (X, Z, మరియు H కు భిన్నంగా) నిర్ణీతమైనవి కాకుండా నిరంతర, సర్దుబాటు చేయదగిన (tunable) విలువపై ఆధారపడి ఉంటాయి. ఈ కోర్సులో తర్వాత వేరియేషనల్ అల్గారిథమ్‌ల మాడ్యూల్‌కు చేరుకున్నప్పుడు మీరు ఇలాంటి పారామీటరైజ్డ్ రొటేషన్ గేట్‌లను నేరుగా కలుస్తారు.

## కంట్రోల్‌లు మరియు టార్గెట్‌లు

వైర్‌పై ఒక **ఘన బిందువు (•)** ఒక *కంట్రోల్* క్విట్‌ను సూచిస్తుంది. ఒక నిలువు రేఖ దాన్ని ఇతర వైర్(ల)పై నియంత్రిత ఆపరేషన్‌తో కలుపుతుంది — ప్రత్యేకంగా CNOT కోసం, టార్గెట్‌ను లోపల ప్లస్ గుర్తుతో ఉన్న వృత్తంగా, $\oplus$, గీస్తారు. ఒక బిందువు రేఖ ద్వారా $\oplus$ గుర్తుకు కలుపబడి ఉండటం చూడటం "ఇది CNOT" అని తక్షణమే గుర్తించడానికి సహాయపడుతుంది. మరింత సాధారణ నియంత్రిత గేట్‌లు (కంట్రోల్డ్-Z, కంట్రోల్డ్-రొటేషన్, మొదలైనవి) అదే బిందువు-మరియు-రేఖ సంప్రదాయాన్ని ఉపయోగిస్తాయి, కేవలం టార్గెట్ చివర $\oplus$ బదులు వేరే గుర్తుతో.

## కొలత

ఒక చిన్న **మీటర్-డయల్ గుర్తు** (ఇది నిజంగా ఒక చిన్న స్పీడోమీటర్‌లా కనిపిస్తుంది) ఒక క్విట్ ఎక్కడ కొలవబడుతుందో సూచిస్తుంది. ఇది దాదాపు ఎల్లప్పుడూ వైర్‌పై చివరి విషయం, ఎందుకంటే క్విట్ యొక్క క్వాంటం ప్రవర్తన కొలిచిన క్షణమే "ఉపయోగించబడుతుంది" — మరింత అధునాతన సర్క్యూట్‌లలో, మీరు సర్క్యూట్ మధ్యలో ఒక క్విట్‌ను కొలిచి, ఫలితాన్ని తదుపరి గేట్‌లను నియంత్రించడానికి ఉపయోగించవచ్చు, కానీ ఈ కోర్సులో మీరు నిర్మించే సర్క్యూట్‌లలో, కొలత చివరి దశ.

## బారియర్‌లు (Barriers)

అనేక వైర్‌ల మీదుగా విస్తరించిన **డాష్డ్ నిలువు రేఖ** ఒక **బారియర్**. దీనికి ఎలాంటి గణన అర్థం లేదు — దీనివల్ల స్థితి మారదు — ఇది పూర్తిగా దృశ్య/వ్యవస్థీకరణ గుర్తు, సర్క్యూట్ యొక్క ఒక భావనాత్మక దశను (ఉదాహరణకు, "స్థితి తయారీ") తర్వాతిదాని నుండి ("అసలు అల్గారిథమ్") వేరు చేయడానికి తరచుగా ఉపయోగించబడుతుంది, కోడ్‌లో ఖాళీ రేఖ కోడ్ ఏమి చేస్తుందో మార్చకుండా తార్కిక విభాగాలను వేరు చేసినట్లే.

## క్విట్ క్రమం — తర్వాత కోసం ఒక గమనిక

వివిధ సాధనాలు బహు-క్విట్ స్థితులను $|q_1 q_0\rangle$ vs $|q_0 q_1\rangle$ వంటి స్ట్రింగ్‌లుగా రాసేటప్పుడు క్విట్‌లను వేర్వేరు క్రమంలో అమరుస్తాయి. సర్క్యూట్ బిల్డర్ మాడ్యూల్‌లో మీరు ఉపయోగించే సిమ్యులేటర్, Qiskit, **లిటిల్-ఎండియన్ (little-endian)** క్రమాన్ని ఉపయోగిస్తుంది: *అతి తక్కువ ప్రాముఖ్యత* కలిగిన క్విట్ ముందుగా రాయబడుతుంది (కుడివైపు అత్యంత అంచు బిట్ క్విట్ 0 కు అనుగుణంగా ఉంటుంది). మీరు చేతితో గీసిన సర్క్యూట్‌ను సిమ్యులేటర్ అవుట్‌పుట్‌తో మొదటిసారి పోల్చినప్పుడు ఇది "ఆగండి, నా అవుట్‌పుట్ ఎందుకు తలకిందులుగా ఉంది?" అనే గందరగోళానికి ఒక సాధారణ మూలం — తర్వాత ఇది మిమ్మల్ని ఇబ్బంది పెట్టకుండా ఉండటానికి దీన్ని ఇప్పుడే గుర్తుంచుకోవడం మంచిది.

## సారాంశం

సింగిల్ రేఖలు క్వాంటం స్థితులను మోస్తాయి, డబుల్ రేఖలు కొలత తర్వాత క్లాసికల్ బిట్‌లను మోస్తాయి. బిందువు-మరియు-రేఖ నియంత్రిత ఆపరేషన్‌ను సూచిస్తుంది, మీటర్ గుర్తు కొలతను సూచిస్తుంది, మరియు డాష్డ్ రేఖ ఎలాంటి గణన ప్రభావం లేని కేవలం వ్యవస్థీకరణ బారియర్. ఈ పేజీని సూచికగా గుర్తుంచుకోండి — కోర్సు మిగిలిన భాగంలో మీరు సరిగ్గా ఈ నొటేషన్‌నే ఉపయోగించి సర్క్యూట్‌లను అర్థం చేసుకుంటారు.', 'te', 'beginner', 2)
on conflict (module_code, language, order_index) do update
  set title = excluded.title,
      body_markdown = excluded.body_markdown,
      difficulty = excluded.difficulty;
