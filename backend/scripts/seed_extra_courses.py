"""Lessons and challenges for courses QT-M5..QT-M12.

This file is the source of truth for that content. Run it to upsert the
lessons (keyed on module_code + language + order_index) and insert any
challenges not already present (matched by prompt), or pass --sql to print an
equivalent idempotent migration for supabase/migrations.

Usage (from backend/, with the venv active):
    python -m scripts.seed_extra_courses
    python -m scripts.seed_extra_courses --sql > ../supabase/migrations/0007_seed_extra_courses.sql
"""

import argparse
import sys
import json

import httpx
from dotenv import load_dotenv

load_dotenv()

from app.config import settings  # noqa: E402 -- reads env at import time

# (module_code, difficulty, [(title, body_markdown), ...])
COURSES: list[tuple[str, str, list[tuple[str, str]]]] = [
    ("QT-M5", "beginner", [
        ("Complex Numbers and Amplitudes", r"""Quantum states are written with **complex numbers**, so it's worth getting comfortable with them before anything else. A complex number has the form $z = a + bi$, where $a$ and $b$ are ordinary real numbers and $i$ is defined by $i^2 = -1$. You can picture $z$ as a point on a 2D plane: $a$ along the horizontal axis, $b$ along the vertical one.

## Magnitude and phase

Every complex number has a **magnitude** (its distance from the origin) and a **phase** (the angle it makes with the horizontal axis):

$$|z| = \sqrt{a^2 + b^2}, \qquad z = |z|\,e^{i\varphi}$$

That second form uses Euler's formula, $e^{i\varphi} = \cos\varphi + i\sin\varphi$, and it's the one you'll see most in quantum computing because gates like $S$, $T$, and $R_Z$ act by changing phases.

The **complex conjugate** flips the sign of the imaginary part: $z^* = a - bi$. A handy identity is $z^* z = |z|^2$, which is always a non-negative real number.

## Why amplitudes are complex

A qubit's state $|\psi\rangle = \alpha|0\rangle + \beta|1\rangle$ uses complex amplitudes $\alpha$ and $\beta$. Measurement probabilities come from their magnitudes, $P(0) = |\alpha|^2$ and $P(1) = |\beta|^2$, which is why the rule $|\alpha|^2 + |\beta|^2 = 1$ must hold.

Phases don't change those probabilities on their own, but they decide how amplitudes **interfere** when gates combine them. Two paths with the same phase add up; two with opposite phases cancel. Quantum algorithms are, at heart, carefully arranged interference.

## Worked example

Take $\alpha = \frac{1}{\sqrt{2}}$ and $\beta = \frac{i}{\sqrt{2}}$. Then $|\beta|^2 = \frac{i}{\sqrt{2}} \cdot \frac{-i}{\sqrt{2}} = \frac{1}{2}$, so this state measures 0 or 1 with equal probability, just like $|+\rangle$, yet it is a genuinely different state because of the phase $i$ on $|1\rangle$.

## The takeaway

Amplitudes are complex numbers. Their magnitudes give probabilities; their phases control interference. Keep both in mind and most of quantum computing becomes much easier to follow."""),
        ("Vectors, Matrices, and Dirac Notation", r"""A qubit's state is a **vector** with two complex entries, and a gate is a **matrix** that transforms it. Dirac (bra-ket) notation is just a compact way of writing these.

## Kets are column vectors

$$|0\rangle = \begin{pmatrix} 1 \\ 0 \end{pmatrix}, \qquad |1\rangle = \begin{pmatrix} 0 \\ 1 \end{pmatrix}, \qquad \alpha|0\rangle + \beta|1\rangle = \begin{pmatrix} \alpha \\ \beta \end{pmatrix}$$

A **bra** $\langle\psi|$ is the conjugate transpose of the ket: a row vector with each entry conjugated. Putting a bra and ket together gives the **inner product** $\langle\phi|\psi\rangle$, a single complex number measuring how much two states overlap. For example $\langle 0|1\rangle = 0$ (the basis states are orthogonal) and $\langle\psi|\psi\rangle = 1$ for any valid state.

## Gates are matrices

Applying a gate means multiplying the state vector by the gate's matrix:

$$X = \begin{pmatrix} 0 & 1 \\ 1 & 0 \end{pmatrix}, \qquad H = \frac{1}{\sqrt{2}}\begin{pmatrix} 1 & 1 \\ 1 & -1 \end{pmatrix}$$

So $X|0\rangle = |1\rangle$, and $H|0\rangle = \frac{1}{\sqrt{2}}(|0\rangle + |1\rangle) = |+\rangle$.

Every quantum gate is **unitary**: $U^\dagger U = I$, where $U^\dagger$ is the conjugate transpose. Unitarity guarantees two things at once: probabilities still sum to 1 after the gate, and the gate can always be undone by applying $U^\dagger$.

## Worked example

Apply $H$ twice: $H \cdot H = \frac{1}{2}\begin{pmatrix} 2 & 0 \\ 0 & 2 \end{pmatrix} = I$. That's why two Hadamards in a row cancel out, a pattern you'll spot in many circuits.

## The takeaway

Kets are column vectors, bras are their conjugate transposes, inner products measure overlap, and gates are unitary matrices acting on state vectors. With that dictionary, any circuit diagram can be read as a sequence of matrix multiplications."""),
        ("Tensor Products and Multi-Qubit States", r"""One qubit lives in a 2-dimensional space. Two qubits live in a 4-dimensional space, and $n$ qubits need $2^n$ amplitudes. The operation that builds these bigger spaces is the **tensor product**, written $\otimes$.

## Combining states

$$|a\rangle \otimes |b\rangle = \begin{pmatrix} a_0 \\ a_1 \end{pmatrix} \otimes \begin{pmatrix} b_0 \\ b_1 \end{pmatrix} = \begin{pmatrix} a_0 b_0 \\ a_0 b_1 \\ a_1 b_0 \\ a_1 b_1 \end{pmatrix}$$

We usually shorten $|0\rangle \otimes |1\rangle$ to $|01\rangle$. The four basis states of two qubits are $|00\rangle, |01\rangle, |10\rangle, |11\rangle$.

## Gates on one qubit of many

To apply $H$ to the first qubit only, you use $H \otimes I$, the tensor product of the gate with the identity on the other qubit. Two-qubit gates like CNOT are $4 \times 4$ matrices that can't be split this way.

## Entanglement, precisely

A two-qubit state is a **product state** if it can be written as $|a\rangle \otimes |b\rangle$. If it can't, it's **entangled**. The Bell state

$$|\Phi^+\rangle = \frac{1}{\sqrt{2}}(|00\rangle + |11\rangle)$$

is entangled: try to write it as $(a_0|0\rangle + a_1|1\rangle) \otimes (b_0|0\rangle + b_1|1\rangle)$ and you'd need $a_0 b_1 = 0$ and $a_1 b_0 = 0$ while $a_0 b_0$ and $a_1 b_1$ are both nonzero, which is impossible.

## Why this matters

The $2^n$ growth is the reason classical computers struggle to simulate quantum systems: 50 qubits already need about $10^{15}$ amplitudes. It's also why quantum computers are interesting: they hold and transform that huge state natively.

## The takeaway

Tensor products build multi-qubit states and gates. States that can't be factored into single-qubit pieces are entangled, and the exponential size of the combined space is both the challenge of simulation and the opportunity of quantum computing."""),
    ]),
    ("QT-M6", "beginner", [
        ("Your First Qiskit Circuit", r"""**Qiskit** is an open-source Python toolkit for building and running quantum circuits. Everything you've drawn in the Circuit Builder can be written as a few lines of Qiskit.

## Building a Bell state in code

```python
from qiskit import QuantumCircuit

qc = QuantumCircuit(2, 2)   # 2 qubits, 2 classical bits
qc.h(0)                     # Hadamard on qubit 0
qc.cx(0, 1)                 # CNOT: control 0, target 1
qc.measure([0, 1], [0, 1])  # measure both qubits into both bits
print(qc.draw())
```

Each method call adds one instruction to the circuit, in order. `qc.draw()` prints the same kind of diagram you see in the Composer.

## Qubits and classical bits

A `QuantumCircuit(2, 2)` has two **quantum** registers (the qubits) and two **classical** bits that store measurement results. Measurement is the bridge between them: `measure(q, c)` collapses qubit `q` and writes the outcome to bit `c`.

## Common gates

| Qiskit call | Gate |
|---|---|
| `qc.x(q)` | Pauli-X (NOT) |
| `qc.h(q)` | Hadamard |
| `qc.z(q)`, `qc.s(q)`, `qc.t(q)` | Phase gates |
| `qc.rx(theta, q)` | Rotation about X |
| `qc.cx(c, t)` | CNOT |
| `qc.cz(c, t)` | Controlled-Z |

## Bit ordering

Qiskit numbers qubits from 0 but prints results with qubit 0 as the **rightmost** character. So a result string `"01"` means qubit 0 measured 1 and qubit 1 measured 0. This "little-endian" convention trips up almost everyone once, so it's worth remembering early.

## The takeaway

A Qiskit program creates a `QuantumCircuit`, appends gates in order, and measures qubits into classical bits. The code is a direct translation of the circuit diagram, which makes it easy to move between the two."""),
        ("Shots, Counts, and Simulators", r"""Running a quantum circuit once gives you a single measurement outcome, which on its own tells you very little. To see the probability distribution a circuit produces, you run it many times. Each run is called a **shot**.

## Running on the Aer simulator

```python
from qiskit import QuantumCircuit, transpile
from qiskit_aer import AerSimulator

qc = QuantumCircuit(2, 2)
qc.h(0)
qc.cx(0, 1)
qc.measure([0, 1], [0, 1])

sim = AerSimulator()
result = sim.run(transpile(qc, sim), shots=1024).result()
print(result.get_counts())   # e.g. {'00': 509, '11': 515}
```

The **counts** dictionary maps each observed bitstring to how many shots produced it. Dividing by the number of shots estimates the probability of each outcome.

## Statistical noise

With a perfect simulator, a Bell state should give `00` and `11` exactly half the time, yet you'll see numbers like 509 and 515, not 512 and 512. That's ordinary sampling noise. It shrinks as you add shots, roughly like $1/\sqrt{\text{shots}}$, so 4× the shots halves the typical error.

## Statevector vs. sampling

Simulators can also return the full **statevector**, the exact amplitudes, without measuring. That's great for learning and debugging, but it's something real hardware can never give you. On a real device, counts are all you get.

## Reading results well

- Check that probabilities sum to about 1 and that unexpected outcomes are rare.
- Compare against what the math predicts: a Bell state should almost never produce `01` or `10`.
- When results look wrong, draw the circuit and check qubit ordering first.

## The takeaway

Quantum programs are run for many shots, and results come back as counts. Simulators like Aer let you check your circuits exactly or statistically before spending time on real hardware."""),
        ("Transpilation and Running on Hardware", r"""Real quantum processors don't support every gate, and not every pair of qubits is physically connected. **Transpilation** rewrites your circuit so it can actually run on a specific device.

## What the transpiler does

1. **Basis translation**: rewrites gates into the device's native set. Many superconducting devices natively support only a few operations, such as $\sqrt{X}$, $R_Z$, and one two-qubit gate like CNOT or ECR. A Hadamard becomes a short sequence of those.
2. **Layout**: chooses which physical qubit plays each of your circuit's qubits, preferring the least noisy ones.
3. **Routing**: if two qubits that need a CNOT aren't neighbours on the chip, the transpiler inserts **SWAP** gates to move states next to each other.
4. **Optimization**: cancels and merges gates, since every extra gate adds error.

```python
from qiskit import transpile
tqc = transpile(qc, backend=backend, optimization_level=3)
print(tqc.depth(), tqc.count_ops())
```

## Why depth matters

A circuit's **depth** is the number of layers of gates. Each layer takes time, and qubits lose their quantum state over time, so shallower circuits give cleaner results. Routing SWAPs can easily triple a circuit's depth, which is why layout choice matters so much.

## Running on a real device

Cloud providers expose real backends through the same `run` interface. Jobs wait in a queue, then return counts just like the simulator, but with noise: a Bell state might show a few percent of `01` and `10` outcomes that the ideal simulator never produces.

## The takeaway

Transpilation adapts a circuit to a device's native gates and connectivity and optimizes it along the way. Keeping circuits shallow and qubit interactions local is the single biggest thing you can do to get good results from real hardware."""),
    ]),
    ("QT-M7", "intermediate", [
        ("The No-Cloning Theorem", r"""Classical information can be copied freely. Quantum information can't. The **no-cloning theorem** says there is no physical process that takes an arbitrary unknown state $|\psi\rangle$ and produces two copies $|\psi\rangle|\psi\rangle$.

## Why copying fails

Suppose a unitary $U$ could clone any state: $U|\psi\rangle|0\rangle = |\psi\rangle|\psi\rangle$. It would have to work for $|0\rangle$ and $|1\rangle$:

$$U|0\rangle|0\rangle = |0\rangle|0\rangle, \qquad U|1\rangle|0\rangle = |1\rangle|1\rangle$$

By linearity, for $|+\rangle = \frac{1}{\sqrt{2}}(|0\rangle + |1\rangle)$ it must give

$$U|+\rangle|0\rangle = \frac{1}{\sqrt{2}}(|00\rangle + |11\rangle)$$

But a true clone would be $|+\rangle|+\rangle = \frac{1}{2}(|00\rangle + |01\rangle + |10\rangle + |11\rangle)$. These differ, so no such $U$ exists.

Notice that CNOT *does* copy $|0\rangle$ and $|1\rangle$. It's only unknown superpositions that can't be copied.

## What it rules out

- You can't measure a single unknown qubit and learn its full state. You'd need many copies, which you can't make.
- You can't amplify a quantum signal the way a classical repeater does, which is why quantum networks need different tools, like entanglement swapping.
- An eavesdropper can't secretly copy quantum-encoded keys, the foundation of quantum cryptography.

## What it doesn't rule out

You *can* move a quantum state from one place to another, as long as the original is destroyed in the process. That's exactly what quantum teleportation does, and it's the subject of the next lesson.

## The takeaway

Linearity of quantum mechanics forbids copying unknown quantum states. That limitation shapes quantum communication and is precisely what makes quantum key distribution secure."""),
        ("Quantum Teleportation", r"""**Quantum teleportation** transfers an unknown qubit state from Alice to Bob using one shared entangled pair and two classical bits. Nothing travels faster than light, and the original state is destroyed, so no-cloning is respected.

## The setup

Alice holds the qubit to send, $|\psi\rangle = \alpha|0\rangle + \beta|1\rangle$ on qubit 0. Alice and Bob share a Bell pair $\frac{1}{\sqrt{2}}(|00\rangle + |11\rangle)$ on qubits 1 (Alice's) and 2 (Bob's).

## The protocol

1. Alice applies **CNOT** from qubit 0 to qubit 1, then **H** to qubit 0.
2. Alice **measures** qubits 0 and 1, getting two classical bits $m_0 m_1$.
3. Alice sends $m_0 m_1$ to Bob over an ordinary channel.
4. Bob applies $X$ if $m_1 = 1$, then $Z$ if $m_0 = 1$.

Bob's qubit is now exactly $\alpha|0\rangle + \beta|1\rangle$.

## Why it works

After step 1 the three-qubit state can be regrouped as

$$\tfrac{1}{2}\Big[|00\rangle(\alpha|0\rangle + \beta|1\rangle) + |01\rangle(\alpha|1\rangle + \beta|0\rangle) + |10\rangle(\alpha|0\rangle - \beta|1\rangle) + |11\rangle(\alpha|1\rangle - \beta|0\rangle)\Big]$$

Each of Alice's four outcomes leaves Bob's qubit in $|\psi\rangle$ up to a known $X$, $Z$, or both, which the corrections undo.

## Common misunderstandings

- **No faster-than-light signalling**: until Bob receives Alice's two bits, his qubit is completely random to him.
- **No matter is moved**: only the state is transferred.
- **The original is gone**: Alice's measurement destroys her copy.

## Try it

In the Circuit Builder, prepare qubit 0 with an $R_Y$ rotation, build the protocol using CNOT and CZ in place of the classically controlled corrections, and check that qubit 2's statistics match the original.

## The takeaway

Teleportation spends one Bell pair and two classical bits to move one qubit's state, and it's a core building block of quantum networks and fault-tolerant computing."""),
        ("Superdense Coding", r"""Teleportation uses two classical bits to send one qubit. **Superdense coding** is its mirror image: it uses one qubit to send two classical bits, provided the sender and receiver already share entanglement.

## The protocol

Alice and Bob share $|\Phi^+\rangle = \frac{1}{\sqrt{2}}(|00\rangle + |11\rangle)$; Alice holds the first qubit.

1. To send two bits, Alice applies one of four operations to *her* qubit only:

| Bits | Alice applies | Resulting Bell state |
|---|---|---|
| 00 | $I$ | $\frac{1}{\sqrt{2}}(\lvert 00\rangle + \lvert 11\rangle)$ |
| 01 | $X$ | $\frac{1}{\sqrt{2}}(\lvert 10\rangle + \lvert 01\rangle)$ |
| 10 | $Z$ | $\frac{1}{\sqrt{2}}(\lvert 00\rangle - \lvert 11\rangle)$ |
| 11 | $ZX$ | $\frac{1}{\sqrt{2}}(\lvert 01\rangle - \lvert 10\rangle)$ |

2. Alice sends her qubit to Bob.
3. Bob applies **CNOT** (Alice's qubit as control) then **H** on Alice's qubit, and measures both. The four Bell states map to the four bitstrings, so Bob reads Alice's two bits exactly.

## Why it's surprising

Alone, one qubit can carry at most one classical bit of retrievable information (this is Holevo's bound). Superdense coding doesn't break that rule; the second bit's worth of capacity comes from the entanglement shared in advance. Together, one qubit plus one pre-shared Bell pair carries two bits.

## Teleportation vs. superdense coding

| | Sends | Uses |
|---|---|---|
| Teleportation | 1 qubit state | 1 Bell pair + 2 classical bits |
| Superdense coding | 2 classical bits | 1 Bell pair + 1 qubit |

Both show that entanglement is a **resource** that can be spent to do things no classical channel can.

## The takeaway

With pre-shared entanglement, a single transmitted qubit carries two classical bits. Superdense coding and teleportation are two sides of the same idea: entanglement plus communication beats either one alone."""),
    ]),
    ("QT-M8", "intermediate", [
        ("Why Quantum Threatens Today's Encryption", r"""Most of the internet's security rests on **public-key cryptography**: RSA, Diffie-Hellman, and elliptic-curve schemes. They're secure because certain maths problems are believed to be infeasible for classical computers.

## The hard problems

- **RSA** relies on the difficulty of **factoring** a large number $N = pq$ back into its primes.
- **Diffie-Hellman** and **elliptic-curve** cryptography rely on the **discrete logarithm** problem.

The best known classical algorithms for these take time that grows faster than any polynomial in the key size, so a 2048-bit RSA key is far out of reach.

## What Shor's algorithm changes

Shor's algorithm solves both factoring and discrete logarithms in **polynomial time** on a large, error-corrected quantum computer. It reduces them to finding the period of a function, which the Quantum Fourier Transform does efficiently. With enough reliable qubits, today's public-key schemes would break.

## What's less affected

**Symmetric** ciphers like AES and hash functions like SHA-256 aren't broken by Shor. **Grover's algorithm** gives only a quadratic speedup against them, effectively halving the key length, so moving from AES-128 to AES-256 restores the security margin.

## Harvest now, decrypt later

Today's quantum computers are far too small and noisy to run Shor's algorithm on real keys. The concern is that an adversary can **record encrypted traffic now** and decrypt it years later once large machines exist. Data that must stay secret for a decade or more is already at risk.

## Two responses

1. **Post-quantum cryptography**: new classical algorithms believed to resist quantum attacks, which run on today's computers.
2. **Quantum key distribution**: using quantum physics itself to share keys, covered in the next lessons.

## The takeaway

Shor's algorithm threatens the public-key cryptography securing today's internet, while symmetric cryptography needs only larger keys. Because encrypted data can be stored now and broken later, the transition is already underway."""),
        ("The BB84 Protocol", r"""**BB84**, proposed by Bennett and Brassard in 1984, lets two parties create a shared secret key whose security comes from the laws of physics rather than from computational difficulty.

## Two bases

Alice encodes each bit in one of two bases:

| Basis | Bit 0 | Bit 1 |
|---|---|---|
| Z (rectilinear) | $\lvert 0\rangle$ | $\lvert 1\rangle$ |
| X (diagonal) | $\lvert +\rangle$ | $\lvert -\rangle$ |

Measuring in the matching basis recovers the bit with certainty. Measuring in the wrong basis gives a completely random result, 50/50.

## The protocol

1. Alice picks a random bit and a random basis for each qubit, prepares the corresponding state, and sends it to Bob.
2. Bob measures each qubit in a basis he chooses at random.
3. Over a public channel, Alice and Bob announce their **bases** (never the bits) and keep only the positions where the bases matched. On average that's half the qubits.
4. The kept bits form the **sifted key**, which should be identical on both sides.

## Worked example

| Alice's bit | 1 | 0 | 1 | 1 | 0 |
|---|---|---|---|---|---|
| Alice's basis | Z | X | X | Z | Z |
| Bob's basis | Z | Z | X | X | Z |
| Kept? | ✓ | ✗ | ✓ | ✗ | ✓ |

The sifted key is **1 1 0**.

## Finishing the key

Real channels have noise, so Alice and Bob run **error correction** to fix mismatches, then **privacy amplification**, hashing the key down to a shorter one, to squeeze out anything an eavesdropper might have learned.

## The takeaway

BB84 encodes bits in randomly chosen bases, keeps only the matching-basis results, and turns them into a shared key. Its security comes from the fact that measuring in the wrong basis disturbs the state, which is the subject of the next lesson."""),
        ("Detecting Eavesdroppers and Post-Quantum Cryptography", r"""What makes BB84 secure is that an eavesdropper, Eve, can't learn anything about the key without leaving fingerprints.

## Intercept-resend

Suppose Eve intercepts each qubit, measures it in a random basis, and sends Bob a fresh qubit matching her result. Half the time she picks the wrong basis, which randomizes the state she forwards. Even in positions where Alice and Bob used the same basis, Bob now gets the wrong bit with probability

$$P(\text{error}) = \tfrac{1}{2} \times \tfrac{1}{2} = \tfrac{1}{4}$$

## Catching Eve

Alice and Bob sacrifice a random sample of their sifted key and compare it publicly. This gives the **quantum bit error rate** (QBER). An ordinary channel has a small QBER; intercept-resend pushes it toward 25%. If the QBER is above a threshold (about 11% for BB84), they abort and try again. Below it, privacy amplification removes Eve's partial knowledge.

No-cloning is what closes the loophole: Eve can't copy the qubit, measure the copy, and forward the untouched original.

## Real-world limits

- QKD needs dedicated quantum links, typically optical fibre or satellite, and range is limited by photon loss.
- It secures **key exchange**, not authentication: Alice and Bob still need an authenticated classical channel.
- Hardware imperfections have been exploited in the lab, so security depends on careful engineering.

## Post-quantum cryptography

The more widely deployable answer is **post-quantum cryptography** (PQC): classical algorithms built on problems, such as structured lattices, that no known quantum algorithm solves efficiently. In 2024 NIST standardized **ML-KEM** (from CRYSTALS-Kyber) for key establishment and **ML-DSA** (from CRYSTALS-Dilithium) and **SLH-DSA** (from SPHINCS+) for signatures. They run on ordinary hardware and are being rolled into browsers and operating systems.

## The takeaway

Eavesdropping on BB84 unavoidably raises the error rate, so Alice and Bob can detect it and abort. For most systems, post-quantum algorithms are the practical defence, while QKD serves specialized high-security links."""),
    ]),
    ("QT-M9", "intermediate", [
        ("From Fourier Transform to QFT", r"""The classical **discrete Fourier transform** (DFT) turns a list of $N$ numbers into its frequency components. It's everywhere: audio compression, image processing, signal analysis. The **Quantum Fourier Transform** (QFT) does the same transformation to the amplitudes of a quantum state.

## The definition

For $n$ qubits, $N = 2^n$. The QFT maps each basis state $|x\rangle$ to

$$\text{QFT}\,|x\rangle = \frac{1}{\sqrt{N}} \sum_{k=0}^{N-1} e^{2\pi i\, xk/N}\, |k\rangle$$

Applied to a general state $\sum_x a_x|x\rangle$, it produces $\sum_k b_k|k\rangle$ where the $b_k$ are exactly the DFT of the $a_x$.

## One qubit

For $n = 1$, $N = 2$ and the phases are $e^{i\pi xk} = \pm 1$, so

$$\text{QFT}|0\rangle = \tfrac{1}{\sqrt{2}}(|0\rangle + |1\rangle), \qquad \text{QFT}|1\rangle = \tfrac{1}{\sqrt{2}}(|0\rangle - |1\rangle)$$

That's just the Hadamard gate. The QFT is a many-qubit generalization of $H$.

## Why it's fast

The classical Fast Fourier Transform needs about $N \log N$ operations. The QFT needs only about $n^2 = (\log N)^2$ gates, which is exponentially fewer.

There's a catch: the Fourier coefficients end up in amplitudes, and you can't read amplitudes directly. The QFT pays off only inside algorithms designed so a measurement afterwards reveals something useful, typically a **period** or a **phase**.

## Where it's used

- **Shor's algorithm**: the QFT extracts the period of $f(x) = a^x \bmod N$, which yields the factors.
- **Quantum phase estimation**: the QFT converts phase information into a readable binary number.
- **Quantum simulation and chemistry** build on phase estimation.

## The takeaway

The QFT applies the discrete Fourier transform to quantum amplitudes using only about $n^2$ gates. It isn't a faster way to Fourier-transform your data, but it's the key subroutine that turns hidden periodic structure into measurable results."""),
        ("Building the QFT Circuit", r"""The QFT has a surprisingly regular circuit built from just two ingredients: **Hadamard** gates and **controlled phase rotations**.

## The product form

The key identity is that the QFT output factors into single-qubit states. Writing $x$ in binary as $x_1 x_2 \dots x_n$:

$$\text{QFT}|x\rangle = \frac{1}{\sqrt{2^n}} \bigotimes_{j=1}^{n} \left(|0\rangle + e^{2\pi i\, 0.x_j x_{j+1}\dots x_n}\,|1\rangle\right)$$

where $0.x_j\dots x_n$ is a binary fraction. Each output qubit just needs the right phase, and phases can be added one controlled rotation at a time.

## The rotation gates

$$R_k = \begin{pmatrix} 1 & 0 \\ 0 & e^{2\pi i/2^k} \end{pmatrix}$$

$R_1 = Z$, $R_2 = S$, $R_3 = T$, and higher $k$ give ever-smaller phase kicks.

## The circuit for 3 qubits

1. **Qubit 0**: apply $H$, then controlled-$R_2$ from qubit 1, then controlled-$R_3$ from qubit 2.
2. **Qubit 1**: apply $H$, then controlled-$R_2$ from qubit 2.
3. **Qubit 2**: apply $H$.
4. **SWAP** qubits 0 and 2 to reverse the output order.

For $n$ qubits that's $n$ Hadamards and $\frac{n(n-1)}{2}$ controlled rotations, which is where the $O(n^2)$ gate count comes from.

## Approximate QFT

The tiny rotations $R_k$ for large $k$ barely change the state, and real hardware can't apply them accurately anyway. Dropping rotations below a cutoff gives the **approximate QFT**, which needs far fewer gates and loses very little accuracy. Practical implementations almost always use it.

## The takeaway

The QFT circuit is a triangle of Hadamards and controlled phase rotations followed by a qubit reversal. Its regular structure makes it easy to build, and the approximate version keeps it practical on noisy hardware."""),
        ("Quantum Phase Estimation", r"""**Quantum phase estimation** (QPE) answers this question: given a unitary $U$ and one of its eigenstates $|u\rangle$, with $U|u\rangle = e^{2\pi i\theta}|u\rangle$, what is $\theta$? It's one of the most important subroutines in quantum computing.

## The circuit

QPE uses two registers:

- a **counting register** of $t$ qubits, starting in $|0\rangle$,
- a **target register** holding the eigenstate $|u\rangle$.

1. Apply $H$ to every counting qubit.
2. Counting qubit $j$ controls $U^{2^j}$ on the target. Because $|u\rangle$ is an eigenstate, each controlled operation **kicks back** a phase $e^{2\pi i\, 2^j \theta}$ onto its control qubit and leaves the target unchanged.
3. The counting register now holds $\frac{1}{\sqrt{2^t}}\sum_k e^{2\pi i\,\theta k}|k\rangle$, which is exactly a QFT output.
4. Apply the **inverse QFT** and measure. The result is $\theta$ written as a $t$-bit binary fraction.

## Worked example

Take $U = T$, whose eigenstate $|1\rangle$ has eigenvalue $e^{i\pi/4} = e^{2\pi i \cdot (1/8)}$, so $\theta = 1/8 = 0.001_2$. With $t = 3$ counting qubits, QPE measures `001` with certainty, and $001_2/2^3 = 1/8$.

## Precision

With $t$ counting qubits you learn $\theta$ to about $t$ bits. If $\theta$ isn't exactly representable, you get the nearest values with high probability, and adding a few extra qubits boosts the success rate.

## Where QPE appears

- **Shor's algorithm** is phase estimation applied to modular multiplication.
- **Quantum chemistry**: estimating molecular ground-state energies means estimating eigenvalues of a Hamiltonian.
- **HHL** for linear systems uses QPE to access matrix eigenvalues.

## The takeaway

Phase estimation uses phase kickback to write an eigenvalue's phase into a register, then the inverse QFT turns it into a readable binary number. It's the bridge between the QFT and many of quantum computing's most important applications."""),
    ]),
    ("QT-M10", "intermediate", [
        ("Decoherence: T1 and T2", r"""A qubit in superposition is fragile. Interaction with its environment, through stray electromagnetic fields, heat, or material defects, gradually destroys its quantum behaviour. This process is called **decoherence**, and two numbers summarize how fast it happens.

## T1: energy relaxation

A qubit in $|1\rangle$ tends to lose energy and fall to $|0\rangle$. The **T1 time** is the characteristic time for this decay:

$$P(\text{still in } |1\rangle \text{ after time } t) \approx e^{-t/T_1}$$

It's like a ball rolling downhill: left alone long enough, an excited qubit always ends up in the ground state.

## T2: dephasing

A superposition $\alpha|0\rangle + \beta|1\rangle$ also carries a **relative phase** between its parts. Random environmental fluctuations scramble that phase, and the **T2 time** measures how long it survives. Once the phase is lost, the qubit behaves like a classical coin flip, and interference, the source of quantum speedups, stops working.

T2 is always limited by relaxation: $T_2 \le 2T_1$. In practice it's often shorter.

## Typical numbers

| Technology | Typical coherence | Typical 2-qubit gate time |
|---|---|---|
| Superconducting | ~100 µs to 1 ms | ~50 to 500 ns |
| Trapped ions | seconds or longer | ~10 to 1000 µs |

What matters is the ratio: how many gates fit inside the coherence time. That's why raw coherence alone doesn't determine which platform is "better".

## What this means for circuits

Every layer of gates takes time, so deep circuits run into decoherence. This is the practical reason to keep circuits **shallow**, to transpile carefully, and to choose the best-performing qubits on a device.

## The takeaway

T1 measures how quickly excited qubits relax; T2 measures how quickly superposition phases scramble. Together they set a time budget that every quantum circuit must fit inside."""),
        ("Gate Errors, Readout Errors, and Fidelity", r"""Even within their coherence time, real qubits don't behave perfectly. Hardware providers publish error rates so you can predict how trustworthy a result will be.

## Gate errors

Every gate is implemented by a physical pulse, whether microwave or laser, that is never perfectly calibrated. The result is a small chance the gate does something slightly different from its ideal matrix. Providers report a **gate fidelity**, or its complement, the **error rate**:

- single-qubit gates: often better than **99.9%** fidelity
- two-qubit gates: typically **99% to 99.9%**, and they are usually the dominant error source

## Readout errors

Measurement can also mislabel results: a qubit in $|1\rangle$ read as 0, or the reverse. Readout error rates of 1 to 3% are common. This is why an ideal `00`/`11` Bell state can show a few percent `01` and `10` even when the gates themselves are good.

## Crosstalk and leakage

Operating one qubit can disturb its neighbours (**crosstalk**), and a qubit can occasionally leave the $|0\rangle$/$|1\rangle$ subspace entirely (**leakage**). Both are harder to model than simple gate errors.

## Estimating circuit fidelity

A rough rule of thumb multiplies the success probability of every operation:

$$F_{\text{circuit}} \approx \prod_{\text{gates}} F_{\text{gate}}$$

With 100 two-qubit gates at 99% fidelity, $0.99^{100} \approx 0.37$, so only about a third of shots are error-free. This is why gate counts matter so much on today's hardware.

## Benchmarks

Metrics like **quantum volume** and **layer fidelity** combine qubit count, connectivity, and error rates into a single measure of how large a circuit a device can run reliably.

## The takeaway

Two-qubit gates and measurement are the main error sources on current devices. Multiplying fidelities across a circuit gives a quick, sobering estimate of how much signal survives."""),
        ("Qubit Technologies and Error Mitigation", r"""There is no single way to build a qubit. Several physical platforms compete, each with different strengths.

## The main platforms

| Platform | How it works | Strengths | Challenges |
|---|---|---|---|
| **Superconducting** | tiny circuits cooled near absolute zero | fast gates, mature fabrication | short coherence, limited connectivity |
| **Trapped ions** | charged atoms held by electric fields, driven by lasers | long coherence, all-to-all connectivity, high fidelity | slower gates, scaling many ions |
| **Neutral atoms** | atoms held in optical tweezers | large qubit counts, flexible layouts | slower cycles, still maturing |
| **Photonic** | information carried by photons | room-temperature operation, natural for networking | photon loss, probabilistic gates |
| **Spin qubits** | electron spins in silicon | small, compatible with chip manufacturing | uniformity and control at scale |

## Error mitigation

Full error correction needs many more qubits than today's devices have. **Error mitigation** instead post-processes noisy results to estimate what an ideal device would have produced.

- **Readout error mitigation**: measure how often each basis state is misread, build a calibration matrix, and invert it to correct your counts.
- **Zero-noise extrapolation (ZNE)**: deliberately run the circuit at amplified noise levels, for example by stretching pulses or inserting canceling gate pairs, then extrapolate the results back to zero noise.
- **Dynamical decoupling**: insert pulse sequences on idle qubits to cancel slowly varying noise, extending effective coherence.
- **Probabilistic error cancellation**: model the noise and statistically undo it, at the cost of many more shots.

## The trade-off

Mitigation doesn't make individual shots error-free. It improves estimated **expectation values** at the cost of extra runs, which is exactly what variational algorithms like VQE and QAOA need.

## The takeaway

Superconducting, trapped-ion, neutral-atom, photonic, and spin qubits make different engineering trade-offs. Until error correction arrives at scale, mitigation techniques are how researchers squeeze useful results out of noisy hardware."""),
    ]),
    ("QT-M11", "advanced", [
        ("Why Quantum Error Correction Is Hard", r"""Classical error correction is simple in principle: store each bit three times and take a majority vote. Quantum error correction has to overcome three obstacles that make that naive approach impossible.

## Obstacle 1: no cloning

You can't copy an unknown qubit, so "store three copies" is ruled out. Instead, quantum codes spread one qubit's information across several physical qubits using **entanglement**:

$$\alpha|0\rangle + \beta|1\rangle \;\longrightarrow\; \alpha|000\rangle + \beta|111\rangle$$

This isn't three copies of the state; it's one logical state encoded non-locally.

## Obstacle 2: measurement destroys superposition

To find an error you'd normally look at the data, but measuring a qubit collapses it. Quantum codes instead measure **syndromes**: joint properties such as "do qubits 1 and 2 agree?". These reveal *which* error happened without revealing anything about $\alpha$ or $\beta$.

## Obstacle 3: errors are continuous

A qubit can drift by any tiny angle, not just flip. The key result that saves us: measuring the syndrome **discretizes** the error. Any small error collapses into either "no error" or one of a finite set of Pauli errors, $X$ (bit flip), $Z$ (phase flip), or $Y$ (both), each of which can be corrected.

## Logical vs. physical qubits

A **logical qubit** is the protected qubit encoded across many **physical qubits**. Correction only helps if physical error rates are below a **threshold**; above it, adding qubits introduces errors faster than they're fixed.

## The threshold theorem

If physical error rates are below the threshold, logical error rates can be made arbitrarily small by using larger codes, with only polylogarithmic overhead. This theorem is why fault-tolerant quantum computing is believed to be possible at all.

## The takeaway

Quantum error correction replaces copying with entangled encoding, replaces reading data with syndrome measurements, and relies on measurement to turn continuous errors into discrete, correctable ones."""),
        ("The Three-Qubit Repetition Codes", r"""The simplest quantum codes protect against one kind of error at a time. They're not enough on their own, but they show every core idea of quantum error correction.

## The bit-flip code

**Encode**: starting from $\alpha|0\rangle + \beta|1\rangle$ on qubit 0, apply CNOTs from qubit 0 to qubits 1 and 2:

$$\alpha|000\rangle + \beta|111\rangle$$

**Detect**: measure two parity checks with ancilla qubits:

- $Z_0 Z_1$: do qubits 0 and 1 agree?
- $Z_1 Z_2$: do qubits 1 and 2 agree?

| Syndrome ($Z_0Z_1$, $Z_1Z_2$) | Error | Fix |
|---|---|---|
| (+, +) | none | nothing |
| (−, +) | $X$ on qubit 0 | $X_0$ |
| (−, −) | $X$ on qubit 1 | $X_1$ |
| (+, −) | $X$ on qubit 2 | $X_2$ |

The syndrome says where the flip happened but reveals nothing about $\alpha$ or $\beta$, so the superposition survives. The code corrects any **single** bit flip; two flips fool the majority logic.

## The phase-flip code

A phase flip $Z$ turns $|+\rangle$ into $|-\rangle$. In the Hadamard basis a phase flip looks exactly like a bit flip, so we reuse the same trick with basis changes:

$$\alpha|{+}{+}{+}\rangle + \beta|{-}{-}{-}\rangle$$

The parity checks become $X_0X_1$ and $X_1X_2$, and they catch any single phase flip.

## The limitation

The bit-flip code is blind to phase flips, and the phase-flip code is blind to bit flips. Real qubits suffer both, so we need a code that combines them, which is exactly what the Shor code does in the next lesson.

## The takeaway

Repetition codes encode one logical qubit in three physical ones and use parity-check syndromes to locate single errors without disturbing the encoded state. Each protects against only one error type."""),
        ("The Shor Code and Surface Codes", r"""## The Shor code

In 1995 Peter Shor combined the two repetition codes into the first code that corrects **any** single-qubit error. It **concatenates** them: first encode against phase flips across three blocks, then encode each block against bit flips.

$$|0_L\rangle = \tfrac{1}{2\sqrt{2}}(|000\rangle + |111\rangle)^{\otimes 3}, \qquad |1_L\rangle = \tfrac{1}{2\sqrt{2}}(|000\rangle - |111\rangle)^{\otimes 3}$$

That's **9 physical qubits** per logical qubit. Inner parity checks catch bit flips within a block; outer checks compare the signs of blocks to catch phase flips. Since $Y = iXZ$, any error on one qubit gets corrected.

## Stabilizer codes

The Shor code is an example of a **stabilizer code**: the code is defined by a set of commuting Pauli checks, the *stabilizers*, that leave every valid code state unchanged. Measuring the stabilizers gives the syndrome. Most modern codes, including the surface code, are described this way.

## Surface codes

The **surface code** arranges physical qubits on a 2D grid. Data qubits sit between two kinds of ancilla qubits: some measure $X$-type checks on their four neighbours, others measure $Z$-type checks.

Its strengths are why it leads the field:

- **Only nearest-neighbour interactions**, which matches the flat layouts of superconducting chips.
- **High threshold**, around 1% error per operation, within reach of today's hardware.
- **Scalable distance**: a distance-$d$ patch uses about $2d^2$ physical qubits and corrects up to $\lfloor (d-1)/2 \rfloor$ errors. Increasing $d$ suppresses logical errors exponentially, once below threshold.

## Where things stand

Recent experiments have shown logical error rates *decreasing* as the surface-code distance grows, the key signature of operating below threshold. Useful fault-tolerant machines will still need thousands of physical qubits per few logical qubits, which is why qubit quality and count both matter.

## The takeaway

The Shor code showed that correcting arbitrary quantum errors is possible. Surface codes make it practical on 2D hardware, and they're the leading route to large-scale, fault-tolerant quantum computers."""),
    ]),
    ("QT-M12", "advanced", [
        ("Encoding Classical Data into Qubits", r"""Before a quantum computer can learn from data, the data has to get into the qubits. This **encoding** (or **feature map**) step often decides whether a quantum machine-learning model can work at all.

## Basis encoding

Write each data point as a bitstring and prepare the matching basis state: the number 5 becomes $|101\rangle$. It's simple, but it needs one qubit per bit and captures only discrete values.

## Angle encoding

Put each feature $x_j$ into a rotation angle on its own qubit:

$$|x\rangle = \bigotimes_j R_Y(x_j)|0\rangle$$

It uses $n$ qubits for $n$ features and a single layer of gates, so it's easy to run on current hardware. Features are usually rescaled to a range like $[0, \pi]$ first.

## Amplitude encoding

Store a normalized vector of $2^n$ numbers directly in the amplitudes of $n$ qubits:

$$|x\rangle = \sum_{i=0}^{2^n - 1} x_i |i\rangle$$

That's exponentially compact: 10 qubits hold 1,024 values. The catch is that preparing an arbitrary amplitude-encoded state generally takes a circuit whose size grows with $2^n$, which can erase the advantage.

## Entangling feature maps

More expressive maps repeat layers of data-dependent rotations and entangling gates, for example $R_Z(x_i x_j)$ phases between pairs of qubits. These produce states whose structure is hard to compute classically, which is the starting point for quantum kernels.

## The data-loading bottleneck

Loading $N$ classical numbers takes at least on the order of $N$ operations, so for large classical datasets encoding can dominate the runtime. Many researchers expect the clearest quantum-ML advantages for data that is **already quantum**, such as states produced by quantum sensors or simulations.

## The takeaway

Basis, angle, and amplitude encoding trade off qubit count against circuit depth. The choice of feature map shapes what a model can learn, and data loading is one of quantum ML's central practical challenges."""),
        ("Variational Quantum Classifiers", r"""A **variational quantum classifier** (VQC) is a hybrid model: a parameterized quantum circuit makes predictions, and a classical optimizer tunes its parameters, the same loop you met with VQE and QAOA.

## The architecture

1. **Feature map** $U(x)$: encode the input $x$ into qubits.
2. **Ansatz** $W(\theta)$: layers of trainable rotations $R_Y(\theta_k)$ and $R_Z(\theta_k)$ with entangling CNOTs.
3. **Measurement**: estimate an expectation value, such as $\langle Z_0 \rangle \in [-1, 1]$, and map it to a class, for example positive means class A.

$$f_\theta(x) = \langle 0|\, U^\dagger(x)\, W^\dagger(\theta)\, Z_0\, W(\theta)\, U(x)\, |0\rangle$$

## Training

A classical optimizer adjusts $\theta$ to minimize a loss, such as cross-entropy between predictions and labels. Gradients come from the **parameter-shift rule**: for standard rotation gates,

$$\frac{\partial f}{\partial \theta_k} = \frac{1}{2}\Big[f(\theta_k + \tfrac{\pi}{2}) - f(\theta_k - \tfrac{\pi}{2})\Big]$$

That's two extra circuit evaluations per parameter, with no approximation.

## Barren plateaus

For deep or highly entangling random ansätze, gradients can become **exponentially small** in the number of qubits, a *barren plateau*, leaving the optimizer with no signal to follow. Mitigations include shallow, problem-inspired ansätze, local cost functions, and careful initialization.

## Practical concerns

- **Shot noise**: every expectation value is estimated from finite samples, so gradients are noisy.
- **Hardware noise** flattens outputs toward zero, which error mitigation can partially undo.
- **Classical baselines**: a VQC should always be compared against strong classical models on the same data.

## The takeaway

A VQC is a trainable quantum circuit wrapped in a classical optimization loop, with exact gradients from the parameter-shift rule. Barren plateaus and noise are the main obstacles to scaling it up."""),
        ("Quantum Kernels and the Road to Advantage", r"""Many classical machine-learning methods, like support vector machines, rely on a **kernel**: a function $k(x, x')$ measuring how similar two data points are in some high-dimensional feature space. Quantum computers offer a new way to compute kernels.

## The quantum kernel

Encode each point with a feature map $U(x)$ and define

$$k(x, x') = \big|\langle 0|\, U^\dagger(x')\, U(x)\, |0\rangle\big|^2$$

the overlap between the two encoded states. On hardware you estimate it by running $U(x)$ followed by $U^\dagger(x')$ and measuring how often you get back all zeros.

## The workflow

1. Estimate $k(x_i, x_j)$ for every pair of training points on the quantum computer.
2. Hand the resulting kernel matrix to a completely classical SVM.
3. To classify a new point, estimate its kernel with the support vectors.

Only the similarity measure is quantum; training is convex and classical, which avoids barren plateaus entirely.

## When could this help?

A quantum kernel is only useful if it's **hard to compute classically** *and* **well matched to the data**. Researchers have constructed learning problems with provable quantum advantage for kernels built around structures like discrete logarithms, but those are purpose-built. For typical real-world data, no advantage has been shown yet.

## Pitfalls

- **Exponential concentration**: with many qubits and expressive feature maps, all kernel values can crowd toward the same number, making points look equally similar.
- **Cost**: the kernel matrix needs about $N^2$ circuit evaluations for $N$ training points.
- **Dequantization**: some proposed speedups have been matched by clever classical algorithms.

## A realistic outlook

The most promising directions are problems where data is naturally quantum, such as learning properties of quantum states or classifying phases of matter, and hybrid models that use quantum circuits for specific, well-motivated subtasks.

## The takeaway

Quantum kernels compute similarity through state overlaps and let classical SVMs do the learning. They're a principled way to test for quantum advantage in ML, but real-world advantage remains an open research question."""),
    ]),
]

