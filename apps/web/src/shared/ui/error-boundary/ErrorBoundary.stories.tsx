import { MouseEventHandler } from "react";

import { Button } from "@repo/shared/components/button";

import { fn } from "@storybook/test";

import { ErrorBoundary } from "./ErrorBoundary";

import type { Meta, StoryObj } from "@storybook/react";

// 에러를 발생시키는 테스트 컴포넌트
const ThrowError = ({ shouldThrow = false }: { shouldThrow?: boolean }) => {
  if (shouldThrow) {
    throw new Error("Test error for Storybook demonstration");
  }
  return <div>This component is working fine!</div>;
};

// 사용자가 버튼을 눌러 에러를 발생시킬 수 있는 컴포넌트
const ErrorTrigger = () => {
  const throwError = () => {
    throw new Error("User triggered error!");
  };

  return (
    <div className="space-y-4 text-center">
      <p>Click the button below to trigger an error:</p>
      <Button onClick={throwError} variant="destructive">
        Trigger Error
      </Button>
    </div>
  );
};

const meta: Meta<typeof ErrorBoundary> = {
  title: "UI/ErrorBoundary",
  component: ErrorBoundary,
  parameters: {
    layout: "fullscreen",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof ErrorBoundary>;

export default meta;
type Story = StoryObj<typeof meta>;

// 정상 상태
export const Default: Story = {
  args: {
    children: (
      <div className="p-8 text-center">
        <h2 className="mb-4 text-xl font-semibold">Normal Component</h2>
        <p>This component is working normally without any errors.</p>
      </div>
    ),
  },
};

// 에러 상태 (자동으로 에러 발생)
export const WithError: Story = {
  args: {
    children: <ThrowError shouldThrow={true} />,
    onError: fn(),
  },
};

// 인터랙티브 에러 트리거
export const InteractiveError: Story = {
  args: {
    children: <ErrorTrigger />,
  },
};

// 커스텀 fallback UI
const customFallbackUI = (
  _error: any,
  _errorInfo: any,
  resetError: MouseEventHandler<HTMLButtonElement> | undefined,
) => (
  <div className="flex min-h-screen items-center justify-center bg-gradient-to-r from-purple-400 to-pink-400">
    <div className="m-4 w-full max-w-md rounded-lg bg-white p-8 shadow-xl">
      <div className="text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
          <svg
            className="h-8 w-8 text-red-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </div>
        <h2 className="mb-2 text-2xl font-bold text-gray-900">
          Custom Error UI
        </h2>
        <p className="mb-6 text-gray-600">
          This is a custom error fallback UI.
          <br />
          You can customize it however you want!
        </p>
        <Button onClick={resetError} className="w-full">
          Try Again
        </Button>
      </div>
    </div>
  </div>
);

export const CustomFallback: Story = {
  args: {
    children: <ThrowError shouldThrow={true} />,
    fallback: customFallbackUI,
    onError: fn(),
  },
};

// 에러 콜백 처리
export const WithErrorCallback: Story = {
  args: {
    children: <ThrowError shouldThrow={true} />,
    onError: fn(),
  },
};

// 복잡한 컨텐츠와 함께
export const WithComplexContent: Story = {
  args: {
    children: (
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white shadow">
          <div className="mx-auto max-w-7xl px-4 py-6">
            <h1 className="text-3xl font-bold text-gray-900">My Application</h1>
          </div>
        </header>
        <main className="mx-auto max-w-7xl px-4 py-6">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            <div className="rounded-lg bg-white p-6 shadow">
              <h2 className="mb-4 text-xl font-semibold">Card 1</h2>
              <p>This card is working fine.</p>
            </div>
            <div className="rounded-lg bg-white p-6 shadow">
              <h2 className="mb-4 text-xl font-semibold">Card 2</h2>
              <ThrowError shouldThrow={true} />
            </div>
            <div className="rounded-lg bg-white p-6 shadow">
              <h2 className="mb-4 text-xl font-semibold">Card 3</h2>
              <p>This card would be affected by the error boundary.</p>
            </div>
          </div>
        </main>
      </div>
    ),
    onError: fn(),
  },
};
