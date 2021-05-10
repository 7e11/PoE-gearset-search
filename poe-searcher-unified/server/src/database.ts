import { fromIni } from "@aws-sdk/credential-provider-ini";
import { DynamoDBClient, GetItemCommand, PutItemCommand } from "@aws-sdk/client-dynamodb";
import { User } from './types';
import bcrypt from 'bcrypt';

const dbClient = new DynamoDBClient({
	credentials: fromIni({profile: "poe-gearset-searcher"}),
	region: "us-east-1",
	endpoint: "https://dynamodb.us-east-1.amazonaws.com"
});

export async function getUser(username: string): Promise<User | undefined> {
	const params = {
		TableName : "poe-gearset-users",
    Key: {
			"username": {S: username},
		}
	};

	const data = await dbClient.send(new GetItemCommand(params));
	console.log("success", data.Item);
	return data.Item as User | undefined;
}

export async function addUser(username: string, password: string): Promise<boolean> {
	const hash = await bcrypt.hash(username, 10);
	const params = {
		TableName : "poe-gearset-users",
		Item: {
			"username": {S: username},
			"hash": {S: hash}
		}
	};

  try {
    const data = await dbClient.send(new PutItemCommand(params));
    console.log(data);
		return true;
  } catch (err) {
    console.error(err);
		return false;
  }
}


if (typeof module !== 'undefined' && !module.parent) {
	const username = "test";
	const password = "asdf";
	addUser(username, password).then((success) => {
		console.log(success);
	});
}
