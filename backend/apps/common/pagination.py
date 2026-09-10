from rest_framework.pagination import PageNumberPagination
from rest_framework.response import Response


class EnvelopePagination(PageNumberPagination):
    """
    Collection envelope pagination:

        { "data": [...], "pagination": { page, page_size, total_items, total_pages } }
    """

    page_size = 20
    page_size_query_param = "page_size"
    max_page_size = 100

    def get_paginated_response(self, data):
        return Response(
            {
                "data": data,
                "pagination": {
                    "page": self.page.number,
                    "page_size": self.get_page_size(self.request),
                    "total_items": self.page.paginator.count,
                    "total_pages": self.page.paginator.num_pages,
                },
            }
        )
