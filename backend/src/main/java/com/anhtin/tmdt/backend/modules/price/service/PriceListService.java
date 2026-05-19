package com.anhtin.tmdt.backend.modules.price.service;

import com.anhtin.tmdt.backend.modules.agency.dto.AgencyPriceListRequest;
import com.anhtin.tmdt.backend.modules.price.dto.PriceListItemUpdateRequest;
import com.anhtin.tmdt.backend.modules.price.dto.PriceListRequest;
import com.anhtin.tmdt.backend.modules.common.dto.PriceListDTO;
import com.anhtin.tmdt.backend.modules.common.dto.PriceListItemDTO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.Objects;
import java.util.stream.Collectors;
import com.anhtin.tmdt.backend.modules.price.repository.PriceListItemRepository;
import com.anhtin.tmdt.backend.modules.price.repository.PriceListConditionRepository;
import com.anhtin.tmdt.backend.modules.agency.repository.AgencyPriceListRepository;
import com.anhtin.tmdt.backend.modules.agency.entity.AgencyStorePriceList;
import com.anhtin.tmdt.backend.modules.user.entity.User;
import com.anhtin.tmdt.backend.modules.agency.entity.AgencyRanking;
import com.anhtin.tmdt.backend.modules.price.repository.PriceListRepository;
import com.anhtin.tmdt.backend.modules.agency.repository.AgencyStorePriceListRepository;
import com.anhtin.tmdt.backend.modules.price.entity.PriceList;
import com.anhtin.tmdt.backend.modules.agency.repository.AgencyRankingRepository;
import com.anhtin.tmdt.backend.modules.agency.entity.AgencyPriceList;
import com.anhtin.tmdt.backend.modules.agency.repository.AgencyRepository;
import com.anhtin.tmdt.backend.modules.price.entity.PriceListCondition;
import com.anhtin.tmdt.backend.modules.price.entity.PriceListConditionType;
import com.anhtin.tmdt.backend.modules.product.repository.ProductRepository;
import com.anhtin.tmdt.backend.modules.product.entity.Product;
import com.anhtin.tmdt.backend.modules.agency.entity.Agency;
import com.anhtin.tmdt.backend.modules.user.repository.UserRepository;
import com.anhtin.tmdt.backend.modules.price.entity.PriceListItem;
import com.anhtin.tmdt.backend.modules.order.entity.Transaction;
import org.springframework.context.annotation.Lazy;
import org.springframework.transaction.support.TransactionSynchronization;
import org.springframework.transaction.support.TransactionSynchronizationManager;
import com.anhtin.tmdt.backend.modules.agency.service.CustomerPriceSyncService;

@Service
public class PriceListService {

    @Autowired
    private PriceListRepository priceListRepository;

    @Autowired
    @Lazy
    private CustomerPriceSyncService customerPriceSyncService;

    @Autowired
    private PriceListItemRepository priceListItemRepository;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private AgencyRepository agencyRepository;

    @Autowired
    private AgencyPriceListRepository agencyPriceListRepository;

    @Autowired
    private AgencyStorePriceListRepository agencyStorePriceListRepository;

    @Autowired
    private PriceListConditionRepository priceListConditionRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private AgencyRankingRepository agencyRankingRepository;

    private String getAgencyRank(Long agencyId) {
        if (agencyId == null) return "BRONZE";
        return agencyRankingRepository.findFirstByAgencyIdOrderByYearDescMonthDesc(agencyId)
                .map(AgencyRanking::getRankLevel)
                .orElse("BRONZE");
    }

    public List<PriceListDTO> getAllPriceLists() {
        return priceListRepository.findAll().stream()
                .map(pl -> new PriceListDTO(pl, priceListItemRepository.countByPriceListId(pl.getId())))
                .collect(Collectors.toList());
    }

    public PriceListDTO getPriceListById(Long id) {
        if (id == null) {
            throw new IllegalArgumentException("ID cannot be null");
        }
        PriceList pl = priceListRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Price list not found"));
        return new PriceListDTO(pl, priceListItemRepository.countByPriceListId(id));
    }