# (module_code, difficulty, prompt, options, correct_index)
CHALLENGES: list[tuple[str, str, str, list[str], int]] = [
    ("QT-M5", "beginner", "A qubit is in the state (1/√2)|0⟩ + (i/√2)|1⟩. What is the probability of measuring 1?",
     ["0", "1/2", "i/2", "1/√2"], 1),
    ("QT-M5", "beginner", "Which property must every quantum gate matrix U satisfy?",
     ["U is symmetric (U = Uᵀ)", "U is unitary (U†U = I)", "All entries of U are real", "U has determinant 0"], 1),
    ("QT-M6", "beginner", "In Qiskit, a 2-qubit measurement result is printed as '01'. What does it mean?",
     ["Qubit 0 measured 0 and qubit 1 measured 1", "Qubit 0 measured 1 and qubit 1 measured 0", "Both qubits measured 1", "The circuit had an error"], 1),
    ("QT-M6", "beginner", "Why does a transpiler insert SWAP gates when targeting real hardware?",
     ["To add error correction", "To move qubit states next to each other when a two-qubit gate acts on qubits that aren't physically connected", "To increase the number of shots", "To convert measurements into classical bits"], 1),
    ("QT-M7", "intermediate", "What does the no-cloning theorem forbid?",
     ["Creating entangled pairs", "Making an exact independent copy of an arbitrary unknown quantum state", "Measuring a qubit more than once", "Sending a qubit through an optical fibre"], 1),
    ("QT-M7", "intermediate", "In quantum teleportation, what must Alice send to Bob in addition to their pre-shared Bell pair?",
     ["Nothing: the state arrives instantly", "The qubit being teleported", "Two classical bits from her measurement", "A second Bell pair"], 2),
    ("QT-M8", "intermediate", "In BB84, which bits do Alice and Bob keep for the sifted key?",
     ["All of them", "Only the bits where Bob measured 1", "Only the positions where they used the same basis", "Only the positions where they used different bases"], 2),
    ("QT-M8", "intermediate", "Roughly what error rate does an intercept-resend eavesdropper introduce in the sifted BB84 key?",
     ["0%", "About 25%", "About 50%", "100%"], 1),
    ("QT-M9", "intermediate", "What does the Quantum Fourier Transform on a single qubit reduce to?",
     ["The X gate", "The Hadamard gate", "The T gate", "A measurement"], 1),
    ("QT-M9", "intermediate", "In quantum phase estimation, what determines how many bits of the phase θ you learn?",
     ["The number of shots", "The number of qubits in the counting register", "The number of target qubits", "The T1 time of the device"], 1),
    ("QT-M10", "intermediate", "What does the T2 time of a qubit measure?",
     ["How long a gate takes to run", "How long the qubit's superposition phase survives before dephasing", "How many qubits a chip has", "The readout error rate"], 1),
    ("QT-M10", "intermediate", "A circuit contains 100 two-qubit gates, each with 99% fidelity. Roughly what fraction of runs are error-free?",
     ["About 99%", "About 90%", "About 37%", "About 1%"], 2),
    ("QT-M11", "advanced", "How does quantum error correction detect errors without destroying the encoded superposition?",
     ["It copies the qubit and measures the copy", "It measures syndromes: joint parity checks that reveal which error occurred but not the encoded state", "It measures every data qubit directly", "It avoids measurement entirely"], 1),
    ("QT-M11", "advanced", "How many physical qubits does the Shor code use to encode one logical qubit?",
     ["3", "5", "7", "9"], 3),
    ("QT-M12", "advanced", "What is the main attraction, and the main catch, of amplitude encoding?",
     ["It needs no qubits, but only works for images", "n qubits can hold 2ⁿ values, but preparing the state can require a very deep circuit", "It's exactly the same as basis encoding", "It removes the need for measurement"], 1),
    ("QT-M12", "advanced", "What is a barren plateau in variational quantum models?",
     ["A region where gradients become exponentially small, leaving the optimizer with almost no signal", "A hardware fault on a chip", "A dataset with no labels", "The point where training has converged perfectly"], 0),
]


