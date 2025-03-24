import { h, inject } from "vue";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { ChevronUpIcon, ChevronDownIcon, ArrowUpDownIcon, FileEditIcon } from "lucide-vue-next";
import type { ColumnDef, Column, Row, Table } from "@tanstack/vue-table";
import type { Product } from "@/types/product";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

// Créer une fonction composable pour utiliser i18n
export function useTranslation(): { t: ReturnType<typeof useI18n>["t"] } {
  // useI18n est maintenant correctement appelé dans un composable
  const { t } = useI18n();
  return { t };
}
// Helper function to create a sortable header
const SortableHeader = (label: string, column: Column<Product>): VNode => {
  return h("div", { class: "flex items-center space-x-2" }, [
    h("span", label),
    h(
      Button,
      {
        variant: "ghost",
        size: "sm",
        class: "h-8 w-8 p-0",
        onClick: () => column.toggleSorting(column.getIsSorted() === "asc"), // Toggle sorting
      },
      () =>
        // Display appropriate icon based on sort state
        column.getIsSorted() === "asc"
          ? h(ChevronUpIcon, { class: "h-4 w-4" })
          : column.getIsSorted() === "desc"
            ? h(ChevronDownIcon, { class: "h-4 w-4" })
            : h(ArrowUpDownIcon, { class: "h-4 w-4" }),
    ),
  ]);
};