    @Transactional
    public PriceListDTO createPriceList(PriceListRequest request) {
        if (request.getIsDefault() != null && request.getIsDefault() && priceListRepository.existsByIsDefaultTrue()) {
            throw new RuntimeException("Default price list already exists");
        }

        PriceList pl = new PriceList();
        pl.setName(request.getName());
        pl.setDescription(request.getDescription());
        pl.setIsDefault(request.getIsDefault() != null ? request.getIsDefault() : false);
        pl.setActive(true);
        PriceList saved = priceListRepository.save(pl);

        // Auto-insert all products with price = -1
        List<Product> products = productRepository.findAll();
        List<PriceListItem> items = products.stream().map(p -> {
            PriceListItem item = new PriceListItem();
            item.setPriceList(saved);
            item.setProduct(p);
            item.setPrice(-1.0);
            item.setIsVisible(true);
            return item;
        }).collect(Collectors.toList());
        priceListItemRepository.saveAll(Objects.requireNonNull(items));

        return new PriceListDTO(saved, (long) items.size());
    }

    @Transactional
    public PriceListDTO updatePriceList(Long id, PriceListRequest request) {
        if (id == null) throw new IllegalArgumentException("ID cannot be null");
        PriceList pl = priceListRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Price list not found"));

        if (request.getIsDefault() != null && request.getIsDefault() && !pl.getIsDefault() && priceListRepository.existsByIsDefaultTrue()) {
            throw new RuntimeException("Default price list already exists");
        }

        pl.setName(request.getName());
        pl.setDescription(request.getDescription());
        pl.setIsDefault(request.getIsDefault() != null ? request.getIsDefault() : pl.getIsDefault());
        return new PriceListDTO(priceListRepository.save(pl), priceListItemRepository.countByPriceListId(pl.getId()));
    }

    @Transactional
    public void deletePriceList(Long id) {
        if (id == null) throw new IllegalArgumentException("ID cannot be null");
        PriceList pl = priceListRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Price list not found"));
        if (pl.getIsDefault()) {
            throw new RuntimeException("Cannot delete default price list");
        }
        priceListItemRepository.deleteByPriceListId(id);
        priceListRepository.delete(pl);
    }

    public List<PriceListItemDTO> getPriceListItems(Long priceListId) {
        return priceListItemRepository.findByPriceListId(priceListId).stream()
                .map(PriceListItemDTO::new)
                .collect(Collectors.toList());
    }

    @Transactional
    public void updatePriceListItem(Long priceListId, PriceListItemUpdateRequest request) {
        if (priceListId == null || request.getProductId() == null) {
            throw new IllegalArgumentException("IDs cannot be null");
        }
        PriceListItem item = priceListItemRepository.findByPriceListIdAndProductId(priceListId, request.getProductId())
                .orElseThrow(() -> new RuntimeException("Item not found in price list"));
        if (request.getPrice() != null) item.setPrice(request.getPrice());
        if (request.getIsVisible() != null) item.setIsVisible(request.getIsVisible());
        priceListItemRepository.save(Objects.requireNonNull(item));
        final Long finalPlId = priceListId;
        final Long finalProductId = request.getProductId();
        TransactionSynchronizationManager.registerSynchronization(new TransactionSynchronization() {
            @Override
            public void afterCommit() {
                customerPriceSyncService.syncPriceForProductInPriceList(finalPlId, finalProductId, null, "PRICE_LIST_UPDATED");
            }
        });
    }

    @Transactional
    public void onProductCreated(Product product) {
        List<PriceList> allLists = priceListRepository.findAll();
        List<PriceListItem> newItems = allLists.stream().map(pl -> {
            PriceListItem item = new PriceListItem();
            item.setPriceList(pl);
            item.setProduct(product);
            item.setPrice(-1.0);
            item.setIsVisible(true);
            return item;
        }).collect(Collectors.toList());
        priceListItemRepository.saveAll(Objects.requireNonNull(newItems));
    }

    // --- Resolve Logic ---

