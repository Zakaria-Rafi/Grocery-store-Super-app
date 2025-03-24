// @ts-nocheck
import type { Meta, StoryObj } from "@storybook/vue3";
import { userEvent, within, expect } from "@storybook/test";
import { Button } from ".";
// More on how to set up stories at: https://storybook.js.org/docs/vue/writing-stories/introduction

const meta = {
  title: "UI/Button",
  component: Button,
  render: (args) => ({
    components: { Button },
    setup() {
      return { args };
    },
    template: `
      <div class="flex items-center gap-4">
        <Button v-bind="args" :disabled="args.disabled">
          Button
        </Button>
      </div>
    `,
  }),
  // This component will have an automatically generated docsPage entry: https://storybook.js.org/docs/vue/writing-docs/autodocs
  tags: ["autodocs"],
  argTypes: {
    variant: {
      control: "select",
      options: ["default", "destructive", "outline", "secondary", "ghost", "link"],
      description: "Variante du bouton",
    },
    size: {
      control: "select",
      options: ["sm", "base", "lg", "icon"],
      description: "Taille du bouton",
    },
    disabled: {
      control: "boolean",
      description: "Désactivation du bouton",
    },
  },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

// Cas de test basiques avec différentes tailles
export const Small: Story = {
  args: {
    size: "sm",
    variant: "default",
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button"));
  },
};

export const Base: Story = {
  args: {
    size: "base",
    variant: "default",
  },
};

export const Large: Story = {
  args: {
    size: "lg",
    variant: "default",
  },
};

export const Icon: Story = {
  args: {
    size: "icon",
    variant: "default",
  },
};

export const Destructive: Story = {
  args: {
    variant: "destructive",
  },
};

export const Secondary: Story = {
  args: {
    variant: "secondary",
  },
};

export const Ghost: Story = {
  args: {
    variant: "ghost",
  },
};

export const Link: Story = {
  args: {
    variant: "link",
  },
};

export const Outline: Story = {
  args: {
    variant: "outline",
  },
};

export const Disabled: Story = {
  args: {
    disabled: true,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    expect(canvas.getByRole("button")).toBeDisabled();
  },
};