# ---------------------------------------------------------------------------


def _headers(extra: dict[str, str] | None = None) -> dict[str, str]:
    return {
        "apikey": settings.supabase_service_role_key,
        "Authorization": f"Bearer {settings.supabase_service_role_key}",
        "Content-Type": "application/json",
        **(extra or {}),
    }


def lesson_rows() -> list[dict]:
    return [
        {"module_code": code, "title": title, "body_markdown": body.strip(), "language": "en",
         "difficulty": difficulty, "order_index": i}
        for code, difficulty, lessons in COURSES
        for i, (title, body) in enumerate(lessons)
    ]


def challenge_rows() -> list[dict]:
    return [
        {"module_code": code, "difficulty": difficulty, "prompt": prompt, "starter_data": None,
         "grading_rule": {"type": "quiz", "options": options, "correct_index": correct}}
        for code, difficulty, prompt, options, correct in CHALLENGES
    ]


def seed() -> None:
    base = f"{settings.supabase_url}/rest/v1"
    lessons = lesson_rows()
    resp = httpx.post(
        f"{base}/lessons", params={"on_conflict": "module_code,language,order_index"}, json=lessons,
        headers=_headers({"Prefer": "resolution=merge-duplicates,return=minimal"}), timeout=60,
    )
    resp.raise_for_status()

    existing = httpx.get(f"{base}/challenges", params={"select": "prompt"}, headers=_headers(), timeout=30)
    existing.raise_for_status()
    known = {row["prompt"] for row in existing.json()}
    new = [c for c in challenge_rows() if c["prompt"] not in known]
    if new:
        resp = httpx.post(f"{base}/challenges", json=new, headers=_headers({"Prefer": "return=minimal"}), timeout=30)
        resp.raise_for_status()
    print(f"Upserted {len(lessons)} lessons across {len(COURSES)} courses; inserted {len(new)} new challenges.")


