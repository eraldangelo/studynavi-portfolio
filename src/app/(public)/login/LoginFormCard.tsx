'use client';

import Image from 'next/image';
import { Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/forms/button';
import { Input } from '@/components/ui/forms/input';
import { Label } from '@/components/ui/forms/label';

type LoginFormCardProps = {
  email: string;
  password: string;
  showPassword: boolean;
  signingIn: boolean;
  error: string;
  isSsoSigningIn: boolean;
  hasTurnstileKey: boolean;
  turnstileClientError: string | null;
  canSubmit: boolean;
  turnstileContainerRef: React.RefObject<HTMLDivElement>;
  onEmailChange: (value: string) => void;
  onPasswordChange: (value: string) => void;
  onTogglePassword: () => void;
  onSubmit: (e: React.FormEvent) => Promise<void>;
};

export function LoginFormCard(props: LoginFormCardProps) {
  const {
    email,
    password,
    showPassword,
    signingIn,
    error,
    isSsoSigningIn,
    hasTurnstileKey,
    turnstileClientError,
    canSubmit,
    turnstileContainerRef,
    onEmailChange,
    onPasswordChange,
    onTogglePassword,
    onSubmit,
  } = props;

  return (
    <div className="grid w-full max-w-4xl grid-cols-1 items-center gap-8 md:grid-cols-2">
      <div className="relative h-48 w-full md:h-96">
        <Image
          src="https://firebasestorage.googleapis.com/v0/b/studio-3466606038-537d1.firebasestorage.app/o/StudyNavi.png?alt=media&token=0d4030b0-09e3-4c31-8674-90607eb0af70"
          alt="StudyNavi branding"
          fill
          className="object-contain"
          sizes="(max-width: 768px) 100vw, 50vw"
          priority
        />
      </div>

      <div className="mx-auto w-full max-w-sm rounded-lg border bg-card p-8 shadow-sm">
        <div className="text-center">
          <h1 className="mb-2 text-2xl font-bold">
            <span style={{ color: '#004097' }}>Study</span>
            <span style={{ color: '#eab308' }}>Navi</span>
          </h1>
          <p className="mb-6 text-muted-foreground">Please sign in to continue</p>
        </div>

        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="example@example.com"
              required
              value={email}
              onChange={(e) => onEmailChange(e.target.value)}
              disabled={signingIn}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => onPasswordChange(e.target.value)}
                disabled={signingIn}
                className="pr-10"
              />
              <button
                type="button"
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-2 text-muted-foreground hover:text-foreground disabled:opacity-50"
                onClick={onTogglePassword}
                onMouseDown={(e) => e.preventDefault()}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                disabled={signingIn}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {error && <p className="text-sm text-red-500">{error}</p>}
          {isSsoSigningIn && (
            <p className="text-sm text-muted-foreground">Signing you in from Pathfinder...</p>
          )}

          <div className="space-y-2">
            <div className="flex justify-center">
              {hasTurnstileKey ? (
                <div ref={turnstileContainerRef} />
              ) : (
                <p className="text-sm text-red-500">Turnstile site key is missing or invalid.</p>
              )}
            </div>
            {turnstileClientError ? (
              <p className="text-sm text-red-500 text-center">{turnstileClientError}</p>
            ) : null}
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={signingIn || isSsoSigningIn || !canSubmit}
          >
            {signingIn ? 'Signing in...' : 'Sign In'}
          </Button>
        </form>
      </div>
    </div>
  );
}
