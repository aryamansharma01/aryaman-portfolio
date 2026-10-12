---
title: "Transformer language model, part 2"
date: "2026-10-10"
excerpt: "Self-attention, multi-head attention, the pieces of a Transformer layer, causal masking, and KV caching."
---

In the [previous post](/blog/rnn-lstm-attention) I went from RNNs to LSTMs to attention.

- **RNNs** → struggle with long sequences because gradients shrink as they pass back through each time step
- **LSTMs** → reduce this with a gated, additive memory cell, but still process tokens one at a time and can't be parallelized. Seq2seq models added another problem by compressing the whole input into a single vector.
- **Attention** → fixed that by letting the decoder look at every encoder state directly

The Transformer keeps attention and drops the recurrence, and that's where this post starts.

## Attention

Instead of robotically translating word by word, attention lets the model selectively pay attention to specific parts of the source.

- At each decoding step → compute a context vector = the parts of the encoder sequence with the most influence on the current target word
- Calculated as a weighted sum of encoder hidden states, weights = relevance of each word to the current decoding step
- Higher weight = more influence on the target word

In a Transformer the same idea is applied *within* one sequence (**self-attention**): every token attends to the tokens of its own sequence.

![Scaled dot-product attention](/images/blog/transformer-lm/scaled-dot-product-attention.png)

Say you're given an input sequence $x$ with 4 tokens. 3 matrices are created:

1. **Q (Query):** what am I looking for?
2. **K (Key):** what do I advertise about myself?
3. **V (Value):** what information do I carry?

- 4 rows in each matrix → one query, one key, one value vector per input token
- Number of columns → depends on the chosen projection dimension

For each token, scores are calculated against **every** token (all 4, including itself) through a dot product.
- Denotes how important that token is to deduce the value for the current token
- Higher score = more relevant
- Softmax'ing the scores gives the attention weights

$$
\text{Attention}(Q, K, V) = \text{softmax}\left(\frac{QK^T}{\sqrt{d_k}}\right)V
$$

**Why scale by $\sqrt{d_k}$?** To constrain values and keep dot products from becoming too large as the key and query dimensions increase.
- Softmax is exponential, so large scores give overly peaked attention weights (one weight → 1, the rest → 0)
- Gradients through softmax then become very small, which leads to slower or less effective learning

**Why $\sqrt{d_k}$?** The *variance* of the dot product grows with $d_k$, so its *standard deviation* grows with $\sqrt{d_k}$. Dividing by $\sqrt{d_k}$ compensates for that growth.

## Multi-head attention

All this is one instance of a scaled dot-product attention layer. We can use multiple heads in an attention layer:

- Each head gets its own parameters
- Concatenate all head outputs → a single vector for each time step (followed by an output projection $W_O$)
- To keep the output embedding $x_t'$ the same size as the input $x_t$ → each head's output dimension = $d_{model}$ / number of heads, then concatenate

**What's the use of multiple heads?** To let a transformer attend to different relationships between tokens simultaneously, rather than relying on a single attention mechanism.
- Different heads learn different relationships like subject-verb agreement, coreference, syntactic structure
- One larger head could have the same overall dimensions, but it computes a **single** attention distribution per query
- Multiple heads learn separate distributions in different representation spaces, which results in more flexibility to represent different relationships in parallel
- Caveat: some heads may learn overlapping patterns

In a TLM, each hidden vector looks back at the hidden vectors of the current and previous timesteps in the previous layer. The language model part is just like an RNN-LM!

![Transformer language model](/images/blog/transformer-lm/transformer-lm.png)

## Transformer layers

Having covered the basic building block of a TLM (attention), here is how modern transformers put it all together. Each layer consists of several sublayers:

1. Attention
2. Feed-forward neural network
3. Layer normalization
4. Residual connections

**LayerNorm** : During training of a deep network, a small change in the low layers amplifies into a large change in the high layers (internal covariate shift). LayerNorm normalizes each token's hidden vector across its features (mean 0, variance 1), then learns an elementwise gain/bias. This allows higher learning rates (faster convergence) without diverging gradients

**Residual connections** : As network depth grows very large, performance degrades (not because of overfitting). With so many layers changing the values, the model loses sight of what it started with, i.e. the input. Residual connections pass a copy of the input alongside the function → $b = f(a) + a$ → information flows more directly. Due to this, very deep networks train effectively and outperform their shallower counterparts

![Plain vs residual connection](/images/blog/transformer-lm/residual-connection.png)

## Question: does attention know about order?

Suppose we have the following input embeddings and attention weights, with $W_v = I$:

