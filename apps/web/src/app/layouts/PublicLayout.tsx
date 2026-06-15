import PublicHeader from '@/shared/components/PublicHeader'

export function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
      <PublicHeader />
      <div className="flex w-full max-w-md flex-col gap-3">
        {/* <img
          src="/segob-inm.webp"
          alt="Apex Rivals Logo"
          className="self-center"
        /> */}

        {children}
      </div>
    </div>
    // <div className="relative min-h-svh">
    //   <PublicHeader />

    //   <div className="flex h-screen  flex-col items-center justify-center gap-6 p-6 md:p-10">
    //     <section className="flex w-full max-w-md flex-col gap-3">
    //       {children}
    //     </section>
    //   </div>
    // </div>
  )
}
