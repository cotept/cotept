"use client"

import { useState } from "react"

import { Button } from "@repo/shared/components/button"
import { Popover, PopoverContent, PopoverTrigger } from "@repo/shared/components/popover"
import { MENTOR_EXPERIENCE_TAGS, MENTOR_JOB_TAGS } from "@repo/shared/constants/mentor-tags"

import { ChevronDown } from "lucide-react"

// 필터 옵션 타입
type FilterOption = {
  id: string
  label: string
}

// 정렬 옵션
const SORT_OPTIONS: FilterOption[] = [
  { id: "rating", label: "평점순" },
  { id: "latest", label: "최신순" },
  { id: "review", label: "리뷰많은순" },
  { id: "price-low", label: "가격낮은순" },
  { id: "price-high", label: "가격높은순" },
]

// 직무 필터 (전체 옵션 추가)
const JOB_FILTER_OPTIONS: FilterOption[] = [{ id: "all", label: "전체" }, ...MENTOR_JOB_TAGS]

// 연차 필터 (전체 옵션 추가)
const EXPERIENCE_FILTER_OPTIONS: FilterOption[] = [{ id: "all", label: "전체" }, ...MENTOR_EXPERIENCE_TAGS]

export function HomeFilters() {
  // 큰 필터 상태
  const [selectedJob, setSelectedJob] = useState("all")
  const [selectedExperience, setSelectedExperience] = useState("all")
  const [selectedSort, setSelectedSort] = useState("rating")

  return (
    <div className="border-border bg-background/80 sticky top-16 z-40 border-b py-4 backdrop-blur">
      {/* <div className="container"> */}
      <div className="mx-auto max-w-7xl">
        {/* 큰 필터 섹션 */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* 좌측: 주요 필터 그룹 */}
          <div className="flex flex-wrap items-center gap-2">
            {/* 직무 필터 */}
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size="default" className="min-w-[100px] justify-between rounded-lg">
                  <span className="text-foreground font-medium">
                    직무 · {JOB_FILTER_OPTIONS.find((j) => j.id === selectedJob)?.label}
                  </span>
                  <ChevronDown className="text-muted-foreground ml-2 h-4 w-4" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-56 p-3" side="bottom" align="start" avoidCollisions={false}>
                <div className="space-y-1">
                  {JOB_FILTER_OPTIONS.map((job) => (
                    <Button
                      key={job.id}
                      variant={selectedJob === job.id ? "default" : "ghost"}
                      size="sm"
                      className="w-full justify-start"
                      onClick={() => setSelectedJob(job.id)}>
                      {job.label}
                    </Button>
                  ))}
                </div>
              </PopoverContent>
            </Popover>

            {/* 연차 필터 */}
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size="default" className="min-w-[100px] justify-between rounded-lg">
                  <span className="text-foreground font-medium">
                    연차 · {EXPERIENCE_FILTER_OPTIONS.find((e) => e.id === selectedExperience)?.label}
                  </span>
                  <ChevronDown className="text-muted-foreground ml-2 h-4 w-4" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-56 p-3" side="bottom" align="start" avoidCollisions={false}>
                <div className="space-y-1">
                  {EXPERIENCE_FILTER_OPTIONS.map((exp) => (
                    <Button
                      key={exp.id}
                      variant={selectedExperience === exp.id ? "default" : "ghost"}
                      size="sm"
                      className="w-full justify-start"
                      onClick={() => setSelectedExperience(exp.id)}>
                      {exp.label}
                    </Button>
                  ))}
                </div>
              </PopoverContent>
            </Popover>
          </div>

          {/* 우측: 정렬 */}
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="ghost" size="default" className="gap-2">
                <span className="text-foreground font-bold">
                  {SORT_OPTIONS.find((s) => s.id === selectedSort)?.label}
                </span>
                <ChevronDown className="h-4 w-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-48 p-3" side="bottom" align="end" avoidCollisions={false}>
              <div className="space-y-1">
                {SORT_OPTIONS.map((option) => (
                  <Button
                    key={option.id}
                    variant={selectedSort === option.id ? "default" : "ghost"}
                    size="sm"
                    className="w-full justify-start"
                    onClick={() => setSelectedSort(option.id)}>
                    {option.label}
                  </Button>
                ))}
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </div>
    </div>
  )
}
