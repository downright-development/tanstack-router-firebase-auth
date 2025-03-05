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
import { create } from 'zustand'
import { auth, githubProvider } from '../lib/firebase'
import { User, signInWithPopup, signOut } from 'firebase/auth'

interface AuthState {
  user: User | null
  loading: boolean
  error: string | null
  signInWithGithub: () => Promise<void>
  signOutUser: () => Promise<void>
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  loading: true,
  error: null,
  
  signInWithGithub: async () => {
    try {
      set({ loading: true, error: null })
      await signInWithPopup(auth, githubProvider)
    } catch (error) {
      set({ error: (error as Error).message })
    } finally {
      set({ loading: false })
    }
  },
  
  signOutUser: async () => {
    try {
      set({ loading: true, error: null })
      await signOut(auth)
      set({ user: null })
    } catch (error) {
      set({ error: (error as Error).message })
    } finally {
      set({ loading: false })
    }
  }
}))

// Initialize auth state listener
auth.onAuthStateChanged((user) => {
  useAuthStore.setState({ user, loading: false })
})
```

## TanStack Router Configuration

The application uses TanStack Router for type-safe routing. The routes are organized in a modular structure with separate files for different route groups:

- `src/routes/index.tsx` - Main routes index
- `src/routes/root.tsx` - Root route definition
- `src/routes/_auth.tsx` - Authentication routes
- `src/routes/(public)/*` - Publicly accessible routes

Example route configuration:

```typescript
import { Router, Route, RootRoute } from '@tanstack/react-router'
import { HomePage } from '../pages/Home'
import { LoginPage } from '../pages/Login'
import { DashboardPage } from '../pages/Dashboard'
import { ProfilePage } from '../pages/Profile'
import { ProtectedRoute } from '../components/ProtectedRoute'

// Define root route
const rootRoute = new RootRoute()

// Public routes
const homeRoute = new Route({
  getParentRoute: () => rootRoute,
  path: '/',
  component: HomePage,
})

const loginRoute = new Route({
  getParentRoute: () => rootRoute,
  path: '/login',
  component: LoginPage,
})

// Protected routes
const dashboardRoute = new Route({
  getParentRoute: () => rootRoute,
  path: '/dashboard',
  component: () => (
    <ProtectedRoute>
      <DashboardPage />
    </ProtectedRoute>
  ),
})

const profileRoute = new Route({
  getParentRoute: () => rootRoute,
  path: '/profile',
  component: () => (
    <ProtectedRoute>
      <ProfilePage />
    </ProtectedRoute>
  ),
})

// Create the router with all routes
const routeTree = rootRoute.addChildren([
  homeRoute,
  loginRoute,
  dashboardRoute,
  profileRoute,
])

export const router = new Router({ routeTree })
```

## Protected Routes

The application implements route protection with a `ProtectedRoute` component:

```typescript
import { Navigate } from '@tanstack/react-router'
import { useAuthStore } from '../stores/use-auth-store'

interface ProtectedRouteProps {
  children: React.ReactNode
}

export const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { user, loading } = useAuthStore()

  if (loading) {
    return <div>Loading...</div>
  }

  if (!user) {
    return <Navigate to="/login" />
  }

  return <>{children}</>
}
```

In the actual project, this protection logic may be implemented directly in the route definitions or through the auth context provider.

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
export const githubProvider = new GithubAuthProvider()
```

## Common Issues & Troubleshooting

### Authentication Issues

- **GitHub OAuth not working**: Ensure your GitHub OAuth app has the correct callback URL
- **Redirect errors**: Check that your Firebase Auth domain matches your environment setup
- **CORS errors**: Ensure your Firebase project has the correct domains listed in the authorized domains

### Environment Variables

- If you get initialization errors, make sure all environment variables are correctly set in `.env.local`
- Double-check that you're using the correct prefix (`VITE_`) for all environment variables

### TanStack Router Issues

- If you experience routing issues, ensure you've properly wrapped your application with the router provider
- Check that all routes are correctly defined and imported

## Deployment

### Firebase Hosting

1. Install Firebase CLI:
```bash
npm install -g firebase-tools
```

2. Login to Firebase:
```bash
firebase login
```

3. Initialize Firebase Hosting:
```bash
firebase init hosting
```

4. Build your project:
```bash
npm run build
```

5. Deploy to Firebase:
```bash
firebase deploy
```

### Other Hosting Options

You can also deploy this application to platforms like Vercel, Netlify, or GitHub Pages. Make sure to:

1. Add your environment variables in the platform's settings
2. Configure the build command (`npm run build`)
3. Set the publish directory (`dist`)

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.