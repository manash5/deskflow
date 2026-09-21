import fs from "fs";
import path from "path";
import { Agent } from "../models/agent.model";
import { Admin } from "../models/admin.model";
import { ChatTurn } from "../models/chat-turn.model";
import { Customer } from "../models/customer.model";

export type DataStore = {
  admins: Admin[];
  customers: Customer[];
  agents: Agent[];
  chatTurns: ChatTurn[];
};

const DATA_DIR = path.resolve(__dirname, "../../data");
const STORE_PATH = path.join(DATA_DIR, "store.json");

const emptyStore = (): DataStore => ({
  admins: [],
  customers: [],
  agents: [],
  chatTurns: [],
});

export class JsonStore {
  private cache: DataStore | null = null;

  read(): DataStore {
    if (this.cache) {
      return this.cache;
    }
    if (!fs.existsSync(STORE_PATH)) {
      this.cache = emptyStore();
      return this.cache;
    }
    const raw = fs.readFileSync(STORE_PATH, "utf8");
    const next: DataStore = { ...emptyStore(), ...JSON.parse(raw) };
    this.cache = next;
    return next;
  }

  write(next: DataStore): DataStore {
    fs.mkdirSync(DATA_DIR, { recursive: true });
    fs.writeFileSync(STORE_PATH, JSON.stringify(next, null, 2));
    this.cache = next;
    return next;
  }

  update(mutator: (draft: DataStore) => void): DataStore {
    const draft: DataStore = structuredClone(this.read());
    mutator(draft);
    return this.write(draft);
  }
}

export const jsonStore = new JsonStore();
