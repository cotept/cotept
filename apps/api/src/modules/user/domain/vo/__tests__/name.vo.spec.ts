import { Name } from '@/modules/user/domain/vo/name.vo';

describe('Name 값 객체', () => {
  // 올바른 케이스
  describe('유효한 케이스', () => {
    it('한글로 이름을 생성할 수 있다', () => {
      // Given
      const nameStr = '홍길동';
      
      // When
      const name = Name.of(nameStr);
      
      // Then
      expect(name.toString()).toBe(nameStr);
    });
    
    it('영문으로 이름을 생성할 수 있다', () => {
      // Given
      const nameStr = 'John';
      
      // When
      const name = Name.of(nameStr);
      
      // Then
      expect(name.toString()).toBe(nameStr);
    });
    
    it('한글과 영문이 혼합된 이름을 생성할 수 있다', () => {
      // Given
      const nameStr = '홍John';
      
      // When
      const name = Name.of(nameStr);
      
      // Then
      expect(name.toString()).toBe(nameStr);
    });
    
    it('앞뒤 공백은 제거된다', () => {
      // Given
      const nameStr = '  홍길동  ';
      
      // When
      const name = Name.of(nameStr);
      
      // Then
      expect(name.toString()).toBe('홍길동');
    });

    it('이름에 공백이 포함될 수 있다', () => {
      // Given
      const nameStr = '홍 길동';
      
      // When
      const name = Name.of(nameStr);
      
      // Then
      expect(name.toString()).toBe('홍 길동');
    });
  });
  
  // 유효하지 않은 케이스
  describe('유효하지 않은 케이스', () => {
    it('이름이 비어있으면 예외가 발생한다', () => {
      // Given
      const nameStr = '';
      
      // When & Then
      expect(() => Name.of(nameStr)).toThrow('이름은 필수 값입니다.');
    });
    
    it('이름이 2자 미만이면 예외가 발생한다', () => {
      // Given
      const nameStr = '홍';
      
      // When & Then
      expect(() => Name.of(nameStr)).toThrow('이름은 2자 이상 50자 이하여야 합니다.');
    });
    
    it('이름이 50자를 초과하면 예외가 발생한다', () => {
      // Given
      const nameStr = '홍'.repeat(51);
      
      // When & Then
      expect(() => Name.of(nameStr)).toThrow('이름은 2자 이상 50자 이하여야 합니다.');
    });
    
    it('이름에 숫자가 포함되면 예외가 발생한다', () => {
      // Given
      const nameStr = '홍길동123';
      
      // When & Then
      expect(() => Name.of(nameStr)).toThrow('이름은 한글과 영문자만 허용됩니다.');
    });
    
    it('이름에 특수문자가 포함되면 예외가 발생한다', () => {
      // Given
      const nameStr = '홍길동!';
      
      // When & Then
      expect(() => Name.of(nameStr)).toThrow('이름은 한글과 영문자만 허용됩니다.');
    });
  });
  
  // 기능 테스트
  describe('기능 검증', () => {
    it('두 이름 객체가 같은 값을 가지면 동등하다', () => {
      // Given
      const name1 = Name.of('홍길동');
      const name2 = Name.of('홍길동');
      const name3 = Name.of('김철수');
      
      // Then
      expect(name1.equals(name2)).toBe(true);
      expect(name1.equals(name3)).toBe(false);
    });
    
    it('이름을 마스킹 처리할 수 있다', () => {
      // Given
      const name1 = Name.of('홍길동');
      const name2 = Name.of('김철수박');
      const name3 = Name.of('김수');
      
      // Then
      expect(name1.getMasked()).toBe('홍*동');
      expect(name2.getMasked()).toBe('김**박');
      expect(name3.getMasked()).toBe('김*');
    });
  });
});
