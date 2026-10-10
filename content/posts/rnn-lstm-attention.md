---
title: "Transformer language model, part 1: why not RNNs/LSTMs?"
date: "2026-10-10"
excerpt: "Why RNNs forget, how LSTMs patch it, and how attention set the stage for Transformers."
---

![RNN language model](/images/blog/rnn-lstm-attention/rnn-language-model.png)

**Key idea of an RNN LM**
1. Convert all previous words → a **fixed-length vector** $h_t = f_\theta(w_{t-1}, \dots, w_1)$
2. Define $p(w_t \mid h_t)$ conditioned on that vector

## Why not RNNs?

**Vanishing gradient problem.** I distinctly remember reading about it in senior year, but promptly forgot about it.

<!-- original figure, swapped for the standard tanh form below: ![RNN equations](/images/blog/rnn-lstm-attention/rnn-equations.png) -->

$$
h_t = \tanh(W_{hh}h_{t-1} + W_{hx}x_t + b_h)
$$

$$
y_t = W_{yh}h_t + b_y
$$

![Sensitivity to the input at t=1 fades over time](/images/blog/rnn-lstm-attention/rnn-vanishing-gradient.mp4)

- The RNN heavily relies on the previous cell's memories → bound to lose some relevant information down the line → trouble with long-term dependencies
- Why the gradient vanishes:

  $$
  \frac{\partial h_t}{\partial h_k} = \prod_{j=k+1}^{t} \text{diag}\big(\tanh'(\cdot)\big)\, W_{hh}
  $$

  - Product of $t-k$ terms. Largest eigenvalue of $W_{hh}$ < 1 (and $\tanh' \le 1$) → shrinks exponentially with distance
  - Early inputs barely affect the gradient at later steps

With LSTMs, various "gates" determine the propagation of information and can choose to "remember" or "forget" information.

## Long Short-Term Memory (LSTM)

![LSTM cell](/images/blog/rnn-lstm-attention/lstm-cell.png)

<!-- > Note: the $W_{c\cdot}\,c$ terms below are **peephole** connections (Graves' variant, diagonal so effectively element-wise). The standard LSTM drops them. -->

### Input gate

$$
i_t = \sigma(W_{xi}x_t + W_{hi}h_{t-1} + b_i)
$$

Determines how much new information is allowed into the cell state.
- $W_{xi}x_t$ → information from the current input
- $W_{hi}h_{t-1}$ → information from the previous hidden state

*"The movie was surprisingly good."*
- Reads "good" → input gate might let positive-sentiment information into memory
- High gate value → relevant features, low → irrelevant ones

### Forget gate

$$
f_t = \sigma(W_{xf}x_t + W_{hf}h_{t-1} + b_f)
$$

Determines how much of the previous cell state to retain.

- Previous cell state stores negative sentiment about a movie
- "but" appears, followed by "the ending was excellent" → forget gate might reduce the importance of the earlier sentiment

For one memory component:
- $f_t = 1$ → retain all of the previous value
- $f_t = 0.5$ → retain half
- $f_t = 0$ → discard it entirely

### Cell state update

$$
c_t = f_t \odot c_{t-1} + i_t \odot \tanh(W_{xc}x_t + W_{hc}h_{t-1} + b_c)
$$

Combines old memory with selected new information.

- **Part A, retain existing memory:** $f_t \odot c_{t-1}$ → forget gate decides how much old cell state survives
- **Part B, add new information:** $i_t \odot \tanh(\dots)$ → expression inside tanh = candidate memory content; input gate controls how much of it is added

**Why tanh?**
- Bounded, controlled updates to memory, not an unrestricted candidate value
- Supports positive and negative information (e.g. + → evidence for a feature, − → evidence against it)

**New memory = retained old memory + selected new information**

**Why this fixes vanishing gradients:** the update is *additive*, so along the cell path

$$
\frac{\partial c_t}{\partial c_{t-1}} \approx f_t
$$

- No repeated multiplication by $W_{hh}$ along this path
- $f_t \approx 1$ → gradient flows back nearly unchanged

### Output gate

$$
o_t = \sigma(W_{xo}x_t + W_{ho}h_{t-1} + b_o)
$$

Decides which parts of the updated cell state contribute to the hidden state.
- Uses current input and previous hidden state
- High value → more of a memory component contributes to the output
- Low value → suppresses it
- Note: the output gate does **not** erase anything from the cell state. It only controls how much is exposed through the hidden state.

### Hidden state

$$
h_t = o_t \odot \tanh(c_t)
$$

Combines updated memory with the output gate.
1. $\tanh(c_t)$ → squashes cell state into (−1, 1)
2. Element-wise multiply with $o_t$ → controls which components contribute

**Why tanh?**
- **Control the magnitude:** even if $c_t$ gets very large, $\tanh(c_t)$ stays in (−1, 1) → hidden activation can't grow without bound
- **Preserve both signs:** sigmoid outputs (0, 1); tanh can represent both → hidden state carries information in either direction

## Why not LSTMs for everything?

1. LSTMs show an improvement over RNNs, but they still face difficulty with long-range dependencies
2. Computation is inherently serial → can't be easily parallelized on a GPU
3. They (mostly) solve vanishing gradients, but can still suffer from **exploding gradients** ([why?](https://stats.stackexchange.com/questions/320919/why-can-rnns-with-lstm-units-also-suffer-from-exploding-gradients))
   - **Matrix self-multiplication:** $h_t$ and the input, forget, output gates still rely on matrix multiplications + nonlinearities (sigmoid, tanh)
   - **Large recurrent weights:** backprop repeatedly multiplies gradients by weight matrices → largest eigenvalue > 1 → gradient grows exponentially going back in time
   - **Uncontrolled gate activations:** poor initialization or sharp error spikes → gates amplify the error signal instead of dampening it → erratic updates, NaNs, overflow

## How did Transformers come about?

### Encoder-decoder

How do humans translate? Having learnt about 4 languages, I know for me learning is an iterative process:
- New words → I process the equivalent word in my native language
- Grammar → I learn the patterns and map them to familiar structures in my native tongue
- With enough repetitions, I get attuned to the new pattern, so next time I don't have to translate it back to understand it

Seq2seq borrows the encode-then-decode idea:
- **Encoder** processes the input sequence, retaining hidden states, ultimately generating a fixed-length representation (**context vector**) that encapsulates the essence of the entire input sentence
- **Decoder** takes it → generates the output sequence token by token

Encoder and decoder typically used RNN or LSTM cells. But it faced a problem with longer sequences, as discussed before.
- Because it generated a single fixed-length context vector for the entire input, it led to information loss
- Crucial details get diluted or overlooked in the summarization

### Attention

Attention fixed this. The concept is that
- At each decoding step → compute a fresh context vector, which is just the weighted sum of **all** encoder hidden states
- Weights = relevance of each source word to the current decoding step → higher weight = more influence on the current target word

But the encoder and decoder were still RNNs underneath. Each token still had to wait for the previous one, so training stayed serial and slow. Also, long-range information still had to pass through many recurrent steps before attention could reach it

That raises an obvious question. If attention is doing the useful work of connecting distant tokens, why keep the recurrence at all? In 2017, [*Attention Is All You Need*](https://arxiv.org/abs/1706.03762) answered by removing it.
