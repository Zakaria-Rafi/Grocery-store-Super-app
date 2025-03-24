import type { Meta, StoryObj } from "@storybook/vue3";
import { userEvent, within, expect } from "@storybook/test";
import { RadioGroup, RadioGroupItem } from ".";
// More on how to set up stories at: https://storybook.js.org/docs/vue/writing-stories/introduction

const meta = {
  title: "UI/RadioGroup",
  component: RadioGroup,
  render: (args) => ({
    components: { RadioGroup, RadioGroupItem },
    setup() {
      return { args };
    },
    template: `
      <RadioGroup v-bind="args">
            <div className="flex items-center space-x-2">
                <RadioGroupItem value="default" id="r1" />
                <Label htmlFor="r1">Default</Label>
            </div>
            <div className="flex items-center space-x-2">
                <RadioGroupItem value="comfortable" id="r2" />
                <Label htmlFor="r2">Comfortable</Label>
            </div>
            <div className="flex items-center space-x-2">
                <RadioGroupItem value="compact" id="r3" />
                <Label htmlFor="r3">Compact</Label>
            </div>
        </RadioGroup>
    `,
  }),
  // This component will have an automatically generated docsPage entry: https://storybook.js.org/docs/vue/writing-docs/autodocs
  tags: ["autodocs"],
  argTypes: {
    defaultValue: {
      control: "text",
      description: "Valeur par défaut",
    },
    dir: {
      control: "select",
      options: ["ltr", "rtl"],
      description: "Direction du groupe de radio",
    },
    disabled: {
      control: "boolean",
      description: "Désactive le groupe de radio",
    },
    orientation: {
      control: "select",
      options: ["horizontal", "vertical"],
      description: "Orientation du groupe de radio",
    },
  },
} satisfies Meta<typeof RadioGroup>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    defaultValue: "default",
    dir: "ltr",
    disabled: false,
    orientation: "vertical",
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("radio", { name: "Default" }));
  },
};

export const Disabled: Story = {
  args: {
    defaultValue: "default",
    dir: "ltr",
    disabled: true,
    orientation: "vertical",
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("radio", { name: "Default" }));
    expect(canvas.getByRole("radio", { name: "Comfortable" })).toBeDisabled();
  },
};

export const Horizontal: Story = {
  args: {
    defaultValue: "default",
    dir: "ltr",
    orientation: "horizontal",
  },
};

export const Vertical: Story = {
  args: {
    defaultValue: "default",
    dir: "ltr",
    orientation: "vertical",
  },
};

export const WithCustomClass: Story = {
  args: {
    defaultValue: "default",
    dir: "ltr",
    orientation: "vertical",
    class: "bg-red-500",
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("radio", { name: "Default" }));
  },
};

export const Ltr: Story = {
  args: {
    defaultValue: "default",
    dir: "ltr",
  },
};

export const Rtl: Story = {
  args: {
    defaultValue: "default",
    dir: "rtl",
  },
};

export const withOtherDefault: Story = {
  args: {
    defaultValue: "comfortable",
    dir: "ltr",
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("radio", { name: "Comfortable" }));
  },
};
