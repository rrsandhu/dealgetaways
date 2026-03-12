import type { Metadata } from "next";
export const metadata: Metadata = { title: "Sign In" };

// Clerk is temporarily disabled. Add NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY to .env.local
// and restore the Clerk <SignIn /> component to enable authentication.
export default function SignInPage() {
  return (
    <div className="flex min-h-[calc(100vh-64px)] items-center justify-center bg-gray-50 py-12 px-4">
      <div className="w-full max-w-sm rounded-2xl border border-gray-200 bg-white p-8 shadow-sm text-center">
        <h1 className="text-2xl font-bold text-gray-900">Sign In</h1>
        <p className="mt-2 text-sm text-gray-500">
          Authentication coming soon. Add your Clerk keys to enable sign in.
        </p>
        <a
          href="/"
          className="mt-6 inline-flex items-center justify-center rounded-xl bg-blue-700 px-6 py-2.5 text-sm font-semibold text-white hover:bg-blue-800"
        >
          Back to Home
        </a>
      </div>
    </div>
  );
}
