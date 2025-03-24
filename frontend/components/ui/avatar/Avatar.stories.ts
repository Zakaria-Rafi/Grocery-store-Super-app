import type { Meta, StoryObj } from "@storybook/vue3";
import { Avatar, AvatarFallback, AvatarImage } from ".";
import { userEvent, within, expect } from "@storybook/test";
// More on how to set up stories at: https://storybook.js.org/docs/vue/writing-stories/introduction

const meta = {
  title: "UI/Avatar",
  component: Avatar,
  render: (args) => ({
    components: { Avatar, AvatarImage, AvatarFallback },
    setup() {
      return { args };
    },
    template: `
      <div class="flex items-center gap-4">
        <Avatar v-bind="args">
          <AvatarImage :src="args.imageSrc" :alt="args.imageAlt" />
          <AvatarFallback>{{args.fallback}}</AvatarFallback>
        </Avatar>
      </div>
    `,
  }),
  // This component will have an automatically generated docsPage entry: https://storybook.js.org/docs/vue/writing-docs/autodocs
  tags: ["autodocs"],
  argTypes: {
    size: {
      control: "select",
      options: ["sm", "base", "lg"],
      description: "Taille de l'avatar",
    },
    shape: {
      control: "select",
      options: ["circle", "square"],
      description: "Forme de l'avatar",
    },
    imageSrc: {
      control: "text",
      description: "URL de l'image",
    },
    imageAlt: {
      control: "text",
      description: "Texte alternatif de l'image",
    },
    fallback: {
      control: "text",
      description: "Texte de fallback",
    },
    class: {
      control: "text",
      description: "Classes CSS personnalisées",
    },
  },
} satisfies Meta<typeof Avatar>;

export default meta;
type Story = StoryObj<typeof meta>;

// Cas de test basiques avec différentes tailles
export const Small: Story = {
  args: {
    size: "sm",
    shape: "circle",
    imageSrc: "https://github.com/shadcn.png",
    imageAlt: "@shadcn",
    fallback: "CN",
  },
};

export const Base: Story = {
  args: {
    size: "base",
    shape: "circle",
    imageSrc: "https://github.com/shadcn.png",
    imageAlt: "@shadcn",
    fallback: "CN",
  },
};

export const Large: Story = {
  args: {
    size: "lg",
    shape: "circle",
    imageSrc: "https://github.com/shadcn.png",
    imageAlt: "@shadcn",
    fallback: "CN",
  },
};

// Test des différentes formes
export const Square: Story = {
  args: {
    size: "base",
    shape: "square",
    imageSrc: "https://github.com/shadcn.png",
    imageAlt: "@shadcn",
    fallback: "CN",
  },
};

// Test du fallback (image invalide)
export const WithFallback: Story = {
  args: {
    size: "base",
    shape: "circle",
    imageSrc: "invalid-image-url.jpg",
    imageAlt: "Image invalide",
    fallback: "FB",
  },
};

// Test avec une image personnalisée
export const CustomImage: Story = {
  args: {
    size: "lg",
    shape: "circle",
    imageSrc: "https://picsum.photos/200",
    imageAlt: "Image aléatoire",
    fallback: "IM",
  },
};

// Test avec des classes personnalisées
export const WithCustomClass: Story = {
  args: {
    size: "base",
    shape: "circle",
    imageSrc: "https://github.com/shadcn.png",
    imageAlt: "@shadcn",
    fallback: "CN",
    class: "border-4 border-blue-500",
  },
};

// Test de groupe d'avatars
export const AvatarGroup: Story = {
  render: (args) => ({
    components: { Avatar, AvatarImage, AvatarFallback },
    setup() {
      return { args };
    },
    template: `
      <div class="flex items-center space-x-[-0.75rem] gap-10">
        <Avatar v-bind="args">
          <AvatarImage src="https://github.com/shadcn.png" alt="@shadcn" />
          <AvatarFallback>CN</AvatarFallback>
        </Avatar>
        <Avatar v-bind="args">
          <AvatarImage src="https://picsum.photos/200" alt="Random" />
          <AvatarFallback>RD</AvatarFallback>
        </Avatar>
        <Avatar v-bind="args">
          <AvatarImage src="invalid-url.jpg" alt="Invalid" />
          <AvatarFallback>IN</AvatarFallback>
        </Avatar>
      </div>
    `,
  }),
  args: {
    size: "base",
    shape: "circle",
  },
};
