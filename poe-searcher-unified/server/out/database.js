"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.addUser = exports.getUser = void 0;
const tslib_1 = require("tslib");
const credential_provider_ini_1 = require("@aws-sdk/credential-provider-ini");
const client_dynamodb_1 = require("@aws-sdk/client-dynamodb");
const bcrypt_1 = tslib_1.__importDefault(require("bcrypt"));
const dbClient = new client_dynamodb_1.DynamoDBClient({
    credentials: credential_provider_ini_1.fromIni({ profile: "poe-gearset-searcher" }),
    region: "us-east-1",
    endpoint: "https://dynamodb.us-east-1.amazonaws.com"
});
async function getUser(username) {
    const params = {
        TableName: "poe-gearset-users",
        Key: {
            "username": { S: username },
        }
    };
    const data = await dbClient.send(new client_dynamodb_1.GetItemCommand(params));
    console.log("success", data.Item);
    return data.Item;
}
exports.getUser = getUser;
async function addUser(username, password) {
    const hash = await bcrypt_1.default.hash(username, 10);
    const params = {
        TableName: "poe-gearset-users",
        Item: {
            "username": { S: username },
            "hash": { S: hash }
        }
    };
    try {
        const data = await dbClient.send(new client_dynamodb_1.PutItemCommand(params));
        console.log(data);
        return true;
    }
    catch (err) {
        console.error(err);
        return false;
    }
}
exports.addUser = addUser;
if (typeof module !== 'undefined' && !module.parent) {
    const username = "test";
    const password = "asdf";
    addUser(username, password).then((success) => {
        console.log(success);
    });
}
//# sourceMappingURL=database.js.map