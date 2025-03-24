import { h, inject } from "vue";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { ChevronUpIcon, ChevronDownIcon, ArrowUpDownIcon, FileEditIcon } from "lucide-vue-next";
import type { ColumnDef, Table, Row } from "@tanstack/vue-table";
import type { User } from "@/types/user";

export type UserColumns = ColumnDef<User, unknown>[];

const SortableHeader = (
  label: string,
  column: { toggleSorting: (asc: boolean) => void; getIsSorted: () => "asc" | "desc" | false },
): ReturnType<typeof h> => {
  return h("div", { class: "flex items-center space-x-2" }, [
    h("span", label),
    h(
      Button,
      {
        variant: "ghost",
        size: "sm",
        class: "h-8 w-8 p-0",
        onClick: () => column.toggleSorting(column.getIsSorted() === "asc"),
      },
      () =>
        column.getIsSorted() === "asc"
          ? h(ChevronUpIcon, { class: "h-4 w-4" })
          : column.getIsSorted() === "desc"
            ? h(ChevronDownIcon, { class: "h-4 w-4" })
            : h(ArrowUpDownIcon, { class: "h-4 w-4" }),
    ),
  ]);
};

export const columns: Array<ColumnDef<User, unknown>> = [
  {
    id: "select",
    enableSorting: false,
    enableHiding: false,
    header: ({ table }: { table: Table<User> }): ReturnType<typeof h> =>
      h(Checkbox, {
        checked: table.getIsAllRowsSelected(),
        "onUpdate:checked": () => table.toggleAllRowsSelected(),
        "aria-label": "Sélectionner tout",
        class: "translate-y-[2px]",
      }),
    cell: ({ row }: { row: Row<User> }): ReturnType<typeof h> =>
      h(Checkbox, {
        checked: row.getIsSelected(),
        "onUpdate:checked": () => row.toggleSelected(),
        "aria-label": "Sélectionner la ligne",
        class: "translate-y-[2px]",
      }),
  },
  {
    accessorKey: "id",
    header: ({ column }) => SortableHeader("ID", column),
    sortingFn: "alphanumeric",
  },
  {
    accessorKey: "role",
    header: ({ column }) => SortableHeader("Rôle", column),
    sortingFn: "alphanumeric",
  },
  {
    accessorKey: "firstName",
    header: ({ column }) => SortableHeader("Prénom", column),
    sortingFn: "alphanumeric",
  },
  {
    accessorKey: "lastName",
    header: ({ column }) => SortableHeader("Nom", column),
    sortingFn: "alphanumeric",
  },
  {
    accessorKey: "email",
    header: ({ column }) => SortableHeader("Email", column),
    sortingFn: "alphanumeric",
  },
  {
    accessorKey: "orderCount",
    header: ({ column }) => SortableHeader("Total commandes", column),
    cell: ({ row }: { row: Row<User> }): ReturnType<typeof h> => {
      const count = row.getValue("orderCount") as number;
      return h("span", undefined, count || "0");
    },
    sortingFn: "alphanumeric",
  },
  {
    accessorKey: "totalSpent",
    header: ({ column }) => SortableHeader("Total dépenses", column),
    cell: ({ row }: { row: Row<User> }): ReturnType<typeof h> => {
      const amount = row.getValue("totalSpent") as number;
      const formattedAmount = new Intl.NumberFormat("fr-FR", {
        style: "currency",
        currency: "EUR",
      }).format(amount || 0);
      return h("span", undefined, formattedAmount);
    },
    sortingFn: "alphanumeric",
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }: { row: Row<User> }): ReturnType<typeof h> => {
      const openEditModal = inject("openEditModal") as ((client: User) => void) | undefined;
      const client = row.original;
      return h(
        Button,
        {
          variant: "ghost",
          onClick: () => {
            if (openEditModal) {
              openEditModal(client);
            }
          },
        },
        () => h(FileEditIcon, { class: "h-4 w-4" }),
      );
    },
  },
];
