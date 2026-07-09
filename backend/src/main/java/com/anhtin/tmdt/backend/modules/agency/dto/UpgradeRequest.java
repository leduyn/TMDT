package com.anhtin.tmdt.backend.modules.agency.dto;

import jakarta.validation.constraints.NotBlank;

public class UpgradeRequest {

    private boolean agreedToTerms;
    private String termsVersion;

    public boolean isAgreedToTerms() { return agreedToTerms; }
    public void setAgreedToTerms(boolean agreedToTerms) { this.agreedToTerms = agreedToTerms; }
    public String getTermsVersion() { return termsVersion; }
    public void setTermsVersion(String termsVersion) { this.termsVersion = termsVersion; }
}