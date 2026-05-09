package com.anhtin.tmdt.backend.dto.request;
public class CustomerGroupRequest {
    public CustomerGroupRequest() {}

    private String name;
    private String description;

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
}
