import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { formatDate, formatPrice } from "@/utils/formatters";
import type { ColumnDef, Row } from "@tanstack/vue-table";
import { ArrowUpDown, ChevronDown, ChevronUp, FileEditIcon } from "lucide-vue-next";
import { h } from "vue";
import type { Order, OrderProduct } from "~/types/order";
import type { User } from "~/types/user";

export type OrderTableOptions = {
  downloadInvoice: (id: string) => Promise<void>;
  showUpdateModal: (order: Order) => void;
};

type BadgeVariant = "default" | "secondary" | "destructive" | "success" | "warning" | "info" | "outline";

export const createColumns = ({ downloadInvoice, showUpdateModal }: OrderTableOptions): ColumnDef<Order>[] => [
  {
    id: "select",
    enableSorting: false,
    enableHiding: false,
    header: ({ table }) =>
      h(Checkbox, {
        checked: table.getIsAllPageRowsSelected(),
        "onUpdate:checked": (checked) => table.toggleAllPageRowsSelected(!!checked),
        "aria-label": "Select all",
        class: "translate-y-[2px]",
      }),
    cell: ({ row }) =>
      h(Checkbox, {
        checked: row.getIsSelected(),
        "onUpdate:checked": (checked) => row.toggleSelected(!!checked),
        "aria-label": "Select row",
        class: "translate-y-[2px]",
      }),
  },
  {
    accessorKey: "orderNumber",
    size: 150,
    header: ({ column }) => {
      const sort = column.getIsSorted();
      return h("div", { class: "flex items-center" }, [
        h("span", {}, "N° Commande"),
        h(
          Button,
          {
            variant: "ghost",
            onClick: () => column.toggleSorting(column.getIsSorted() === "asc"),
            class: "ml-2 h-8 w-8 p-0",
          },
          () =>
            sort === "asc"
              ? h(ChevronUp, { class: "h-4 w-4" })
              : sort === "desc"
                ? h(ChevronDown, { class: "h-4 w-4" })
                : h(ArrowUpDown, { class: "h-4 w-4" }),
        ),
      ]);
    },
  },
  {
    accessorKey: "created_at",
    size: 120,
    header: ({ column }) => {
      const sort = column.getIsSorted();
      return h("div", { class: "flex items-center" }, [
        h("span", {}, "Date"),
        h(
          Button,
          {
            variant: "ghost",
            onClick: () => column.toggleSorting(column.getIsSorted() === "asc"),
            class: "ml-2 h-8 w-8 p-0",
          },
          () =>
            sort === "asc"
              ? h(ChevronUp, { class: "h-4 w-4" })
              : sort === "desc"
                ? h(ChevronDown, { class: "h-4 w-4" })
                : h(ArrowUpDown, { class: "h-4 w-4" }),
        ),
      ]);
    },
    cell: ({ row }) => formatDate(row.getValue("created_at")),
  },
  {
    accessorKey: "user",
    size: 150,
    header: ({ column }) => {
      const sort = column.getIsSorted();
      return h("div", { class: "flex items-center" }, [
        h("span", {}, "Acheteur"),
        h(
          Button,
          {
            variant: "ghost",
            onClick: () => column.toggleSorting(column.getIsSorted() === "asc"),
            class: "ml-2 h-8 w-8 p-0",
          },
          () =>
            sort === "asc"
              ? h(ChevronUp, { class: "h-4 w-4" })
              : sort === "desc"
                ? h(ChevronDown, { class: "h-4 w-4" })
                : h(ArrowUpDown, { class: "h-4 w-4" }),
        ),
      ]);
    },
    cell: ({ row }: { row: Row<Order> }) => {
      const user = row.getValue("user") as User;
      return `${user?.firstName} ${user?.lastName}`;
    },
    sortingFn: (rowA, rowB) => {
      const a = `${rowA.original.user?.firstName} ${rowA.original.user?.lastName}`.toLowerCase();
      const b = `${rowB.original.user?.firstName} ${rowB.original.user?.lastName}`.toLowerCase();
      return a < b ? -1 : a > b ? 1 : 0;
    },
  },
  {
    accessorKey: "amount",
    size: 100,
    header: ({ column }) => {
      const sort = column.getIsSorted();
      return h("div", { class: "flex items-center" }, [
        h("span", {}, "Montant"),
        h(
          Button,
          {
            variant: "ghost",
            onClick: () => column.toggleSorting(column.getIsSorted() === "asc"),
            class: "ml-2 h-8 w-8 p-0",
          },
          () =>
            sort === "asc"
              ? h(ChevronUp, { class: "h-4 w-4" })
              : sort === "desc"
                ? h(ChevronDown, { class: "h-4 w-4" })
                : h(ArrowUpDown, { class: "h-4 w-4" }),
        ),
      ]);
    },
    cell: ({ row }) => formatPrice(row.getValue("amount")),
    sortingFn: (rowA, rowB) => {
      return Number(rowA.original.amount) - Number(rowB.original.amount);
    },
  },
  {
    accessorKey: "status",
    size: 120,
    header: ({ column }) => {
      const sort = column.getIsSorted();
      return h("div", { class: "flex items-center" }, [
        h("span", {}, "Statut"),
        h(
          Button,
          {
            variant: "ghost",
            onClick: () => column.toggleSorting(column.getIsSorted() === "asc"),
            class: "ml-2 h-8 w-8 p-0",
          },
          () =>
            sort === "asc"
              ? h(ChevronUp, { class: "h-4 w-4" })
              : sort === "desc"
                ? h(ChevronDown, { class: "h-4 w-4" })
                : h(ArrowUpDown, { class: "h-4 w-4" }),
        ),
      ]);
    },
    cell: ({ row }: { row: Row<Order> }) => {
      const status = row.getValue("status") as string;
      return h(
        Badge,
        {
          variant: getStatusVariant(status),
          class: "capitalize",
        },
        () => status,
      );
    },
  },
  {
    accessorKey: "products",
    size: 100,
    header: ({ column }) => {
      const sort = column.getIsSorted();
      return h("div", { class: "flex items-center" }, [
        h("span", {}, "Produits"),
        h(
          Button,
          {
            variant: "ghost",
            onClick: () => column.toggleSorting(column.getIsSorted() === "asc"),
            class: "ml-2 h-8 w-8 p-0",
          },
          () =>
            sort === "asc"
              ? h(ChevronUp, { class: "h-4 w-4" })
              : sort === "desc"
                ? h(ChevronDown, { class: "h-4 w-4" })
                : h(ArrowUpDown, { class: "h-4 w-4" }),
        ),
      ]);
    },
    cell: ({ row }: { row: Row<Order> }) => {
      const products = row.getValue("products") as OrderProduct[];
      const count = products?.reduce((total: number, p: OrderProduct) => total + p.quantity, 0) || 0;
      return `${count} produit${count > 1 ? "s" : ""}`;
    },
    sortingFn: (rowA: Row<Order>, rowB: Row<Order>) => {
      const productsA = rowA.getValue("products") as OrderProduct[];
      const productsB = rowB.getValue("products") as OrderProduct[];
      const countA = productsA?.reduce((total: number, p) => total + p.quantity, 0) || 0;
      const countB = productsB?.reduce((total: number, p) => total + p.quantity, 0) || 0;
      return countA - countB;
    },
  },
  {
    id: "Facture",
    size: 80,
    header: "Facture",
    cell: ({ row }) => {
      return h(
        Button,
        {
          variant: "ghost",
          class: "text-blue-500 underline",
          onClick: () => downloadInvoice(row.original.id),
        },
        () => [h("div", { class: "flex items-center justify-center" }, [h("span", { class: "ml-2" }, "Voir facture")])],
      );
    },
    enableSorting: false,
  },
  {
    id: "actions",
    size: 50,
    header: "Actions",
    cell: ({ row }) => {
      return h(
        Button,
        {
          variant: "ghost",
          class: "p-0",
          onClick: () => showUpdateModal(row.original),
        },
        () => h("div", { class: "flex items-center justify-center" }, [h(FileEditIcon, { class: "h-4 w-4" })]),
      );
    },
    enableSorting: false,
  },
];

// Fonction utilitaire pour obtenir la variante du badge selon le statut
const getStatusVariant = (status: string): BadgeVariant => {
  const statusMap: Record<string, BadgeVariant> = {
    "En attente": "warning",
    "En cours": "info",
    Expédié: "secondary",
    Livré: "success",
    Annulé: "destructive",
    Completed: "success",
    Pending: "warning",
  };
  return statusMap[status] || "default";
};
