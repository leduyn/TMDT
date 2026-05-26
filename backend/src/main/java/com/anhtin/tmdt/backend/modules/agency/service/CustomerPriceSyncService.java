package com.anhtin.tmdt.backend.modules.agency.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

import com.anhtin.tmdt.backend.modules.agency.entity.Agency;
import com.anhtin.tmdt.backend.modules.agency.repository.AgencyRepository;
import com.anhtin.tmdt.backend.modules.agency.entity.AgencyProductPrice;
import com.anhtin.tmdt.backend.modules.agency.entity.AgencyProductPriceHistory;
import com.anhtin.tmdt.backend.modules.agency.repository.AgencyProductPriceRepository;
import com.anhtin.tmdt.backend.modules.agency.repository.AgencyProductPriceHistoryRepository;
import com.anhtin.tmdt.backend.modules.product.entity.Product;
import com.anhtin.tmdt.backend.modules.product.repository.ProductRepository;
import com.anhtin.tmdt.backend.modules.price.service.PriceListService;
import com.anhtin.tmdt.backend.modules.price.entity.PriceList;
import com.anhtin.tmdt.backend.modules.agency.repository.AgencyPriceListRepository;

@Service
public class CustomerPriceSyncService {

    @Autowired
    private AgencyProductPriceRepository agencyProductPriceRepository;

    @Autowired
    private AgencyProductPriceHistoryRepository agencyProductPriceHistoryRepository;

    @Autowired
    private AgencyRepository agencyRepository;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private PriceListService priceListService;

    @Autowired
    private AgencyPriceListRepository agencyPriceListRepository;

    @Async
    @Transactional(propagation = org.springframework.transaction.annotation.Propagation.REQUIRES_NEW)
    public void syncAllPricesForAgency(Long agencyId, Long changedById, String changeSource) {
        if (agencyId == null) return;
        Agency agency = agencyRepository.findById(agencyId).orElse(null);
        if (agency == null) return;

        List<Product> products = productRepository.findAll();
        for (Product product : products) {
            syncSingleProductPriceForAgency(agency, product, changedById, changeSource);
        }
    }

    @Async
    @Transactional(propagation = org.springframework.transaction.annotation.Propagation.REQUIRES_NEW)
    public void syncAllPricesForPriceList(Long priceListId, Long changedById, String changeSource) {
        if (priceListId == null) return;
        List<Long> agencyIds = priceListService.getAssignedAgencyIds(priceListId);
        // Note: For full accuracy, we should also find agencies whose Rank maps to this price list,
        // or ALL_AGENCY if it's the ALL_AGENCY price list.
        // For simplicity, we sync for all agencies to ensure consistency.
        List<Agency> allAgencies = agencyRepository.findAll();
        List<Product> products = productRepository.findAll();

        for (Agency agency : allAgencies) {
            for (Product product : products) {
                syncSingleProductPriceForAgency(agency, product, changedById, changeSource);
            }
        }
    }

    @Async
    @Transactional(propagation = org.springframework.transaction.annotation.Propagation.REQUIRES_NEW)
    public void syncPriceForProductInPriceList(Long priceListId, Long productId, Long changedById, String changeSource) {
        if (priceListId == null || productId == null) return;
        Product product = productRepository.findById(productId).orElse(null);
        if (product == null) return;

        List<Agency> allAgencies = agencyRepository.findAll();
        for (Agency agency : allAgencies) {
            syncSingleProductPriceForAgency(agency, product, changedById, changeSource);
        }
    }

    private void syncSingleProductPriceForAgency(Agency agency, Product product, Long changedById, String changeSource) {
        Optional<AgencyProductPrice> existingOpt = agencyProductPriceRepository.findByAgencyIdAndProductId(agency.getId(), product.getId());
        if (existingOpt.isPresent() && Boolean.TRUE.equals(existingOpt.get().getIsOverride())) {
            // Ignore overridden prices during auto-sync
            return;
        }

        // Calculate what the price SHOULD be from price lists
        PriceListService.ResolvedPriceInfo rawInfo = priceListService.calculateRawPriceInfoForAgency(product.getId(), agency.getId());
        if (rawInfo == null || rawInfo.getPrice() == null) return;

        AgencyProductPrice app;
        Double oldPrice = null;

        if (existingOpt.isPresent()) {
            app = existingOpt.get();
            Long existingPlId = app.getSourcePriceList() != null ? app.getSourcePriceList().getId() : null;
            boolean priceEquals = (app.getPrice() == null && rawInfo.getPrice() == null) ||
                                 (app.getPrice() != null && app.getPrice().equals(rawInfo.getPrice()));
            boolean sourcePlEquals = java.util.Objects.equals(existingPlId, rawInfo.getPriceListId());
            
            if (priceEquals && sourcePlEquals) {
                // No change
                return;
            }
            oldPrice = app.getPrice();
        } else {
            app = new AgencyProductPrice();
            app.setAgency(agency);
            app.setProduct(product);
            app.setIsOverride(false);
        }

        app.setPrice(rawInfo.getPrice());
        if (oldPrice != null) {
            app.setOldPrice(oldPrice);
        }
        
        // Lookup price list reference
        if (rawInfo.getPriceListId() != null) {
            PriceList pl = new PriceList();
            pl.setId(rawInfo.getPriceListId());
            app.setSourcePriceList(pl);
        } else {
            app.setSourcePriceList(null);
        }

        app.setUpdatedAt(java.time.LocalDateTime.now());
        agencyProductPriceRepository.save(app);

        // Save history
        AgencyProductPriceHistory history = new AgencyProductPriceHistory();
        history.setAgencyProductPrice(app);
        history.setAgency(agency);
        history.setProduct(product);
        history.setOldPrice(oldPrice);
        history.setNewPrice(app.getPrice());
        
        if (changedById != null) {
            com.anhtin.tmdt.backend.modules.user.entity.User user = new com.anhtin.tmdt.backend.modules.user.entity.User();
            user.setId(changedById);
            history.setChangedBy(user);
        }
        
        history.setChangeSource(changeSource);
        history.setSourcePriceList(app.getSourcePriceList());
        agencyProductPriceHistoryRepository.save(history);
    }
}
