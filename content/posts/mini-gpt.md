---
title: "Coding a mini GPT: RoPE, causal attention, and GQA"
date: "2026-10-12"
excerpt: "Building a GPT-style model from scratch."
---

Let's talk about code.

I recently had the opportunity (read: homework) to code up a GPT-style architecture from scratch (minGPT, with a few modern upgrades). While the deadline was breathing down my neck I had a fun experience nonetheless. It gave me a bird's eye view of the basics of building a transformer from scratch, training with custom data and then visualising the results first-hand. Let's get into it.

Code can be found [here](https://github.com/aryamansharma01/minigpt/tree/main).

![GPT-623 architecture with the four changes labelled](/images/blog/mini-gpt/gpt623_architecture.png)

Note: there are four architectural changes that distinguish this configuration (called GPT-623) from the gpt2 configuration in this codebase.

1. **No bias in linear projections**: labels A, G, I, C → bias removed from every attention linear layer (q_proj, k_proj, v_proj, out_proj). The SwiGLU MLP (H) is bias-free too.
2. **QK-Norm**: labels D, E → per-head RMSNorm on query and key, after they're reshaped into heads and before attention scores are computed. Not in gpt2.
3. **RMSNorm instead of LayerNorm**: labels B, J, F
4. **SwiGLU MLP instead of GELU MLP**: label H

Why is this an improvement over GPT-2?

- no bias → fewer params, no measurable quality loss at scale (PaLM, LLaMA dropped them)
- QK-Norm → bounds the q·k logits → stops attention from collapsing onto one token as weights grow → more stable training at higher learning rates
- RMSNorm → skips mean-subtraction and bias → cheaper, same quality in practice
- SwiGLU → gated MLP (one branch decides how much of the other passes through) → better loss per parameter than GELU

## Building blocks

### Rotary Positional Embeddings

As described in [this blog](/blog/transformer-lm#question-does-attention-know-about-order), attention is inherently permutation invariant, and we need to give some sort of signal to the model to let it know the position of each word in the sentence. We could use something like a sequential position embedding (1, 2, 3, 4…) for each word, but there are some problems with it.

1. Absolute positional embeddings are essentially fixed → hits a hard wall when we reach an ID beyond the original context window
2. Position is added into the token embedding itself → content and position get tangled. The model only ever sees "5" and "2", never "we're 3 apart", so relative distance has to be learned indirectly

Rotary Position Embedding (RoPE) fixes this. We do something different by treating word embeddings as points on a plane. Then, rotations can encode offset and comparisons (dot products) can be used to measure distance.

- RoPE applies position as a continuous rotation → naturally encodes the distance between tokens
- No hard ceiling on the input length the model can run on (quality is a separate story, see below)

Sentence: *Aryaman has a happy cat.*

For simplicity, assume words are represented in 2D space so they can be plotted on a plane. Exhibit: Aryaman. Then, we might have another vector 'has' pointing in a different direction and so on, until all our words are in the diagram. We rotate these vectors by multiplying a rotation matrix with the target vector → v′ = R(mθ) · v, where m is the token's position.

<video src="/images/blog/mini-gpt/rope_rotation.mp4" poster="/images/blog/mini-gpt/rope_rotation_poster.png" autoplay loop muted playsinline controls style="width:100%;border-radius:12px"></video>

See 'Aryaman' rotating θ. Each token rotates by its own position times θ, i.e. 'cat' rotates 5θ while 'has' rotates 2θ (pos. 5 vs. pos. 2). Although 'has' and 'cat' started in similar directions, after the rotation they have very different angles w.r.t. 'Aryaman'.

Specifically, 'cat' rotated 2.5 times as much as 'has'.

Second half of the clip → shift the whole sentence 3 positions later. Every vector rotates by the same extra 3θ, so the angle between any two words stays put. That's the whole trick: q·k only cares about the angle between them, so only the offset matters.

Real vectors have many more dimensions than 2. That's why θ is calculated using this schedule:

$$\theta_i = 10000^{-2(i-1)/d}, \quad i = 1, \dots, d/2$$

Split the input into pairs of 2 → each pair i = 1…d/2 gets its own θᵢ to rotate by.

<img src="/images/blog/mini-gpt/rope_pairs.svg" alt="A d=8 query vector for 'cat' split into four pairs, each spinning at its own theta" style="width:100%">

As i moves from 1 → d/2, θ gets smaller → that pair rotates less per position.

Question comes, why do we want each pair to be rotated a different amount? A single θ forces a tradeoff. Large θ resolves nearby positions well but repeats often, so distant positions become ambiguous. Small θ never wraps but barely changes across nearby tokens, so it can't tell neighbors apart. A schedule gives us both → fast pairs for local precision, slow pairs for long range.

Example (d = 8, 'cat' at m = 5, figure above):
- pair 1, θ = 1 → 5 rad, full turn every ~6 tokens → tells 'happy' from 'cat', but pos. 5 and pos. 11 look almost the same
- pair 4, θ = 0.001 → 0.005 rad, full turn every ~6,283 tokens → useless for neighbours, but never ambiguous across a long document

Here's what that does to the attention formula:

![Standard vs RoPE attention score](/images/blog/mini-gpt/rope_attention_formula.png)

R_m only shows up on q and k. R_mᵀR_n collapses to R_(n−m) → the score depends on the offset, not on where the pair sits in the sentence.

Applying R_m as a d×d matrix:

![Full rotation matrix is 75% zeros](/images/blog/mini-gpt/rope_sparse.png)

A ton of computation wasted by a full matrix multiply because of the zeros!

There's a better way → each rotation block only affects two specific dimensions of the embedding, so we can rewrite the matrix multiplication as element-wise vector products.

![Element-wise RoPE for one token](/images/blog/mini-gpt/rope_elementwise.png)

Now this vectorized approach is much faster for a single sample, since we've gone from a matrix multiplication to simple element-wise operations.

Note: the paper pairs adjacent dims (x1, x2), (x3, x4)… This code pairs dim i with dim i + d/2 (GPT-NeoX / LLaMA convention). Same rotations, different bookkeeping → fine as long as q and k use the same one.

When we train or run inference, for high performance, we want to apply RoPE on the entire matrix in a single vectorized operation.

![RoPE over the whole sequence](/images/blog/mini-gpt/rope_matrix.png)

Split our d dimensions into two parts:

- This structure lets us use element-wise multiplication
- First term takes Y and multiplies by a precomputed matrix of cosine values
- Second term swaps the two halves of Y, negates the half that moves to the front, and multiplies by a precomputed sine matrix
- Together, they do the same rotation arithmetic as the previous attempts in O(Nd) instead of O(Nd²)

```python
def __init__(self, d: int, base: int = 10_000):
    super().__init__()
    """ 
    TODO: Initialize the class with the input arguments, as well as any values you may want to cache.
    """
    self.d = d
    self.theta = 1.0/(base**(torch.arange(0,d,2).float()/d)) #implementing the theta equation
    self.cos = None
    self.sin = None


def forward(self, Y: torch.Tensor):

    seqlen = Y.shape[-2]

    pos = torch.arange(1,seqlen+1,device=Y.device, dtype=self.theta.dtype) #absolute positional values (1,2,3..till sequence length)
    freqs = pos[:,None]*self.theta.to(Y.device)[None,:] 
    angles = torch.cat([freqs,freqs],dim=-1) 

    cos = angles.cos().to(Y.dtype)
    sin = angles.sin().to(Y.dtype)

    Y1 = Y[...,:self.d//2]
    Y2 = Y[...,self.d//2:]
    rotated = torch.cat([-Y2,Y1],dim=-1) #concatenating the negative of the second half and the positive of the first half to get the second coefficient

    return Y*cos+rotated*sin #RoPE equation
```

<p class="code-source"><a href="https://github.com/aryamansharma01/minigpt/blob/4dc80c27b5fb175bdc9f2397a190ea9598cc1753/mingpt/model.py#L71-L97">mingpt/model.py · lines 71–97</a></p>

That said, RoPE still degrades in performance at longer contexts → the slow-rotating pairs never complete a full period during training, so beyond the training length they hit angles the model has never seen.

### Causal Self Attention

We discussed self attention in [this blog](/blog/transformer-lm#attention). Causal self-attention → the current token attends only to itself and the tokens before it. Because we're predicting autoregressively (one token at a time, based on the previous inputs), we don't care for the tokens that appear to the right of it. This is where the "causal" nature comes from.

```python
# key, query, value projections
self.q_proj = nn.Linear(config.n_embd, config.n_embd, bias=bias)
self.k_proj = nn.Linear(config.n_embd, config.n_embd, bias=bias)
self.v_proj = nn.Linear(config.n_embd, config.n_embd, bias=bias)
```

<p class="code-source"><a href="https://github.com/aryamansharma01/minigpt/blob/4dc80c27b5fb175bdc9f2397a190ea9598cc1753/mingpt/model.py#L113-L116">mingpt/model.py · lines 113–116</a></p>

This is how the 3 matrices Q, K, V are calculated. They are linear projections of the current input tokens:
- Q (Query): what am I looking for?
- K (Key): what do I advertise about myself?
- V (Value): what information do I carry?

```python
# regularization
self.attn_dropout = nn.Dropout(config.attn_pdrop)
self.resid_dropout = nn.Dropout(config.resid_pdrop)
```

<p class="code-source"><a href="https://github.com/aryamansharma01/minigpt/blob/4dc80c27b5fb175bdc9f2397a190ea9598cc1753/mingpt/model.py#L128-L130">mingpt/model.py · lines 128–130</a></p>

- **Attention dropout** → randomly zeros some attention weights after softmax. Discourages the model from relying too heavily on a small set of attention connections.
- **Residual dropout** → randomly zeros elements of the attention output after its output projection, before it's added back to the residual stream. Regularizes the attention branch, not the residual stream itself.
- Both use the probabilities in the config (attn_pdrop, resid_pdrop, default 0.1) → active during training, disabled in eval mode.

```python
# causal mask to ensure that attention is only applied to the left in the input sequence
self.register_buffer("bias", torch.tril(torch.ones(config.block_size, config.block_size))
                             .view(1, 1, config.block_size, config.block_size))

self.rope = config.rope
if self.rope:
    head_dim = config.n_embd//self.n_head
    self.query_rotary_pe = RotaryPositionalEmbeddings(d=head_dim) 
    self.key_rotary_pe = RotaryPositionalEmbeddings(d=head_dim)
```

<p class="code-source"><a href="https://github.com/aryamansharma01/minigpt/blob/4dc80c27b5fb175bdc9f2397a190ea9598cc1753/mingpt/model.py#L132-L140">mingpt/model.py · lines 132–140</a></p>

Register the causal mask (lower-triangular ones) and initialise the RoPE embeddings to be applied.

```python
# split the embedding dimension (n_embd) across the number of heads by introducing an additional 'h' dimension
# reshape the query, key, value tensors to increase efficiency of matrix multiplication
# b = batch size, t = sequence length, h = number of heads, d = n_embd / number of heads

q = rearrange(q, 'b t (h d) -> b h t d', h=self.n_head)
k = rearrange(k, 'b t (h d) -> b h t d', h=self.n_head)
v = rearrange(v, 'b t (h d) -> b h t d', h=self.n_head)
```

<p class="code-source"><a href="https://github.com/aryamansharma01/minigpt/blob/4dc80c27b5fb175bdc9f2397a190ea9598cc1753/mingpt/model.py#L150-L156">mingpt/model.py · lines 150–156</a></p>

I like einops. Basically, it's a library for reshaping and combining tensors using readable dimension labels. Here, `rearrange` splits each projected tensor from (batch, time, embedding) into (batch, heads, time, head_dim), so attention can be computed independently for each head. For example, `(h d)` means the embedding dimension is divided into h heads of size d.

```python
# QKNorm applies per-head, after reshape and before RoPE
if self.qk_norm:
    q = self.q_norm(q)
    k = self.k_norm(k)

if self.rope:
    """
    Implement the forward pass when using RoPE.
    """
    q = self.query_rotary_pe(q)
    k = self.key_rotary_pe(k)

# compute square root of (n_embd / number of heads) to scale the dot product
scale = math.sqrt(k.size(-1))
# calculate the attention scores with the query and  key
att = einsum(q, k, 'b h q d, b h k d -> b h q k') / scale
att = att.masked_fill(self.bias[:,:,:t,:t] == 0, float('-inf'))
att = F.softmax(att, dim=-1)

att = self.attn_dropout(att)

# matrix multiplication of attention scores and value
y = einsum(att, v, 'b h q t, b h t d -> b h q d')

# rearrange the output tensor to (batch size, sequence length, n_embd)
y = rearrange(y, 'b h q d -> b q (h d)') # re-assemble all head outputs side by side

# output projection
y = self.resid_dropout(self.out_proj(y))

return y
```

<p class="code-source"><a href="https://github.com/aryamansharma01/minigpt/blob/4dc80c27b5fb175bdc9f2397a190ea9598cc1753/mingpt/model.py#L158-L188">mingpt/model.py · lines 158–188</a></p>

We apply the normalization and RoPE embeddings to our query and key matrices. V is left unchanged. Why? Position only needs to decide *who attends to whom* (the scores). V is *what gets mixed in*. Rotating V would bake absolute position into the output and break the relative property.

Applying our attention score equation, softmax(QKᵀ/√d)·V, we use einsum to multiply the two matrices. `einsum(q, k, 'b h q d, b h k d -> b h q k')` computes query-key dot products. For each batch, head, query position and key position, it sums over d (the head features). The result `att` has shape (batch, heads, query_positions, key_positions) → attention scores showing how much each query position relates to each key position.

Because this is causal self attention, we apply a mask to set all the elements to the right to −∞. After softmax, e^(−∞) = 0 → these positions get zero weight in our final resultant vector.

![Scores, masked scores, and softmax weights for 'Aryaman has a happy cat'](/images/blog/mini-gpt/causal_mask.png)

`einsum(att, v, 'b h q t, b h t d -> b h q d')` applies those attention weights to the value vectors. It sums over t (the key/value positions), producing one weighted value vector per query position and head.

Then `rearrange(y, 'b h q d -> b q (h d)')` moves the sequence axis next to the batch axis and flattens the head and feature dimensions together. That combines all heads into a single embedding vector per position, with shape (batch, sequence_length, embedding_size).

### Grouped Query Attention

![Multi-head vs grouped-query vs multi-query attention](/images/blog/mini-gpt/gqa_mha_mqa.png)

*MHA → every query head has its own K and V head. MQA → all query heads share one K/V head. GQA sits in between → query heads are split into groups, each group shares one K/V head. Fewer K/V heads → smaller k_proj/v_proj and a smaller KV cache at generation time, with quality close to MHA.*

```python
####Initialize any required variables. ####
self.n_query_head = config.n_query_head
self.n_kv_head = config.n_kv_head
self.n_group = config.n_query_head // config.n_kv_head
self.n_embd = config.n_embd
self.head_dim = config.n_embd // config.n_query_head

bias = config.model_type!='gpt623'

# Key, Query, Value Projections: you must define these as nn.Linear().
# Keep in mind the shape that you want these projections to output.
self.q_proj = nn.Linear(config.n_embd, config.n_query_head*self.head_dim,bias = bias) 
self.k_proj = nn.Linear(config.n_embd, config.n_kv_head*self.head_dim,bias = bias)
self.v_proj = nn.Linear(config.n_embd, config.n_kv_head*self.head_dim,bias = bias) 

self.out_proj = nn.Linear(config.n_embd,config.n_embd,bias = bias)
```

<p class="code-source"><a href="https://github.com/aryamansharma01/minigpt/blob/4dc80c27b5fb175bdc9f2397a190ea9598cc1753/mingpt/model.py#L210-L225">mingpt/model.py · lines 210–225</a></p>

- **Causal self-attention** → computes query, key and value projections for all heads. Each query head has its own key and value head.
- **Grouped-query attention (GQA)** → computes queries for all query heads, but uses fewer key/value heads. Repeats each key/value head across a group of query heads before computing attention. Reduces the key/value projection size → especially useful for reducing KV-cache costs during generation.
- `n_query_head`, `n_kv_head` and `n_group` track how query heads share key/value heads. `n_group` = how many query heads share each KV head.
- `q_proj` → one query per query head. `k_proj`, `v_proj` → fewer heads: `n_kv_head * head_dim`. In causal self-attention, all three projections produce the same number of heads.

```python
b,t,n_embd = x.size()
q = self.q_proj(x) 
k = self.k_proj(x)
v = self.v_proj(x)

q = rearrange(q, 'b t (h d) -> b h t d', h=self.n_query_head)
k = rearrange(k, 'b t (h d) -> b h t d', h=self.n_kv_head)
v = rearrange(v, 'b t (h d) -> b h t d', h=self.n_kv_head)

# QKNorm (gpt623) should be done before RoPE
if self.qk_norm:
    q = self.q_norm(q)
    k = self.k_norm(k)

if self.rope:
    q= self.query_rotary_pe(q)
    k = self.key_rotary_pe(k)

k_rep = repeat(k, 'b h t d -> b (h g) t d', g=self.n_group)
v_rep = repeat(v, 'b h t d -> b (h g) t d', g=self.n_group)
att = einsum(q,k_rep,'b h q d, b h k d -> b h q k')/math.sqrt(k.size(-1))
```

<p class="code-source"><a href="https://github.com/aryamansharma01/minigpt/blob/4dc80c27b5fb175bdc9f2397a190ea9598cc1753/mingpt/model.py#L255-L275">mingpt/model.py · lines 255–275</a></p>

- `rearrange` splits q using `n_query_head`, but k and v using `n_kv_head`
- `repeat` expands the KV heads so each query head has a matching key/value head for the attention calculation

![How repeat lines K/V heads up with query heads](/images/blog/mini-gpt/gqa_repeat.png)

After that, it follows the same basic steps as causal self-attention: scaled scores, causal mask, softmax, dropout, weighted values and output projection.

**MHA and MQA as special cases.** Setting `n_kv_head == n_query_head` gives MHA, and `n_kv_head == 1` gives MQA.

## Results

![Training loss, vanilla vs GQA](/images/blog/mini-gpt/results_vanilla_vs_gqa.png)

Vanilla (multi-head) vs GQA with 2 KV heads, seq_len 16, 200 iters:
- curves lie on top of each other, GQA marginally lower near the end but within noise
- → sharing K/V across query heads costs nothing in quality here, while k_proj/v_proj shrink

![Training loss across 4 configs, seq_len 16 then 256](/images/blog/mini-gpt/results_four_configs.png)

4 configs, 600 iters at seq_len 16, then 600 more at seq_len 256:
- **iters 0–600** → all four close, RoPE runs a touch lower (~1.85 vs ~1.95)
- **switch to 256** → every config spikes, but not equally
  - no RoPE (vanilla, GQA-only) → jump to ~3.3, sit on a ~2.4 plateau for ~80 iters, then recover → end ~1.47
  - RoPE (RoPE-only, RoPE + GQA) → smaller spike (~2.6), drop straight away → end ~1.32
- why → absolute position embeddings for positions 17–256 were never trained, so the model has to learn them from scratch first. RoPE has no position parameters: positions 17–256 follow the same rotation formula, and the relative offsets it already learned still mean the same thing
- GQA vs no GQA → near-identical in both phases → the quality gap between MHA and GQA is negligible at this scale; the gap that matters is RoPE vs no RoPE
