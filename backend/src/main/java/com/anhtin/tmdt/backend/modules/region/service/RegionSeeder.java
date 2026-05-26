package com.anhtin.tmdt.backend.modules.region.service;

import com.anhtin.tmdt.backend.modules.region.entity.BusinessRegion;
import com.anhtin.tmdt.backend.modules.region.entity.Province;
import com.anhtin.tmdt.backend.modules.region.entity.Ward;
import com.anhtin.tmdt.backend.modules.region.repository.BusinessRegionRepository;
import com.anhtin.tmdt.backend.modules.region.repository.ProvinceRepository;
import com.anhtin.tmdt.backend.modules.region.repository.WardRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Map;
import java.util.HashMap;

@Service
public class RegionSeeder implements CommandLineRunner {

    @Autowired
    private BusinessRegionRepository regionRepository;

    @Autowired
    private ProvinceRepository provinceRepository;

    @Autowired
    private WardRepository wardRepository;

    private final RestTemplate restTemplate = new RestTemplate();

    @Override
    public void run(String... args) throws Exception {
        boolean cleanFirst = Arrays.asList(args).contains("--clean-regions");

        if (cleanFirst) {
            System.out.println("Cleaning regions, provinces and wards...");
            regionRepository.deleteAll();
            provinceRepository.deleteAll();
            wardRepository.deleteAll();
        }

        if (provinceRepository.count() == 0) {
            seedData();
        }
    }

    private void seedData() {
        System.out.println("Seeding regions and hierarchy...");

        // Fetch hierarchy from v1 API (simpler for initial seeding if needed)
        // Actually, let's just fetch Provinces and Wards directly from v2
        ProvinceResponse[] provinces = restTemplate.getForObject("https://provinces.open-api.vn/api/p/", ProvinceResponse[].class);
        WardResponse[] wards = restTemplate.getForObject("https://provinces.open-api.vn/api/w/", WardResponse[].class);

        if (provinces != null && wards != null) {
            createRegion("MIEN_BAC", "Miền Bắc", "Khu vực các tỉnh phía Bắc", Arrays.asList(provinces).subList(0, 10), wards);
            createRegion("MIEN_TRUNG", "Miền Trung", "Khu vực các tỉnh miền Trung", Arrays.asList(provinces).subList(10, 20), wards);
            createRegion("MIEN_NAM", "Miền Nam", "Khu vực các tỉnh phía Nam", Arrays.asList(provinces).subList(20, provinces.length), wards);
        }

        System.out.println("Seeding completed!");
    }

    private void createRegion(String code, String name, String description, List<ProvinceResponse> provincesData, WardResponse[] wards) {
        BusinessRegion region = new BusinessRegion();
        region.setCode(code);
        region.setName(name);
        region.setDescription(description);
        region.setActive(true);

        Map<Integer, List<WardResponse>> wardsByProvince = new HashMap<>();
        for (WardResponse w : wards) {
            wardsByProvince.computeIfAbsent(w.getProvince_code(), k -> new ArrayList<>()).add(w);
        }

        for (ProvinceResponse pData : provincesData) {
            Province province = new Province();
            province.setName(pData.getName());
            province.setCode((long) pData.getCode());
            
            List<WardResponse> pWards = wardsByProvince.getOrDefault(pData.getCode(), new ArrayList<>());
            for (WardResponse wData : pWards) {
                Ward ward = new Ward();
                ward.setName(wData.getName());
                ward.setCode((long) wData.getCode());
                province.addWard(ward);
                region.addWard(ward);
            }
            provinceRepository.save(province);
        }

        regionRepository.save(region);
    }

    static class ProvinceResponse {
        private String name;
        private int code;
        public String getName() { return name; }
        public void setName(String name) { this.name = name; }
        public int getCode() { return code; }
        public void setCode(int code) { this.code = code; }
    }

    static class WardResponse {
        private String name;
        private int code;
        private int province_code;
        public String getName() { return name; }
        public void setName(String name) { this.name = name; }
        public int getCode() { return code; }
        public void setCode(int code) { this.code = code; }
        public int getProvince_code() { return province_code; }
        public void setProvince_code(int province_code) { this.province_code = province_code; }
    }
}
