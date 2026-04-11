# LinguaFlow AI — Multimodal Translation Platform

![Node.js](https://img.shields.io/badge/Backend-Node.js-green)
![Frontend](https://img.shields.io/badge/Frontend-HTML%20CSS%20JS-blue)
![AI](https://img.shields.io/badge/AI-HuggingFace-yellow)
![Deploy](https://img.shields.io/badge/Deploy-Vercel%20%7C%20Render-purple)

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

Frontend deployed on Vercel
Backend API powered by Hugging Face models

Example deployment:

https://linguaflow-ai.vercel.app

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

LinguaFlow-AI-Translator

frontend
index.html — main user interface
translator.js — text translation logic
voice.js — speech recognition logic
camera.js — OCR image translation
document.js — document upload handling
app.js — UI navigation logic

backend
server.js — backend API server
package.json — backend dependencies

README.md

---

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

Clone the repository

git clone https://github.com/yourusername/LinguaFlow-AI-Translator.git

Navigate to the backend folder

cd backend

Install dependencies

npm install

Run the backend server

node server.js

Open the frontend interface by launching the file:

frontend/index.html

in your browser.

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
Translation history
User authentication and account system

---

## Author

Developed as an AI-powered translation platform demonstrating **multimodal language processing** using modern web technologies and machine learning APIs.

---

⭐ If you like this project, consider giving it a star on GitHub.
