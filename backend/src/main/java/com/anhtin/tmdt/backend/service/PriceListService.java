package com.anhtin.tmdt.backend.service;

import com.anhtin.tmdt.backend.dto.request.AgencyPriceListRequest;
import com.anhtin.tmdt.backend.dto.request.PriceListItemUpdateRequest;
import com.anhtin.tmdt.backend.dto.request.PriceListRequest;
import com.anhtin.tmdt.backend.dto.response.PriceListDTO;
import com.anhtin.tmdt.backend.dto.response.PriceListItemDTO;
import com.anhtin.tmdt.backend.entity.*;
import com.anhtin.tmdt.backend.repository.*;
import lombok.Getter;
import lombok.Setter;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class PriceListService {

    @Autowired
    private PriceListRepository priceListRepository;

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

    @SuppressWarnings("null")
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
        priceListItemRepository.saveAll(items);

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

    @SuppressWarnings("null")
    @Transactional
    public void updatePriceListItem(Long priceListId, PriceListItemUpdateRequest request) {
        if (priceListId == null || request.getProductId() == null) {
            throw new IllegalArgumentException("IDs cannot be null");
        }
        PriceListItem item = priceListItemRepository.findByPriceListIdAndProductId(priceListId, request.getProductId())
                .orElseThrow(() -> new RuntimeException("Item not found in price list"));
        if (request.getPrice() != null) item.setPrice(request.getPrice());
        if (request.getIsVisible() != null) item.setIsVisible(request.getIsVisible());
        priceListItemRepository.save(item);
    }

    @SuppressWarnings("null")
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
        priceListItemRepository.saveAll(newItems);
    }

    // --- Resolve Logic ---

    /** Lấy bảng giá hiệu lực cho Đại lý */
    public PriceList resolveForAgency(Long agencyId) {
        if (agencyId == null) {
            throw new IllegalArgumentException("Agency ID cannot be null");
        }
        
        // Tầng 1: Chỉ định trực tiếp (AgencyPriceList)
        Optional<AgencyPriceList> assigned = agencyPriceListRepository.findByAgencyId(agencyId);
        if (assigned.isPresent()) return assigned.get().getPriceList();

        // Lấy rank hiện tại của đại lý (từ bảng rankings tháng gần nhất hoặc default)
        if (!agencyRepository.existsById(agencyId)) {
            throw new RuntimeException("Agency not found");
        }
        // Lấy rank thực tế của đại lý
        String rank = getAgencyRank(agencyId);

        // Tầng 2: Theo hạng đại lý (AGENCY_RANK)
        List<PriceListCondition> rankConditions = priceListConditionRepository
                .findByConditionTypeAndRankLevelOrderByPriorityDesc(PriceListConditionType.AGENCY_RANK, rank);
        if (!rankConditions.isEmpty()) return rankConditions.get(0).getPriceList();

        // Tầng 3: Toàn bộ đại lý (ALL_AGENCY)
        List<PriceListCondition> allAgencyConditions = priceListConditionRepository
                .findByConditionTypeOrderByPriorityDesc(PriceListConditionType.ALL_AGENCY);
        if (!allAgencyConditions.isEmpty()) return allAgencyConditions.get(0).getPriceList();

        // Tầng 4: Mặc định
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
                        .findByConditionTypeAndCustomerGroupIdOrderByPriorityDesc(PriceListConditionType.CUSTOMER_GROUP, user.getCustomerGroup().getId());
                if (!groupConditions.isEmpty()) return groupConditions.get(0).getPriceList();
            }
        }

        // Tầng 3: Toàn bộ khách hàng (ALL_CUSTOMER)
        List<PriceListCondition> allCustomerConditions = priceListConditionRepository
                .findByConditionTypeOrderByPriorityDesc(PriceListConditionType.ALL_CUSTOMER);
        if (!allCustomerConditions.isEmpty()) return allCustomerConditions.get(0).getPriceList();

        // Tầng 4: Mặc định
        return priceListRepository.findByIsDefaultTrue()
                .orElseThrow(() -> new RuntimeException("Default price list not found"));
    }

    // --- Assignments ---

    @SuppressWarnings("null")
    @Transactional
    public void assignToAgency(AgencyPriceListRequest request) {
        if (request.getAgencyId() == null || request.getPriceListId() == null) {
            throw new IllegalArgumentException("IDs cannot be null");
        }
        agencyPriceListRepository.findByAgencyId(request.getAgencyId()).ifPresent(agencyPriceListRepository::delete);
        
        Agency agency = agencyRepository.findById(request.getAgencyId()).orElseThrow();
        PriceList pl = priceListRepository.findById(request.getPriceListId()).orElseThrow();
        
        AgencyPriceList apl = new AgencyPriceList();
        apl.setAgency(agency);
        apl.setPriceList(pl);
        agencyPriceListRepository.save(apl);
    }

    @SuppressWarnings("null")
    @Transactional
    public void setAgencyStorePriceList(Long agencyId, Long priceListId) {
        if (agencyId == null || priceListId == null) {
            throw new IllegalArgumentException("IDs cannot be null");
        }
        agencyStorePriceListRepository.findByAgencyId(agencyId).ifPresent(agencyStorePriceListRepository::delete);
        
        Agency agency = agencyRepository.findById(agencyId).orElseThrow();
        PriceList pl = priceListRepository.findById(priceListId).orElseThrow();
        
        AgencyStorePriceList aspl = new AgencyStorePriceList();
        aspl.setAgency(agency);
        aspl.setPriceList(pl);
        agencyStorePriceListRepository.save(aspl);
    }

    @SuppressWarnings("null")
    @Transactional
    public void unassignAgency(Long agencyId) {
        if (agencyId == null) throw new IllegalArgumentException("Agency ID cannot be null");
        agencyPriceListRepository.findByAgencyId(agencyId).ifPresent(agencyPriceListRepository::delete);
    }

    public List<Long> getAssignedAgencyIds(Long priceListId) {
        return agencyPriceListRepository.findByPriceListId(priceListId).stream()
                .map(apl -> apl.getAgency().getId())
                .collect(Collectors.toList());
    }

    @Getter
    @Setter
    public static class ResolvedPriceInfo {
        private Double price;
        private String priceListName;
        private Long priceListId;
    }

    @SuppressWarnings("null")
    public ResolvedPriceInfo getResolvedPriceInfo(Long productId, Long agencyId, Long customerId) {
        List<PriceList> candidates = new ArrayList<>();
        
        if (customerId != null) {
            // Hierarchy for Customer: Store -> Group -> All Customer -> Default
            agencyStorePriceListRepository.findByAgencyId(agencyId).ifPresent(s -> candidates.add(s.getPriceList()));
            
            User user = userRepository.findById(customerId).orElse(null);
            if (user != null && user.getCustomerGroup() != null) {
                priceListConditionRepository.findByConditionTypeAndCustomerGroupIdOrderByPriorityDesc(
                        PriceListConditionType.CUSTOMER_GROUP, user.getCustomerGroup().getId())
                        .forEach(c -> candidates.add(c.getPriceList()));
            }
            
            priceListConditionRepository.findByConditionTypeOrderByPriorityDesc(PriceListConditionType.ALL_CUSTOMER)
                    .forEach(c -> candidates.add(c.getPriceList()));
        } else {
            // Hierarchy for Agency: Direct -> Rank -> All Agency -> Default
            agencyPriceListRepository.findByAgencyId(agencyId).ifPresent(a -> candidates.add(a.getPriceList()));
            
            // Lấy rank thực tế của đại lý
            String rank = getAgencyRank(agencyId);
            priceListConditionRepository.findByConditionTypeAndRankLevelOrderByPriorityDesc(
                    PriceListConditionType.AGENCY_RANK, rank)
                    .forEach(c -> candidates.add(c.getPriceList()));
            
            priceListConditionRepository.findByConditionTypeOrderByPriorityDesc(PriceListConditionType.ALL_AGENCY)
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
