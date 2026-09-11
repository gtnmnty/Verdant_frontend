// Flow: Query customer's paginated order history from backend GraphQL endpoint
// Matches the OrderPage, Order, and OrderItem types defined in order.graphql
export const MY_ORDERS_QUERY = `
    query MyOrders(
        $status: OrderClientFilter
        $timeframe: OrderTimeframe
        $search: String
        $sort: OrderClientSort
        $page: Int!
        $pageSize: Int!
   ) {
        myOrders(
          status: $status
          timeframe: $timeframe
          search: $search
          sort: $sort
          page: $page
          pageSize: $pageSize
        ) {
            totalItems
            totalPages
            items {
                id            
                orderCode
                orderStatus
                total
                createdAt
                items {
                  id
                  product {
                    id
                  }
                  productName
                  productImage
                  unitPrice
                  quantity
                }
            }
        }
   } 
`;

export const ORDER_BY_ID_QUERY = `
    query OrderById($id: ID!) {
        order(id: $id) {
            id
            orderCode
            orderStatus
            paymentStatus
            paymentMethod
            subtotal
            deliveryFee
            total
            createdAt
            updatedAt
            address {
                line1
                line2
                city
                state
                postal
                country
            }
            user {
                id
                fullName
                email
                phone
            }
            items {
                id
                productName
                productImage
                quantity
                unitPrice
                subtotal
                deliveryOption
                quantityLabel
            }
        }
    }
`;

export interface BackendOrderItem {
    id: string;
    productName: string;
    productImage: string | null;
    quantity: number;
    unitPrice: number;
    subtotal: number;
    deliveryOption?: string;
    quantityLabel?: string;
}
export interface BackendAddress {
    line1: string;
    line2?: string | null;
    city: string;
    state: string;
    postal: string;
    country?: string | null;
}
export interface BackendUser {
    id: string;
    fullName: string;
    email: string;
    phone?: string | null;
}
export interface BackendOrder {
    id: string;
    orderCode: string;
    orderStatus: "PLACED" | "PROCESSING" | "IN_TRANSIT" | "DELIVERED" | "CANCELLED";
    paymentStatus: string;
    paymentMethod: string;
    subtotal: number;
    deliveryFee: number;
    total: number;
    createdAt: string;
    updatedAt: string;
    address: BackendAddress;
    user: BackendUser;
    items: BackendOrderItem[];
}