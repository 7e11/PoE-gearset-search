"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.User = exports.SolverResult = exports.SolverInfo = exports.ResistInfo = exports.ItemInfo = exports.PriceUnit = exports.Slot = void 0;
const tslib_1 = require("tslib");
const bcrypt_1 = tslib_1.__importDefault(require("bcrypt"));
var Slot;
(function (Slot) {
    // Armour
    Slot["Helmet"] = "helmet";
    Slot["Chest"] = "chest";
    Slot["Gloves"] = "gloves";
    Slot["Boots"] = "boots";
    // Accessories
    Slot["Ring"] = "ring";
    Slot["Amulet"] = "amulet";
    Slot["Belt"] = "belt";
    // Weapons (omitted)
    Slot["Undefined"] = "undefined";
})(Slot = exports.Slot || (exports.Slot = {}));
var PriceUnit;
(function (PriceUnit) {
    PriceUnit["Chaos"] = "chaos";
    PriceUnit["Exalted"] = "exalted";
    PriceUnit["Undefined"] = "undefined";
})(PriceUnit = exports.PriceUnit || (exports.PriceUnit = {}));
class ItemInfo {
    constructor(item, stash) {
        this.item = item;
        this.stash = stash;
        this.resists = itemRes(item);
        [this.price, this.unit] = itemPrice(item, stash);
        this.slot = itemSlot(item);
        this.solver_info = new SolverInfo(this.price, this.unit, this.resists, this.slot);
    }
}
exports.ItemInfo = ItemInfo;
class ResistInfo {
    constructor() {
        this.fire = 0;
        this.cold = 0;
        this.lightning = 0;
        this.chaos = 0;
    }
    sum() {
        return this.fire + this.cold + this.lightning + this.chaos;
    }
    add(other) {
        this.fire += other.fire;
        this.cold += other.cold;
        this.lightning += other.lightning;
        this.chaos += other.chaos;
    }
}
exports.ResistInfo = ResistInfo;
class SolverInfo {
    constructor(price, unit, resists, slot) {
        if (unit === PriceUnit.Exalted) {
            // Rough exalt to chaos conversion.
            this.price = 160 * price;
        }
        else {
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
exports.SolverInfo = SolverInfo;
class SolverResult {
    constructor(feasible, items) {
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
exports.SolverResult = SolverResult;
class User {
    constructor() {
        this.username = "";
        this.hash = "";
        this.savedData = undefined;
    }
    async validatePassword(password) {
        return await bcrypt_1.default.compare(password, this.hash);
    }
}
exports.User = User;
/**
 * If the item already has this information, just pull it from that instead
 *
 * @param item The item we want resistance information for
 */
function itemRes(item) {
    var _a, _b;
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
    const elements = ['Fire', 'Cold', 'Lightning', 'Chaos'];
    const ele_regex = elements.map(elem => [elem, new RegExp(String.raw `\+(\d+)%.*${elem}.*Resist`)]);
    const allres_regex = new RegExp(String.raw `\+(\d+)% to all Elemental Resistances`);
    const res = new ResistInfo();
    (_a = item.explicitMods) === null || _a === void 0 ? void 0 : _a.forEach(mod => {
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
    (_b = item.implicitMods) === null || _b === void 0 ? void 0 : _b.forEach(mod => {
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
    // console.log(res);
    return res;
}
function itemPrice(item, stash) {
    // For bulk priced items, the stash will have a property "stash" (this can be overriden by individual item notes)
    // "~price 6 chaos"
    // "~b/o 33 chaos"
    // For individually priced items, look in the item property "note"  (fractions are allowed)
    // "~price 4 chaos"
    // "~b/o 10 chaos"
    // "~b/o .8 exalted"
    // "~price 1.2 exalted"
    var _a, _b;
    const price_regex = new RegExp(String.raw `~(?:price|b\/o) (\d*\.?\d+) (chaos|exalted)`);
    let price = 0;
    let unit = PriceUnit.Undefined;
    // Check stash price first
    const stash_price = (_a = stash.stash) === null || _a === void 0 ? void 0 : _a.match(price_regex);
    if (stash_price) {
        price = parseFloat(stash_price[1]);
        unit = stash_price[2];
    }
    // Check item prices, these override stash pries
    const item_price = (_b = item.note) === null || _b === void 0 ? void 0 : _b.match(price_regex);
    if (item_price) {
        price = parseFloat(item_price[1]);
        unit = item_price[2];
    }
    // console.log(`${item.name} - ${price} ${unit}`);
    return [price, unit];
}
function itemSlot(item) {
    var _a;
    for (const category of ((_a = item.extended.subcategories) !== null && _a !== void 0 ? _a : [])) {
        if (Object.values(Slot).includes(category)) {
            return category;
        }
    }
    return Slot.Undefined;
}
//# sourceMappingURL=types.js.map