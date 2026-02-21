# AMD Hardware Developer Challenge – Complete Guide

**Goal:** Fix 10 bugs in PyTorch or vLLM ROCm backlog → get merged PRs → submit to claim HP Strix Halo 128GB Laptop.

---

## Current Status

- **Your PyTorch fork:** [github.com/Jtss-ux/pytorch](https://github.com/Jtss-ux/pytorch) ✅ exists
- **Merged PRs:** 0 (need 10 merged into upstream)
- **master-er folder:** Contains `public-apis-master` (API list project), not relevant to this challenge

---

## Step 1: Fix Windows Path Length (If Cloning Locally)

Windows has a 260‑character path limit. PyTorch has long filenames. Run **once** (Admin PowerShell):

```powershell
git config --global core.longpaths true
New-ItemProperty -Path "HKLM:\SYSTEM\CurrentControlSet\Control\FileSystem" -Name "LongPathsEnabled" -Value 1 -PropertyType DWORD -Force
```

Restart your terminal or PC. Then clone:

```powershell
cd C:\Users\JTS\OneDrive\Desktop
git clone https://github.com/Jtss-ux/pytorch.git pytorch-rocm
cd pytorch-rocm
git remote add upstream https://github.com/pytorch/pytorch.git
git fetch upstream
```

---

## Step 2: Use GitHub Codespaces (Recommended to Avoid Path Issues)

1. Go to [github.com/Jtss-ux/pytorch](https://github.com/Jtss-ux/pytorch)
2. Click **Code** → **Codespaces** → **Create codespace on main**
3. Wait for the environment to build

---

## Step 3: Good ROCm Issues to Start With

### PyTorch ROCm (simpler, code-cleanup style)

| Issue | Title | Difficulty |
|-------|--------|------------|
| [#171124](https://github.com/pytorch/pytorch/issues/171124) | [ROCm] Update MIN_ROCM_VERSION to 6.0 in verify_dynamo.py | Easy |
| [#171122](https://github.com/pytorch/pytorch/issues/171122) | [ROCm] Simplify has_hipsolver() version check | Easy |
| [#171120](https://github.com/pytorch/pytorch/issues/171120) | [ROCm] Remove obsolete HIP NaN handling workarounds | Easy |
| [#174867](https://github.com/pytorch/pytorch/issues/174867) | [ROCm] Simplify _check_hipsparse_generic_available() | Easy |

### vLLM ROCm

| Issue | Title |
|-------|--------|
| [#34752](https://github.com/vllm-project/vllm/issues/34752) | Improve --kv-cache-dtype behavior (good first issue) |
| [#34859](https://github.com/vllm-project/vllm/issues/34859) | Missing shards from quantized checkpoint fails silently |

---

## Step 4: Contribution Workflow (Per Bug)

1. **Sync your fork**
   ```bash
   git checkout main
   git fetch upstream
   git merge upstream/main
   git push origin main
   ```

2. **Create a branch** (example for #174867)
   ```bash
   git checkout -b fix-rocm-hipsparse-check-174867
   ```

3. **Implement the fix**  
   For [#174867](https://github.com/pytorch/pytorch/issues/174867), the change is:
   - File: `torch/utils/hipify/cuda_to_hip_mappings.py` (or wherever `_check_hipsparse_generic_available` lives)
   - Replace the full version-check logic with:
   ```python
   def _check_hipsparse_generic_available():
       return TEST_WITH_ROCM
   ```

4. **Commit and push**
   ```bash
   git add <changed_file>
   git commit -m "[ROCm] Simplify _check_hipsparse_generic_available() version check"
   git push origin fix-rocm-hipsparse-check-174867
   ```

5. **Open PR**
   - Go to github.com/Jtss-ux/pytorch
   - Click “Compare & pull request”
   - Base: `pytorch:main` (upstream), head: your branch
   - Title: `[ROCm] Simplify _check_hipsparse_generic_available() version check`
   - In description: `Fixes #174867`

6. **Sign CLA** if prompted (Linux Foundation)

7. **Respond to review** until the PR is merged

---

## Step 5: Submission Format for the Challenge

After you have **10 merged PRs**, paste links like this in the challenge form:

```
1. https://github.com/pytorch/pytorch/pull/XXXXX
2. https://github.com/pytorch/pytorch/pull/XXXXX
3. https://github.com/vllm-project/vllm/pull/XXXXX
...
10. https://github.com/pytorch/pytorch/pull/XXXXX
```

---

## Links

- **PyTorch ROCm issues:** https://github.com/pytorch/pytorch/labels/rocm
- **vLLM ROCm issues:** https://github.com/vllm-project/vllm/issues?q=is%3Aissue+ROCM
- **PyTorch Contributing:** https://github.com/pytorch/pytorch/blob/main/CONTRIBUTING.md

---

## About master-er & API Keys

- **master-er:** Holds the public-apis project (list of free APIs), not API keys.
- **GHelper API keys:** Set via environment variables (e.g. `REPLICATE_API_TOKEN`, `HUGGING_FACE_API_KEY`); see `DEPLOYMENT-SETUP.md`.
- **AMD Challenge:** No API keys required.
