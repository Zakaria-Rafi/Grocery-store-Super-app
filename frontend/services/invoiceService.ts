import { $fetch } from "ofetch";

export interface Invoice {
  id: string;
  createdAt: string;
  user: {
    id: string;
    name: string;
  };
  status: string;
  paymentStatus: string;
  paymentMethod: string;
  total: number;
  orderItems: Array<{
    id: string;
    quantity: number;
    price: number;
    product: {
      name: string;
    };
  }>;
}

export interface InvoiceResponse {
  id: string;
  date: string;
  buyer: {
    id: string;
    name: string;
  };
  orderStatus: string;
  paymentStatus: string;
  paymentMethod: string;
  amount: number;
  items: Array<{
    id: string;
    name: string;
    quantity: number;
    price: number;
  }>;
}

export const useInvoiceService = (): {
  fetchInvoices: () => Promise<InvoiceResponse[]>;
  fetchInvoicePDF: (id: string) => Promise<Blob>;
} => {
  const fetchInvoices = async (): Promise<InvoiceResponse[]> => {
    const response = await $fetch<Invoice[]>("/api/invoices");

    if (!Array.isArray(response)) {
      return [];
    }

    return response.map((invoice) => ({
      id: invoice.id,
      date: invoice.createdAt,
      buyer: {
        id: invoice.user.id,
        name: invoice.user.name,
      },
      orderStatus: invoice.status,
      paymentStatus: invoice.paymentStatus,
      paymentMethod: invoice.paymentMethod,
      amount: invoice.total,
      items: invoice.orderItems.map((item) => ({
        id: item.id,
        name: item.product.name,
        quantity: item.quantity,
        price: item.price,
      })),
    }));
  };

  const fetchInvoicePDF = async (id: string): Promise<Blob> => {
    return await $fetch(`/api/invoices/${id}/pdf`, {
      responseType: "blob",
    });
  };

  return {
    fetchInvoices,
    fetchInvoicePDF,
  };
};
