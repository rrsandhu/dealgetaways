import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { auth } from "@clerk/nextjs/server";
import { BookmarkCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export const metadata: Metadata = { title: "Saved Searches" };

export default async function SavedSearchesPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Saved Searches</h1>
          <p className="text-gray-500">Quickly re-run your favourite searches</p>
        </div>

        <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-16 text-center">
          <BookmarkCheck className="mx-auto h-10 w-10 text-gray-300 mb-3" />
          <h2 className="text-lg font-semibold text-gray-700">No saved searches yet</h2>
          <p className="mt-1 text-sm text-gray-500">
            Run a search and save it to quickly revisit later.
          </p>
          <Link href="/search" className="mt-5 inline-block">
            <Button className="bg-blue-700 hover:bg-blue-800">Start searching</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
