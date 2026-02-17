# 🔧 MANUAL STARTUP GUIDE - Step by Step

## ⚠️ The batch script had issues. Let's do this manually (it's actually easier!)

### What You'll Do:
Open **3 Command Prompt windows** and run one command in each.

---

## 🚀 STEP 1: Open First Command Prompt

1. Press **Windows Key + R**
2. Type: `cmd`
3. Press **Enter**

You now have **Terminal 1** open.

---

## 📱 STEP 2: Start Frontend (Terminal 1)

Copy and paste these commands one by one:

```bash
cd Desktop\AI-Content-Studio\frontend
```

Press Enter, wait for prompt. Then:

```bash
npm install
```

This will take 2-3 minutes. **Let it finish completely!** You'll see lots of text ending with something like `added 200+ packages`.

Then:

```bash
npm run dev
```

**Wait until you see this message:**
```
   ▲ Next.js 13.x.x
   - Local:        http://localhost:3000
```

When you see this, **STOP HERE** and go to Step 3. **DON'T CLOSE THIS WINDOW!**

---

## ⚙️ STEP 3: Open Second Command Prompt

While Terminal 1 is running, press **Windows Key + R** again to open a new Command Prompt.

In **Terminal 2**, run:

```bash
cd Desktop\AI-Content-Studio\backend
```

Press Enter, then:

```bash
npm install
```

Wait 1-2 minutes for it to finish. Then:

```bash
npm start
```

**Wait until you see:**
```
✅ Backend server running at http://localhost:5000
```

**DON'T CLOSE THIS WINDOW!**

---

## 🤖 STEP 4: Open Third Command Prompt

Press **Windows Key + R** again to open a new Command Prompt.

In **Terminal 3**, run:

```bash
cd Desktop\AI-Content-Studio\ml-models
```

Press Enter, then:

```bash
python -m venv venv
```

Wait for it to finish. Then:

```bash
venv\Scripts\activate
```

You should see `(venv)` at the start of your command line. Then:

```bash
pip install -r requirements.txt
```

This takes 2-3 minutes. Let it finish. Then:

```bash
python app.py
```

**Wait until you see:**
```
✅ ML Service running at http://localhost:5001
```

**DON'T CLOSE THIS WINDOW!**

---

## ✅ VERIFICATION

You should now have:
- ✅ Terminal 1: "http://localhost:3000" message
- ✅ Terminal 2: "Backend server running" message
- ✅ Terminal 3: "ML Service running" message

If you see all three, move to the next step!

---

## 🌐 STEP 5: Open Browser

Open Firefox (or Chrome) and go to:

```
http://localhost:3000
```

**You should see the AI Studio dashboard!**

---

## 🆘 TROUBLESHOOTING

### Issue: "npm: command not found"
**Solution:** Node.js not installed or terminal doesn't recognize it
- Close all Command Prompts
- Restart your computer
- Open Command Prompt again
- Try the commands again

### Issue: "python: command not found"
**Solution:** Python not installed or not in PATH
- Close all terminals
- Restart computer
- Try again

### Issue: "Port already in use"
**Solution:** Something else is using the port
- Close all terminals
- Restart computer
- Try again

### Issue: npm install stuck for 10+ minutes
**Solution:** Normal on first run
- Be patient, it's downloading packages
- Don't interrupt it
- Let it finish completely

### Issue: Can't see the 3 "running" messages
**Solution:** 
- Check terminal output carefully
- Scroll up to see all messages
- If errors, take a screenshot and share them

---

## 💡 IMPORTANT

### Keep All 3 Windows Open!
- Do NOT close any of the 3 terminals
- Minimize them instead
- They need to keep running for the app to work

### If You Need to Stop
- Close all 3 terminals
- Wait 10 seconds
- To restart, just run the same commands again

---

## ✨ Success Signs

You'll know it's working when:
1. Terminal 1 shows: `http://localhost:3000`
2. Terminal 2 shows: `Backend server running at http://localhost:5000`
3. Terminal 3 shows: `ML Service running at http://localhost:5001`
4. Browser shows: AI Studio dashboard

---

## 🎉 Next Step

Once you see the dashboard at http://localhost:3000:

1. Look at the sidebar (left side)
2. Click on "Image Generator"
3. Enter a test prompt
4. Click "Generate Image"
5. You should see a success message!

---

**Having trouble? Tell me what error messages you see and I'll help!**