    /** Láº¥y báº£ng giÃ¡ hiá»‡u lá»±c cho Äáº¡i lÃ½ */
    public PriceList resolveForAgency(Long agencyId) {
        if (agencyId == null) {
            throw new IllegalArgumentException("Agency ID cannot be null");
        }
        
        System.out.println("ðŸ” [resolveForAgency] agencyId=" + agencyId);
        
        // Táº§ng 1: Chá»‰ Ä‘á»‹nh trá»±c tiáº¿p (AgencyPriceList)
        LocalDateTime now = LocalDateTime.now();
        System.out.println("ðŸ” [resolveForAgency] now=" + now);
        
        Optional<AgencyPriceList> assigned = agencyPriceListRepository.findFirstByAgencyIdAndEffectiveFromLessThanEqualOrderByEffectiveFromDesc(agencyId, now);
        System.out.println("ðŸ” [resolveForAgency] Táº§ng 1 - Direct assignment present=" + assigned.isPresent());
        if (assigned.isPresent()) {
            PriceList pl = assigned.get().getPriceList();
            System.out.println("ðŸ” [resolveForAgency] â†’ Tráº£ vá» báº£ng giÃ¡ trá»±c tiáº¿p: id=" + pl.getId() + ", name=" + pl.getName());
            return pl;
        }

        // Láº¥y rank hiá»‡n táº¡i cá»§a Ä‘áº¡i lÃ½ (tá»« báº£ng rankings thÃ¡ng gáº§n nháº¥t hoáº·c default)
        if (!agencyRepository.existsById(agencyId)) {
            throw new RuntimeException("Agency not found");
        }
        // Láº¥y rank thá»±c táº¿ cá»§a Ä‘áº¡i lÃ½
        String rank = getAgencyRank(agencyId);
        System.out.println("ðŸ” [resolveForAgency] Táº§ng 2 - Agency rank=" + rank);

        // Táº§ng 2: Theo háº¡ng Ä‘áº¡i lÃ½ (AGENCY_RANK)
        List<PriceListCondition> rankConditions = priceListConditionRepository
                .findActiveByRank(PriceListConditionType.AGENCY_RANK, rank, now);
        System.out.println("ðŸ” [resolveForAgency] Táº§ng 2 - Rank conditions found=" + rankConditions.size());
        if (!rankConditions.isEmpty()) {
            PriceList pl = rankConditions.get(0).getPriceList();
            System.out.println("ðŸ” [resolveForAgency] â†’ Tráº£ vá» báº£ng giÃ¡ theo rank: id=" + pl.getId() + ", name=" + pl.getName());
            return pl;
        }
        
        // Táº§ng 3: ToÃ n bá»™ Ä‘áº¡i lÃ½ (ALL_AGENCY)
        List<PriceListCondition> allAgencyConditions = priceListConditionRepository
                .findActiveByConditionType(PriceListConditionType.ALL_AGENCY, now);
        System.out.println("ðŸ” [resolveForAgency] Táº§ng 3 - ALL_AGENCY conditions found=" + allAgencyConditions.size());
        if (!allAgencyConditions.isEmpty()) {
            PriceList pl = allAgencyConditions.get(0).getPriceList();
            System.out.println("ðŸ” [resolveForAgency] â†’ Tráº£ vá» báº£ng giÃ¡ ALL_AGENCY: id=" + pl.getId() + ", name=" + pl.getName());
            return pl;
        }

        // Táº§ng 4: Máº·c Ä‘á»‹nh
        System.out.println("ðŸ” [resolveForAgency] Táº§ng 4 - Fallback to default");
        return priceListRepository.findByIsDefaultTrue()
                .orElseThrow(() -> new RuntimeException("Default price list not found"));
    }

    /** Láº¥y báº£ng giÃ¡ hiá»‡u lá»±c cho KhÃ¡ch hÃ ng táº¡i Cá»­a hÃ ng Äáº¡i lÃ½ */
    public PriceList resolveForCustomer(Long customerId, Long agencyId) {
        if (agencyId == null) {
            throw new IllegalArgumentException("Agency ID cannot be null");
        }
        
        // Táº§ng 1: Äáº¡i lÃ½ tá»± thiáº¿t láº­p cho cá»­a hÃ ng (AgencyStorePriceList)
        Optional<AgencyStorePriceList> storePl = agencyStorePriceListRepository.findByAgencyId(agencyId);
        if (storePl.isPresent()) return storePl.get().getPriceList();

        if (customerId != null) {
            User user = userRepository.findById(customerId).orElse(null);
            if (user != null && user.getCustomerGroup() != null) {
                // Táº§ng 2: Theo nhÃ³m khÃ¡ch hÃ ng (CUSTOMER_GROUP)
                List<PriceListCondition> groupConditions = priceListConditionRepository
                        .findActiveByCustomerGroup(PriceListConditionType.CUSTOMER_GROUP, user.getCustomerGroup().getId(), LocalDateTime.now());
                if (!groupConditions.isEmpty()) return groupConditions.get(0).getPriceList();
            }
        }

        // Táº§ng 3: ToÃ n bá»™ khÃ¡ch hÃ ng (ALL_CUSTOMER)
        List<PriceListCondition> allCustomerConditions = priceListConditionRepository
                .findActiveByConditionType(PriceListConditionType.ALL_CUSTOMER, LocalDateTime.now());
        if (!allCustomerConditions.isEmpty()) return allCustomerConditions.get(0).getPriceList();

        // Táº§ng 4: Máº·c Ä‘á»‹nh
        return priceListRepository.findByIsDefaultTrue()
                .orElseThrow(() -> new RuntimeException("Default price list not found"));
    }

