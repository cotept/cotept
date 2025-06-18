//멘토 카드 클릭 시 멘토 정보 표시 함수

export function processMentorList(mentors: any[]) {
  // 예시: 이름순 정렬
  return mentors.slice().sort((a, b) => a.name.localeCompare(b.name));
}