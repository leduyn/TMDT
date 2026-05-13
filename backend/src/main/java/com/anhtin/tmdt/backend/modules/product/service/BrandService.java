package com.anhtin.tmdt.backend.modules.product.service;

import com.anhtin.tmdt.backend.modules.product.dto.BrandRequest;
import com.anhtin.tmdt.backend.modules.common.dto.BrandDTO;
import com.anhtin.tmdt.backend.modules.product.entity.Brand;
import com.anhtin.tmdt.backend.modules.product.repository.BrandRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.lang.NonNull;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;
import com.anhtin.tmdt.backend.modules.product.entity.Product;
import com.anhtin.tmdt.backend.modules.order.entity.Transaction;

@Service
public class BrandService {

    @Autowired
    private BrandRepository brandRepository;

    public List<BrandDTO> getAllBrands() {
        return brandRepository.findAll().stream()
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
        brand.setCode(request.getCode());
        brand.setName(request.getName());
        brand.setLogoUrl(request.getLogoUrl());
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

        brand.setCode(request.getCode());
        brand.setName(request.getName());
        brand.setLogoUrl(request.getLogoUrl());
        return convertToDTO(brandRepository.save(brand));
    }

    @Transactional
    public void deleteBrand(@NonNull Long id) {
        if (!brandRepository.existsById(id)) {
            throw new RuntimeException("Brand not found with id " + id);
        }
        brandRepository.deleteById(id);
    }

    public BrandDTO convertToDTO(Brand brand) {
        return new BrandDTO(brand.getId(), brand.getCode(), brand.getName(), brand.getLogoUrl());
    }
}
