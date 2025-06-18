'use client'

import { useQuery } from "@tanstack/react-query";
import { getMentors } from "@/features/mentoring/apis/getMentors";
import { useMentorStore } from "@/features/mentoring/store/useMentorStore";
import { useMemo, useEffect } from "react";
import { processMentorList } from "@/features/mentoring/service/handleMentorCard";

export function useMentors() {
  const { data, isLoading, error } = useQuery({ queryKey: ["mentors"], queryFn: getMentors });

  // 비즈니스 로직 적용 (예: 정렬, 필터 등)
  const processedMentors = useMemo(
    () => (data ? processMentorList(data) : []),
    [data]
  );

  // 전역 상태에 저장 (옵션)
  const setMentors = useMentorStore((state) => state.setMentors);
  useEffect(() => {
    if (data) setMentors(data);
  }, [data, setMentors]);

  return { mentors: processedMentors, isLoading, error };
} 