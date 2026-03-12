import Link from "next/link";
import type { Metadata } from "next";
import { Crown, UserPlus } from "lucide-react";

export const metadata: Metadata = { title: "Create Account — DealGetaways" };

export default function SignUpPage() {
  return (
    <div className="flex min-h-[calc(100vh-64px)] items-center justify-center bg-gray-50 py-12 px-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-700">
            <UserPlus className="h-7 w-7 text-white" />
          </div>
          <h1 className="text-2xl font-black text-gray-900">
            Join <span className="text-blue-700">DealGetaways</span>
          </h1>
          <p className="mt-2 text-sm text-gray-500">
            Get alerts and unlock deals for your favourite Canadian cities
          </p>
        </div>

        {/* Coming soon card */}
        <div className="rounded-2xl border border-blue-100 bg-white p-8 shadow-sm text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-amber-50">
            <Crown className="h-6 w-6 text-amber-500" />
          </div>
          <h2 className="text-lg font-bold text-gray-900">Coming Soon</h2>
          <p className="mt-2 text-sm text-gray-500 leading-relaxed">
            Member accounts are launching shortly. Subscribe to our newsletter
            to be notified when sign-ups open.
          </p>
          <div className="mt-6 space-y-3">
            <Link
              href="/#newsletter"
              className="flex items-center justify-center rounded-xl bg-blue-700 px-6 py-2.5 text-sm font-semibold text-white hover:bg-blue-800 transition-colors"
            >
              Get Notified
            </Link>
            <Link
              href="/"
              className="flex items-center justify-center rounded-xl border border-gray-200 px-6 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Back to Home
            </Link>
          </div>
        </div>

        <p className="mt-4 text-center text-xs text-gray-400">
          Already have an account?{" "}
          <Link href="/sign-in" className="text-blue-600 hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
