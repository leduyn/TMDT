package com.anhtin.tmdt.backend.modules.region.service;

import com.anhtin.tmdt.backend.modules.region.entity.Province;
import com.anhtin.tmdt.backend.modules.region.entity.Ward;
import com.anhtin.tmdt.backend.modules.region.repository.ProvinceRepository;
import com.anhtin.tmdt.backend.modules.region.repository.WardRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class LocationSyncService {

    @Autowired
    private ProvinceRepository provinceRepository;

    @Autowired
    private WardRepository wardRepository;

    private final RestTemplate restTemplate = new RestTemplate();
    private final ObjectMapper objectMapper = new ObjectMapper();

    private boolean isSyncingProvinces = false;
    private boolean isSyncingWards = false;

    @Transactional
    public void syncProvinces() {
        if (isSyncingProvinces) return;
        isSyncingProvinces = true;
        try {
            System.out.println("--- BẮT ĐẦU ĐỒNG BỘ TỈNH THÀNH (v2) ---");
            ProvinceV2[] provinces = restTemplate.getForObject("https://provinces.open-api.vn/api/v2/p/", ProvinceV2[].class);
            
            if (provinces == null) return;

            for (ProvinceV2 pData : provinces) {
                Province province = provinceRepository.findByCode((long) pData.getCode())
                        .orElse(new Province());
                province.setName(pData.getName());
                province.setCode((long) pData.getCode());
                province.setCodename(pData.getCodename());
                province.setDivisionType(pData.getDivision_type());
                province.setPhoneCode(pData.getPhone_code());
                provinceRepository.save(province);
            }
            System.out.println("--- HOÀN TẤT ĐỒNG BỘ " + provinces.length + " TỈNH THÀNH ---");
        } finally {
            isSyncingProvinces = false;
        }
    }

    @Transactional
    public void syncWards() {
        if (isSyncingWards) return;
        isSyncingWards = true;
        try {
            System.out.println("--- BẮT ĐẦU ĐỒNG BỘ PHƯỜNG XÃ VÀ LEGACY IDS (v2) ---");
            WardV2[] wards = restTemplate.getForObject("https://provinces.open-api.vn/api/v2/w/", WardV2[].class);
            
            if (wards == null) return;

            int count = 0;
            for (WardV2 wData : wards) {
                Ward ward = wardRepository.findByCode((long) wData.getCode())
                        .orElse(new Ward());
                
                ward.setName(wData.getName());
                ward.setCode((long) wData.getCode());
                ward.setCodename(wData.getCodename());
                ward.setDivisionType(wData.getDivision_type());
                ward.setShortCodename(wData.getShort_codename());
                
                // Link to province
                provinceRepository.findByCode((long) wData.getProvince_code()).ifPresent(ward::setProvince);

                // Sync Legacies
                try {
                    Object legacyData = restTemplate.getForObject(
                        "https://provinces.open-api.vn/api/v2/w/" + wData.getCode() + "/to-legacies/", 
                        Object.class
                    );
                    if (legacyData != null) {
                        ward.setLegacyIds(objectMapper.writeValueAsString(legacyData));
                    }
                } catch (Exception e) {
                    // Skip legacy error but keep ward data
                }

                wardRepository.save(ward);
                count++;
                if (count % 100 == 0) {
                    System.out.println("   - Đã đồng bộ " + count + "/" + wards.length + " phường xã...");
                }
            }
            System.out.println("--- HOÀN TẤT ĐỒNG BỘ " + count + " PHƯỜNG XÃ ---");
        } finally {
            isSyncingWards = false;
        }
    }

    // DTOs for v2 API
    static class ProvinceV2 {
        private String name;
        private int code;
        private String codename;
        private String division_type;
        private int phone_code;
        public String getName() { return name; }
        public void setName(String name) { this.name = name; }
        public int getCode() { return code; }
        public void setCode(int code) { this.code = code; }
        public String getCodename() { return codename; }
        public void setCodename(String codename) { this.codename = codename; }
        public String getDivision_type() { return division_type; }
        public void setDivision_type(String division_type) { this.division_type = division_type; }
        public int getPhone_code() { return phone_code; }
        public void setPhone_code(int phone_code) { this.phone_code = phone_code; }
    }

    static class WardV2 {
        private String name;
        private int code;
        private String codename;
        private String division_type;
        private String short_codename;
        private int province_code;
        public String getName() { return name; }
        public void setName(String name) { this.name = name; }
        public int getCode() { return code; }
        public void setCode(int code) { this.code = code; }
        public String getCodename() { return codename; }
        public void setCodename(String codename) { this.codename = codename; }
        public String getDivision_type() { return division_type; }
        public void setDivision_type(String division_type) { this.division_type = division_type; }
        public String getShort_codename() { return short_codename; }
        public void setShort_codename(String short_codename) { this.short_codename = short_codename; }
        public int getProvince_code() { return province_code; }
        public void setProvince_code(int province_code) { this.province_code = province_code; }
    }
}
