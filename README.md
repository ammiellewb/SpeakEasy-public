# SpeakEasy

An AR application built for Snapchat Spectacles that enables real-time conversations with AI through speech recognition and text-to-speech functionality.

## Overview

SpeakEasy is an innovative augmented reality application designed for Snapchat Spectacles that bridges the gap between human speech and AI interaction. The application provides:

- **Real-time Speech Recognition**: Convert spoken words to text using advanced ASR (Automatic Speech Recognition)
- **AI-Powered Conversations**: Interact with AI models including Gemini and Groq for intelligent responses
- **Text-to-Speech Output**: Convert AI responses back to natural speech
- **AR Visual Interface**: Display interactive elements and responses directly in your field of view
- **Object Recognition & Labeling**: Identify and label objects in the real world through the AR interface

## Features

- 🎙️ **Voice Input**: Natural speech recognition with microphone controls
- 🤖 **AI Integration**: Support for multiple AI APIs (Gemini, Groq)
- 🔊 **Speech Output**: Text-to-speech conversion for AI responses
- 👁️ **AR Visualization**: Real-time object detection and labeling
- 🎮 **Interactive UI**: Touch and gesture-based controls
- 👀 **Spectacles Optimized**: Built specifically for Snapchat Spectacles hardware

## Technology Stack

- **Platform**: Snapchat Spectacles / Lens Studio
- **Languages**: TypeScript, JavaScript
- **APIs**: 
  - Gemini AI API
  - Groq API
  - Text-to-Speech modules
  - Speech Recognition services
- **Frameworks**: Spectacles Interaction Kit

## Project Structure

```
Assets/
├── Scripts/           # Core application logic
├── Materials/         # AR materials and shaders
├── Prefabs/          # Reusable AR objects
├── Modules/          # External modules (Camera, etc.)
├── config/           # Configuration files
└── ...

config/
├── api-keys.ts       # API key configurations
└── config.example.ts # Configuration examples
```

## Setup & Configuration

1. **API Keys**: Copy `config/config.example.ts` to `config/config.ts` and add your API keys:
   ```typescript
   export const GEMINI_API_KEY = "your-gemini-api-key";
   export const GROQ_API_KEY = "your-groq-api-key";
   ```

2. **Lens Studio**: Open the project in Lens Studio for Spectacles development

3. **Device Testing**: Deploy to Snapchat Spectacles for testing

## Key Components

- **ASRController.ts**: Handles speech recognition functionality
- **GeminiAPI.ts**: Integration with Google's Gemini AI model
- **GroqAPI.ts**: Integration with Groq AI services
- **TextToSpeechController.ts**: Manages speech synthesis
- **SceneController.ts**: Main application controller
- **ObjectLabelHandler.ts**: Manages AR object labeling
- **DepthCache.ts**: Handles depth perception for AR placement

## Development

This project was developed for [Hack the North 2025](https://hackthenorth.com/) and showcases the potential of AR-powered conversational AI interfaces for accessibility.


---

*Built with ❤️ for Hack the North 2025*
