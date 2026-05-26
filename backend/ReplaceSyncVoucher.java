import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Paths;

public class ReplaceSyncVoucher {
    public static void main(String[] args) throws IOException {
        String path = "d:/Java lean/TMDT/backend/src/main/java/com/anhtin/tmdt/backend/modules/price/service/PriceUpdateVoucherService.java";
        String content = new String(Files.readAllBytes(Paths.get(path)));
        
        // Add import
        content = content.replace("import com.anhtin.tmdt.backend.modules.order.entity.Transaction;",
                                  "import com.anhtin.tmdt.backend.modules.order.entity.Transaction;\nimport com.anhtin.tmdt.backend.modules.agency.service.CustomerPriceSyncService;");
        
        // Add autowired field
        content = content.replace("public class PriceUpdateVoucherService {\n\n    @Autowired\n    private PriceUpdateVoucherRepository voucherRepository;",
                                  "public class PriceUpdateVoucherService {\n\n    @Autowired\n    private com.anhtin.tmdt.backend.modules.agency.service.CustomerPriceSyncService customerPriceSyncService;\n\n    @Autowired\n    private PriceUpdateVoucherRepository voucherRepository;");
        
        // Hook applyVoucher
        content = content.replace("priceListItemRepository.save(plItem);\n            }",
                                  "priceListItemRepository.save(plItem);\n                customerPriceSyncService.syncPriceForProductInPriceList(plId, vItem.getProduct().getId(), null, \"VOUCHER_APPLIED\");\n            }");

        Files.write(Paths.get(path), content.getBytes());
    }
}