// Table columns definition
export const getColumns = (): Array<ColumnDef<Product, unknown>> => {
  const { t } = useTranslation();

  return [
    {
      id: "select",
      enableSorting: false,
      enableHiding: false,
      header: ({ table }: { table: Table<Product> }) =>
        h(Checkbox, {
          checked: table.getIsAllRowsSelected(),
          "onUpdate:checked": () => table.toggleAllRowsSelected(),
          "aria-label": "Sélectionner tout",
          class: "translate-y-[2px]",
        }),
      cell: ({ row }: { row: Row<Product> }) =>
        h(Checkbox, {
          checked: row.getIsSelected(),
          "onUpdate:checked": () => row.toggleSelected(),
          "aria-label": "Sélectionner la ligne",
          class: "translate-y-[2px]",
        }),
    },
    {
      accessorKey: "name",
      header: ({ column }: { column: Column<Product> }) => SortableHeader(t("PRODUCT.NAME"), column),
      cell: ({ row }: { row: Row<Product> }): VNode => {
        const product = row.original;
        return h(TooltipProvider, {}, () =>
          h(
            Tooltip,
            {},
            {
              default: () => [
                h(TooltipTrigger, { asChild: true }, () => h("div", { class: "cursor-pointer" }, product.name)),
                h(TooltipContent, { class: "w-auto p-0" }, () =>
                  product.imagesUrl[0]
                    ? h("img", {
                        src: product.imagesUrl[0],
                        alt: product.name,
                        class: "w-32 h-32 object-contain rounded-md",
                      })
                    : h(
                        "div",
                        {
                          class: "w-32 h-32 bg-gray-100 flex items-center justify-center text-gray-400 rounded-md",
                        },
                        t("PRODUCT.NO_IMAGE"),
                      ),
                ),
              ],
            },
          ),
        );
      },
      sortingFn: (rowA: Row<Product>, rowB: Row<Product>): number => {
        const a = rowA.original.name.toLowerCase();
        const b = rowB.original.name.toLowerCase();
        return a.localeCompare(b);
      },
    },
    {
      accessorKey: "brand",
      header: ({ column }: { column: Column<Product> }) => SortableHeader(t("PRODUCT.BRAND"), column),
      sortingFn: "alphanumeric",
    },
    {
      accessorKey: "stock",
      header: ({ column }: { column: Column<Product> }) => SortableHeader(t("PRODUCT.STOCK"), column),
      sortingFn: "basic", // Basic sorting for numbers
    },
    {
      accessorKey: "price",
      header: ({ column }: { column: Column<Product> }) => SortableHeader(t("PRODUCT.PRICE"), column),
      cell: ({ row }: { row: Row<Product> }): VNode => {
        const price = row.getValue("price");
        const numericPrice = typeof price === "string" ? parseFloat(price) : price;
        const formattedPrice = !isNaN(numericPrice as number)
          ? new Intl.NumberFormat("fr-FR", {
              style: "currency",
              currency: "EUR",
            }).format(numericPrice as number)
          : "0,00 €";
        return h("div", {}, formattedPrice);
      },
      sortingFn: (rowA: Row<Product>, rowB: Row<Product>, columnId: string): number => {
        const a = parseFloat(rowA.getValue(columnId));
        const b = parseFloat(rowB.getValue(columnId));
        return a < b ? -1 : a > b ? 1 : 0;
      },
    },
    {
      accessorKey: "barcode",
      header: t("PRODUCT.EAN"),
      cell: ({ row }: { row: Row<Product> }): VNode => {
        const openBarcodeModal = inject("openBarcodeModal") as ((barcode: string) => void) | undefined;
        const barcode = row.getValue("barcode") as string;
        return h(
          "a",
          {
            "data-id": "Barcode",
            href: "#",
            class: "text-blue-500 underline",
            onClick: (e) => {
              e.preventDefault();
              if (openBarcodeModal) {
                openBarcodeModal(barcode);
              }
            },
          },
          t("PRODUCT.SHOW_BARCODE"),
        );
      },
    },
    {
      accessorKey: "catalogStatus",
      header: ({ column }: { column: Column<Product> }): VNode => {
        return h(
          "div",
          {
            class: "cursor-pointer select-none flex items-center justify-between",
            onClick: () => column.toggleSorting(),
          },
          [
            t("PRODUCT.CATALOG_STATUS"),
            h("span", { class: "ml-2 flex-shrink-0" }, [
              column.getIsSorted() === "asc"
                ? h(ChevronUpIcon, { class: "h-4 w-4" })
                : column.getIsSorted() === "desc"
                  ? h(ChevronDownIcon, { class: "h-4 w-4" })
                  : h(ArrowUpDownIcon, { class: "h-4 w-4" }),
            ]),
          ],
        );
      },
      cell: ({ row }: { row: Row<Product> }): VNode => {
        const product = row.original;
        const isInactive = product.price <= 0 || product.stock <= 0;
        const status = isInactive ? t("PRODUCT.INACTIVE") : product.catalogStatus || t("PRODUCT.ACTIVE");

        return h(
          "span",
          {
            class: {
              "text-green-500": status === "Actif",
              "text-red-500": status === "Inactif",
            },
          },
          status,
        );
      },
      sortingFn: (rowA: Row<Product>, rowB: Row<Product>): number => {
        const getStatus = (row: Row<Product>) => {
          const product = row.original;
          return product.price <= 0 || product.stock <= 0
            ? t("PRODUCT.INACTIVE")
            : product.catalogStatus || t("PRODUCT.ACTIVE");
        };
        const statusOrder = { [t("PRODUCT.ACTIVE")]: 1, [t("PRODUCT.INACTIVE")]: 0 };
        const a = getStatus(rowA);
        const b = getStatus(rowB);
        return statusOrder[b] - statusOrder[a];
      },
    },
    {
      accessorKey: "stockStatus",
      header: ({ column }: { column: Column<Product> }): VNode => {
        return SortableHeader(t("PRODUCT.STOCK_STATUS"), column);
      },
      cell: ({ row }: { row: Row<Product> }): VNode => {
        const stock = row.getValue("stock") as number;
        const status = stock > 0 ? t("PRODUCT.IN_STOCK") : t("PRODUCT.OUT_OF_STOCK");
        return h(
          "span",
          {
            class: status === t("PRODUCT.IN_STOCK") ? "text-green-500" : "text-red-500",
          },
          status,
        );
      },
      sortingFn: (rowA: Row<Product>, rowB: Row<Product>): number => {
        const stockA = rowA.getValue("stock") as number;
        const stockB = rowB.getValue("stock") as number;
        const a = stockA > 0 ? 1 : 0;
        const b = stockB > 0 ? 1 : 0;
        return a < b ? -1 : a > b ? 1 : 0;
      },
    },
    // Actions column
    {
      id: "actions",
      header: t("PRODUCT.ACTIONS"),
      cell: ({ row }: { row: Row<Product> }): VNode => {
        const openEditModal = inject("openEditModal") as ((product: Product) => void) | undefined;
        const product = row.original;
        return h(
          Button,
          {
            variant: "ghost",
            onClick: () => {
              if (openEditModal) {
                openEditModal(product);
              }
            },
          },
          () => h(FileEditIcon, { class: "h-4 w-4" }),
        );
      },
    },
  ];
};

// Typer la ref selectedProduct
export const selectedProduct = ref<Product | null>(null);

// Il faut créer une fonction qui renvoie les colonnes
// car on a besoin d'accéder à la fonction t() dans le contexte d'exécution
export const getProductColumns = (): ColumnDef<Product>[] => {
  const { t } = useTranslation();
  return [
    {
      id: "name",
      header: t("PRODUCT.NAME"),
      accessorKey: "name",
    },
    {
      id: "price",
      header: t("PRODUCT.PRICE"),
      accessorKey: "price",
    },
    {
      id: "stock",
      header: t("PRODUCT.STOCK"),
      accessorKey: "stock",
    },
    {
      id: "category",
      header: t("PRODUCT.CATEGORY"),
      accessorKey: "category",
    },
    {
      id: "actions",
      header: t("PRODUCT.ACTIONS"),
    },
  ];
};
