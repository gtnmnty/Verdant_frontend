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
            totalCount
            totalPage
            content {
                id            
                status
                total
                createdAt
                items {
                  id
                  name
                  price
                  quantity
                }
            }
        }
   } 

`