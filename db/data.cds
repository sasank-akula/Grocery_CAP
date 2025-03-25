namespace com.cy.grocery;

using { cuid } from '@sap/cds/common';

entity Customers : cuid {
    name           : String;
    email          : String;
    address        : String;
    phoneNumber    : String;
    toOrders       : Composition of many Orders on toOrders.customer = $self;
}

entity Orders : cuid {
    orderDate      : Date;
    totalAmount    : Decimal(10,2);
    customer       : Association to Customers;
    toItems        : Composition of many OrderItems on toItems.order = $self;
}

entity Items : cuid {
    name           : String;
    price          : Decimal(10,2);
    description    : String;
    stockQuantity  : Integer;
}

entity OrderItems : cuid {
    quantity       : Integer;
    itemPrice      : Decimal(10,2);
    totalItemPrice : Decimal(10,2);
    order          : Association to Orders;
    item           : Association to Items;
}
