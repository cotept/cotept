import React from "react"

const GlobalContainer = ({ children }: { children: React.ReactNode }) => {
  return (
    <main className="flex min-h-screen flex-col">
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute left-0 top-0 -z-10 opacity-10">
          <div className="bg-primary h-[400px] w-[400px] -translate-x-1/2 -translate-y-1/2 rounded-full blur-[100px]"></div>
        </div>
        <div className="pointer-events-none absolute bottom-0 right-0 -z-10 opacity-10">
          <div className="bg-primary h-[400px] w-[400px] translate-x-1/2 translate-y-1/2 rounded-full blur-[100px]"></div>
        </div>
        {children}
      </section>
    </main>
  )
}

export default GlobalContainer
