# Emotional Agent Demo - Deployment Guide

## Current Issue Analysis
Your frontend is trying to connect to `http://127.0.0.1:5000` (localhost), which only works locally. For proper display, you need deployment.

## Deployment Options

### Option 1: Replit (Recommended for Easy Sharing)

#### Step 1: Fix API Endpoints
Update all frontend files to use relative paths instead of localhost:

**Files to update:**
- frontend/src/components/Chatbox.js: Change `http://127.0.0.1:5000/chat` → `/api/chat`
- frontend/src/components/EnhancedChatbox.js: Change `http://127.0.0.1:5000/api/chat` → `/api/chat`
- frontend/src/components/EmotionalArc.js: Change `http://127.0.0.1:5000/chat` → `/api/chat`
- frontend/src/components/EmotionalMemoryAgent.js: Change `http://127.0.0.1:5000/api/emotional-chat` → `/api/emotional-chat`
- frontend/src/components/VoiceEmotionalAgent.js: Change `http://127.0.0.1:5000/api/voice-chat` → `/api/voice-chat`

#### Step 2: Create Replit Configuration Files

**Create .replit file:**
```
run = "cd frontend && npm install && npm run build && cd .. && python backend/app.py"
language = "python"

[env]
PORT = "5000"
FLASK_ENV = "production"
```

**Create requirements.txt:**
```
flask==2.3.3
flask-cors==4.0.0
gunicorn==21.2.0
```

**Create Procfile:**
```
web: gunicorn backend.app:app --bind 0.0.0.0:$PORT
```

#### Step 3: Update Backend for Production
Add to backend/app.py:
```python
import os

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port, debug=False)
```

#### Step 4: Deploy to Replit
1. Push code to GitHub:
   ```bash
   git init
   git add .
   git commit -m "Emotional agent demo ready for deployment"
   git remote add origin https://github.com/YOUR_USERNAME/emotional-agent-demo.git
   git push -u origin main
   ```

2. Go to replit.com → "Create" → "Import from GitHub"
3. Paste your GitHub repo URL
4. Click "Import from GitHub"
5. Click "Run" - Replit will auto-install dependencies and start both frontend and backend

### Option 2: ngrok (For Local Testing)

#### Step 1: Install ngrok
```bash
npm install -g ngrok
```

#### Step 2: Start Backend
```bash
cd backend
python app.py
```

#### Step 3: Expose Backend
```bash
ngrok http 5000
# Copy the https URL (e.g., https://abc123.ngrok.io)
```

#### Step 4: Update Frontend URLs
Replace all `http://127.0.0.1:5000` with your ngrok URL in all frontend files.

## Quick Fix Commands

### For Replit (Recommended):
```bash
# 1. Fix endpoints
find frontend/src -name "*.js" -exec sed -i '' 's|http://127.0.0.1:5000||g' {} \;

# 2. Create config files
echo "run = \"cd frontend && npm install && npm run build && cd .. && python backend/app.py\"" > .replit
echo "flask==2.3.3\nflask-cors==4.0.0\ngunicorn==21.2.0" > requirements.txt

# 3. Push to GitHub and import to Replit
```

### Expected Results:
- **Replit**: Permanent URL like `https://emotional-agent-demo.yourusername.repl.co`
- **ngrok**: Temporary URL like `https://abc123.ngrok.io` (changes every restart)

## Recommendation
Start with Replit for permanent, shareable deployment. It handles both frontend and backend automatically and provides a stable URL.
