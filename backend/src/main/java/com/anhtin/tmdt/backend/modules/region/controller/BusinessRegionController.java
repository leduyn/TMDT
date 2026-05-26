package com.anhtin.tmdt.backend.modules.region.controller;

import com.anhtin.tmdt.backend.modules.region.dto.BusinessRegionDTO;
import com.anhtin.tmdt.backend.modules.region.dto.BusinessRegionRequest;
import com.anhtin.tmdt.backend.modules.region.service.BusinessRegionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/regions")
@CrossOrigin(origins = "*")
public class BusinessRegionController {

    @Autowired
    private BusinessRegionService regionService;

    @GetMapping
    @PreAuthorize("isAuthenticated()")
    public List<BusinessRegionDTO> getAllRegions() {
        return regionService.getAllRegions();
    }

    @GetMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public BusinessRegionDTO getRegionById(@PathVariable Long id) {
        return regionService.getRegionById(id);
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('COMPANY', 'ADMIN')")
    public BusinessRegionDTO createRegion(@RequestBody BusinessRegionRequest request) {
        return regionService.createRegion(request);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('COMPANY', 'ADMIN')")
    public BusinessRegionDTO updateRegion(@PathVariable Long id, @RequestBody BusinessRegionRequest request) {
        return regionService.updateRegion(id, request);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('COMPANY', 'ADMIN')")
    public void deleteRegion(@PathVariable Long id) {
        regionService.deleteRegion(id);
    }
}
