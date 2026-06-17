package com.anhtin.tmdt.backend.modules.product.service;

import com.anhtin.tmdt.backend.modules.product.dto.BrandRequest;
import com.anhtin.tmdt.backend.modules.common.dto.BrandDTO;
import com.anhtin.tmdt.backend.modules.product.entity.Brand;
import com.anhtin.tmdt.backend.modules.product.repository.BrandRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.lang.NonNull;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class BrandService {

    @Autowired
    private BrandRepository brandRepository;

    public List<BrandDTO> getAllBrands() {
        return brandRepository.findAll().stream()
                .sorted(Comparator.comparing(Brand::getUpdatedDate, Comparator.nullsLast(Comparator.reverseOrder())))
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public BrandDTO getBrandById(@NonNull Long id) {
        Brand brand = brandRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Brand not found with id " + id));
        return convertToDTO(brand);
    }

    @Transactional
    public BrandDTO createBrand(BrandRequest request) {
        if (brandRepository.findByCode(request.getCode()).isPresent()) {
            throw new RuntimeException("Brand code already exists");
        }
        Brand brand = new Brand();
        setBrandFields(brand, request);
        return convertToDTO(brandRepository.save(brand));
    }

    @Transactional
    public BrandDTO updateBrand(@NonNull Long id, BrandRequest request) {
        Brand brand = brandRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Brand not found with id " + id));
        
        brandRepository.findByCode(request.getCode()).ifPresent(existing -> {
            if (!existing.getId().equals(id)) {
                throw new RuntimeException("Brand code already exists");
            }
        });

        setBrandFields(brand, request);
        return convertToDTO(brandRepository.save(brand));
    }

    private void setBrandFields(Brand brand, BrandRequest request) {
        brand.setCode(request.getCode());
        brand.setName(request.getName());
        brand.setLogoUrl(request.getLogoUrl());
        brand.setBravoId(request.getBravoId());
        brand.setIsHighlight(request.getIsHighlight());
        brand.setHighlightPriority(request.getHighlightPriority());
        brand.setStatus(request.getStatus());
        if (request.getCreatedDate() != null) {
            brand.setCreatedDate(LocalDateTime.parse(request.getCreatedDate(), DateTimeFormatter.ofPattern("yyyy-MM-dd'T'HH:mm:ss.SSSZ")));
        }
        brand.setBravoSortValue(request.getBravoSortValue());
        brand.setUpdatedDate(LocalDateTime.now());
    }

    @Transactional
    public void deleteBrand(@NonNull Long id) {
        if (!brandRepository.existsById(id)) {
            throw new RuntimeException("Brand not found with id " + id);
        }
        brandRepository.deleteById(id);
    }

    public BrandDTO convertToDTO(Brand brand) {
        return new BrandDTO(brand.getId(), brand.getCode(), brand.getName(), brand.getLogoUrl(),
                brand.getBravoId(), brand.getIsHighlight(), brand.getHighlightPriority(),
                brand.getStatus(), brand.getCreatedDate(), brand.getBravoSortValue(),
                brand.getUpdatedDate());
    }
}
