
export const PRODUCT_QUERY = `
    query Products(
        $category: String, 
        $search: String, 
        $sort: ServiceSort, 
        $page: Int, 
        $pageSize: Int
    ) {
        products(
            category: $category, 
            search: $search, 
            sort: $sort, 
            page: $page, 
            pageSize: $pageSize
        )
    }
`