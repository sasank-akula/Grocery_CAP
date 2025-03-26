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
  this.after('READ', Orders, async (orders, req) => {
    const orderIDs = Array.isArray(orders) ? orders.map(o => o.ID) : [orders.ID];
  
    // Fetch total amount for each order by summing totalItemPrice from OrderItems
    if (orderIDs.length) {
      const totals = await SELECT.from(OrderItems)
        .columns('order_ID', 'SUM(totalItemPrice) as totalItemPrice') // Correctly sum and alias totalItemPrice
        .where({ order_ID: { in: orderIDs } })
        .groupBy('order_ID');
  
      if (Array.isArray(orders)) {
        // If multiple orders are fetched
        orders.forEach(order => {
          const totalForOrder = totals.find(t => t.order_ID === order.ID);
          order.totalAmount = totalForOrder ? totalForOrder.totalItemPrice : 0;
        });
      } else {
        // If a single order is fetched
        const totalForOrder = totals.find(t => t.order_ID === orders.ID);
        orders.totalAmount = totalForOrder ? totalForOrder.totalItemPrice : 0;
      }
    }
  });
  
  
  

  // Logic to calculate total price for each order item before creating the OrderItems
  this.before('CREATE', OrderItems, async (req) => {
    const itemID = req.data.item_ID;
    const quantity = req.data.quantity;

    // Fetch the item price from the Items entity
    const item = await SELECT.one.from(Items).where({ ID: itemID });
    if (item) {
      req.data.itemPrice = item.price; // Store item price in OrderItems
      req.data.totalItemPrice = item.price * quantity; // Calculate total price for this item
    } else {
      req.error(400, `Item with ID ${itemID} not found.`);
    }
    const orderID = req.data.order_ID;
    const order = await SELECT.one.from(Orders).where({ ID: orderID });
    if(!order){
      req.error(400, `Order with ID ${orderID} not found.`);
    }
  });


};
