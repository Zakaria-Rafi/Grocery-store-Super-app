import { h, inject } from "vue";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { ChevronUpIcon, ChevronDownIcon, ArrowUpDownIcon, FileEditIcon } from "lucide-vue-next";
import type { ColumnDef, Table, Row } from "@tanstack/vue-table";
import type { Coupon } from "@/types/coupon";
import type { Product } from "~/types/product";
import type { User } from "~/types/user";
import { useI18n } from "vue-i18n";

export type CouponColumns = ColumnDef<Coupon, unknown>[];

// Créer une fonction composable pour utiliser i18n
export function useTranslation(): { t: ReturnType<typeof useI18n>["t"] } {
  // useI18n est maintenant correctement appelé dans un composable
  const { t } = useI18n();
  return { t };
}

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

// Pour les colonnes, nous utiliserons la fonction lors de la définition
export const getColumns = (): Array<ColumnDef<Coupon, unknown>> => {
  // Utiliser notre composable à l'intérieur d'une fonction
  const { t } = useTranslation();

  return [
    {
      id: "select",
      enableSorting: false,
      enableHiding: false,
      header: ({ table }: { table: Table<Coupon> }): ReturnType<typeof h> =>
        h(Checkbox, {
          checked: table.getIsAllRowsSelected(),
          "onUpdate:checked": () => table.toggleAllRowsSelected(),
          "aria-label": "Sélectionner tout",
          class: "translate-y-[2px]",
        }),
      cell: ({ row }: { row: Row<Coupon> }): ReturnType<typeof h> =>
        h(Checkbox, {
          checked: row.getIsSelected(),
          "onUpdate:checked": () => row.toggleSelected(),
          "aria-label": "Sélectionner la ligne",
          class: "translate-y-[2px]",
        }),
    },
    {
      accessorKey: "id",
      header: ({ column }) => SortableHeader(t("DISCOUNTS.ID"), column),
      sortingFn: "alphanumeric",
    },
    {
      accessorKey: "code",
      header: ({ column }) => SortableHeader(t("DISCOUNTS.CODE"), column),
      sortingFn: "alphanumeric",
    },
    {
      accessorKey: "discountType",
      header: ({ column }) => SortableHeader(t("DISCOUNTS.DISCOUNT_TYPE"), column),
      sortingFn: "alphanumeric",
    },
    {
      accessorKey: "discountValue",
      header: ({ column }) => SortableHeader(t("DISCOUNTS.DISCOUNT_VALUE"), column),
      sortingFn: "alphanumeric",
    },
    {
      accessorKey: "isGlobal",
      header: ({ column }) => SortableHeader(t("DISCOUNTS.IS_GLOBAL"), column),
      sortingFn: "alphanumeric",
    },
    {
      accessorKey: "usageLimit",
      header: ({ column }) => SortableHeader(t("DISCOUNTS.USAGE_LIMIT"), column),
      cell: ({ row }: { row: Row<Coupon> }): ReturnType<typeof h> => {
        const count = row.getValue("usageLimit") as number;
        return h("span", undefined, count || "0");
      },
      sortingFn: "alphanumeric",
    },
    {
      accessorKey: "products",
      header: ({ column }) => SortableHeader(t("DISCOUNTS.PRODUCTS"), column),
      cell: ({ row }: { row: Row<Coupon> }): ReturnType<typeof h> => {
        const products = row.getValue("products") as Product[];
        return h("span", undefined, products.length || "0");
      },
      sortingFn: "alphanumeric",
    },
    {
      accessorKey: "users",
      header: ({ column }) => SortableHeader(t("DISCOUNTS.USERS"), column),
      cell: ({ row }: { row: Row<Coupon> }): ReturnType<typeof h> => {
        const users = row.getValue("users") as User[];
        return h("span", undefined, users.length || "0");
      },
      sortingFn: "alphanumeric",
    },
    {
      accessorKey: "expiryDate",
      header: ({ column }) => SortableHeader(t("DISCOUNTS.EXPIRATION_DATE"), column),
      cell: ({ row }: { row: Row<Coupon> }): ReturnType<typeof h> => {
        const expiryDate = row.getValue("expiryDate");
        if (!expiryDate) return h("span", undefined, "-");

        const date = new Date(expiryDate as Date);
        return h("span", undefined, date.toLocaleDateString("fr-FR"));
      },
      sortingFn: "alphanumeric",
    },
    {
      id: "actions",
      header: t("DISCOUNTS.ACTIONS"),
      cell: ({ row }: { row: Row<Coupon> }): ReturnType<typeof h> => {
        const openEditModal = inject("openEditModal") as ((coupon: Coupon) => void) | undefined;
        const coupon = row.original;
        return h(
          Button,
          {
            variant: "ghost",
            onClick: () => {
              if (openEditModal) {
                openEditModal(coupon);
              }
            },
          },
          () => h(FileEditIcon, { class: "h-4 w-4" }),
        );
      },
    },
  ];
};
