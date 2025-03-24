// @ts-nocheck
import type { Meta, StoryObj } from "@storybook/vue3";
import { userEvent, within, expect } from "@storybook/test";
import { Switch } from ".";
import { Label } from "../label";
// More on how to set up stories at: https://storybook.js.org/docs/vue/writing-stories/introduction

const meta = {
  title: "UI/Switch",
  component: Switch,
  render: (args) => ({
    components: { Switch },
    setup() {
      return { args };
    },
    template: `
      <div class="flex items-center gap-2">
        <Switch v-bind="args" id="switch" />
        <Label for="switch">Switch Mode</Label>
      </div>
    `,
  }),
  // This component will have an automatically generated docsPage entry: https://storybook.js.org/docs/vue/writing-docs/autodocs
  tags: ["autodocs"],
  argTypes: {
    disabled: {
      control: "boolean",
      description: "Désactive l'input",
    },
    checked: {
      control: "boolean",
      description: "Activé par défault",
    },
  },
} satisfies Meta<typeof Switch>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    defaultValue: "Coucou",
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const switchElement = canvas.getByRole("switch");
    expect(switchElement).not.toBeChecked();
  },
};

export const Disabled: Story = {
  args: {
    defaultValue: "Coucou",
    disabled: true,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const switchElement = canvas.getByRole("switch");
    expect(switchElement).toBeDisabled();
  },
};

export const defaultChecked: Story = {
  args: {
    defaultValue: "Coucou",
    checked: true,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const switchElement = canvas.getByRole("switch");
    expect(switchElement).toBeChecked();
  },
};