| Token | Embedding | Weight $a_{4,j}$ |
|---|---|---|
| $x_1$ | [1, 0, 0, 0] | 0.1 |
| $x_2$ | [0, 1, 0, 0] | 0.2 |
| $x_3$ | [0, 0, 2, 0] | 0.6 |
| $x_4$ | [0, 0, 0, 1] | 0.1 |

Compute $x_4'$. Then swap the embeddings of $x_2$ and $x_3$ so that $x_2$ = [0, 0, 2, 0], $x_3$ = [0, 1, 0, 0]. What is the new $x_4'$?

**Answer.** Attention output:

$$
x_4' = \sum_{j=1}^{4} a_{4,j}\, v_j
$$

Since $W_v = I$ → $v_j = W_v x_j = x_j$, so

$$
x_4' = 0.1x_1 + 0.2x_2 + 0.6x_3 + 0.1x_4 = [0.1,\ 0.2,\ 1.2,\ 0.1]
$$

After the swap:
- Swapping two embeddings swaps their keys and values → also swaps the corresponding columns of the attention matrix
- The weights follow the embeddings → the weighted sum for token 4 stays the same

$$
x_4' = [0.1,\ 0.2,\ 1.2,\ 0.1]
$$

→ Attention on its own is **permutation invariant**: it has no notion of word order.

**The solution: position embeddings.** Use (or learn) a set of position-specific embeddings: $p_t$ represents what it means to be in position $t$. Add it to the word embedding $w_t$.

- Every word that appears in position $t$ uses the same position embedding $p_t$
- Varieties:
  1. **Fixed** (based on sine and cosine) vs **learned** (like word embeddings)
  2. **Absolute** vs **relative** (relative to the position of the query vector)

## Single-headed causal attention

If we're training the transformer to predict the next token(s), attending to tokens that come after the current token is cheating! It shouldn't be able to see what's to the right of it → **masking**.

- Scores are computed for all time steps $T$
- Then all softmax inputs for timesteps to the right of the query are set to $-\infty$ → weight 0 → they're not considered

$$
A = \text{softmax}(S) \quad\longrightarrow\quad A_{causal} = \text{softmax}(S + M), \qquad M_{ij} = \begin{cases} 0 & j \le i \\ -\infty & j > i \end{cases}
$$

## Efficient training of transformers

- **Batching:** rather than one sentence at a time, take in a batch of $B$ sentences → the computation is identical for each sentence → trivially parallelized
- **Scaled dot-product attention:** easily parallelized, since the attention scores of one timestep don't depend on other timesteps
- **Multi-headed attention:** each head computed independently → yet more parallelism
- **Matrix multiplication:** GPUs and TPUs make this very fast
- **Model parallelism:** divide the model over multiple GPUs/machines

## Efficient inference: key-value caching

The keys and values are reused over many timesteps, but we do not need to cache the queries, similarity scores, or attention weights. Each step → compute the new $k_t$ and $v_t$ → cache them for subsequent timesteps.

| | Naive: recompute everything | With a KV cache |
|---|---|---|
| Computed at step $t$ | $k_i, v_i$ for every $i \le t$ | only the new $q_t, k_t, v_t$ |
| Attention cost at step $t$ | $O(t^2 d)$ | $O(t\, d)$ |
| Total over $T$ steps | $\sum_t t^2 = O(T^3 d)$ | $\sum_t t = O(T^2 d)$ |
| Extra memory | none | $O(T d)$ per layer for the cache |

> **Why are the keys and values safe to reuse?** Causal masking. Token $i$ attends only to positions $\le i$, so nothing that arrives later can change $k_i$ or $v_i$.

The speedup grows linearly in $T$. Caching removes an entire factor of $T$ from generation, and it matters more the longer the context gets.

Suppose the model has generated *"The cat sat on"* and needs to predict the next token:

1. Compute the query, key, and value for the new token, "on"
2. Reuse the cached keys and values for "The", "cat", "sat"
3. The new query attends to all cached keys → attention weights combine their values
4. Cache the new token's key and value for the next generation step

**Why don't we cache queries?** Each previous token's query is no longer needed during standard autoregressive generation.
- A query determines how a token attends to the other tokens
- Once that token's attention output has been computed, its query is never reused

For a new token $t$:

$$
\text{Attention}_t = \text{softmax}\left(\frac{q_t K_{\le t}^T}{\sqrt{d_k}}\right) V_{\le t}
$$

$q_t$ → computed for the current token. $K_{\le t}$, $V_{\le t}$ → cached keys and values of all tokens so far.
