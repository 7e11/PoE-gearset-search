import express from 'express';
import { PathOfExile } from "@klayver/poe-api-wrappers";
import {Stash, Item, Slot, ItemInfo, ResistInfo, PriceUnit, User } from "./types";
import fs from 'fs';
import { solveResist } from './solver';
import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import {getUser} from './database';



// Configure Passport - http://www.passportjs.org/docs/username-password/
// https://www.npmjs.com/package/passport
passport.use(new LocalStrategy(
  function(username, password, done) {
    console.log(`Authenticating ${username} ${password}`);
    getUser(username).then(user => {
      if (!user) {
        return done(null, false, { message: 'Incorrect username.' });
      }
      if (!user.validatePassword(password)) {
        return done(null, false, { message: 'Incorrect password.' });
      }
      return done(null, user);
    })
  }
));

passport.serializeUser(function(user: any, done) {
  done(null, user.username);
});
 
passport.deserializeUser(async function(username: string, done) {
  const user = await getUser(username);
  done(null, user);
});

PathOfExile.Settings.userAgent = "PoE Gearset Searcher, hruskar.evan@gmail.com";
// PathOfExile.Settings.sessionId = "y0uRs3ss10n1dh3r3";

const app = express()
const port = process.env.PORT || 3000

// Load the static files in dist. This should be done after a "node run build", to build the vue app.
app.use(express.static('./dist'))
app.use(express.json());
app.use(require('cookie-parser')());
app.use(require('body-parser').urlencoded({ extended: true }));
app.use(require('express-session')({ secret: 'keyboard cat', resave: true, saveUninitialized: true }));
app.use(passport.initialize());
app.use(passport.session());

// ----------------
// ---- ROUTES ----
// ----------------
app.post('/api/login', passport.authenticate('local'), function(req, res) {
  res.send(true);
});

app.get('/api/sample', async function(req, res, next) {
  let chunk = await PathOfExile.PublicStashTabs.getChunk(nextId);
  console.log(`This chunk has ${chunk.stashes.length} stashes.`);
  res.send(chunk);
})

app.post('/api/solve', function(req, res, next) {
  const resists: ResistInfo = req.body.resists;
  const slots: Slot[] = req.body.slots;

  let result = solveResist(items, solver_variables, solver_ints, slots, resists);

  res.send(result);
})

app.post('/api/register', function(req, res, next) {
  const username = req.body.username;
  if (getUser(username) === undefined) {

  }
})

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})


// --------------------------------
// ---- Populate Stash Storage ----
// --------------------------------
let intervalId: NodeJS.Timeout;
const maxItems = 20_000;
let stashes: Stash[] = [];
let items: ItemInfo[] = [];

let solver_variables: any = {};
let solver_ints: any = {};

// If we have a textfile backup, then just load that and call it a day
if (fs.existsSync("./stashes.json")) {
  stashes = JSON.parse(fs.readFileSync("./stashes.json", 'utf8'));
  console.log(`Loaded ${stashes.length} stashes from disk`);
  // GENERATE ITEMINFO for everything in the stahes.
  generateItems(stashes);
} else {
  // Get more tabs every 5 seconds
  intervalId = setInterval(populateTabs, 5 * 1000)
}


// Initial chunk -- 5/7/2021 1:25am
let nextId = "1167038414-1173383980-1131505809-1268338606-1217027474";

async function populateTabs() {
  if (items.length >= maxItems) {
    console.log(`Populated\t${items.length} items`);
    // TEMPORARY CODE -- Save our stashes to a file.
    fs.writeFileSync('stashes.json', JSON.stringify(stashes));
    clearInterval(intervalId);
    return;
  }

  let chunk = await PathOfExile.PublicStashTabs.getChunk(nextId);
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
  stashes = stashes.filter(stash => ["PremiumStash", "QuadStash"].includes(stash.stashType) && stash.league === "Ultimatum")

  for (const stash of chunk.stashes) {
    stash.items = stash.items.filter(item => {
      const itemInfo = new ItemInfo(item, stash);

      // First filter out all items that aren't on the of types we're looking for.
      // "weapons" is also a reasonable addition, but it's filtered out because the subcategories are intense.
      let isEquipable = ["armour", "accessories"].includes(item.extended.category);

      // Also filter out items which have no life or resist.
      // FIXME: later, filter out items which don't meet a threshold of resist or life. (Or maybe order by value and remove bad ones.)
      let hasMods = item.explicitMods?.some(mod => mod.indexOf("Resistance") > 0 || mod.indexOf("maximum Life") > 0);
      // FIXME: Also check the implicit mods (maybe?)
      
      // Get rid of all unique items, just too many landmines and I can't realistically deal with them all.
      let isUnique = 'flavourText' in item;

      return itemInfo.slot !== Slot.Undefined && itemInfo.unit !== PriceUnit.Undefined && itemInfo.resists.sum() > 0 && !isUnique;
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
  console.log(`${nextId}\t${sizeBytes/1_000_000}MB -> ${filterSize/1_000_000}MB\t${items.length} items\t${chunk.stashes.length} stashes`)
}

function generateItems(stashes: Stash[]) {
  // Add all the items
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
}