def sql_literal(value: object) -> str:
    if value is None:
        return "null"
    if isinstance(value, (dict, list)):
        return sql_literal(json.dumps(value, ensure_ascii=False)) + "::jsonb"
    if isinstance(value, int):
        return str(value)
    return "'" + str(value).replace("'", "''") + "'"


def to_sql() -> str:
    lines = [
        "-- Qylo -- seed data: lessons and challenges for QT-M5..QT-M12",
        "-- Generated by backend/scripts/seed_extra_courses.py --sql; edit the script, not this file.",
        "-- Idempotent: lessons upsert on (module_code, language, order_index), and",
        "-- challenges are only inserted when no challenge with the same prompt exists.",
        "",
        "insert into public.lessons (module_code, title, body_markdown, language, difficulty, order_index) values",
    ]
    values = [
        "  (" + ", ".join(sql_literal(r[k]) for k in
                          ("module_code", "title", "body_markdown", "language", "difficulty", "order_index")) + ")"
        for r in lesson_rows()
    ]
    lines.append(",\n".join(values))
    lines.append("on conflict (module_code, language, order_index) do update")
    lines.append("  set title = excluded.title, body_markdown = excluded.body_markdown, difficulty = excluded.difficulty;")
    lines.append("")
    lines.append("insert into public.challenges (module_code, difficulty, prompt, starter_data, grading_rule)")
    lines.append("select v.module_code, v.difficulty, v.prompt, v.starter_data, v.grading_rule from (values")
    cvalues = [
        "  (" + ", ".join(sql_literal(r[k]) for k in
                          ("module_code", "difficulty", "prompt")) + ", null::jsonb, " + sql_literal(r["grading_rule"]) + ")"
        for r in challenge_rows()
    ]
    lines.append(",\n".join(cvalues))
    lines.append(") as v(module_code, difficulty, prompt, starter_data, grading_rule)")
    lines.append("where not exists (select 1 from public.challenges c where c.prompt = v.prompt);")
    return "\n".join(lines) + "\n"


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument("--sql", action="store_true", help="print an idempotent SQL migration instead of seeding")
    args = parser.parse_args()
    if args.sql:
        sys.stdout.reconfigure(encoding="utf-8", newline="\n")  # Windows consoles default to cp1252
        print(to_sql(), end="")
    else:
        seed()


if __name__ == "__main__":
    main()
