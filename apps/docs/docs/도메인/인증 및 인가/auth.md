# 회원가입 프로세스 설계 문서

## 개요

우리의 인증 시스템은 일반 회원가입과 소셜 로그인이라는 두 가지 경로를 통해 멘토와 멘티의 회원가입을 처리합니다. 이 프로세스는 강력한 보안 조치, 법적 요구사항 준수, 그리고 사용자 검증 단계를 포함합니다.

## 회원가입 프로세스

<details>
<summary>회원가입 프로세스 다이어그램</summary>

```mermaid
graph TB
    Start(회원가입 시작) --> RegisterType{가입 유형 선택}

    %% 멘티 회원가입 흐름
    RegisterType -->|멘티| MenteeTerms[약관 동의]
    MenteeTerms --> MenteePhone[전화번호 인증]
    MenteePhone --> MenteeInfo[기본 정보 입력<br/>이메일/비밀번호]
    MenteeInfo --> MenteeEmail[이메일 인증]
    MenteeEmail --> MenteeBoj[백준 ID 인증]
    MenteeBoj --> MenteeComplete[멘티 가입 완료]

    %% 멘토 회원가입 흐름
    RegisterType -->|멘토| MentorTerms[약관 동의]
    MentorTerms --> MentorPhone[전화번호 인증]
    MentorPhone --> MentorInfo[기본 정보 입력<br/>이메일/비밀번호]
    MentorInfo --> MentorEmail[이메일 인증]
    MentorEmail --> MentorBoj[백준 ID 인증]
    MentorBoj --> MentorProfile[멘토 프로필 작성<br/>직무/경력/소개]
    MentorProfile --> MentorVerification[멘토 자격 검증<br/>Solved.ac 티어 확인]
    MentorVerification --> MentorReview[관리자 검토]
    MentorReview -->|승인| MentorComplete[멘토 가입 완료]
    MentorReview -->|거절| MentorReject[멘토 신청 거절]

    style Start fill:#f9f,stroke:#333,stroke-width:2px
    style RegisterType fill:#f96,stroke:#333,stroke-width:2px
    style MenteeComplete fill:#9f9,stroke:#333,stroke-width:2px
    style MentorComplete fill:#9f9,stroke:#333,stroke-width:2px
    style MentorReject fill:#f66,stroke:#333,stroke-width:2px
```

</details>

<details>
<summary>회원가입 프로세스 다이어그램 (구)</summary>

```mermaid
graph TB
    Start["회원가입 시작"] --> AuthType{"가입 유형 선택"}

    %% 일반 회원가입 경로
    AuthType -->|"일반 회원가입"| ViewTerms["이용약관 확인"]
    ViewTerms --> AgreeTerms["필수 약관 동의"]
    AgreeTerms --> BasicInfo["기본 정보 입력"]
    BasicInfo --> ValidateEmail["이메일 검증"]
    ValidateEmail --> ValidateBoj["백준 ID 검증"]
    ValidateBoj --> PhoneVerification["휴대폰 인증"]
    PhoneVerification --> CompleteRegistration["회원가입 완료"]

    %% 소셜 로그인 경로
    AuthType -->|"소셜 로그인"| SocialAuth["소셜 인증"]
    SocialAuth --> ViewTermsSocial["이용약관 확인"]
    ViewTermsSocial --> AgreeTermsSocial["필수 약관 동의"]
    AgreeTermsSocial --> AdditionalInfo["추가 정보 입력"]
    AdditionalInfo --> ValidateBojSocial["백준 ID 검증"]
    ValidateBojSocial --> PhoneVerificationSocial["휴대폰 인증"]
    PhoneVerificationSocial --> CompleteRegistrationSocial["회원가입 완료"]

    %% 백준 검증 프로세스
    subgraph "백준 ID 검증 절차"
        ValidateBoj --> CheckTier["solved.ac 티어 확인"]
        CheckTier -->|"요구사항 충족"| Success["검증 성공"]
        CheckTier -->|"요구사항 미달"| Retry["추후 재시도 가능"]
    end

    %% 휴대폰 인증 프로세스
    subgraph "휴대폰 인증 절차"
        PhoneVerification --> SendCode["인증번호 발송"]
        SendCode --> VerifyCode["인증번호 입력"]
        VerifyCode -->|"유효한 코드"| Valid["인증 성공"]
        VerifyCode -->|"잘못된 코드"| Resend["재발송 (최대 5회)"]
        Resend --> VerifyCode
    end
```

</details>

## 회원가입 상태 관리

회원가입은 다음과 같은 상태로 진행됩니다:

1. INITIATED: 회원가입 요청 접수
2. TERMS_AGREED: 필수 약관 동의 완료
3. INFO_SUBMITTED: 기본 정보 입력 및 검증 완료
4. PHONE_VERIFIED: 휴대폰 인증 완료
5. COMPLETED: 회원가입 절차 완료

## 약관 관리 시스템

우리 시스템은 약관 동의에 대한 포괄적인 기록을 관리합니다:

1. 버전 관리

   - 각 약관 버전은 고유하게 식별됩니다
   - 감사를 위해 이전 버전들이 보존됩니다
   - 목적에 따라 여러 버전이 동시에 활성화될 수 있습니다

2. 약관 유형

   - 서비스 이용약관 (필수)
   - 개인정보 처리방침 (필수)
   - 마케팅 정보 수신 동의 (선택)
   - 멘토 서비스 약관 (멘토 전용 필수)

3. 동의 기록
   - 동의 시점
   - 사용자 IP 주소
   - 디바이스 정보
   - 동의한 약관 버전

## 보안 조치

회원가입 프로세스는 다음과 같은 다중 보안 계층을 포함합니다:

1. 요청 제한

   - 휴대폰 인증 최대 5회 시도
   - 실패 후 24시간 대기 기간
   - IP 기반 요청 제한

2. 검증 요구사항

   - 유효한 이메일 주소
   - 휴대폰 번호 인증
   - 백준 ID 검증 (멘토의 경우 최소 티어 요구사항)

3. 데이터 보호
   - 민감 정보 안전 저장
   - 개인정보 암호화
   - 모든 검증 시도에 대한 감사 추적

이 문서의 특정 부분에 대해 더 자세한 설명이 필요하신가요?
