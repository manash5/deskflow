import { randomUUID } from "crypto";
import { Customer } from "../models/customer.model";
import { agentRepository } from "../repositories/agent.repository";
import { customerRepository } from "../repositories/customer.repository";
import { HttpError } from "../utils/httpError";

type CustomerInput = {
  name: string;
  email: string;
  company?: string;
  notes?: string;
};

function requireText(value: string | undefined, field: string) {
  const cleaned = (value || "").trim();
  if (!cleaned) {
    throw new HttpError(400, `${field} is required.`);
  }
  return cleaned;
}

export const customerService = {
  list() {
    return customerRepository.list().map((customer) => ({
      ...customer,
      agentCount: agentRepository.listByCustomer(customer.id).length,
    }));
  },

  get(id: string) {
    const customer = customerRepository.findById(id);
    if (!customer) {
      throw new HttpError(404, "Customer not found.");
    }
    return {
      ...customer,
      agents: agentRepository.listByCustomer(customer.id),
    };
  },

  create(input: CustomerInput): Customer {
    const now = new Date().toISOString();
    const customer: Customer = {
      id: randomUUID(),
      name: requireText(input.name, "name"),
      email: requireText(input.email, "email"),
      company: (input.company || "").trim(),
      notes: (input.notes || "").trim(),
      createdAt: now,
      updatedAt: now,
    };
    return customerRepository.save(customer);
  },

  update(id: string, input: Partial<CustomerInput>): Customer {
    const current = customerRepository.findById(id);
    if (!current) {
      throw new HttpError(404, "Customer not found.");
    }
    return customerRepository.save({
      ...current,
      name: input.name !== undefined ? requireText(input.name, "name") : current.name,
      email: input.email !== undefined ? requireText(input.email, "email") : current.email,
      company: input.company !== undefined ? input.company.trim() : current.company,
      notes: input.notes !== undefined ? input.notes.trim() : current.notes,
      updatedAt: new Date().toISOString(),
    });
  },

  remove(id: string) {
    if (!customerRepository.findById(id)) {
      throw new HttpError(404, "Customer not found.");
    }
    if (agentRepository.listByCustomer(id).length > 0) {
      throw new HttpError(409, "Remove this customer's agents first.");
    }
    customerRepository.remove(id);
  },
};
