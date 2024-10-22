import {
	type SubscriberConfig,
	type SubscriberArgs,
	OrderService,
} from "@medusajs/medusa";

export default async function handleCustomerCreated({
	data,
	eventName,
	container,
	pluginOptions,
}: SubscriberArgs<Record<string, string>>) {
	const sendGridService = container.resolve("sendgridService");
	sendGridService.sendEmail({
		templateId: process.env.SENDGRID_TEMPLATE_ORDER_CLAIM,
		from: "info@beachsidewebdesigns.com",
		to: data.old_email,
		dynamic_template_data: {
			confirmationLink: `${process.env.STORE_CORS}/store/customer/claim_order/${data.token}`,
		},
	});
}

export const config: SubscriberConfig = {
	event: "order-update-token.created",
	context: {
		subscriberId: "customer-request-order-ownership",
	},
};
