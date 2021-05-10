"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.solveResist = void 0;
const tslib_1 = require("tslib");
const types_1 = require("./types");
const fs_1 = tslib_1.__importDefault(require("fs"));
const solver = require("javascript-lp-solver");
// https://stackoverflow.com/questions/175739/built-in-way-in-javascript-to-check-if-a-string-is-a-valid-number
function isNumeric(str) {
    return !isNaN(str) && // use type coercion to parse the _entirety_ of the string (`parseFloat` alone does not do this)...
        !isNaN(parseFloat(str)); // ...and ensure strings of whitespace fail
}
/**
 * Note, the user could ask us to solve for 2 rings (or 2 weapons)
 * Return a tuple of the stash tab its in and the Item ID
 */
function solveResist(items, solver_variables, solver_ints, slots, res) {
    var model = {
        "optimize": "price",
        "opType": "min",
        "constraints": {
            "fire": { "min": res.fire },
            "cold": { "min": res.cold },
            "lightning": { "min": res.lightning },
            "chaos": { "min": res.chaos },
            // One constraint per each "slot". Prevent there from being more than one thing assigned for each slot.
            "helmet": { "max": 0 },
            "chest": { "max": 0 },
            "gloves": { "max": 0 },
            "boots": { "max": 0 },
            // Accessory slots
            "amulet": { "max": 0 },
            "ring": { "max": 0 },
            "belt": { "max": 0 },
        },
        "options": {
            "tolerance": 0.10 //Get within 10% of optimal
        },
        "variables": solver_variables,
        "ints": solver_ints
    };
    // Set slot requirements
    for (const slot of slots) {
        model.constraints[slot].max += 1;
    }
    const results = solver.Solve(model);
    // Look up item solution
    let solved_items = [];
    for (const key of Object.keys(results)) {
        if (isNumeric(key)) {
            solved_items.push(items[parseInt(key)]);
        }
    }
    const solverResult = new types_1.SolverResult(results.feasible, solved_items);
    // Logging
    if (solverResult.feasible) {
        console.log(`Solution found for ${solverResult.price} chaos`);
        for (const item of solverResult.items) {
            console.log(`${item.slot} - ${item.price}c - ${item.item.name} - fire:${item.resists.fire} cold:${item.resists.cold} lightning:${item.resists.lightning} chaos:${item.resists.chaos}`);
        }
        console.log(`Total - fire:${solverResult.resists.fire} cold:${solverResult.resists.cold} lightning:${solverResult.resists.lightning} chaos:${solverResult.resists.chaos}`);
    }
    else {
        console.log("Solution Infeasible");
    }
    return solverResult;
}
exports.solveResist = solveResist;
if (typeof module !== 'undefined' && !module.parent) {
    // // this is the main module
    const stashes = JSON.parse(fs_1.default.readFileSync("./stashes.json", 'utf8'));
    console.log(`Loaded ${stashes.length} stashes from disk`);
    // Test some resist code
    // const solution = solveResist(stashes, ["helmet" as Slot, "ring" as Slot], 0);
    // const items = Array.from(solution.values());
    // console.log(`items: ${items.map(item => item.resists)}`);
    let items = [];
    let solver_variables = {};
    let solver_ints = {};
    // Item generation for solver
    let itemIndex = 0;
    for (const stash of stashes) {
        for (const item of stash.items) {
            const itemInfo = new types_1.ItemInfo(item, stash);
            items.push(itemInfo);
            // Also generate solver info
            solver_variables[itemIndex] = itemInfo.solver_info;
            // Prevent partial items from being used
            solver_ints[itemIndex] = 1;
            itemIndex++;
        }
    }
    let resGoal = new types_1.ResistInfo();
    resGoal.cold = 100;
    resGoal.lightning = 100;
    // Call the solver and interpret results.
    let result = solveResist(items, solver_variables, solver_ints, ["ring", "ring"], resGoal);
    console.log(result);
}
//# sourceMappingURL=solver.js.map