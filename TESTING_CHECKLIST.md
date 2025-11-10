# Testing Checklist - Run This First!

**Goal**: Identify what works and what's broken in 30 minutes

---

## Setup (5 minutes)

### Terminal 1: Parallax
```bash
cd ~/parallax
source venv/bin/activate
parallax run -m Qwen/Qwen3-0.6B -n 1 --host 0.0.0.0
```

### Terminal 2: ParallaxPay
```bash
cd ~/parallaxpay_x402
npm run dev
```

### Browser
Open: http://localhost:3000

---

## Test 1: Landing Page (2 minutes)

- [ ] Page loads without errors
- [ ] All sections visible (hero, features, steps, stats)
- [ ] Navigation works (Agents, Providers links)
- [ ] Wallet button appears
- [ ] Animations play smoothly
- [ ] Mobile responsive (resize browser)

**Check browser console for errors:** ⬜ None ⬜ Some ⬜ Many

**Visual issues noticed:**
```
[Write down any issues]
```

---

## Test 2: Wallet Connection (2 minutes)

- [ ] Click "Connect Wallet" button
- [ ] Wallet popup appears (Phantom/Solflare)
- [ ] Can connect wallet
- [ ] Wallet address shows after connection
- [ ] Can disconnect wallet

**Issues:**
```
[Any problems?]
```

---

## Test 3: Agent Dashboard Page (3 minutes)

- [ ] Navigate to /agents page
- [ ] Page loads (no white screen)
- [ ] "Deploy Agent" button visible
- [ ] Stats/metrics display
- [ ] Can see deployed agents (if any from before)

**Browser console errors?** Yes / No

**Layout issues?**
```
[Any visual problems?]
```

---

## Test 4: Custom Agent Deployment (5 minutes)

- [ ] Click "Deploy Agent" button
- [ ] Modal opens
- [ ] Can enter agent name
- [ ] Can enter prompt
- [ ] "Deploy" button works
- [ ] Modal closes after deploy
- [ ] Agent appears in dashboard
- [ ] Agent card shows correct info

**Test with:**
- Name: `Test Agent`
- Prompt: `Say hello in 10 words`

**Deployed successfully?** Yes / No

**If NO, error message:**
```
[Copy error from console]
```

---

## Test 5: Run Custom Agent (5 minutes)

**CRITICAL TEST - THIS MUST WORK!**

- [ ] Click "Run" button on deployed agent
- [ ] Payment modal appears
- [ ] Shows cost ($0.001)
- [ ] "Pay & Execute" button visible
- [ ] Click button, modal closes
- [ ] Loading state shows
- [ ] Result appears (within 10-15 seconds)
- [ ] Transaction hash shown
- [ ] Agent total runs increased

**Worked?** Yes / No

**If NO:**
```
At what step did it fail?
1. Payment modal didn't appear
2. Payment failed
3. Parallax connection failed
4. Timeout (no result)
5. Error shown: [copy error]
```

**Parallax logs (check Terminal 1):**
```
[Any errors in Parallax?]
```

---

## Test 6: Composite Agent Creation (5 minutes)

**THIS IS YOUR KILLER FEATURE!**

- [ ] Click "Deploy Agent" → Select "Composite Agent"
- [ ] Modal shows composite agent form
- [ ] Can add Step 1 (agent name, prompt)
- [ ] Can add Step 2
- [ ] Can add Step 3
- [ ] Can toggle "Use output from previous step"
- [ ] "Deploy Composite Agent" button works
- [ ] Composite agent appears in dashboard
- [ ] Shows as "composite" type

**Test with:**
Step 1: "Researcher" - "Say 'data'"
Step 2: "Analyzer" - "Say 'analysis'" (use output from Step 1)
Step 3: "Summarizer" - "Say 'summary'" (use output from Step 2)

**Created successfully?** Yes / No

**Issues:**
```
[Any problems?]
```

---

## Test 7: Run Composite Agent (5 minutes)

**MOST CRITICAL TEST!**

- [ ] Click "Run" on composite agent
- [ ] Shows composite workflow modal
- [ ] Shows all steps
- [ ] Shows total cost ($0.003)
- [ ] "Execute Workflow" button visible
- [ ] Click button, execution starts
- [ ] Can see step-by-step progress
- [ ] Step 1 completes (green checkmark)
- [ ] Step 2 completes
- [ ] Step 3 completes
- [ ] Final result shows all outputs
- [ ] Transaction recorded

**Worked?** Yes / No

**If NO:**
```
Which step failed?
1. Modal didn't show workflow
2. Execution button didn't work
3. Stuck on Step 1
4. Stuck on Step 2
5. Stuck on Step 3
6. No results shown
7. Error: [copy error]
```

---

## Test 8: Transactions Feed (2 minutes)

- [ ] Navigate to /transactions page
- [ ] Page loads
- [ ] Shows list of transactions
- [ ] Shows agent names, costs, timestamps
- [ ] Can click transaction hash
- [ ] Links to Solana Explorer

**Shows transactions?** Yes / No / Empty

---

## Test 9: Supabase Persistence (2 minutes)

- [ ] Refresh browser (Cmd+R / Ctrl+R)
- [ ] Agents still show in dashboard
- [ ] Navigate away and back
- [ ] Agents persist

**Persists correctly?** Yes / No

---

## Test 10: Provider Marketplace (2 minutes)

- [ ] Navigate to /marketplace page
- [ ] Page loads
- [ ] Shows provider info
- [ ] Can select provider
- [ ] Selection saves

---

## 🚨 CRITICAL ISSUES FOUND

**Blockers (MUST FIX):**
```
1. [List anything that completely breaks the demo]
2.
3.
```

**Major Issues (Should fix):**
```
1. [List important bugs]
2.
3.
```

**Minor Issues (Nice to have):**
```
1. [List small bugs]
2.
3.
```

**UI/UX Problems:**
```
1. [List confusing/ugly parts]
2.
3.
```

---

## NEXT STEPS

Based on test results:

### If EVERYTHING works:
✅ Focus 100% on UI/UX improvements
✅ Add polish, animations, better visuals
✅ Make it stunning!

### If SOME things broken:
⚠️ Fix critical bugs first (30 min - 1 hour)
⚠️ Then do UI/UX improvements
⚠️ Test again after fixes

### If MANY things broken:
🚨 Don't panic!
🚨 Focus on fixing ONE flow: Deploy → Run → Results
🚨 Make that flow PERFECT
🚨 Then add UI polish to that flow only

---

## SHARE RESULTS

Once done testing, share:
1. Which tests passed ✅
2. Which tests failed ❌
3. Console errors (screenshot)
4. Biggest pain points

Then we'll create the PERFECT improvement plan! 🚀
