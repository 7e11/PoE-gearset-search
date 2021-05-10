import { Stash, Item, Slot, ItemInfo, ResistInfo, PriceUnit, SolverResult } from "./types"
import fs from 'fs';
const solver: any = require("javascript-lp-solver");

// https://stackoverflow.com/questions/175739/built-in-way-in-javascript-to-check-if-a-string-is-a-valid-number
function isNumeric(str: string): boolean {
  return !isNaN(str as unknown as number) && // use type coercion to parse the _entirety_ of the string (`parseFloat` alone does not do this)...
         !isNaN(parseFloat(str)) // ...and ensure strings of whitespace fail
}

/**
 * Note, the user could ask us to solve for 2 rings (or 2 weapons)
 * Return a tuple of the stash tab its in and the Item ID
 */
export function solveResist(items: ItemInfo[], solver_variables: any, solver_ints: any, slots: Slot[], res: ResistInfo): SolverResult {
	var model: any = {
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
			"tolerance": 0.10	 //Get within 10% of optimal
		},
		"variables": solver_variables,
		"ints": solver_ints
	};

	// Set slot requirements
	for (const slot of slots) {
		model.constraints[slot as string].max += 1;
	}

	const results = solver.Solve(model);

	// Look up item solution
	let solved_items: ItemInfo[] = [];
	for (const key of Object.keys(results)) {
		if (isNumeric(key)) {
			solved_items.push(items[parseInt(key)]);
		}
	}

	const solverResult = new SolverResult(results.feasible, solved_items);

	// Logging
	if (solverResult.feasible) {
		console.log(`Solution found for ${solverResult.price} chaos`);
		for (const item of solverResult.items) {
			console.log(`${item.slot} - ${item.price}c - ${item.item.name} - fire:${item.resists.fire} cold:${item.resists.cold} lightning:${item.resists.lightning} chaos:${item.resists.chaos}`);
		}
		console.log(`Total - fire:${solverResult.resists.fire} cold:${solverResult.resists.cold} lightning:${solverResult.resists.lightning} chaos:${solverResult.resists.chaos}`)
	} else {
		console.log("Solution Infeasible");
	}	

	return solverResult;
}

if (typeof module !== 'undefined' && !module.parent) {
	// // this is the main module
	const stashes: Stash[] = JSON.parse(fs.readFileSync("./stashes.json", 'utf8'));
	console.log(`Loaded ${stashes.length} stashes from disk`);

	// Test some resist code
	// const solution = solveResist(stashes, ["helmet" as Slot, "ring" as Slot], 0);
	// const items = Array.from(solution.values());
	// console.log(`items: ${items.map(item => item.resists)}`);

	let items: ItemInfo[] = [];
	let solver_variables: any = {};
	let solver_ints: any = {};

	// Item generation for solver
	let itemIndex = 0;
  for (const stash of stashes) {
    for (const item of stash.items) {
      const itemInfo = new ItemInfo(item, stash);
      items.push(itemInfo);
      // Also generate solver info
      solver_variables[itemIndex] = itemInfo.solver_info;
      // Prevent partial items from being used
      solver_ints[itemIndex] = 1;
			itemIndex++;
    }
  }

	let resGoal = new ResistInfo();
	resGoal.cold = 100;
	resGoal.lightning = 100;

	// Call the solver and interpret results.
	let result = solveResist(items, solver_variables, solver_ints, ["ring", "ring"] as Slot[], resGoal);
	console.log(result);
}
