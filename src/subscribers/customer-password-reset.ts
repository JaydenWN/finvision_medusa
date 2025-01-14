import {
	type SubscriberConfig,
	type SubscriberArgs,
	CustomerService,
} from "@medusajs/medusa";

export default async function handleCustomerCreated({
	data,
	eventName,
	container,
	pluginOptions,
}: SubscriberArgs<Record<string, string>>) {
	const { token, email, first_name } = data;
	const sendGridService = container.resolve("sendgridService");
	sendGridService.sendEmail({
		templateId: process.env.SENDGRID_TEMPLATE_PASSWORD_RESET,
		from: "info@beachsidewebdesigns.com",
		to: email,
		dynamic_template_data: {
			// any data necessary for your template...
			resetLink: `${process.env.STORE_CORS}/store/customer/reset_password/${token}`,
			first_name,
			token,
		},
	});
}

export const config: SubscriberConfig = {
	event: CustomerService.Events.PASSWORD_RESET,
	context: {
		subscriberId: "customer-password-reset-handler",
	},
};
