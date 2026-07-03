package com.anhtin.tmdt.backend.modules.price.controller;

import com.anhtin.tmdt.backend.modules.agency.dto.AgencyPriceListRequest;
import com.anhtin.tmdt.backend.modules.price.dto.PriceListItemUpdateRequest;
import com.anhtin.tmdt.backend.modules.price.dto.PriceListRequest;
import com.anhtin.tmdt.backend.modules.common.dto.MessageResponse;
import com.anhtin.tmdt.backend.modules.common.dto.PriceListDTO;
import com.anhtin.tmdt.backend.modules.common.dto.PriceListItemDTO;
import com.anhtin.tmdt.backend.modules.price.entity.PriceList;
import com.anhtin.tmdt.backend.modules.price.service.PriceListService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import com.anhtin.tmdt.backend.modules.user.entity.User;
import com.anhtin.tmdt.backend.modules.agency.entity.Agency;

@RestController
@RequestMapping("/api/price-lists")
public class PriceListController {

    @Autowired
    private PriceListService priceListService;

    @GetMapping
    public List<PriceListDTO> getAllPriceLists() {
        return priceListService.getAllPriceLists();
    }

    @GetMapping("/page")
    public Page<PriceListDTO> getPriceListsPage(@PageableDefault(size = 20) Pageable pageable) {
        return priceListService.getPriceListsPage(pageable);
    }

    @GetMapping("/{id}")
    public PriceListDTO getPriceListById(@PathVariable Long id) {
        return priceListService.getPriceListById(id);
    }

    @PostMapping
    @PreAuthorize("hasRole('COMPANY')")
    public PriceListDTO createPriceList(@RequestBody PriceListRequest request) {
        return priceListService.createPriceList(request);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('COMPANY')")
    public PriceListDTO updatePriceList(@PathVariable Long id, @RequestBody PriceListRequest request) {
        return priceListService.updatePriceList(id, request);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('COMPANY')")
    public ResponseEntity<?> deletePriceList(@PathVariable Long id) {
        priceListService.deletePriceList(id);
        return ResponseEntity.ok(new MessageResponse("Deleted price list successfully"));
    }

    @PutMapping("/{id}/set-default")
    @PreAuthorize("hasRole('COMPANY')")
    public ResponseEntity<?> setDefaultPriceList(@PathVariable Long id) {
        priceListService.setDefaultPriceList(id);
        return ResponseEntity.ok(new MessageResponse("Default price list updated successfully"));
    }

    @GetMapping("/{id}/items")
    public Page<PriceListItemDTO> getPriceListItems(
            @PathVariable Long id,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) String search) {
        return priceListService.getPriceListItems(id, page, size, search);
    }

    @PutMapping("/{id}/items")
    @PreAuthorize("hasRole('COMPANY')")
    public ResponseEntity<?> updateItem(@PathVariable Long id, @RequestBody PriceListItemUpdateRequest request) {
        priceListService.updatePriceListItem(id, request);
        return ResponseEntity.ok(new MessageResponse("Updated price list item successfully"));
    }

    @PostMapping("/assign-agency")
    @PreAuthorize("hasRole('COMPANY')")
    public ResponseEntity<?> assignToAgency(@RequestBody AgencyPriceListRequest request) {
        priceListService.assignToAgency(request);
        return ResponseEntity.ok(new MessageResponse("Assigned price list to agency successfully"));
    }

    @PostMapping("/my-store/{priceListId}")
    @PreAuthorize("hasRole('AGENCY')")
    public ResponseEntity<?> setMyStorePriceList(@PathVariable Long priceListId, @RequestParam Long agencyId) {
        // In a real app, agencyId would be extracted from the authenticated user principal
        priceListService.setAgencyStorePriceList(agencyId, priceListId);
        return ResponseEntity.ok(new MessageResponse("Updated store price list successfully"));
    }

    @GetMapping("/resolve/agency/{agencyId}")
    public PriceListDTO resolveForAgency(@PathVariable Long agencyId) {
        PriceList pl = priceListService.resolveForAgency(agencyId);
        return new PriceListDTO(pl, null);
    }

    @GetMapping("/resolve/customer/{agencyId}")
    public PriceListDTO resolveForCustomer(@PathVariable Long agencyId, @RequestParam(required = false) Long customerId) {
        PriceList pl = priceListService.resolveForCustomer(customerId, agencyId);
        return new PriceListDTO(pl, null);
    }

    @DeleteMapping("/unassign-agency/{agencyId}")
    @PreAuthorize("hasRole('COMPANY')")
    public ResponseEntity<?> unassignAgency(@PathVariable Long agencyId) {
        priceListService.unassignAgency(agencyId);
        return ResponseEntity.ok(new MessageResponse("Unassigned agency successfully"));
    }

    @GetMapping("/{id}/assigned-agencies")
    public List<Long> getAssignedAgencies(@PathVariable Long id) {
        return priceListService.getAssignedAgencyIds(id);
    }

    @GetMapping("/resolved-price")
    public ResponseEntity<Double> getResolvedPrice(
            @RequestParam Long productId,
            @RequestParam Long agencyId,
            @RequestParam(required = false) Long customerId) {
        Double price = priceListService.getResolvedPrice(productId, agencyId, customerId);
        return ResponseEntity.ok(price);
    }
}
