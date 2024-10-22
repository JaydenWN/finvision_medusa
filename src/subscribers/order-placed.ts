import {
	type SubscriberConfig,
	type SubscriberArgs,
	OrderService,
} from "@medusajs/medusa";

export default async function handleOrderPlaced({
	data,
	eventName,
	container,
	pluginOptions,
}: SubscriberArgs<Record<string, string>>) {
	// The entire order object is available in data.id
	const orderId = data.id;

	// Resolve the OrderService to fetch full order details
	const orderService = container.resolve("orderService") as OrderService;

	try {
		// Fetch the full order details
		const order = await orderService.retrieve(orderId, {
			relations: ["items", "customer", "shipping_address", "billing_address"],
		});
		console.log(order.email);
		// console.log("Order placed:", order);
		// // You can now access all order information
		// console.log("Order ID:", order.id);
		// console.log(
		// 	"Customer:",
		// 	order.customer.first_name,
		// 	order.customer.last_name,
		// );
		// console.log("Total:", order.total);
		// console.log(
		// 	"Items:",
		// 	order.items.map((item) => item.title),
		// );

		// Prepare order items for email template
		const orderItems = order.items.map((item) => ({
			title: item.title,
			quantity: item.quantity,
			price: item.unit_price,
			total: item.unit_price * item.quantity,
		}));
		// Perform any other actions with the order data here
		const sendGridService = container.resolve("sendgridService");
		sendGridService.sendEmail({
			templateId: process.env.SENDGRID_TEMPLATE_ORDER_PLACED,
			from: "info@beachsidewebdesigns.com",
			to: order.email,
			dynamic_template_data: {
				order_number: order.display_id,
				customer_name: `${order.customer.first_name} ${order.customer.last_name}`,
				order_date: new Date(order.created_at).toLocaleDateString(),
				order_total: (order.total / 100).toFixed(2), // Assuming the total is in cents
				shipping_address: {
					address1: order.shipping_address.address_1,
					address2: order.shipping_address.address_2,
					city: order.shipping_address.city,
					state: order.shipping_address.province,
					postal_code: order.shipping_address.postal_code,
					country: order.shipping_address.country_code,
				},
				order_items: orderItems,
			},
		});
	} catch (error) {
		console.error("Error fetching order details:", error);
	}
}

export const config: SubscriberConfig = {
	event: OrderService.Events.PLACED,
	context: {
		subscriberId: "order-placed-handler",
	},
};
