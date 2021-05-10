import { PathOfExile } from "@klayver/poe-api-wrappers";
import bcrypt from 'bcrypt';

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

export class ItemInfo {
  item: Item;
  stash: Stash;
  resists: ResistInfo;
  price: number;
  unit: PriceUnit;
  slot: Slot;

  solver_info: SolverInfo;
  
  constructor(item: Item, stash: Stash) {
    this.item = item;
    this.stash = stash;
    this.resists = itemRes(item);
    [this.price, this.unit] = itemPrice(item, stash);
    this.slot = itemSlot(item);
    this.solver_info = new SolverInfo(this.price, this.unit, this.resists, this.slot);
  }
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

export class SolverInfo {
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

	constructor(price: number, unit: PriceUnit, resists: ResistInfo, slot: Slot) {
		if (unit === PriceUnit.Exalted) {
			// Rough exalt to chaos conversion.
			this.price = 160 * price;
		} else {
			this.price = price;
		}
		// Resists
		this.fire = resists.fire;
		this.cold = resists.cold;
		this.lightning = resists.lightning;
		this.chaos = resists.chaos;
		// Slot
		this.helmet = 0;
		this.chest = 0;
		this.gloves = 0;
		this.boots = 0;
		this.amulet = 0;
		this.ring = 0;
		this.belt = 0;
		switch (slot) {
			case Slot.Helmet:
				this.helmet = 1;
				break;
			case Slot.Chest:
				this.chest = 1;
				break;
			case Slot.Gloves:
				this.gloves = 1;
				break;
			case Slot.Boots:
				this.boots = 1;
				break;
			case Slot.Amulet:
				this.amulet = 1;
				break;
			case Slot.Ring:
				this.ring = 1;
				break;
			case Slot.Belt:
				this.belt = 1;
				break;
			default:
				// console.error("INVALID TYPE", slot);
				break;
		}
	}
}

export class SolverResult {
  feasible: boolean;
  price: number;
  resists: ResistInfo;
  items: ItemInfo[];

  constructor(feasible: boolean, items: ItemInfo[]) {
    this.feasible = feasible;
    this.price = 0; // Can't use result.result because that's 0 if the search failed.
    this.items = items;
    this.resists = new ResistInfo();
    for (const item of items) {
      this.resists.add(item.resists);
      this.price += item.solver_info.price; // Chaos estimate.
    }
  }
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

export class User {
  username = "";
  hash = "";
  savedData?: SavedData = undefined;

  async validatePassword(password: string): Promise<boolean> {
    return await bcrypt.compare(password, this.hash);
  }
}

/**
 * If the item already has this information, just pull it from that instead 
 * 
 * @param item The item we want resistance information for
 */
function itemRes(item: Item): ResistInfo {
  // ---- Resist Type Mods ----
  // +##% to Fire/Cold/Lightning/Chaos Resistance
  // +##% to all Elemental Resistances
  // multi resists:
  // +##% to Fire and Cold Resistances
  // +##% to Fire and Lightning Resistances
  // +##% to Cold and Lightning Resistances
  // veiled resists: 
  // +##% to Fire and Chaos Resistances
  // +##% to Cold and Chaos Resistances
  // +##% to Lightning and Chaos Resistances
  // ---- Other mods ----
  // +## to maximum Life
  const elements = ['Fire', 'Cold', 'Lightning', 'Chaos']
  const ele_regex: [string, RegExp][] = elements.map(elem => [elem, new RegExp(String.raw`\+(\d+)%.*${elem}.*Resist`)])
  const allres_regex = new RegExp(String.raw`\+(\d+)% to all Elemental Resistances`)

	const res = new ResistInfo();
	item.explicitMods?.forEach(mod => {
		for (const [elem, regex] of ele_regex) {
			const eleres = mod.match(regex);
			if (eleres) {
				if (elem === "Fire")
					res.fire += parseInt(eleres[1]);
				else if (elem === "Cold")
					res.cold += parseInt(eleres[1]);
				else if (elem === "Lightning")
					res.lightning += parseInt(eleres[1]);
				else
					res.chaos += parseInt(eleres[1]);
			}
		}
		// check for the "All Elemental Resistance" mod
		const allres = mod.match(allres_regex);
		if (allres) {
			res.fire += parseInt(allres[1]);
			res.cold += parseInt(allres[1]);
			res.lightning += parseInt(allres[1]);
		}
	});

	// Also check the implicits
	item.implicitMods?.forEach(mod => {
		for (const [elem, regex] of ele_regex) {
			const eleres = mod.match(regex);
			if (eleres) {
				if (elem === "Fire")
					res.fire += parseInt(eleres[1]);
				else if (elem === "Cold")
					res.cold += parseInt(eleres[1]);
				else if (elem === "Lightning")
					res.lightning += parseInt(eleres[1]);
				else
					res.chaos += parseInt(eleres[1]);
			}
		}
		// check for the "All Elemental Resistance" mod
		const allres = mod.match(allres_regex);
		if (allres) {
			res.fire += parseInt(allres[1]);
			res.cold += parseInt(allres[1]);
			res.lightning += parseInt(allres[1]);
		}
	})

	// console.log(res);
	return res;
}

function itemPrice(item: Item, stash: Stash): [number, PriceUnit] {
  // For bulk priced items, the stash will have a property "stash" (this can be overriden by individual item notes)
  // "~price 6 chaos"
  // "~b/o 33 chaos"
  // For individually priced items, look in the item property "note"  (fractions are allowed)
  // "~price 4 chaos"
  // "~b/o 10 chaos"
  // "~b/o .8 exalted"
  // "~price 1.2 exalted"
  
  const price_regex = new RegExp(String.raw`~(?:price|b\/o) (\d*\.?\d+) (chaos|exalted)`);

  let price = 0;
  let unit = PriceUnit.Undefined;

  // Check stash price first
  const stash_price = stash.stash?.match(price_regex);
  if (stash_price) {
    price = parseFloat(stash_price[1]);
    unit = stash_price[2] as PriceUnit;
  }

  // Check item prices, these override stash pries
  const item_price = item.note?.match(price_regex);
  if (item_price) {
    price = parseFloat(item_price[1]);
    unit = item_price[2] as PriceUnit;
  }

  // console.log(`${item.name} - ${price} ${unit}`);
  return [price, unit];
}

function itemSlot(item: Item): Slot {
  for (const category of (item.extended.subcategories ?? [])) {
    if (Object.values(Slot).includes(category as Slot)) {
      return category as Slot;
    }
  }
  return Slot.Undefined;
}