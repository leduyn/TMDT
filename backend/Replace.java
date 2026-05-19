import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Paths;

public class Replace {
    public static void main(String[] args) throws IOException {
        String path = "d:/Java lean/TMDT/backend/src/main/java/com/anhtin/tmdt/backend/modules/price/service/PriceListService.java";
        String content = new String(Files.readAllBytes(Paths.get(path)));
        
        // Add import
        content = content.replace("import com.anhtin.tmdt.backend.modules.price.entity.PriceListItem;", 
                                  "import com.anhtin.tmdt.backend.modules.price.entity.PriceListItem;\nimport com.anhtin.tmdt.backend.modules.agency.repository.AgencyProductPriceRepository;\nimport com.anhtin.tmdt.backend.modules.agency.entity.AgencyProductPrice;\nimport org.springframework.context.annotation.Lazy;");
        
        // Add autowired field
        content = content.replace("public class PriceListService {\n\n    @Autowired\n    private PriceListRepository priceListRepository;",
                                  "public class PriceListService {\n\n    @Autowired\n    @Lazy\n    private AgencyProductPriceRepository agencyProductPriceRepository;\n\n    @Autowired\n    private PriceListRepository priceListRepository;");
        
        // Extract raw calculation
        content = content.replace("public ResolvedPriceInfo getResolvedPriceInfo(Long productId, Long agencyId, Long customerId) {",
                                  "public ResolvedPriceInfo getResolvedPriceInfo(Long productId, Long agencyId, Long customerId) {\n        if (customerId == null && agencyId != null) {\n            Optional<AgencyProductPrice> app = agencyProductPriceRepository.findByAgencyIdAndProductId(agencyId, productId);\n            if (app.isPresent()) {\n                ResolvedPriceInfo info = new ResolvedPriceInfo();\n                info.setPrice(app.get().getPrice());\n                if (app.get().getSourcePriceList() != null) {\n                    info.setPriceListId(app.get().getSourcePriceList().getId());\n                    info.setPriceListName(app.get().getSourcePriceList().getName());\n                } else {\n                    info.setPriceListName(\"Giá Cài Ð?t Riêng\");\n                }\n                return info;\n            }\n        }\n        return calculateRawPriceInfoForAgency(productId, agencyId, customerId);\n    }\n\n    public ResolvedPriceInfo calculateRawPriceInfoForAgency(Long productId, Long agencyId) {\n        return calculateRawPriceInfoForAgency(productId, agencyId, null);\n    }\n\n    private ResolvedPriceInfo calculateRawPriceInfoForAgency(Long productId, Long agencyId, Long customerId) {");
        
        Files.write(Paths.get(path), content.getBytes());
    }
}
