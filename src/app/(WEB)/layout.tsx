import { Navbar } from "@/components/Navbar";

export default function RootLayout({
  children,
  modal
}: Readonly<{
  children: React.ReactNode;
  modal: React.ReactNode;
}>) {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 bg-gradient-to-b from-gray-50 to-white">
        {children}
        {modal}
      </main>
      <footer className="bg-gray-800 text-white py-8">
        <div className="container mx-auto px-4 text-center">
          <p>&copy; 2024 杯村. 保留所有权利。</p>
        </div>
      </footer>
    </div>
  )
}