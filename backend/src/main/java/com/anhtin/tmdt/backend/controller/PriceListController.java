package com.anhtin.tmdt.backend.controller;

import com.anhtin.tmdt.backend.dto.request.AgencyPriceListRequest;
import com.anhtin.tmdt.backend.dto.request.PriceListItemUpdateRequest;
import com.anhtin.tmdt.backend.dto.request.PriceListRequest;
import com.anhtin.tmdt.backend.dto.response.MessageResponse;
import com.anhtin.tmdt.backend.dto.response.PriceListDTO;
import com.anhtin.tmdt.backend.dto.response.PriceListItemDTO;
import com.anhtin.tmdt.backend.entity.PriceList;
import com.anhtin.tmdt.backend.service.PriceListService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/price-lists")
public class PriceListController {

    @Autowired
    private PriceListService priceListService;

    @GetMapping
    public List<PriceListDTO> getAllPriceLists() {
        return priceListService.getAllPriceLists();
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

    @GetMapping("/{id}/items")
    public List<PriceListItemDTO> getPriceListItems(@PathVariable Long id) {
        return priceListService.getPriceListItems(id);
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
