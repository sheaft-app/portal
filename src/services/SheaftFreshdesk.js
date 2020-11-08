import GetAuthInstance from "./SheaftAuth.js";
import { config } from "./../configs/config.js";

export async function loginFreshdesk() {
	try {
		var result = await retrieveFreshdeskToken();
		if (result) {
			FreshworksWidget("authenticate", {
				token: result,
				callback: authenticateCallback,
			});
		}
	} catch (err) {
		console.log(err);
	}
}

export function closeHelpModal() {
	FreshworksWidget("close");
}

export function openHelpModal() {
	FreshworksWidget("open");
}

export function createNewTicket(subject, profile, errors) {
	FreshworksWidget("open", "ticketForm",{
		subject: subject,
		custom_fields: {
		  cf_profile: JSON.stringify(profile),
		  cf_page: location.hash,
		  cf_errors: errors ? JSON.stringify(errors) : null
		}
	  });
}

export function logoutFreshdesk() {
	FreshworksWidget("logout");
}

async function retrieveFreshdeskToken() {
	var postSettings = {
		method: "POST",
		body:
			'{"operationName":"GenerateFreshdeskToken","variables":{},"query":"query GenerateFreshdeskToken {generateFreshdeskToken}"}',
		headers: {
			"Content-Type": "application/json",
			Authorization: "Bearer " + GetAuthInstance().user.access_token,
		},
	};

	try {
		var result = await (
			await fetch(config.api + "/graphql", postSettings)
		).json();
		if (result && result.data && result.data.generateFreshdeskToken) {
			return result.data.generateFreshdeskToken;
		}
		return null;
	} catch (err) {
		console.log(err);
	}
}

async function authenticateCallback() {
	try {
		var result = await retrieveFreshdeskToken();
		if (result) {
			FreshworksWidget("authenticate", {
				token: result,
			});
		}
	} catch (err) {
		console.log(err);
	}
}
