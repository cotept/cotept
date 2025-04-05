import { ValidationArguments, ValidatorConstraint, ValidatorConstraintInterface } from "class-validator"

/**
 * 연속된 문자나 숫자가 포함되어 있는지 검증하는 커스텀 밸리데이터
 * 예: '123', 'abc' 등의 연속된 패턴이 비밀번호에 포함되어 있는지 확인
 */
@ValidatorConstraint({ name: "isNotSequential", async: false })
export class IsNotSequential implements ValidatorConstraintInterface {
  validate(text: string, args: ValidationArguments) {
    if (!text) return true

    // 연속된 문자/숫자 감지 정규식
    const sequentialPatterns = [
      // 숫자 연속 패턴
      "012",
      "123",
      "234",
      "345",
      "456",
      "567",
      "678",
      "789",
      // 영문 연속 패턴 (소문자)
      "abc",
      "bcd",
      "cde",
      "def",
      "efg",
      "fgh",
      "ghi",
      "hij",
      "ijk",
      "jkl",
      "klm",
      "lmn",
      "mno",
      "nop",
      "opq",
      "pqr",
      "qrs",
      "rst",
      "stu",
      "tuv",
      "uvw",
      "vwx",
      "wxy",
      "xyz",
    ]

    // 대소문자 구분 없이 검사
    const lowerText = text.toLowerCase()

    // 연속된 패턴이 포함되어 있는지 확인
    return !sequentialPatterns.some((pattern) => lowerText.includes(pattern))
  }

  defaultMessage(args: ValidationArguments) {
    return "비밀번호에 연속된 문자나 숫자(123, abc 등)를 사용할 수 없습니다."
  }
}
