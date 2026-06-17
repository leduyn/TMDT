package com.anhtin.tmdt.backend.modules.product.service;

import com.anhtin.tmdt.backend.modules.product.dto.ProductTypeRequest;
import com.anhtin.tmdt.backend.modules.common.dto.ProductTypeDTO;
import com.anhtin.tmdt.backend.modules.product.entity.ProductType;
import com.anhtin.tmdt.backend.modules.product.repository.ProductTypeRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.lang.NonNull;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class ProductTypeService {

    @Autowired
    private ProductTypeRepository productTypeRepository;

    public List<ProductTypeDTO> getAllProductTypes() {
        return productTypeRepository.findAll().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public ProductTypeDTO getProductTypeById(@NonNull Long id) {
        ProductType productType = productTypeRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("ProductType not found with id " + id));
        return convertToDTO(productType);
    }

    @Transactional
    public ProductTypeDTO createProductType(ProductTypeRequest request) {
        if (productTypeRepository.findByCode(request.getCode()).isPresent()) {
            throw new RuntimeException("ProductType code already exists");
        }
        ProductType productType = new ProductType();
        productType.setCode(request.getCode());
        productType.setName(request.getName());
        productType.setDescription(request.getDescription());
        return convertToDTO(productTypeRepository.save(productType));
    }

    @Transactional
    public ProductTypeDTO updateProductType(@NonNull Long id, ProductTypeRequest request) {
        ProductType productType = productTypeRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("ProductType not found with id " + id));

        productTypeRepository.findByCode(request.getCode()).ifPresent(existing -> {
            if (!existing.getId().equals(id)) {
                throw new RuntimeException("ProductType code already exists");
            }
        });

        productType.setCode(request.getCode());
        productType.setName(request.getName());
        productType.setDescription(request.getDescription());
        return convertToDTO(productTypeRepository.save(productType));
    }

    @Transactional
    public void deleteProductType(@NonNull Long id) {
        if (!productTypeRepository.existsById(id)) {
            throw new RuntimeException("ProductType not found with id " + id);
        }
        productTypeRepository.deleteById(id);
    }

    public ProductTypeDTO convertToDTO(ProductType productType) {
        return new ProductTypeDTO(productType.getId(), productType.getCode(),
                productType.getName(), productType.getDescription());
    }
}
