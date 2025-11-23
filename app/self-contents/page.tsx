import { Header } from "../components/Header";

export default function SelfContentsPage() {
  return (
    <div className="min-h-screen bg-gray-100">
    <Header variant="solid" textVariant="dark" />
      <main className="pt-20">
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          {/* Replace with your content */}
          <div className="px-4 py-6 sm:px-0">
            <div className="border-4 border-dashed border-gray-200 rounded-lg h-96 flex items-center justify-center">
              <span className="text-gray-400">Your self contents go here.</span>
            </div>
          </div>
          {/* /End replace */}
        </div>
      </main>
    </div>
  )
}   