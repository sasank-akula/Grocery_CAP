const cds = require('@sap/cds');

module.exports = function () {
  const { Orders, OrderItems, Items, Customers } = this.entities;

  // Before creating an order, ensure that the customer exists
  this.before('CREATE', Orders, async (req) => {
    const customerID = req.data.customer_ID;

    // Check if the customer exists
    const customer = await SELECT.one.from(Customers).where({ ID: customerID });
    if (!customer) {
      req.error(400, `Customer with ID ${customerID} not found.`);
    }
  });

  // Logic to calculate total price for each order item before creating the OrderItems
  this.before('CREATE', OrderItems, async (req) => {
    const itemID = req.data.item_ID;
    console.log(itemID)
    const quantity = req.data.quantity;

    // Fetch the item price from the Items entity
    const item = await SELECT.one.from(Items).where({ ID: itemID });
    if (item) {
      req.data.itemPrice = item.price; // Store item price in OrderItems
      req.data.totalItemPrice = item.price * quantity; // Calculate total price for this item
    } else {
      req.error(400, `Item with ID ${itemID} not found.`);
    }
  });

  // After creating OrderItems, update the total amount in Orders
  this.on('CREATE', OrderItems, async (req) => {
 
    const orderID = req.data.order_ID;

    const totalItemPrice = req.data.totalItemPrice;

    // Fetch the related order
    const order = await SELECT.one.from(Orders).where({ ID: orderID });
    if (order) {
      // Initialize totalAmount if it's not set
      let totalAmount = order.totalAmount;
      totalAmount += totalItemPrice;

      // Update the total amount in the Orders entity
      await UPDATE(Orders).set({ totalAmount }).where({ ID: orderID });
      await INSERT.into(OrderItems).entries(req.data);

     return req.data

    } else {
      req.error(400, `Order with ID ${orderID} not found.`);
    }
  });
};
