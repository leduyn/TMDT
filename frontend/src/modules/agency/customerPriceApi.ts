import { fetchJSON } from "@/lib/fetcher";

export interface AgencyProductPriceDTO {
    id: number;
    agencyId: number;
    productId: number;
    productName: string;
    productImageUrl: string;
    price: number;
    oldPrice?: number;
    sourcePriceListId: number;
    sourcePriceListName: string;
    isOverride: boolean;
    updatedAt: string;
}

export interface AgencyProductPriceHistoryDTO {
    id: number;
    agencyId: number;
    productId: number;
    oldPrice: number;
    newPrice: number;
    changedById: number;
    changedByUsername: string;
    changedAt: string;
    changeSource: string;
    sourcePriceListId: number;
    sourcePriceListName: string;
}

export const customerPriceApi = {
    getPricesForAgency: (agencyId: number, days?: number) => {
        let url = `/api/customer-prices?agencyId=${agencyId}`;
        if (days && days > 0) url += `&days=${days}`;
        return fetchJSON<AgencyProductPriceDTO[]>(url);
    },
    
    getHistory: (agencyId: number, productId: number) => 
        fetchJSON<AgencyProductPriceHistoryDTO[]>(`/api/customer-prices/history?agencyId=${agencyId}&productId=${productId}`),
    
    overridePrice: (agencyId: number, productId: number, price: number) => 
        fetchJSON<void>(`/api/customer-prices/override?agencyId=${agencyId}&productId=${productId}&price=${price}`, {
            method: 'POST'
        }),
    
    removeOverride: (agencyId: number, productId: number) => 
        fetchJSON<void>(`/api/customer-prices/remove-override?agencyId=${agencyId}&productId=${productId}`, {
            method: 'POST'
        }),
    
    rollbackPrice: (historyId: number) => 
        fetchJSON<void>(`/api/customer-prices/rollback/${historyId}`, {
            method: 'POST'
        }),
        
    syncAgencyPrices: (agencyId: number) => 
        fetchJSON<void>(`/api/customer-prices/sync/${agencyId}`, {
            method: 'POST'
        }),
        
    importPrices: (agencyId: number, file: File) => {
        const formData = new FormData();
        formData.append('file', file);
        
        // Cannot use fetchJSON directly because it sets Content-Type to application/json
        // So we will use a custom fetch call
        const token = localStorage.getItem('token');
        return fetch(`/api/customer-prices/import/${agencyId}`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`
            },
            body: formData
        }).then(async res => {
            if (!res.ok) {
                const errorData = await res.json().catch(() => ({}));
                throw new Error(errorData.message || 'Error importing prices');
            }
            // Could return text or json depending on the backend, let's return text
            return res.text();
        });
    }
};
