"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const express_1 = tslib_1.__importDefault(require("express"));
const poe_api_wrappers_1 = require("@klayver/poe-api-wrappers");
const types_1 = require("./types");
const fs_1 = tslib_1.__importDefault(require("fs"));
const solver_1 = require("./solver");
const passport_1 = tslib_1.__importDefault(require("passport"));
const passport_local_1 = require("passport-local");
const database_1 = require("./database");
// Configure Passport - http://www.passportjs.org/docs/username-password/
// https://www.npmjs.com/package/passport
passport_1.default.use(new passport_local_1.Strategy(function (username, password, done) {
    console.log(`Authenticating ${username} ${password}`);
    database_1.getUser(username).then(user => {
        if (!user) {
            return done(null, false, { message: 'Incorrect username.' });
        }
        if (!user.validatePassword(password)) {
            return done(null, false, { message: 'Incorrect password.' });
        }
        return done(null, user);
    });
}));
passport_1.default.serializeUser(function (user, done) {
    done(null, user.username);
});
passport_1.default.deserializeUser(async function (username, done) {
    const user = await database_1.getUser(username);
    done(null, user);
});
poe_api_wrappers_1.PathOfExile.Settings.userAgent = "PoE Gearset Searcher, hruskar.evan@gmail.com";
// PathOfExile.Settings.sessionId = "y0uRs3ss10n1dh3r3";
const app = express_1.default();
const port = process.env.PORT || 3000;
// Load the static files in dist. This should be done after a "node run build", to build the vue app.
app.use(express_1.default.static('./dist'));
app.use(express_1.default.json());
app.use(require('cookie-parser')());
app.use(require('body-parser').urlencoded({ extended: true }));
app.use(require('express-session')({ secret: 'keyboard cat', resave: true, saveUninitialized: true }));
app.use(passport_1.default.initialize());
app.use(passport_1.default.session());
// ----------------
// ---- ROUTES ----
// ----------------
app.post('/api/login', passport_1.default.authenticate('local'), function (req, res) {
    res.send(true);
});
app.get('/api/sample', async function (req, res, next) {
    let chunk = await poe_api_wrappers_1.PathOfExile.PublicStashTabs.getChunk(nextId);
    console.log(`This chunk has ${chunk.stashes.length} stashes.`);
    res.send(chunk);
});
app.post('/api/solve', function (req, res, next) {
    const resists = req.body.resists;
    const slots = req.body.slots;
    let result = solver_1.solveResist(items, solver_variables, solver_ints, slots, resists);
    res.send(result);
});
app.post('/api/register', function (req, res, next) {
    const username = req.body.username;
    if (database_1.getUser(username) === undefined) {
    }
});
app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`);
});
// --------------------------------
// ---- Populate Stash Storage ----
// --------------------------------
let intervalId;
const maxItems = 20000;
let stashes = [];
let items = [];
let solver_variables = {};
let solver_ints = {};
// If we have a textfile backup, then just load that and call it a day
if (fs_1.default.existsSync("./stashes.json")) {
    stashes = JSON.parse(fs_1.default.readFileSync("./stashes.json", 'utf8'));
    console.log(`Loaded ${stashes.length} stashes from disk`);
    // GENERATE ITEMINFO for everything in the stahes.
    generateItems(stashes);
}
else {
    // Get more tabs every 5 seconds
    intervalId = setInterval(populateTabs, 5 * 1000);
}
// Initial chunk -- 5/7/2021 1:25am
let nextId = "1167038414-1173383980-1131505809-1268338606-1217027474";
async function populateTabs() {
    if (items.length >= maxItems) {
        console.log(`Populated\t${items.length} items`);
        // TEMPORARY CODE -- Save our stashes to a file.
        fs_1.default.writeFileSync('stashes.json', JSON.stringify(stashes));
        clearInterval(intervalId);
        return;
    }
    let chunk = await poe_api_wrappers_1.PathOfExile.PublicStashTabs.getChunk(nextId);
    // If we get the same ID back, it means we're querying the API too fast
    if (nextId === chunk.nextChangeId) {
        console.log(`Chunk ID duplicate ${nextId}, skipping.`);
        return;
    }
    // Set the nextId
    nextId = chunk.nextChangeId;
    const sizeBytes = Buffer.byteLength(JSON.stringify(chunk));
    // Sort out everything thats not equipable. item -> extended -> category
    // chunk.stashes[0].items[0].extended.subcategories?[0] == "helmet"
    // Valid categories: "armour" | "accessories" | "weapons"
    // Valid things in subcategories: "helmet" | "chest" | "gloves" | "boots" | "ring" | "amulet" | "belt" | "shield"
    //  Weapons: "staff" | "quiver" | "warstaff" + many many more.
    // Filter out non-item stashes, and those not in ultimatum.
    stashes = stashes.filter(stash => ["PremiumStash", "QuadStash"].includes(stash.stashType) && stash.league === "Ultimatum");
    for (const stash of chunk.stashes) {
        stash.items = stash.items.filter(item => {
            var _a;
            const itemInfo = new types_1.ItemInfo(item, stash);
            // First filter out all items that aren't on the of types we're looking for.
            // "weapons" is also a reasonable addition, but it's filtered out because the subcategories are intense.
            let isEquipable = ["armour", "accessories"].includes(item.extended.category);
            // Also filter out items which have no life or resist.
            // FIXME: later, filter out items which don't meet a threshold of resist or life. (Or maybe order by value and remove bad ones.)
            let hasMods = (_a = item.explicitMods) === null || _a === void 0 ? void 0 : _a.some(mod => mod.indexOf("Resistance") > 0 || mod.indexOf("maximum Life") > 0);
            // FIXME: Also check the implicit mods (maybe?)
            // Get rid of all unique items, just too many landmines and I can't realistically deal with them all.
            let isUnique = 'flavourText' in item;
            return itemInfo.slot !== types_1.Slot.Undefined && itemInfo.unit !== types_1.PriceUnit.Undefined && itemInfo.resists.sum() > 0 && !isUnique;
        });
    }
    // Now filter out every stash that has no items
    chunk.stashes = chunk.stashes.filter(stash => stash.items.length > 0);
    const filterSize = Buffer.byteLength(JSON.stringify(chunk));
    // Add the final stashes to our stash array
    stashes.push(...chunk.stashes);
    // Add all the items
    generateItems(stashes);
    // Log size reduction and item data.
    console.log(`${nextId}\t${sizeBytes / 1000000}MB -> ${filterSize / 1000000}MB\t${items.length} items\t${chunk.stashes.length} stashes`);
}
function generateItems(stashes) {
    // Add all the items
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
}
//# sourceMappingURL=server.js.map