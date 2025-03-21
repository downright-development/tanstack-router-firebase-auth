import { createFileRoute, redirect, useRouter } from '@tanstack/react-router';
import {
  GithubAuthProvider,
  GoogleAuthProvider,
  OAuthProvider,
} from 'firebase/auth';
import { siApple, siGithub, siGoogle } from 'simple-icons';
import { z } from 'zod';
import { useAuth } from '../../providers/auth-context-provider';

const fallback = '/dashboard' as const;

export const Route = createFileRoute('/(public)/login')({
  validateSearch: z.object({
    redirect: z.string().optional().catch(''),
  }),
  beforeLoad: ({ context, search }) => {
    if (context.user) {
      throw redirect({ to: search.redirect || fallback });
    }
  },
  component: LoginComponent,
});

function LoginComponent() {
  const router = useRouter();
  const { signIn } = useAuth();

  const handleSignIn = async (provider: 'github' | 'apple' | 'google') => {
    console.log(`Clicked ${provider} sign in!`);
    try {
      const providers = {
        google: new GoogleAuthProvider(),
        github: new GithubAuthProvider(),
        apple: new OAuthProvider('apple'),
      };

      const typedProvider =
        providers[provider] ??
        (() => {
          throw new Error('Invalid provider');
        })();

      await signIn(typedProvider);
      router.invalidate(); // This should force the user to route to /dashboard
      // router.navigate({ to: "/dashboard" });
    } catch (error) {
      console.error('Sign in error:', error);
    }
  };

  return (
    <div className="">
      <div className="w-full max-w-md px-4 animate-fade-up relative z-10">
        <div className="w-full backdrop-blur-sm bg-card/80 p-8 space-y-8 shadow-md border border-border">
          <div className="space-y-4">
            <button
              className="w-full h-12 font-medium bg-background hover:bg-secondary border-2 transition-all hover:scale-[1.02]"
              onClick={() => handleSignIn('github')}
            >
              <div className="flex items-center justify-center w-full">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  className="mr-2 h-5 w-5"
                  fill="currentColor"
                  aria-labelledby="githubIconTitle"
                  role="img"
                  style={{ minWidth: '20px' }}
                >
                  <title id="githubIconTitle">GitHub Logo</title>
                  <path d={siGithub.path} />
                </svg>
                <span>Continue with GitHub</span>
              </div>
            </button>
          </div>

          <div className="text-center text-sm text-muted-foreground">
            By continuing, you agree to our{' '}
            <a
              href="#"
              className="underline underline-offset-4 hover:text-primary transition-colors"
            >
              Terms of Service
            </a>{' '}
            and{' '}
            <a
              href="#"
              className="underline underline-offset-4 hover:text-primary transition-colors"
            >
              Privacy Policy
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
