export default class CityService {
	address = "https://api-adresse.data.gouv.fr";

	async SearchByAddress(filterText) {
		var res = {
			data: null,
			success: false,
			errors: null,
		};

		try {
			const response = await fetch(
				`${this.address}/search/?q=${filterText}`,
				{
					method: "GET",
					headers: {
						"Content-Type": "application/json",
					},
				}
			);

			var results = await response.json();
			if (results.features.length == 0) return res;

			res.success = true;
			res.data = results.features.map((address) => {
				return {
					line1: address.properties.name,
					line2: null,
					zipcode: address.properties.postcode,
					city: address.properties.city,
					latitude: address.geometry.coordinates[1],
					longitude: address.geometry.coordinates[0],
					insee: address.properties.id
				};
			});

			return res;
		} catch (ex) {
			console.error(ex);
			res.errors = [];
			return res;
		}
	}

	async SearchByPosition(position) {
		var res = {
			data: null,
			success: false,
			errors: null,
		};

		try {
			const response = await fetch(
				`${this.address}/reverse/?lat=${position.latitude}&lng=${position.longitude}`,
				{
					method: "GET",
					headers: {
						"Content-Type": "application/json",
					},
				}
			);

			var results = await response.json();
			if (results.features.length == 0) return res;

			res.success = true;

			var address = results.features[0];
			res.data = {
				line1: address.properties.name,
				line2: null,
				zipcode: address.properties.postcode,
				city: address.properties.city,
				latitude: address.geometry.coordinates[1],
				longitude: address.geometry.coordinates[0],
				insee: address.properties.id
			};

			return res;
		} catch (ex) {
			console.error(ex);
			res.errors = [];
			return res;
		}
	}
}