    // --- Assignments ---

    @Transactional
    public void assignToAgency(AgencyPriceListRequest request) {
        if (request.getAgencyId() == null || request.getPriceListId() == null) {
            throw new IllegalArgumentException("IDs cannot be null");
        }
        // XÃ³a Táº¤T Cáº¢ cÃ¡c gÃ¡n trá»±c tiáº¿p cÅ© cá»§a Ä‘áº¡i lÃ½ nÃ y (dÃ¹ng deleteByAgencyId Ä‘á»ƒ trÃ¡nh bá» sÃ³t)
        agencyPriceListRepository.deleteByAgencyId(request.getAgencyId());
        
        Long agencyId = request.getAgencyId();
        Long plId = request.getPriceListId();
        if (agencyId == null || plId == null) throw new IllegalArgumentException("IDs cannot be null");
        
        Agency agency = agencyRepository.findById(agencyId).orElseThrow();
        PriceList pl = priceListRepository.findById(plId).orElseThrow();
        
        AgencyPriceList apl = new AgencyPriceList();
        apl.setAgency(agency);
        apl.setPriceList(pl);
        agencyPriceListRepository.save(apl);
        final Long finalAgencyId = agencyId;
        TransactionSynchronizationManager.registerSynchronization(new TransactionSynchronization() {
            @Override
            public void afterCommit() {
                customerPriceSyncService.syncAllPricesForAgency(finalAgencyId, null, "AGENCY_ASSIGNMENT_CHANGED");
            }
        });
    }

    @Transactional
    public void setAgencyStorePriceList(Long agencyId, Long priceListId) {
        if (agencyId == null || priceListId == null) {
            throw new IllegalArgumentException("IDs cannot be null");
        }
        
        Agency agency = agencyRepository.findById(agencyId).orElseThrow();
        PriceList pl = priceListRepository.findById(priceListId).orElseThrow();
        
        Optional<AgencyStorePriceList> existingOpt = agencyStorePriceListRepository.findByAgencyId(agencyId);
        if (existingOpt.isPresent()) {
            AgencyStorePriceList existing = existingOpt.get();
            existing.setPriceList(pl);
            existing.setCreatedAt(LocalDateTime.now());
            agencyStorePriceListRepository.save(existing);
        } else {
            AgencyStorePriceList aspl = new AgencyStorePriceList();
            aspl.setAgency(agency);
            aspl.setPriceList(pl);
            agencyStorePriceListRepository.save(aspl);
        }
    }

    @Transactional
    public void unassignAgency(Long agencyId) {
        if (agencyId == null) throw new IllegalArgumentException("Agency ID cannot be null");
        agencyPriceListRepository.deleteByAgencyId(agencyId);
        final Long finalAgencyId = agencyId;
        TransactionSynchronizationManager.registerSynchronization(new TransactionSynchronization() {
            @Override
            public void afterCommit() {
                customerPriceSyncService.syncAllPricesForAgency(finalAgencyId, null, "AGENCY_ASSIGNMENT_CHANGED");
            }
        });
    }

    public List<Long> getAssignedAgencyIds(Long priceListId) {
        return agencyPriceListRepository.findByPriceListId(priceListId).stream()
                .map(apl -> apl.getAgency().getId())
                .collect(Collectors.toList());
    }

    public static class ResolvedPriceInfo {
        private Double price;
        private String priceListName;
        private Long priceListId;
        private Double oldPrice;

