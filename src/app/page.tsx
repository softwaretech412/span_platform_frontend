import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-8">
      <h1 className="text-3xl font-bold mb-4">Span28</h1>
      <p className="text-gray-600 mb-8">Australian outdoor structure configurator</p>
      <Link
        href="/configurator"
        className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
      >
        Start Configurator
      </Link>
      <Link
        href="/admin"
        className="mt-4 text-sm text-gray-500 hover:text-gray-700"
      >
        Admin
      </Link>
    </main>
  );
}
