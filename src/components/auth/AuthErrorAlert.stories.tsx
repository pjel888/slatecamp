import type { Meta, StoryObj } from "@storybook/react";

import { AuthErrorAlert } from "./AuthErrorAlert";

const meta = {
  title: "Auth/AuthErrorAlert",
  component: AuthErrorAlert,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "Shared auth error alert for login/register OAuth failures. Composes the SlateCamp UI Alert primitive.",
      },
    },
  },
  args: {
    message: "Sign-in failed. Please try again.",
  },
  decorators: [
    (Story) => (
      <div className="w-full max-w-sm px-4">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof AuthErrorAlert>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const OAuthCallbackFailed: Story = {
  args: {
    message: "Sign-in failed. Please try again.",
  },
};

export const LongProviderError: Story = {
  args: {
    message:
      "Google could not complete the sign-in request. Check your account permissions, then try again.",
  },
};
