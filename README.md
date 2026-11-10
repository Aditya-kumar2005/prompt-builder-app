# Template Studio & Universal Prompt Generator

A unified web layout sandbox and universal AI prompt engineering studio powered by **Google Gemini**, **Anthropic Claude**, and **OpenAI GPT**.

---

## 🚀 One-Click Vercel Deployment

This repository is pre-configured with `vercel.json` and a serverless API proxy (`api/index.ts`). You can push to GitHub and deploy directly to Vercel with zero extra configuration.

### 1. Push to GitHub
If you haven't already initialized your git repository:
```bash
git init
git add .
git commit -m "Initial commit: Template Studio and Prompt Builder"
git branch -M main
git remote add origin https://github.com/<YOUR_USERNAME>/<YOUR_REPO_NAME>.git
git push -u origin main
```

### 2. Import into Vercel
1. Go to [vercel.com/new](https://vercel.com/new).
2. Connect your GitHub account and import this repository.
3. Vercel will automatically detect the settings:
   - **Framework Preset**: Vite
   - **Build Command**: `vite build`
   - **Output Directory**: `dist`
4. In **Environment Variables**, add:
   - `GEMINI_API_KEY`: Your Gemini API key from [Google AI Studio](https://aistudio.google.com/app/apikey) (Optional: users can also enter custom keys directly in the app's Settings tab).
   - `ANTHROPIC_API_KEY`: *(Optional)* Your Anthropic Claude API key.
   - `OPENAI_API_KEY`: *(Optional)* Your OpenAI API key.
5. Click **Deploy**. Your app will be live immediately!

---

## 🛠️ Features
- **📐 Layout Template Studio**: Interactive preview prototypes for Landing Pages, Analytics Dashboards, Auth flows (Login, Register, Password Reset), and Portfolios.
- **🪄 Universal Prompt Engineering Studio**:
  - **Prompt Doctor**: Upgrades rough or weak requests into master prompts with structured roles, tasks, schemas, and guardrails.
  - **Canva & Visual Assets**: Creates camera, lighting, and aspect-ratio-tuned prompts for Canva, Midjourney, and DALL-E.
  - **Claude & GPT System Prompts**: Full XML delimiters (`<context>`, `<rules>`) and persona definitions.
  - **Code & Architecture Prompts**: Strict TypeScript, defensive error handling, and clean code formulas.
  - **Interactive Variable Form**: Fill in `{{variables}}` live and see rendered prompts update in real time.
  - **Live Terminal Execution**: Test-run prompts immediately against Gemini, Claude, or OpenAI.
- **⚙️ Multi-Engine Settings**: Connect and test keys for Google Gemini, Anthropic Claude, and OpenAI with latency pings.

---

## 💻 Local Development
```bash
# Install dependencies
npm install

# Start local full-stack development server
npm run dev
```
The app runs at `http://localhost:3000`.
