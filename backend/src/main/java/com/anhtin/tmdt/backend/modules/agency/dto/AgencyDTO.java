package com.anhtin.tmdt.backend.modules.agency.dto;

import com.anhtin.tmdt.backend.modules.agency.entity.Agency;

public class AgencyDTO {
    private Long id;
    private String code;
    private String name;
    private String representativeName;
    private String taxCode;
    private String billingAddress;
    private String shippingAddress;
    private String receiverName;
    private String receiverPhone;
    private String nickname;
    private String phone;
    private boolean active;
    private String status;
    private String type;
    private boolean hasHmn;
    private Double hmnAmount;
    private String createdAt;

    public AgencyDTO() {}

    public AgencyDTO(Agency agency) {
        this.id = agency.getId();
        this.code = agency.getCode();
        this.name = agency.getName();
        this.representativeName = agency.getRepresentativeName();
        this.taxCode = agency.getTaxCode();
        this.billingAddress = agency.getBillingAddress();
        this.shippingAddress = agency.getShippingAddress();
        this.receiverName = agency.getReceiverName();
        this.receiverPhone = agency.getReceiverPhone();
        this.nickname = agency.getNickname();
        this.phone = agency.getPhone();
        this.active = agency.isActive();
        this.status = agency.getStatus() != null ? agency.getStatus().name() : null;
        this.type = agency.getType() != null ? agency.getType().name() : null;
        this.hasHmn = agency.isHasHmn();
        this.hmnAmount = agency.getHmnAmount();
        this.createdAt = agency.getCreatedAt() != null ? agency.getCreatedAt().toString() : null;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getCode() { return code; }
    public void setCode(String code) { this.code = code; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getRepresentativeName() { return representativeName; }
    public void setRepresentativeName(String representativeName) { this.representativeName = representativeName; }
    public String getTaxCode() { return taxCode; }
    public void setTaxCode(String taxCode) { this.taxCode = taxCode; }
    public String getBillingAddress() { return billingAddress; }
    public void setBillingAddress(String billingAddress) { this.billingAddress = billingAddress; }
    public String getShippingAddress() { return shippingAddress; }
    public void setShippingAddress(String shippingAddress) { this.shippingAddress = shippingAddress; }
    public String getReceiverName() { return receiverName; }
    public void setReceiverName(String receiverName) { this.receiverName = receiverName; }
    public String getReceiverPhone() { return receiverPhone; }
    public void setReceiverPhone(String receiverPhone) { this.receiverPhone = receiverPhone; }
    public String getNickname() { return nickname; }
    public void setNickname(String nickname) { this.nickname = nickname; }
    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }
    public boolean isActive() { return active; }
    public void setActive(boolean active) { this.active = active; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public String getType() { return type; }
    public void setType(String type) { this.type = type; }
    public boolean isHasHmn() { return hasHmn; }
    public void setHasHmn(boolean hasHmn) { this.hasHmn = hasHmn; }
    public Double getHmnAmount() { return hmnAmount; }
    public void setHmnAmount(Double hmnAmount) { this.hmnAmount = hmnAmount; }
    public String getCreatedAt() { return createdAt; }
    public void setCreatedAt(String createdAt) { this.createdAt = createdAt; }
}
