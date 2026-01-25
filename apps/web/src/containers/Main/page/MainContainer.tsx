import React from "react"

import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@repo/shared/components/pagination"

import { HomeCarousel } from "@/features/home/ui/HomeCarousel"
import { HomeFeatureSlide } from "@/features/home/ui/HomeFeatureSlide"
import { HomeFilters } from "@/features/home/ui/HomeFilters"
import { HomeHeroSlide } from "@/features/home/ui/HomeHeroSlide"
import { MOCK_MENTORS } from "@/features/mentor/model/mock-data"
import { MentorCard } from "@/features/mentor/ui/MentorCard"
import { GlobalFooter } from "@/shared/ui/layout/GlobalFooter"
import { GlobalHeader } from "@/shared/ui/layout/GlobalHeader"

const MainContainer = () => {
  return (
    <main className="bg-background text-foreground selection:bg-primary/30 flex min-h-screen flex-col font-sans">
      <GlobalHeader />

      <section className="mx-auto w-full max-w-7xl grow px-4 py-8 sm:px-6 lg:px-8">
        <HomeCarousel>
          <HomeHeroSlide />
          <HomeFeatureSlide />
        </HomeCarousel>

        <HomeFilters />

        {/* Mentor Grid */}
        <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {MOCK_MENTORS.map((mentor) => (
            <MentorCard key={mentor.id} mentor={mentor} />
          ))}
        </div>

        {/* Pagination */}
        <Pagination className="mt-16">
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious href="#" text="이전" />
            </PaginationItem>

            {[1, 2, 3, 4, 5].map((page) => (
              <PaginationItem key={page}>
                <PaginationLink href={`#page-${page}`} isActive={page === 1}>
                  {page}
                </PaginationLink>
              </PaginationItem>
            ))}

            <PaginationItem>
              <PaginationEllipsis />
            </PaginationItem>

            <PaginationItem>
              <PaginationLink href="#page-10">10</PaginationLink>
            </PaginationItem>

            <PaginationItem>
              <PaginationNext href="#" text="다음" />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </section>

      <GlobalFooter />
    </main>
  )
}

export default MainContainer
