// @ts-nocheck
import type { Meta, StoryObj } from "@storybook/vue3";
import { Input } from ".";
import { userEvent, within, expect } from "@storybook/test";

// More on how to set up stories at: https://storybook.js.org/docs/vue/writing-stories/introduction

const meta = {
  title: "UI/Input",
  component: Input,
  render: (args) => ({
    components: { Input },
    setup() {
      return { args };
    },
    template: `
      <Input v-bind="args" />
    `,
  }),
  // This component will have an automatically generated docsPage entry: https://storybook.js.org/docs/vue/writing-docs/autodocs
  tags: ["autodocs"],
  argTypes: {
    defaultValue: {
      control: "text",
      description: "Valeur par défaut",
    },
    disabled: {
      control: "boolean",
      description: "Désactive l'input",
    },
    type: {
      control: "select",
      options: ["text", "number", "email", "password", "tel"],
      description: "Type d'input",
    },
    placeholder: {
      control: "text",
      description: "Placeholder",
    },
    class: {
      control: "text",
      description: "Classe CSS",
    },
  },
} satisfies Meta<typeof Input>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    defaultValue: "Coucou",
    type: "text",
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByRole("textbox");

    // Vérifie la valeur initiale
    expect(input).toHaveValue("Coucou");

    // Simule la saisie de texte
    await userEvent.clear(input);
    await userEvent.type(input, "Nouveau texte");
    expect(input).toHaveValue("Nouveau texte");
  },
};

export const Disabled: Story = {
  args: {
    defaultValue: "Coucou",
    disabled: true,
    type: "text",
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByRole("textbox");

    // Vérifie que l'input est désactivé
    expect(input).toBeDisabled();
    expect(input).toHaveValue("Coucou");
  },
};

export const Number: Story = {
  args: {
    defaultValue: "123",
    type: "number",
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByRole("spinbutton");

    // Vérifie la valeur initiale
    expect(input).toHaveValue(123);

    // Teste la saisie d'un nombre
    await userEvent.clear(input);
    await userEvent.type(input, "456");
    expect(input).toHaveValue(456);
  },
};

export const Email: Story = {
  args: {
    defaultValue: "test@test.com",
    type: "email",
  },
};

export const Password: Story = {
  args: {
    defaultValue: "Password",
    type: "password",
  },
};

export const Tel: Story = {
  args: {
    defaultValue: "1234567890",
    type: "tel",
  },
};

export const WithCustomClass: Story = {
  args: {
    defaultValue: "Coucou",
    class: "bg-red-500",
  },
};
