# TanStack Router + Zustand + Firebase Auth

> **Note:** This is a crude example that is not mobile-friendly and is intended for demonstration purposes only.

This project demonstrates a modern React application using TanStack Router for navigation, Zustand for state management, and Firebase Authentication with GitHub OAuth.

## Features

- 🔐 **Authentication** - Complete GitHub OAuth flow using Firebase Auth
- 🧩 **State Management** - Clean and efficient state management with Zustand
- 🧭 **Routing** - Type-safe routing with TanStack Router
- 🔄 **Persistence** - Auth state persistence between sessions
- 🛡️ **Protected Routes** - Route protection based on authentication status
- 🔄 **Loading States** - Proper loading states during authentication

## Tech Stack

- [React](https://reactjs.org/) - UI library
- [TanStack Router](https://tanstack.com/router) - Type-safe routing
- [Zustand](https://zustand-demo.pmnd.rs/) - State management
- [Firebase](https://firebase.google.com/) - Authentication and backend services
- [TypeScript](https://www.typescriptlang.org/) - Type safety
- [Vite](https://vitejs.dev/) - Build tool

## Prerequisites

Before you begin, ensure you have:

- Node.js 16+ installed
- A Firebase project created
- GitHub OAuth set up in your Firebase project

## Getting Started

### 1. Firebase Setup

1. Create a [Firebase project](https://console.firebase.google.com/)
2. Enable Authentication in the Firebase console
3. Add GitHub as an authentication provider:
   - Go to **Authentication** > **Sign-in method** > **GitHub**
   - Enable GitHub authentication
   - You'll need to set up OAuth in your GitHub account:
     - Go to [GitHub Developer Settings](https://github.com/settings/developers)
     - Create a new OAuth app
     - Set the homepage URL to your local or production URL
     - Set the callback URL to: `https://your-firebase-project-id.firebaseapp.com/__/auth/handler`
     - Copy the Client ID and Client Secret
   - Return to Firebase console and paste the GitHub Client ID and Client Secret
   - Save the changes

4. Create a web app in your Firebase project:
   - Go to **Project Overview** > **Add app** > **Web**
   - Register the app with a nickname
   - Copy the Firebase configuration object for later use

### 2. Installation

1. Clone the repository:
```bash
git clone https://github.com/your-username/tanstack-router-firebase-auth.git
cd tanstack-router-firebase-auth
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env.local` file in the root directory and add your Firebase credentials:
```
VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your-messaging-sender-id
VITE_FIREBASE_APP_ID=your-app-id
```

Replace the values with your actual Firebase project credentials from the configuration object.

### 3. Start the Development Server

```bash
npm run dev
```

The application should now be running at `http://localhost:5173` (or another port if 5173 is occupied).

## Project Structure

This project follows a modular structure with clear separation of concerns:

```
/src
  config.ts             # Application configuration
  /providers            # Context providers
    auth-context-provider.tsx  # Authentication context provider
  /routes               # TanStack Router configuration
    /_auth              # Authentication related routes
    /(public)           # Publicly accessible routes
    root.tsx            # Root route definition
    _auth.tsx           # Auth route definition
    index.tsx           # Main routes index
  /stores               # Zustand stores
    use-auth-store.ts   # Authentication state management
  main.tsx              # Application entry point
  routeTree.gen.tsx     # Generated route tree
  styles.css            # Global styles
  utils.ts              # Utility functions
```

## Authentication Flow

This application implements a complete authentication flow:

1. **Initialization**: Firebase Auth is initialized on app load
2. **State Persistence**: Authentication state is maintained across sessions
3. **Sign In**: Users can sign in with their GitHub account
4. **Protected Routes**: Certain routes require authentication
5. **Sign Out**: Users can sign out, clearing their session

## Zustand Store

The application uses Zustand for state management. The main authentication store is defined in `src/stores/use-auth-store.ts`:

```typescript
import type { User } from "firebase/auth";
import { create } from "zustand";

export type AuthState = {
    isAuthenticated: boolean;
    user: User | null;
    setUser: (user: User | null) => void;
};

export const useAuthStore = create<AuthState>((set) => ({
    isAuthenticated: false,
    user: null,
    setUser: (user: User | null) => {
        console.log(
            "Auth state changed:",
            user ? `User logged in: ${user.email || user.uid}` : "User logged out",
            user
        );
        return set({
            user,
            isAuthenticated: !!user,
        });
    },
}));
```

## TanStack Router Configuration

The application uses TanStack Router for type-safe routing. The routes are organized in a modular structure with separate files for different route groups:

- `src/routes/index.tsx` - Main routes index
- `src/routes/root.tsx` - Root route definition
- `src/routes/_auth.tsx` - Authentication routes
- `src/routes/(public)/*` - Publicly accessible routes

## Firebase Configuration

Firebase is initialized in `src/config.ts`:

```typescript
import { initializeApp } from 'firebase/app'
import { getAuth, GithubAuthProvider } from 'firebase/auth'

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
}

// Initialize Firebase
const app = initializeApp(firebaseConfig)

// Initialize Firebase Auth
export const auth = getAuth(app)
```

### Environment Variables

- If you get initialization errors, make sure all environment variables are correctly set in `.env.local`
- Double-check that you're using the correct prefix (`VITE_`) for all environment variables

### TanStack Router Issues

- If you experience routing issues, ensure you've properly wrapped your application with the router provider
- Check that all routes are correctly defined and imported

## License

This project is licensed under the MIT License - see the LICENSE file for details.