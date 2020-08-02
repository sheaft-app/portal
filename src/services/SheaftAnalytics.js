import { ApplicationInsights } from "@microsoft/applicationinsights-web";
import { config } from "../configs/config.js";

class SheaftAnalytics {
	constructor(analyticsSettings) {
		if(analyticsSettings == null)
			return;

		this.insights = new ApplicationInsights(analyticsSettings);
		if (config.production) {
			this.insights.loadAppInsights();
			this.insights.trackPageView();
		}
	}
}

export function InitAnalytics(analyticsSettings) {
	analyticsInstance = new SheaftAnalytics(analyticsSettings);
	Object.freeze(analyticsInstance);
	return analyticsInstance;
}

let analyticsInstance = null;

export default function GetAnalyticsInstance() {
	return analyticsInstance;
};
