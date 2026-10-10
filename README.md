<div align="center">

<img src="assets/Fitnex1.png" alt="FITNEX Logo" width="140" />

# FITNEX

### Gamified fitness companion: track, train, level up

*Track. Train. Transform.*

[![React Native](https://img.shields.io/badge/React_Native-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactnative.dev/)
[![Expo](https://img.shields.io/badge/Expo-000020?style=for-the-badge&logo=expo&logoColor=white)](https://expo.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)](https://supabase.com/)
[![Claude](https://img.shields.io/badge/AI-Claude_API-D97757?style=for-the-badge)](https://www.anthropic.com/)

[About](#-about) •
[Features](#-features) •
[Gamification](#-gamification) •
[Tech Stack](#-tech-stack) •
[Getting Started](#-getting-started) •
[Structure](#-project-structure) •
[Database](#-database-schema)

</div>

---

## 📱 About

**FITNEX** is a cross-platform mobile fitness application built with React Native and Expo. It combines **nutrition tracking, workout management, and an AI assistant** in one app, and uses **gamification** (daily goals, streaks, weekly quests, levels and challenges) to keep users motivated.

> No more switching between apps. No more guesswork. Just results.

The app was developed as part of a final thesis at the Faculty of Organizational Sciences (FON), University of Belgrade: *"Development and implementation of a mobile fitness application based on gamification."*

---

## 📸 Screenshots

<!-- Replace with real screenshots, e.g. put them in /assets/screenshots -->
| Home | Nutrition | Workout | Profile |
|:---:|:---:|:---:|:---:|
| *coming soon* | *coming soon* | *coming soon* | *coming soon* |

---

## ✨ Features

### 🏠 Home
- Daily progress **rings** (calories, workouts, steps) that update as you log activity
- **Weekly quest** progress and current **streak** at a glance
- **Nearby gyms map** (OpenStreetMap) based on your location
- Curated **morning routines** (diet and cooking cards)

### 🥗 Nutrition
- Browse **food categories** and search the food database
- **Barcode scanner** for quick logging
- Log meals and track daily calorie intake against your goal
- Adjustable daily calorie goal with an interactive slider

### 🏋️ Workouts
- Workout catalog with detailed exercise pages
- Log workouts with **sets and reps**
- Weekly overview of completed sessions

### 📊 Progress
- **Fitnex Score**, a weekly score based on calories, workouts and steps
- Stats and history of your activity over time

### 🤖 AI Assistant
- Chat with an AI fitness assistant powered by the Anthropic Claude API for personalized advice

### 👤 Profile and onboarding
- Guided profile setup (age, gender, weight, height, goal, activity level) with **manual number entry** or quick +/- adjustment
- Profile data is shown immediately across the app after setup
- Avatar upload from camera or gallery
- Daily reminders through **smart notifications**
- Step counter using the device pedometer

---

## 🎮 Gamification

Gamification is the core idea of the app. Elements used to drive engagement:

| Element | How it works |
|---|---|
| 🎯 **Daily goals** | Calories, workouts and steps shown as progress rings |
| 🔥 **Streaks** | Consecutive days of meeting your daily goals |
| 🗓️ **Weekly quest** | A weekly target that fills as you log meals and activity |
| ⭐ **Points and levels** | Actions such as logging a meal earn points; collecting enough raises your level |
| 🏆 **Challenges** | Time-limited goals with rewards |
| 🎉 **Instant feedback** | Confetti and a level-up modal celebrate achievements |
| 📈 **Fitnex Score** | A weekly score summarising your consistency |

Game logic lives in `GamificationProvider` (context) together with `constants/gamification.ts` and `constants/challenges.ts`.

---

## 🏗️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React Native + Expo (TSX) |
| Navigation | Expo Router (file-based) |
| Language | TypeScript |
| State management | React Context API (Profile, Gamification) |
| Backend | Supabase (PostgreSQL) |
| Authentication | Supabase Auth (JWT) |
| Storage | Supabase Storage (avatars) |
| Maps and location | react-native-maps + OpenStreetMap, expo-location |
| Sensors | expo-sensors (Pedometer) |
| Camera | expo-camera, expo-image-picker |
| Notifications | expo-notifications |
| AI | Anthropic Claude API |

---

## 📂 Project Structure

```
rmas-fitnex_2022_0387/
├── app/
│   ├── (auth)/                 # Auth flow
│   │   ├── login.tsx
│   │   ├── register.tsx
│   │   ├── onboarding.tsx
│   │   └── setup-profile.tsx
│   ├── (tabs)/                 # Main tabs
│   │   ├── index.tsx           # Home (rings, quest, map, routines)
│   │   ├── nutrition.tsx       # Nutrition tracking
│   │   ├── workout.tsx         # Workout management
│   │   ├── progress.tsx        # Progress and stats
│   │   └── profile.tsx         # Profile and score
│   ├── ai-chat.tsx             # AI assistant
│   ├── challenges.tsx          # Challenges
│   ├── choose-meal.tsx         # Meal logging
│   ├── search-food.tsx         # Food search
│   ├── scan-barcode.tsx        # Barcode scanner
│   ├── food-detail.tsx         # Food details
│   └── workout-detail.tsx      # Workout details
├── components/                 # Reusable UI (home, shared, ui,
│                               #   ConfettiOverlay, LevelUpModal,
│                               #   FoodCategoryBrowser)
├── constants/                  # Colors, typography, spacing,
│                               #   gamification, challenges, routines,
│                               #   foodCategories
├── context/                    # Profile and Gamification providers
├── hooks/                      # useAuth, useLocation
├── services/                   # Supabase, API, notifications
└── assets/                     # Images and icons
```

---

## 🗄️ Database Schema

| Table | Purpose |
|---|---|
| `profiles` | User data: name, age, gender, weight, height, goal, activity level, calorie goal, avatar |
| `daily_scores` | Daily goals progress and Fitnex Score per user |
| `meals` | Meals logged by the user |
| `meals_catalog` | Food database |
| `nutrition_logs` | Daily food intake logs |
| `workouts` | Workout sessions |
| `workout_exercises` | Exercises within workouts |
| `workouts_catalog` | Available workout templates |
| `ai_conversations` | AI chat history |

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- [Expo Go](https://expo.dev/go) on your phone (or an Android/iOS emulator)
- A [Supabase](https://supabase.com/) project
- Google Maps API key
- Anthropic API key (for the AI assistant)

### Installation

```bash
# Clone the repository
git clone https://github.com/elab-development/rmas-fitnex_2022_0387.git
cd rmas-fitnex_2022_0387

# Install dependencies
npm install
```

### Environment setup

Create a `.env` file in the project root:

```env
EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
EXPO_PUBLIC_GOOGLE_MAPS_KEY=your_google_maps_key
```

> Keep the Anthropic API key out of the client bundle. Call the AI API from a backend or a Supabase Edge Function rather than shipping the key in the app.

### Run the app

```bash
npx expo start
```

Scan the QR code with **Expo Go** on your Android or iOS device.

---

## 🔐 Security

- API keys are stored in `.env` and never committed to git
- Supabase Row Level Security (RLS) is enabled on all tables
- JWT authentication for all API requests
- Users can only access their own data

---

## 🗺️ Roadmap

- [ ] Target weight and goal progress tracking
- [ ] More badges and achievements
- [ ] Social features (friends, leaderboards)
- [ ] Wearable integrations

---

## 👩‍💻 Author

<table>
  <tr>
    <td align="center">
      <a href="https://github.com/TijanaSikanja">
        <b>Tijana Šikanja</b>
      </a>
      <br />
      <sub>FON, Information Systems and Technologies</sub>
    </td>
  </tr>
</table>

---

<div align="center">

Made with ❤️ and lots of ☕

*FITNEX - Because every rep counts.*

</div>