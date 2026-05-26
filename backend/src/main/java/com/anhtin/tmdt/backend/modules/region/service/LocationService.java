package com.anhtin.tmdt.backend.modules.region.service;

import com.anhtin.tmdt.backend.modules.region.dto.LocationDTO;
import com.anhtin.tmdt.backend.modules.region.entity.Province;
import com.anhtin.tmdt.backend.modules.region.entity.Ward;
import com.anhtin.tmdt.backend.modules.region.repository.ProvinceRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class LocationService {

    @Autowired
    private ProvinceRepository provinceRepository;

    @Transactional(readOnly = true)
    public List<LocationDTO.ProvinceDTO> getLocationHierarchy() {
        return provinceRepository.findAll().stream()
                .map(this::mapProvinceToDTO)
                .collect(Collectors.toList());
    }

    private LocationDTO.ProvinceDTO mapProvinceToDTO(Province province) {
        LocationDTO.ProvinceDTO dto = new LocationDTO.ProvinceDTO(
                province.getId(),
                province.getCode(),
                province.getName()
        );
        
        if (province.getWards() != null) {
            dto.setWards(province.getWards().stream()
                    .map(this::mapWardToDTO)
                    .collect(Collectors.toList()));
        }
        
        return dto;
    }


    private LocationDTO.WardDTO mapWardToDTO(Ward ward) {
        return new LocationDTO.WardDTO(
                ward.getId(),
                ward.getCode(),
                ward.getName(),
                ward.getRegion() != null ? ward.getRegion().getId() : null,
                ward.getRegion() != null ? ward.getRegion().getName() : null
        );
    }
}
