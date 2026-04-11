# LinguaFlow AI — Multimodal Translation Platform

![React](https://img.shields.io/badge/Frontend-React%20%7C%20Vite-blue)
![Tailwind](https://img.shields.io/badge/Styling-Tailwind%20CSS-06B6D4)
![AI](https://img.shields.io/badge/AI-HuggingFace%20%7C%20RAG-yellow)
![Deploy](https://img.shields.io/badge/Deploy-Vercel-black)

LinguaFlow AI is an intelligent **multimodal translation platform** designed to enable seamless communication across languages using modern AI technologies.

The platform supports **text translation, voice translation, camera-based OCR translation, and document translation**, allowing users to translate information in multiple formats through a single interface.

This project demonstrates how AI services can be integrated into a **real-world SaaS-style application** using a modern web architecture.

---

## Project Inspiration

While designing LinguaFlow AI, I wanted the platform to simulate real-world situations where translation is needed instantly.

One feature I intentionally added was **camera-based OCR translation**. The idea came from the common challenges tourists face when visiting countries where they cannot understand local signs, restaurant menus, transportation notices, or public information boards.

By allowing users to capture text through the camera and translate it with a single click, the platform mimics how travelers might quickly interpret their surroundings.

This idea was included to demonstrate how AI-powered translation tools can be designed with **real human use cases in mind**, particularly for travelers navigating unfamiliar environments.

---

## Live Demo

🌐 **Live Application:**  
https://linguaflow-ai-translator-fwbg.vercel.app/

Frontend deployed on **:contentReference[oaicite:0]{index=0}**  
Backend API powered by **:contentReference[oaicite:1]{index=1}** models.
---

## Key Features

### Text Translation

Translate typed text between languages using AI-powered translation models.

### Voice Translation

Convert spoken language into text and instantly translate it to the target language.

### Camera Translation

Upload or capture images containing text and extract the content using OCR before translating it.

### Document Translation

Upload documents and automatically translate their contents.

### Interactive Web Interface

Users can easily switch between translation modes including text, voice, camera, and document translation.

---

## Tech Stack

### Frontend

HTML
CSS
JavaScript

### Backend

Node.js
Express.js

### AI / Machine Learning

Hugging Face Inference API

### Deployment

Frontend hosted on Vercel
Backend hosted on Render

---
## Project Structure

```
linguaflow-ai-translator
│
├── src
│   ├── components/      # UI Components (Nav, Toast)
│   ├── hooks/           # useTranslate custom hook
│   ├── pages/           # Multimodal pages (Camera, Voice, etc.)
│   ├── styles/          # Global CSS & Tailwind
│   ├── App.jsx          # Main Logic & Routing
│   └── main.jsx         # Entry point
│
├── public/              # Static assets
├── index.html           # Vite root file
├── package.json         # Dependencies & Scripts
└── vite.config.js       # Vite configuration
```

## System Architecture

User
↓
Frontend Interface (Vercel)
↓
Backend API (Node.js / Express)
↓
Hugging Face AI Models
↓
Translation Response
↓
Frontend Display

---

## Running the Project Locally

1. **Clone the repository**
   ```bash
   git clone [https://github.com/ndia4343/linguaflow-ai-translator.git](https://github.com/ndia4343/linguaflow-ai-translator.git)
   cd linguaflow-ai-translator

2. Install dependencies
   npm install

3. Start Development Server
   npm run dev
---

## Deployment

### Frontend Deployment

The frontend is deployed on Vercel for fast global delivery.

### Backend Deployment

The backend API is deployed on Render to handle translation requests and communicate with Hugging Face models.

---

## Future Improvements

Potential improvements include:

Real-time streaming voice translation
Mobile application version
Multi-language speech synthesis
Advanced document parsing
Implementing AI-driven insights to categorize user translation trends using K-Means clustering.
User authentication and account system

---

## Author

Developed by **Nadia Shabbir** as an AI-powered translation platform demonstrating multimodal language processing using modern web technologies and machine learning APIs.

GitHub Profile:  
https://github.com/ndia4343

---

⭐ If you like this project, consider giving it a star on GitHub.
