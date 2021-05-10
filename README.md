# PoE Gearset Searcher
team: oof
members: Evan Hruskar

Technologies:
- Vue
- NodeJS
- Typescript
- AWS Lightsail
- AWS DynamoDB

Live Website (as of 5/10/2021): http://107.22.52.131/

## Description
The popular video game Path Of Exile is an ARPG developed by Grinding Gear Games (GGG) and released in 2013. It has a trading system and in-game currency. Because of this a large user-driven economy has flourished.

The primary way most users interact with this economy is through the official trading platform [pathofexile.com/trade](https://www.pathofexile.com/trade/search/Ultimatum). There are other community trade sites as well like [poe.ninja](https://poe.ninja/) and [poe.trade](https://poe.trade/). One commonality between all of these sites is that they only allow you to search for a single item at a time.

A requirement for endgame PoE is that your character's elemental resistances are capped at 75% for Fire, Cold, and Lightning. Every gear slot (Helmet, Body Armour, Boots, etc...) can potentially have resistances on it, but all that we require is that the total sum is 75% at the end. It’s impossible to query for multiple pieces of gear at the same time with any of these trade sites. I wanted to make a website which addressed this.

In the process of building this, what I discovered is that doing a query like this and optimizing for the lowest cost is an NP-Complete problem. We're trying to minimize the total cost of our gear while we're subject to the following constraints
1. We meet or exceed every resist target (fire, cold, lightning, chaos)
2. Each gear slot can only have one item in it.

While these contraints sound simple enough, it actually makes a pretty complicated problem to solve efficiently. The problem it has the most similarity to is the [Cutting Stock Problem](https://en.wikipedia.org/wiki/Cutting_stock_problem). Essentially, they're trying to minimize waste while subject to the constraint that they meet some "quota" of stock cuts. However, it doesn't have an additional constrant like "each stock cut can only be done once" and in the cutting stock problem, there aren't hundreds of thousands of different cuts.

This is the part of the program I spent the longest time on, but I eventually learned about numerical methods which can efficiently solve some NP-Complete problems. It's called [linear programming](https://en.wikipedia.org/wiki/Linear_programming). I was able to formulate this gearset optimization problem as a linear problem and then used an LP solver to get reasonably fast solutions. I have the tolerance configured to 10%, so no matter what result it gives back, know that it's within 10% of the global minimum.

### Run Dev Build
`yarn server` in server/  (Restart this once it populates the internal store of stash tabs -- otherwise solver may be weird)
`yarn serve` in client/   (`localhost:8080` -- will proxy API requests to `localhost:3000`)
Access `localhost:8080` to interact with the website.

### Deploy to AWS
Uses the [shared credential file](https://docs.aws.amazon.com/sdk-for-javascript/v2/developer-guide/loading-node-credentials-shared.html). Configure it with an IAM account that has full access to DynamoDB.
DynamoDB needs a table `poe-gearset-users`.