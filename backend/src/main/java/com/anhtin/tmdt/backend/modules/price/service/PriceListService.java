package com.anhtin.tmdt.backend.modules.price.service;

import com.anhtin.tmdt.backend.modules.agency.dto.AgencyPriceListRequest;
import com.anhtin.tmdt.backend.modules.price.dto.PriceListItemUpdateRequest;
import com.anhtin.tmdt.backend.modules.price.dto.PriceListRequest;
import com.anhtin.tmdt.backend.modules.common.dto.PriceListDTO;
import com.anhtin.tmdt.backend.modules.common.dto.PriceListItemDTO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.support.TransactionSynchronization;
import org.springframework.transaction.support.TransactionSynchronizationManager;
import org.springframework.context.annotation.Lazy;
import com.anhtin.tmdt.backend.modules.agency.service.CustomerPriceSyncService;
import com.anhtin.tmdt.backend.modules.price.entity.PriceList;
import com.anhtin.tmdt.backend.modules.price.entity.PriceListItem;
import com.anhtin.tmdt.backend.modules.price.entity.PriceListCondition;
import com.anhtin.tmdt.backend.modules.price.entity.PriceListConditionType;
import com.anhtin.tmdt.backend.modules.price.repository.PriceListRepository;
import com.anhtin.tmdt.backend.modules.price.repository.PriceListItemRepository;
import com.anhtin.tmdt.backend.modules.price.repository.PriceListConditionRepository;
import com.anhtin.tmdt.backend.modules.product.repository.ProductRepository;
import com.anhtin.tmdt.backend.modules.product.entity.Product;
import com.anhtin.tmdt.backend.modules.agency.entity.Agency;
import com.anhtin.tmdt.backend.modules.agency.entity.AgencyPriceList;
import com.anhtin.tmdt.backend.modules.agency.entity.AgencyStorePriceList;
import com.anhtin.tmdt.backend.modules.agency.entity.AgencyRanking;
import com.anhtin.tmdt.backend.modules.agency.repository.AgencyRepository;
import com.anhtin.tmdt.backend.modules.agency.repository.AgencyPriceListRepository;
import com.anhtin.tmdt.backend.modules.agency.repository.AgencyStorePriceListRepository;
import com.anhtin.tmdt.backend.modules.agency.repository.AgencyRankingRepository;
import com.anhtin.tmdt.backend.modules.user.entity.User;
import com.anhtin.tmdt.backend.modules.user.repository.UserRepository;
import com.anhtin.tmdt.backend.modules.order.entity.Transaction;
import java.time.LocalDateTime;
import java.util.*;
import java.util.function.Function;
import java.util.stream.Collectors;

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

    public Page<PriceListDTO> getPriceListsPage(Pageable pageable) {
        return priceListRepository.findAll(pageable)
                .map(pl -> new PriceListDTO(pl, priceListItemRepository.countByPriceListId(pl.getId())));
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

    public Page<PriceListItemDTO> getPriceListItems(Long priceListId, int page, int size, String search) {
        Pageable pageable = PageRequest.of(page, size);
        Page<PriceListItem> itemPage;
        if (search != null && !search.trim().isEmpty()) {
            itemPage = priceListItemRepository.searchByProductName(priceListId, search.trim(), pageable);
        } else {
            itemPage = priceListItemRepository.findByPriceListId(priceListId, pageable);
        }
        return itemPage.map(PriceListItemDTO::new);
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

    /** Lấy bảng giá hiệu lực cho Đại lý */
    public PriceList resolveForAgency(Long agencyId) {
        if (agencyId == null) {
            throw new IllegalArgumentException("Agency ID cannot be null");
        }
        
        System.out.println("🔍 [resolveForAgency] agencyId=" + agencyId);
        
        // Tầng 1: Chỉ định trực tiếp (AgencyPriceList)
        LocalDateTime now = LocalDateTime.now();
        System.out.println("🔍 [resolveForAgency] now=" + now);
        
        Optional<AgencyPriceList> assigned = agencyPriceListRepository.findFirstByAgencyIdAndEffectiveFromLessThanEqualOrderByEffectiveFromDesc(agencyId, now);
        System.out.println("🔍 [resolveForAgency] Tầng 1 - Direct assignment present=" + assigned.isPresent());
        if (assigned.isPresent()) {
            PriceList pl = assigned.get().getPriceList();
            System.out.println("🔍 [resolveForAgency] → Trả về bảng giá trực tiếp: id=" + pl.getId() + ", name=" + pl.getName());
            return pl;
        }

        // Lấy rank hiện tại của đại lý (từ bảng rankings tháng gần nhất hoặc default)
        if (!agencyRepository.existsById(agencyId)) {
            throw new RuntimeException("Agency not found");
        }
        // Lấy rank thực tế của đại lý
        String rank = getAgencyRank(agencyId);
        System.out.println("🔍 [resolveForAgency] Tầng 2 - Agency rank=" + rank);

        // Tầng 2: Theo hạng đại lý (AGENCY_RANK)
        List<PriceListCondition> rankConditions = priceListConditionRepository
                .findActiveByRank(PriceListConditionType.AGENCY_RANK, rank, now);
        System.out.println("🔍 [resolveForAgency] Tầng 2 - Rank conditions found=" + rankConditions.size());
        if (!rankConditions.isEmpty()) {
            PriceList pl = rankConditions.get(0).getPriceList();
            System.out.println("🔍 [resolveForAgency] → Trả về bảng giá theo rank: id=" + pl.getId() + ", name=" + pl.getName());
            return pl;
        }
        
        // Tầng 3: Toàn bộ đại lý (ALL_AGENCY)
        List<PriceListCondition> allAgencyConditions = priceListConditionRepository
                .findActiveByConditionType(PriceListConditionType.ALL_AGENCY, now);
        System.out.println("🔍 [resolveForAgency] Tầng 3 - ALL_AGENCY conditions found=" + allAgencyConditions.size());
        if (!allAgencyConditions.isEmpty()) {
            PriceList pl = allAgencyConditions.get(0).getPriceList();
            System.out.println("🔍 [resolveForAgency] → Trả về bảng giá ALL_AGENCY: id=" + pl.getId() + ", name=" + pl.getName());
            return pl;
        }

        // Tầng 4: Mặc định
        System.out.println("🔍 [resolveForAgency] Tầng 4 - Fallback to default");
        return priceListRepository.findByIsDefaultTrue()
                .orElseThrow(() -> new RuntimeException("Default price list not found"));
    }

    /** Lấy bảng giá hiệu lực cho Khách hàng tại Cửa hàng Đại lý */
    public PriceList resolveForCustomer(Long customerId, Long agencyId) {
        if (agencyId == null) {
            throw new IllegalArgumentException("Agency ID cannot be null");
        }
        
        // Tầng 1: Đại lý tự thiết lập cho cửa hàng (AgencyStorePriceList)
        Optional<AgencyStorePriceList> storePl = agencyStorePriceListRepository.findByAgencyId(agencyId);
        if (storePl.isPresent()) return storePl.get().getPriceList();

        if (customerId != null) {
            User user = userRepository.findById(customerId).orElse(null);
            if (user != null && user.getCustomerGroup() != null) {
                // Tầng 2: Theo nhóm khách hàng (CUSTOMER_GROUP)
                List<PriceListCondition> groupConditions = priceListConditionRepository
                        .findActiveByCustomerGroup(PriceListConditionType.CUSTOMER_GROUP, user.getCustomerGroup().getId(), LocalDateTime.now());
                if (!groupConditions.isEmpty()) return groupConditions.get(0).getPriceList();
            }
        }

        // Tầng 3: Toàn bộ khách hàng (ALL_CUSTOMER)
        List<PriceListCondition> allCustomerConditions = priceListConditionRepository
                .findActiveByConditionType(PriceListConditionType.ALL_CUSTOMER, LocalDateTime.now());
        if (!allCustomerConditions.isEmpty()) return allCustomerConditions.get(0).getPriceList();

        // Tầng 4: Mặc định
        return priceListRepository.findByIsDefaultTrue()
                .orElseThrow(() -> new RuntimeException("Default price list not found"));
    }

    // --- Assignments ---

    @Transactional
    public void assignToAgency(AgencyPriceListRequest request) {
        if (request.getAgencyId() == null || request.getPriceListId() == null) {
            throw new IllegalArgumentException("IDs cannot be null");
        }
        // Xóa TẤT CẢ các gán trực tiếp cũ của đại lý này (dùng deleteByAgencyId để tránh bỏ sót)
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

    public List<PriceList> resolveCandidates(Long agencyId, Long customerId) {
        List<PriceList> candidates = new ArrayList<>();
        LocalDateTime now = LocalDateTime.now();

        if (customerId != null) {
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
            agencyPriceListRepository.findFirstByAgencyIdAndEffectiveFromLessThanEqualOrderByEffectiveFromDesc(agencyId, now)
                    .ifPresent(a -> candidates.add(a.getPriceList()));
            String rank = getAgencyRank(agencyId);
            priceListConditionRepository.findActiveByRank(
                    PriceListConditionType.AGENCY_RANK, rank, now)
                    .forEach(c -> candidates.add(c.getPriceList()));
            priceListConditionRepository.findActiveByConditionType(PriceListConditionType.ALL_AGENCY, now)
                    .forEach(c -> candidates.add(c.getPriceList()));
        }

        priceListRepository.findByIsDefaultTrue().ifPresent(candidates::add);
        if (candidates.isEmpty()) {
            priceListRepository.findAll().stream().filter(PriceList::getActive).findFirst().ifPresent(candidates::add);
        }
        return candidates;
    }

    public ResolvedPriceInfo getResolvedPriceInfo(Long productId, Long agencyId, Long customerId) {
        List<PriceList> candidates = resolveCandidates(agencyId, customerId);
        for (int i = 0; i < candidates.size(); i++) {
            PriceList pl = candidates.get(i);
            boolean isLast = (i == candidates.size() - 1);
            Optional<PriceListItem> item = priceListItemRepository.findByPriceListIdAndProductId(pl.getId(), productId);
            if (item.isPresent() && Boolean.TRUE.equals(item.get().getIsVisible())) {
                Double p = item.get().getPrice();
                if (i == 0 || (p != null && p > 0) || isLast) {
                    ResolvedPriceInfo result = new ResolvedPriceInfo();
                    result.setPrice(p);
                    result.setPriceListName(pl.getName());
                    result.setPriceListId(pl.getId());
                    result.setOldPrice(item.get().getOldPrice());
                    return result;
                }
            }
        }
        return new ResolvedPriceInfo();
    }

    public Map<Long, ResolvedPriceInfo> getResolvedPriceInfoForProducts(List<Long> productIds, Long agencyId, Long customerId) {
        if (productIds == null || productIds.isEmpty()) return Collections.emptyMap();

        List<PriceList> candidates = resolveCandidates(agencyId, customerId);
        List<Long> candidateIds = candidates.stream().map(PriceList::getId).collect(Collectors.toList());

        List<PriceListItem> allItems = priceListItemRepository.findByPriceListIdInAndProductIdIn(candidateIds, productIds);
        Map<Long, Map<Long, PriceListItem>> itemsByPriceList = allItems.stream()
                .collect(Collectors.groupingBy(
                        item -> item.getPriceList().getId(),
                        Collectors.toMap(item -> item.getProduct().getId(), Function.identity())
                ));

        Map<Long, ResolvedPriceInfo> results = new HashMap<>();
        for (Long productId : productIds) {
            ResolvedPriceInfo result = resolvePriceFromCandidates(productId, candidates, itemsByPriceList);
            results.put(productId, result);
        }
        return results;
    }

    private ResolvedPriceInfo resolvePriceFromCandidates(Long productId, List<PriceList> candidates,
                                                          Map<Long, Map<Long, PriceListItem>> itemsByPriceList) {
        for (int i = 0; i < candidates.size(); i++) {
            PriceList pl = candidates.get(i);
            boolean isLast = (i == candidates.size() - 1);
            Map<Long, PriceListItem> itemsForPl = itemsByPriceList.getOrDefault(pl.getId(), Collections.emptyMap());
            PriceListItem item = itemsForPl.get(productId);
            if (item != null && Boolean.TRUE.equals(item.getIsVisible())) {
                Double p = item.getPrice();
                if (i == 0 || (p != null && p > 0) || isLast) {
                    ResolvedPriceInfo result = new ResolvedPriceInfo();
                    result.setPrice(p);
                    result.setPriceListName(pl.getName());
                    result.setPriceListId(pl.getId());
                    result.setOldPrice(item.getOldPrice());
                    return result;
                }
            }
        }
        return new ResolvedPriceInfo();
    }

    public Double getResolvedPrice(Long productId, Long agencyId, Long customerId) {
        return getResolvedPriceInfo(productId, agencyId, customerId).getPrice();
    }
}
