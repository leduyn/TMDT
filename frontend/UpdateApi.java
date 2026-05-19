import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Paths;

public class UpdateApi {
    public static void main(String[] args) throws IOException {
        String path = "d:/Java lean/TMDT/frontend/src/lib/api.ts";
        String content = new String(Files.readAllBytes(Paths.get(path)));
        
        String newApi = "\nexport interface AgencyProductPriceDTO {\n" +
            "    id: number;\n" +
            "    agencyId: number;\n" +
            "    productId: number;\n" +
            "    productName: string;\n" +
            "    productImageUrl: string;\n" +
            "    price: number;\n" +
            "    sourcePriceListId: number;\n" +
            "    sourcePriceListName: string;\n" +
            "    isOverride: boolean;\n" +
            "    updatedAt: string;\n" +
            "}\n\n" +
            "export interface AgencyProductPriceHistoryDTO {\n" +
            "    id: number;\n" +
            "    agencyId: number;\n" +
            "    productId: number;\n" +
            "    oldPrice: number;\n" +
            "    newPrice: number;\n" +
            "    changedById: number;\n" +
            "    changedByUsername: string;\n" +
            "    changedAt: string;\n" +
            "    changeSource: string;\n" +
            "    sourcePriceListId: number;\n" +
            "    sourcePriceListName: string;\n" +
            "}\n\n" +
            "export const customerPriceApi = {\n" +
            "    getPricesForAgency: async (agencyId: number): Promise<AgencyProductPriceDTO[]> => {\n" +
            "        const response = await fetch(${API_URL}/customer-prices?agencyId=, { headers: getHeaders() });\n" +
            "        if (!response.ok) throw new Error('Failed to fetch customer prices');\n" +
            "        return response.json();\n" +
            "    },\n" +
            "    getHistory: async (agencyId: number, productId: number): Promise<AgencyProductPriceHistoryDTO[]> => {\n" +
            "        const response = await fetch(${API_URL}/customer-prices/history?agencyId=&productId=, { headers: getHeaders() });\n" +
            "        if (!response.ok) throw new Error('Failed to fetch history');\n" +
            "        return response.json();\n" +
            "    },\n" +
            "    overridePrice: async (agencyId: number, productId: number, price: number) => {\n" +
            "        const response = await fetch(${API_URL}/customer-prices/override?agencyId=&productId=&price=, {\n" +
            "            method: 'POST',\n" +
            "            headers: getHeaders()\n" +
            "        });\n" +
            "        if (!response.ok) throw new Error('Failed to override price');\n" +
            "    },\n" +
            "    rollbackPrice: async (historyId: number) => {\n" +
            "        const response = await fetch(${API_URL}/customer-prices/rollback/, {\n" +
            "            method: 'POST',\n" +
            "            headers: getHeaders()\n" +
            "        });\n" +
            "        if (!response.ok) throw new Error('Failed to rollback price');\n" +
            "    },\n" +
            "    syncAgencyPrices: async (agencyId: number) => {\n" +
            "        const response = await fetch(${API_URL}/customer-prices/sync/, {\n" +
            "            method: 'POST',\n" +
            "            headers: getHeaders()\n" +
            "        });\n" +
            "        if (!response.ok) throw new Error('Failed to sync prices');\n" +
            "    }\n" +
            "};\n";
            
        if (!content.contains("customerPriceApi")) {
            content += newApi;
            Files.write(Paths.get(path), content.getBytes());
        }
    }
}
