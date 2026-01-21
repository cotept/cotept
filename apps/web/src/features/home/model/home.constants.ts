import { SlideData } from './home.types';

export const IMAGE_BADGE_STRIP = "https://lh3.googleusercontent.com/aida-public/AB6AXuDOpyzCCQ1KCCgiaFhu6wAlVmcV0qMb9j3dYomZJvqkb572XfHHT_b5DtDfqi-32oeZVIhSC89p4a7XpBxaby2DFVVqJ-9g_cVFmF_J-nBNb1BJzo7JEWIX-o2y4uRH_0EfSdDr2tJKrs4wTWenKigZSzgrxrWmH6tl36NE2ULzYfjHEvvBJFDeLV7dKKsSbY2UWB4Rr3hXdVIg-zPcTMckYRViIG5krsVloqxcVi-NC3c6G_9bBcjLab4ZEmh-NSYD1E6VznI1yw";

export const SLIDES: SlideData[] = [
  {
    id: 1,
    title: "실시간 코딩 테스트",
    highlight: "1:1 멘토링으로 합격률 UP",
    description: "현직 개발자와 함께하는 실전 모의 면접. 코드 리뷰부터 커리어 상담까지, 당신의 성장을 위한 최고의 멘토를 만나보세요.",
    primaryCta: "지금 멘토 찾기",
    secondaryCta: "멘토 등록하기",
    features: ["검증된 현직 멘토", "1:1 맞춤형 피드백", "실시간 코드 리뷰"],
    type: 'editor'
  },
  {
    id: 2,
    title: "업계 선배 혹은 미래의 동료들과",
    highlight: "인사이트를 나눠 보세요.",
    description: "더 빨리, 더 멀리 갈 수 있어요. 혼자 고민하지 말고 경험자와 함께 성장하세요.",
    primaryCta: "멘토 지원하기",
    secondaryCta: "멘토링 후기 보기",
    features: ["500+ 활동 중인 멘토", "98% 멘티 만족도", "24/7 언제든지 매칭"],
    type: 'insight'
  }
];
