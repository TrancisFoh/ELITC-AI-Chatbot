# ELITC AI Chatbot

An intelligent training consultant chatbot and comprehensive admin portal built for the **Electronics Industries Training Centre (ELITC)**. 

## Features
- **AI Chat Assistant:** Powered by Google's Gemini API, providing precise, context-aware course recommendations and consultative support.
- **Dynamic Admin Dashboard:** A fully featured management portal for monitoring system health, managing courses, reviewing chat logs, and configuring the AI.
- **Secure Authentication:** Identity-based login with Passkey support and Two-Factor Authentication (2FA) for administrators.

## Tech Stack
- **Framework:** .NET 9, Blazor
- **Styling:** Tailwind CSS, Lucide Icons
- **Database:** Entity Framework Core
- **AI Integration:** Google Gemini API

## Prerequisites
- [.NET SDK](https://dotnet.microsoft.com/download)
- An active [Google Gemini API Key](https://aistudio.google.com/)

## Getting Started

1. **Clone the repository:**
   ```bash
   git clone https://github.com/TrancisFoh/ELITC-AI-Chatbot.git
   cd ELITC-AI-Chatbot/src/ELITC-AI-Chatbot
   ```

2. **Configure the application:**
   Make sure your `appsettings.json` is configured with your database connection strings and that your Gemini API key is properly set up in the Admin portal or configuration.

3. **Apply Database Migrations:**
   ```bash
   dotnet ef database update
   ```

4. **Run the Application:**
   ```bash
   dotnet watch
   ```
   *The application will start, and hot reload will be enabled for development.*
