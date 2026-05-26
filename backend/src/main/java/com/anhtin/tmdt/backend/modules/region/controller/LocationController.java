package com.anhtin.tmdt.backend.modules.region.controller;

import com.anhtin.tmdt.backend.modules.region.dto.LocationDTO;
import com.anhtin.tmdt.backend.modules.region.service.LocationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/locations")
public class LocationController {

    @Autowired
    private LocationService locationService;

    @GetMapping("/hierarchy")
    public List<LocationDTO.ProvinceDTO> getLocationHierarchy() {
        return locationService.getLocationHierarchy();
    }
}
