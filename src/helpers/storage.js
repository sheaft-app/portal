export const clearLocalStorage = () => {
	localStorage.removeItem("user_cart");
	localStorage.removeItem("user_choosen_role");
	localStorage.removeItem("user_current_order");
	localStorage.removeItem("user_cookies_consent");
	localStorage.removeItem("user_last_transaction");
	localStorage.removeItem("user_location");
	localStorage.removeItem("user_first_time_on_cart");
	localStorage.removeItem("user_sponsoring");
	localStorage.removeItem("user");

	sessionStorage.removeItem("user_cookies_consent");
};

export const setCookie = (cname, cvalue, exdays) => {
	const d = new Date();
	d.setTime(d.getTime() + exdays * 24 * 60 * 60 * 1000);
	let expires = "expires=" + d.toUTCString();
	document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
};

export const getCookie = (cname) => {
	let name = cname + "=";
	let ca = document.cookie.split(";");
	for (let i = 0; i < ca.length; i++) {
		let c = ca[i];
		while (c.charAt(0) === " ") {
			c = c.substring(1);
		}
		if (c.indexOf(name) === 0) {
			return c.substring(name.length, c.length);
		}
	}
	return null;
};
