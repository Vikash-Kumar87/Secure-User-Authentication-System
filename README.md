# Secure Login System

A complete authentication web app built with React (Vite), Tailwind CSS, and Firebase Authentication + Firestore.

## Features

- Email/password signup and login
- Email verification required before dashboard access
- Forgot password flow
- Session persistence (browser local persistence)
- Protected dashboard route
- Firestore user profile storage
- Form validation and error handling
- Loading spinner and alert messages
- Responsive modern UI

## Tech Stack

- React + Vite
- Tailwind CSS
- Firebase Authentication
- Firestore Database
- React Router

## Project Structure

- src/components/Login.jsx
- src/components/Signup.jsx
- src/components/Dashboard.jsx
- src/firebase/config.js
- src/App.jsx
- src/main.jsx

## Setup Instructions

1. Install dependencies

```bash
npm install
```

2. Configure Firebase

- Create a Firebase project at https://console.firebase.google.com/
- Enable Authentication -> Sign-in method -> Email/Password
- Enable Firestore Database
- Copy `.env.example` to `.env` and fill your Firebase values

3. Run development server

```bash
npm run dev
```

4. Build for production

```bash
npm run build
```

## Firebase Rules Guidance (Basic)

For testing only, you can start with relaxed Firestore rules, then lock down as needed.

```txt
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

## Notes

- Dashboard is accessible only for logged-in users with verified email.
- Firebase handles secure password hashing and auth token/session management.
- If email is not verified at login, user is signed out and verification email is resent.
