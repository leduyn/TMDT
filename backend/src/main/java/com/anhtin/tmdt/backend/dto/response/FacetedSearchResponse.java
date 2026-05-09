package com.anhtin.tmdt.backend.dto.response;

import java.util.List;

/**
 * Response cho faceted search, chứa cả danh sách sản phẩm lẫn facets.
 */
public class FacetedSearchResponse {
    private List<ProductDTO> products;
    private List<FacetGroupDTO> facets;
    private long totalCount;
    private int page;
    private int size;

    public FacetedSearchResponse() {}

    public FacetedSearchResponse(List<ProductDTO> products, List<FacetGroupDTO> facets, long totalCount, int page, int size) {
        this.products = products;
        this.facets = facets;
        this.totalCount = totalCount;
        this.page = page;
        this.size = size;
    }

    public List<ProductDTO> getProducts() { return products; }
    public void setProducts(List<ProductDTO> products) { this.products = products; }

    public List<FacetGroupDTO> getFacets() { return facets; }
    public void setFacets(List<FacetGroupDTO> facets) { this.facets = facets; }

    public long getTotalCount() { return totalCount; }
    public void setTotalCount(long totalCount) { this.totalCount = totalCount; }

    public int getPage() { return page; }
    public void setPage(int page) { this.page = page; }

    public int getSize() { return size; }
    public void setSize(int size) { this.size = size; }
}
