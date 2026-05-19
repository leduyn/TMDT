package com.anhtin.tmdt.backend.modules.region.dto;

import java.util.List;

public class LocationDTO {

    public static class ProvinceDTO {
        private Long id;
        private Long code;
        private String name;
        private List<WardDTO> wards;

        public ProvinceDTO() {}
        public ProvinceDTO(Long id, Long code, String name) {
            this.id = id;
            this.code = code;
            this.name = name;
        }

        public Long getId() { return id; }
        public void setId(Long id) { this.id = id; }
        public Long getCode() { return code; }
        public void setCode(Long code) { this.code = code; }
        public String getName() { return name; }
        public void setName(String name) { this.name = name; }
        public List<WardDTO> getWards() { return wards; }
        public void setWards(List<WardDTO> wards) { this.wards = wards; }
    }


    public static class WardDTO {
        private Long id;
        private Long code;
        private String name;
        private Long regionId;
        private String regionName;

        public WardDTO() {}
        public WardDTO(Long id, Long code, String name, Long regionId, String regionName) {
            this.id = id;
            this.code = code;
            this.name = name;
            this.regionId = regionId;
            this.regionName = regionName;
        }

        public Long getId() { return id; }
        public void setId(Long id) { this.id = id; }
        public Long getCode() { return code; }
        public void setCode(Long code) { this.code = code; }
        public String getName() { return name; }
        public void setName(String name) { this.name = name; }
        public Long getRegionId() { return regionId; }
        public void setRegionId(Long regionId) { this.regionId = regionId; }
        public String getRegionName() { return regionName; }
        public void setRegionName(String regionName) { this.regionName = regionName; }
    }
}