        public Double getPrice() { return price; }
        public void setPrice(Double price) { this.price = price; }
        public String getPriceListName() { return priceListName; }
        public void setPriceListName(String priceListName) { this.priceListName = priceListName; }
        public Long getPriceListId() { return priceListId; }
        public void setPriceListId(Long priceListId) { this.priceListId = priceListId; }
        public Double getOldPrice() { return oldPrice; }
        public void setOldPrice(Double oldPrice) { this.oldPrice = oldPrice; }
    }

    public ResolvedPriceInfo calculateRawPriceInfoForAgency(Long productId, Long agencyId) {
        return getResolvedPriceInfo(productId, agencyId, null);
    }

    public ResolvedPriceInfo getResolvedPriceInfo(Long productId, Long agencyId, Long customerId) {
        List<PriceList> candidates = new ArrayList<>();
        
        LocalDateTime now = LocalDateTime.now();
        if (customerId != null) {
            // Hierarchy for Customer: Direct -> Store -> Group -> All Customer -> Default
            priceListConditionRepository.findActiveByCustomer(
                    PriceListConditionType.DIRECT_CUSTOMER, customerId, now)
                    .forEach(c -> candidates.add(c.getPriceList()));

            agencyStorePriceListRepository.findByAgencyId(agencyId).ifPresent(s -> candidates.add(s.getPriceList()));
            
            User user = userRepository.findById(customerId).orElse(null);
            if (user != null && user.getCustomerGroup() != null) {
                priceListConditionRepository.findActiveByCustomerGroup(
                        PriceListConditionType.CUSTOMER_GROUP, user.getCustomerGroup().getId(), now)
                        .forEach(c -> candidates.add(c.getPriceList()));
            }
            
            priceListConditionRepository.findActiveByConditionType(PriceListConditionType.ALL_CUSTOMER, now)
                    .forEach(c -> candidates.add(c.getPriceList()));
        } else if (agencyId != null) {
            // Hierarchy for Agency: Direct -> Rank -> All Agency -> Default
            // Lấy gán trực tiếp mới nhất đã có hiệu lực
            agencyPriceListRepository.findFirstByAgencyIdAndEffectiveFromLessThanEqualOrderByEffectiveFromDesc(agencyId, now)
                    .ifPresent(a -> candidates.add(a.getPriceList()));
            
            // Lấy rank thực tế của đại lý
            String rank = getAgencyRank(agencyId);
            priceListConditionRepository.findActiveByRank(
                    PriceListConditionType.AGENCY_RANK, rank, now)
                    .forEach(c -> candidates.add(c.getPriceList()));
            
            priceListConditionRepository.findActiveByConditionType(PriceListConditionType.ALL_AGENCY, now)
                    .forEach(c -> candidates.add(c.getPriceList()));
        }
        
        // Add default price list as last resort
        priceListRepository.findByIsDefaultTrue().ifPresent(candidates::add);
        
        // Fallback: If no default and no candidates, take the first active price list
        if (candidates.isEmpty()) {
            priceListRepository.findAll().stream().filter(PriceList::getActive).findFirst().ifPresent(candidates::add);
        }
        
        ResolvedPriceInfo result = new ResolvedPriceInfo();
        
        for (int i = 0; i < candidates.size(); i++) {
            PriceList pl = candidates.get(i);
            boolean isLast = (i == candidates.size() - 1);
            
            Optional<PriceListItem> item = priceListItemRepository.findByPriceListIdAndProductId(pl.getId(), productId);
            if (item.isPresent()) {
                Double p = item.get().getPrice();
                if (Boolean.TRUE.equals(item.get().getIsVisible())) {
                    // Ưu tiên 1: Nếu là bảng giá chỉ định trực tiếp (vị trí 0), lấy ngay kể cả là giá -1 (Liên hệ)
                    // Ưu tiên 2: Nếu giá > 0, lấy ngay
                    // Ưu tiên 3: Nếu là bảng giá cuối cùng (mặc định), lấy ngay kể cả giá -1
                    if (i == 0 || p != null && p > 0 || isLast) {
                        result.setPrice(p);
                        result.setPriceListName(pl.getName());
                        result.setPriceListId(pl.getId());
                        result.setOldPrice(item.get().getOldPrice());
                        return result;
                    }
                }
            }
        }
        
        return result;
    }

    public Double getResolvedPrice(Long productId, Long agencyId, Long customerId) {
        return getResolvedPriceInfo(productId, agencyId, customerId).getPrice();
    }
}
