import { Customer } from "../models/customer.model";
import { jsonStore } from "./store.repository";

export const customerRepository = {
  list(): Customer[] {
    return [...jsonStore.read().customers].sort((a, b) =>
      b.createdAt.localeCompare(a.createdAt),
    );
  },

  findById(id: string): Customer | undefined {
    return jsonStore.read().customers.find((customer) => customer.id === id);
  },

  save(customer: Customer): Customer {
    jsonStore.update((draft) => {
      const index = draft.customers.findIndex((item) => item.id === customer.id);
      if (index === -1) {
        draft.customers.push(customer);
      } else {
        draft.customers[index] = customer;
      }
    });
    return customer;
  },

  remove(id: string): void {
    jsonStore.update((draft) => {
      draft.customers = draft.customers.filter((item) => item.id !== id);
    });
  },
};
