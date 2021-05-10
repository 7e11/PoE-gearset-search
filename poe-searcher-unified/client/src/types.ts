import { PathOfExile } from "@klayver/poe-api-wrappers";
// import bcrypt from 'bcrypt';

export type Stash = PathOfExile.PublicStashTabs.Stash;
export type Item = PathOfExile.Shared.Item.Item;

export enum Slot {
  // Armour
  Helmet = "helmet",
  Chest = "chest",
  Gloves = "gloves",
  Boots = "boots",
  // Accessories
  Ring = "ring",
  Amulet = "amulet",
  Belt = "belt",
  // Weapons (omitted)
  Undefined = "undefined"
}

export enum PriceUnit {
  Chaos = "chaos",
  Exalted = "exalted",
  Undefined = "undefined",
}

export interface ItemInfo {
  item: Item;
  stash: Stash;
  resists: ResistInfo;
  price: number;
  unit: PriceUnit;
  slot: Slot;
  solver_info: SolverInfo;
}

export class ResistInfo {
  fire: number;
  cold: number;
  lightning: number;
  chaos: number;

  constructor() {
    this.fire = 0;
    this.cold = 0;
    this.lightning = 0;
    this.chaos = 0;
  }

  sum(): number {
    return this.fire + this.cold + this.lightning + this.chaos;
  }

  add(other: ResistInfo): void {
    this.fire += other.fire;
    this.cold += other.cold;
    this.lightning += other.lightning;
    this.chaos += other.chaos;
  }
}

export interface SolverInfo {
  // Price (chaos)
	price: number;
  // Resists
	fire: number;
	cold: number;
	lightning: number;
	chaos: number;
	// Slot -- armour
	helmet: number;
	chest: number;
	gloves: number;
	boots: number;
	// Slot -- accessories
	amulet: number;
	ring: number;
	belt: number;
}

export interface SolverResult {
  feasible: boolean;
  price: number;
  resists: ResistInfo;
  items: ItemInfo[];
}

/**
 * ONLY FOR FRONTEND -- For the Gearviewer
 */
export interface ItemStore {
  slotName: string;
  itemInfo: ItemInfo | undefined;
  selected: boolean;
}

export interface SavedData {
  // The resists we're searching for
  resists: ResistInfo;
  // The result we ended up with.
  result: SolverResult;
}

export interface User {
  username: string;
  hash: string;
  savedData?: SavedData;
}