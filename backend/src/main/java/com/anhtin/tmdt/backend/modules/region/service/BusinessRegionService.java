package com.anhtin.tmdt.backend.modules.region.service;

import com.anhtin.tmdt.backend.modules.region.dto.BusinessRegionDTO;
import com.anhtin.tmdt.backend.modules.region.dto.BusinessRegionRequest;
import com.anhtin.tmdt.backend.modules.region.entity.BusinessRegion;
import com.anhtin.tmdt.backend.modules.region.entity.Ward;
import com.anhtin.tmdt.backend.modules.region.repository.BusinessRegionRepository;
import com.anhtin.tmdt.backend.modules.region.repository.WardRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Set;
import java.util.HashSet;
import java.util.stream.Collectors;

@Service
public class BusinessRegionService {

    @Autowired
    private BusinessRegionRepository regionRepository;

    @Autowired
    private WardRepository wardRepository;

    public List<BusinessRegionDTO> getAllRegions() {
        return regionRepository.findAll().stream()
                .map(BusinessRegionDTO::new)
                .collect(Collectors.toList());
    }

    public BusinessRegionDTO getRegionById(Long id) {
        BusinessRegion region = regionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Khu vực kinh doanh không tồn tại"));
        return new BusinessRegionDTO(region);
    }

    private Set<Ward> resolveWardsFromRequest(BusinessRegionRequest request) {
        Set<Ward> allWards = new HashSet<>();
        
        // Direct Ward IDs
        if (request.getWardIds() != null && !request.getWardIds().isEmpty()) {
            allWards.addAll(wardRepository.findByIdIn(request.getWardIds()));
        }
        
        // All Wards from Provinces
        if (request.getProvinceIds() != null && !request.getProvinceIds().isEmpty()) {
            allWards.addAll(wardRepository.findByProvinceIdIn(request.getProvinceIds()));
        }
        
        return allWards;
    }

    @Transactional
    public BusinessRegionDTO createRegion(BusinessRegionRequest request) {
        if (regionRepository.existsByCode(request.getCode())) {
            throw new RuntimeException("Mã khu vực kinh doanh đã tồn tại");
        }

        BusinessRegion region = new BusinessRegion();
        region.setCode(request.getCode());
        region.setName(request.getName());
        region.setDescription(request.getDescription());
        region.setActive(request.isActive());
        
        Set<Ward> wards = resolveWardsFromRequest(request);
        for (Ward ward : wards) {
            // Remove from old region if any
            if (ward.getRegion() != null) {
                ward.getRegion().removeWard(ward);
            }
            region.addWard(ward);
        }

        return new BusinessRegionDTO(regionRepository.save(region));
    }

    @Transactional
    public BusinessRegionDTO updateRegion(Long id, BusinessRegionRequest request) {
        BusinessRegion region = regionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Khu vực kinh doanh không tồn tại"));

        if (!region.getCode().equals(request.getCode()) && regionRepository.existsByCode(request.getCode())) {
            throw new RuntimeException("Mã khu vực kinh doanh đã tồn tại");
        }

        region.setCode(request.getCode());
        region.setName(request.getName());
        region.setDescription(request.getDescription());
        region.setActive(request.isActive());
        
        // Clear old wards
        List<Ward> oldWards = new java.util.ArrayList<>(region.getWards());
        for (Ward w : oldWards) {
            region.removeWard(w);
        }

        Set<Ward> wards = resolveWardsFromRequest(request);
        for (Ward ward : wards) {
            if (ward.getRegion() != null && !ward.getRegion().getId().equals(region.getId())) {
                ward.getRegion().removeWard(ward);
            }
            region.addWard(ward);
        }

        return new BusinessRegionDTO(regionRepository.save(region));
    }

    @Transactional
    public void deleteRegion(Long id) {
        if (!regionRepository.existsById(id)) {
            throw new RuntimeException("Khu vực kinh doanh không tồn tại");
        }
        regionRepository.deleteById(id);
    }
}
