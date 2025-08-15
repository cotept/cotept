# Storybook Best Practices

이 문서는 Storybook을 사용하여 안정적이고 유지보수 가능하며 유용한 스토리를 작성하기 위한 모범 사례를 정리합니다.

## 1. 컴포넌트에 집중하기 (Service가 아닌)

**가장 중요한 원칙입니다.** Storybook의 주된 목적은 UI 컴포넌트를 독립적인 환경에서 개발하고 문서화하는 것입니다.

- **Do:** 스토리는 단일 UI 컴포넌트가 `props` (`Args`)에 따라 어떻게 보이고 동작하는지에 집중해야 합니다.
- **Don't:** `overlay` 서비스와 같은 전역 상태 관리 로직이나 API 호출과 같은 비즈니스 로직을 스토리에서 직접 테스트하지 마세요.

서비스나 비즈니스 로직은 Jest 등을 이용한 단위/통합 테스트로 검증하고, Storybook에서는 순수한 UI의 렌더링 결과와 상호작용에만 집중해야 합니다. 이렇게 역할을 분리해야 예측 가능하고 안정적인 스토리를 만들 수 있습니다.

## 2. Args를 통한 동적 제어

`Args`는 Storybook의 인터랙션을 만드는 핵심 기능입니다. 컴포넌트의 `props`를 나타내며, `Controls` 애드온을 통해 실시간으로 변경할 수 있습니다.

- **기본값 설정:** `meta.args`에 컴포넌트의 기본 `props`를 정의하여 중복을 줄입니다.
- **상태 표현:** 각 스토리에서는 `args`를 오버라이드하여 `Primary`, `Disabled` 등 컴포넌트의 특정 상태를 표현합니다.
- **`argTypes` 활용:** `argTypes`를 사용하면 `Controls` 패널의 동작을 상세하게 설정할 수 있습니다. (예: `control: 'select'`로 드롭다운 메뉴 만들기)

```javascript
// Button.stories.js
export default {
  title: "UI/Button",
  component: Button,
  args: {
    label: "Button",
    primary: true,
    disabled: false,
  },
  argTypes: {
    backgroundColor: { control: "color" },
  },
}

export const Primary = {} // meta.args를 그대로 사용

export const Secondary = {
  args: {
    primary: false,
  },
}
```

## 3. Actions로 이벤트 검증하기

`Actions` 애드온은 `onClick`, `onSubmit` 등 콜백 함수의 호출 여부와 전달된 인자를 확인하는 데 사용됩니다. 컴포넌트의 이벤트가 올바르게 발생하는지 검증하는 가장 쉬운 방법입니다.

`argTypes`에 `action`을 지정하면, 해당 `arg`는 자동으로 이벤트 핸들러를 기록하는 "스파이(spy)" 함수가 됩니다.

```javascript
export default {
  title: "UI/Button",
  component: Button,
  argTypes: {
    // `onClick` arg에 'clicked'라는 이름의 action을 할당
    onClick: { action: "clicked" },
  },
}
```

이제 Storybook의 `Controls` 패널에서 버튼을 클릭하면 `Actions` 탭에 `clicked` 이벤트와 함께 상세 정보가 기록됩니다.

## 4. `play` 함수로 사용자 상호작용 테스트하기

`play` 함수는 스토리가 렌더링된 후, 사용자의 행동(클릭, 입력 등)을 스크립트로 실행하여 컴포넌트의 복잡한 상호작용을 테스트하는 강력한 기능입니다.

- **목적:** `Args`만으로는 표현하기 어려운 "로그인 폼을 채우고 제출 버튼을 누른다"와 같은 연속적인 사용자 시나리오를 테스트하고 문서화합니다.
- **사용법:** `@storybook/testing-library`와 `@storybook/jest`를 사용하여 DOM 요소를 찾고, 이벤트를 발생시키며, 결과를 단언(assert)합니다.

```javascript
import { userEvent, within } from '@storybook/testing-library';
import { expect } from '@storybook/jest';

export const LoginFormFilled: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const emailInput = canvas.getByLabelText('Email');
    await userEvent.type(emailInput, 'user@example.com');

    const passwordInput = canvas.getByLabelText('Password');
    await userEvent.type(passwordInput, 'a-strong-password');

    const submitButton = canvas.getByRole('button', { name: /Log in/i });
    await userEvent.click(submitButton);

    // 로그인 성공 메시지가 나타나는지 확인
    const successMessage = await canvas.findByText('Login successful!');
    await expect(successMessage).toBeInTheDocument();
  },
};
```

## 5. Decorators로 컨텍스트 제공하기

`Decorators`는 스토리를 감싸는 래퍼(wrapper) 함수입니다. `ThemeProvider`, `QueryClientProvider`와 같은 전역 Provider를 제공하거나, 공통적인 레이아웃 스타일을 적용하는 데 사용됩니다. 이는 DRY(Don't Repeat Yourself) 원칙을 지키는 좋은 방법입니다.

```javascript
// .storybook/preview.js 또는 meta 객체에 추가

export const decorators = [
  (Story) => (
    <ThemeProvider theme="default">
      <div style={{ margin: "3em" }}>
        <Story />
      </div>
    </ThemeProvider>
  ),
]
```
