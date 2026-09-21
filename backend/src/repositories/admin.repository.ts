import { Admin } from "../models/admin.model";
import { jsonStore } from "./store.repository";

export const adminRepository = {
  findByEmail(email: string): Admin | undefined {
    return jsonStore
      .read()
      .admins.find((admin) => admin.email.toLowerCase() === email.toLowerCase());
  },

  findById(id: string): Admin | undefined {
    return jsonStore.read().admins.find((admin) => admin.id === id);
  },

  upsert(admin: Admin): Admin {
    jsonStore.update((draft) => {
      const index = draft.admins.findIndex((item) => item.id === admin.id);
      if (index === -1) {
        draft.admins.push(admin);
      } else {
        draft.admins[index] = admin;
      }
    });
    return admin;
  },
};
