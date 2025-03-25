using com.cy.grocery as cy from '../db/data';

service GroceryService {
    entity Customers as projection on cy.Customers;
    entity Orders as projection on cy.Orders;
    entity Items as projection on cy.Items;
    entity OrderItems as projection on cy.OrderItems;
}
