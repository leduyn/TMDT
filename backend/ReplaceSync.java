import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Paths;

public class ReplaceSync {
    public static void main(String[] args) throws IOException {
        String path = "d:/Java lean/TMDT/backend/src/main/java/com/anhtin/tmdt/backend/modules/price/service/PriceListService.java";
        String content = new String(Files.readAllBytes(Paths.get(path)));
        
        // Add import
        content = content.replace("import com.anhtin.tmdt.backend.modules.agency.repository.AgencyProductPriceRepository;",
                                  "import com.anhtin.tmdt.backend.modules.agency.repository.AgencyProductPriceRepository;\nimport com.anhtin.tmdt.backend.modules.agency.service.CustomerPriceSyncService;");
        
        // Add autowired field
        content = content.replace("    private AgencyProductPriceRepository agencyProductPriceRepository;",
                                  "    private AgencyProductPriceRepository agencyProductPriceRepository;\n\n    @Autowired\n    @Lazy\n    private CustomerPriceSyncService customerPriceSyncService;");
        
        // Hook assignToAgency
        content = content.replace("agencyPriceListRepository.save(apl);\n    }",
                                  "agencyPriceListRepository.save(apl);\n        customerPriceSyncService.syncAllPricesForAgency(agencyId, null, \"AGENCY_ASSIGNMENT_CHANGED\");\n    }");
                                  
        // Hook unassignAgency
        content = content.replace("agencyPriceListRepository.deleteByAgencyId(agencyId);\n    }",
                                  "agencyPriceListRepository.deleteByAgencyId(agencyId);\n        customerPriceSyncService.syncAllPricesForAgency(agencyId, null, \"AGENCY_ASSIGNMENT_CHANGED\");\n    }");

        // Hook updatePriceListItem
        content = content.replace("priceListItemRepository.save(Objects.requireNonNull(item));\n    }",
                                  "priceListItemRepository.save(Objects.requireNonNull(item));\n        customerPriceSyncService.syncPriceForProductInPriceList(priceListId, request.getProductId(), null, \"PRICE_LIST_UPDATED\");\n    }");

        Files.write(Paths.get(path), content.getBytes());
    }
}
