package com.anhtin.tmdt.backend.modules.agency.service;

import com.anhtin.tmdt.backend.modules.agency.dto.*;
import com.anhtin.tmdt.backend.modules.agency.entity.*;
import com.anhtin.tmdt.backend.modules.agency.repository.*;
import com.anhtin.tmdt.backend.modules.common.dto.CategoryDTO;
import com.anhtin.tmdt.backend.modules.common.entity.SystemConfig;
import com.anhtin.tmdt.backend.modules.common.repository.SystemConfigRepository;
import com.anhtin.tmdt.backend.modules.customer.entity.Customer;
import com.anhtin.tmdt.backend.modules.customer.repository.CustomerRepository;
import com.anhtin.tmdt.backend.modules.credit.service.CreditService;
import com.anhtin.tmdt.backend.modules.credit.entity.DepositContract;
import com.anhtin.tmdt.backend.modules.credit.repository.DepositContractRepository;
import com.anhtin.tmdt.backend.modules.credit.dto.CreditTermsRequest;
import com.anhtin.tmdt.backend.modules.product.entity.Category;
import com.anhtin.tmdt.backend.modules.product.repository.CategoryRepository;
import com.anhtin.tmdt.backend.security.services.AgencyUserDetails;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class AgencyService {

    @Autowired
    private AgencyRepository agencyRepository;

    @Autowired
    private CustomerRepository customerRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private CreditService creditService;

    @Autowired
    private DepositContractRepository depositContractRepository;

    @Autowired
    private AgencyCustomerAssignmentRepository agencyCustomerAssignmentRepository;

    @Autowired
    private CategoryRepository categoryRepository;

    @Autowired
    private AgencyCategorySelectionRepository categorySelectionRepository;

    @Autowired
    private AgencyOpenedCategoryRepository openedCategoryRepository;

    @Autowired
    private AgencyTypeChangeHistoryRepository typeChangeHistoryRepository;

    @Autowired
    private SystemConfigRepository systemConfigRepository;

    private java.util.concurrent.atomic.AtomicLong contractSeq = new java.util.concurrent.atomic.AtomicLong(0);

    public List<AgencyDTO> getAllAgencies() {
        return agencyRepository.findAll().stream()
                .map(AgencyDTO::new)
                .collect(Collectors.toList());
    }

    public AgencyDTO getAgencyById(Long id) {
        Agency agency = agencyRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Agency not found"));
        return new AgencyDTO(agency);
    }

    @Transactional
    public AgencyDTO register(AgencyRegisterRequest request) {
        if (agencyRepository.existsByPhone(request.getPhone())) {
            throw new RuntimeException("Số điện thoại đã được đăng ký!");
        }
        if (agencyRepository.existsByCode(request.getCode())) {
            throw new RuntimeException("Mã đại lý đã tồn tại!");
        }
        if (request.getTaxCode() != null && !request.getTaxCode().isBlank()
                && agencyRepository.existsByTaxCode(request.getTaxCode())) {
            throw new RuntimeException("Mã số thuế đã tồn tại!");
        }

        Agency agency = new Agency();
        agency.setCode(request.getCode());
        agency.setName(request.getName());
        agency.setRepresentativeName(request.getRepresentativeName());
        agency.setTaxCode(request.getTaxCode());
        agency.setBillingAddress(request.getBillingAddress());
        agency.setShippingAddress(request.getShippingAddress());
        agency.setReceiverName(request.getReceiverName());
        agency.setReceiverPhone(request.getReceiverPhone());
        agency.setNickname(request.getNickname());
        agency.setPhone(request.getPhone());
        agency.setPassword(passwordEncoder.encode(request.getPassword()));
        agency.setStatus(com.anhtin.tmdt.backend.modules.agency.entity.AgencyStatus.PENDING);
        agency.setActive(false);

        Agency savedAgency = agencyRepository.save(agency);
        creditService.initializeCredit(savedAgency);
        return new AgencyDTO(savedAgency);
    }

    @Transactional
    public AgencyDTO createAgency(AgencyRequest request) {
        if (request.getCode() != null && agencyRepository.existsByCode(request.getCode())) {
            throw new RuntimeException("Mã đại lý đã tồn tại!");
        }
        if (request.getPhone() != null && agencyRepository.existsByPhone(request.getPhone())) {
            throw new RuntimeException("Số điện thoại đã được đăng ký!");
        }
        if (request.getTaxCode() != null && !request.getTaxCode().isBlank()
                && agencyRepository.existsByTaxCode(request.getTaxCode())) {
            throw new RuntimeException("Mã số thuế đã tồn tại!");
        }

        Agency agency = new Agency();
        agency.setCode(request.getCode());
        agency.setName(request.getName());
        agency.setRepresentativeName(request.getRepresentativeName());
        agency.setTaxCode(request.getTaxCode());
        agency.setBillingAddress(request.getBillingAddress());
        agency.setShippingAddress(request.getShippingAddress());
        agency.setReceiverName(request.getReceiverName());
        agency.setReceiverPhone(request.getReceiverPhone());
        agency.setNickname(request.getNickname());
        agency.setPhone(request.getPhone());
        if (request.getPassword() != null) {
            agency.setPassword(passwordEncoder.encode(request.getPassword()));
        }
        agency.setStatus(com.anhtin.tmdt.backend.modules.agency.entity.AgencyStatus.APPROVED);
        agency.setActive(true);
        if (request.getType() != null) {
            try {
                agency.setType(AgencyType.valueOf(request.getType().toUpperCase()));
            } catch (IllegalArgumentException e) {
                throw new RuntimeException("Loại đại lý không hợp lệ");
            }
        }

        Agency savedAgency = agencyRepository.save(agency);
        autoCreateCustomer(savedAgency);
        creditService.initializeCredit(savedAgency);
        return new AgencyDTO(savedAgency);
    }

    @Transactional
    public AgencyDTO approveAgency(Long id, AgencyApproveRequest request) {
        Agency agency = agencyRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Agency not found"));

        if (agency.getStatus() != com.anhtin.tmdt.backend.modules.agency.entity.AgencyStatus.PENDING) {
            throw new RuntimeException("Đại lý không ở trạng thái chờ duyệt");
        }

        String typeStr = request.getType() != null ? request.getType().toUpperCase() : "RETAIL";
        AgencyType agencyType;
        try {
            agencyType = AgencyType.valueOf(typeStr);
        } catch (IllegalArgumentException e) {
            throw new RuntimeException("Loại đại lý không hợp lệ: " + typeStr);
        }

        agency.setType(agencyType);

        if (agencyType == AgencyType.RETAIL) {
            agency.setHasHmn(false);
            agency.setHmnAmount(0.0);
            agency.setStatus(com.anhtin.tmdt.backend.modules.agency.entity.AgencyStatus.APPROVED);
            agency.setActive(true);
        } else if (agencyType == AgencyType.WHOLESALE) {
            if (request.getDepositAmount() == null || request.getDepositAmount() <= 0) {
                throw new RuntimeException("Vui lòng nhập giá trị đặt cọc cho đại lý bán sỉ");
            }
            agency.setHasHmn(true);
            agency.setHmnAmount(request.getDepositAmount());
            agency.setStatus(com.anhtin.tmdt.backend.modules.agency.entity.AgencyStatus.PENDING_DEPOSIT);
            agency.setActive(false); // Kích hoạt sau khi đóng đủ tiền cọc
        }

        Agency savedAgency = agencyRepository.save(agency);

        // Cập nhật KHN và HMKD
        if (agencyType == AgencyType.RETAIL) {
            creditService.updateCreditTerms(id, createTermsRequest(0.0, 0, 0.0));
        } else {
            int debtTermDays = request.getDebtTermDays() != null ? request.getDebtTermDays() : 30;
            Double initialVtc = request.getInitialVtc() != null ? request.getInitialVtc() : 0.0;
            creditService.updateCreditTerms(id, createTermsRequest(0.0, debtTermDays, initialVtc));
        }

        // Tạo hợp đồng đặt cọc cho WHOLESALE
        if (agencyType == AgencyType.WHOLESALE) {
            createDepositContract(savedAgency, request);
        }

        autoCreateCustomer(savedAgency);
        return new AgencyDTO(savedAgency);
    }

    private CreditTermsRequest createTermsRequest(Double creditLimit, Integer debtTermDays, Double initialVtc) {
        CreditTermsRequest req = new CreditTermsRequest();
        req.setCreditLimit(creditLimit);
        req.setDebtTermDays(debtTermDays);
        req.setInitialVtc(initialVtc);
        return req;
    }

    private void createDepositContract(Agency agency, AgencyApproveRequest request) {
        String contractNumber = "HDC-" + String.format("%05d", contractSeq.incrementAndGet())
            + "-" + java.time.LocalDate.now().toString().replace("-", "");
        while (depositContractRepository.existsByContractNumber(contractNumber)) {
            contractNumber = "HDC-" + String.format("%05d", contractSeq.incrementAndGet())
                + "-" + java.time.LocalDate.now().toString().replace("-", "");
        }

        DepositContract contract = new DepositContract();
        contract.setContractNumber(contractNumber);
        contract.setAgencyId(agency.getId());
        contract.setDepositAmount(request.getDepositAmount());
        contract.setContractDate(java.time.LocalDateTime.now());
        contract.setTerms(request.getContractTerms());
        contract.setStatus(DepositContract.DepositContractStatus.ACTIVE);
        depositContractRepository.save(contract);
    }

    private void autoCreateCustomer(Agency agency) {
        if (customerRepository.findByAgencyId(agency.getId()).isEmpty()) {
            Customer customer = new Customer();
            customer.setAgencyId(agency.getId());
            customer.setUserId(agency.getId());
            customer.setOrganizationName(agency.getName());
            customer.setTaxCode(agency.getTaxCode());
            customer.setShippingAddress(agency.getShippingAddress());
            customer.setBillingAddress(agency.getBillingAddress());
            customer.setReceiverName(agency.getReceiverName());
            customer.setReceiverPhone(agency.getReceiverPhone());
            customerRepository.save(customer);

            AgencyCustomerAssignment assignment = new AgencyCustomerAssignment();
            assignment.setCustomer(customer);
            assignment.setAgency(agency);
            assignment.setCustomName(agency.getName());
            assignment.setCustomShippingAddress(agency.getShippingAddress());
            assignment.setCustomPhone(agency.getReceiverPhone());
            assignment.setApproved(true);
            agencyCustomerAssignmentRepository.save(assignment);
        }
    }

    @Transactional
    public AgencyDTO updateAgency(Long id, AgencyRequest request) {
        Agency agency = agencyRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Agency not found"));

        org.springframework.security.core.Authentication auth = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication();
        boolean isCompany = auth.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("ROLE_COMPANY"));

        if (!isCompany) {
            Object principal = auth.getPrincipal();
            if (!(principal instanceof AgencyUserDetails)) {
                throw new RuntimeException("Bạn không có quyền thực hiện hành động này");
            }
            AgencyUserDetails agencyUser = (AgencyUserDetails) principal;
            if (!agency.getId().equals(agencyUser.getId())) {
                throw new RuntimeException("Bạn không có quyền thực hiện hành động này");
            }
            if (request.getName() != null) agency.setName(request.getName());
            if (request.getPhone() != null) agency.setPhone(request.getPhone());
            if (request.getRepresentativeName() != null) agency.setRepresentativeName(request.getRepresentativeName());
            if (request.getShippingAddress() != null) agency.setShippingAddress(request.getShippingAddress());
            if (request.getBillingAddress() != null) agency.setBillingAddress(request.getBillingAddress());
            if (request.getReceiverName() != null) agency.setReceiverName(request.getReceiverName());
            if (request.getReceiverPhone() != null) agency.setReceiverPhone(request.getReceiverPhone());
            if (request.getNickname() != null) agency.setNickname(request.getNickname());
            if (request.getAvatarUrl() != null) agency.setAvatarUrl(request.getAvatarUrl());
        } else {
            if (request.getCode() != null) agency.setCode(request.getCode());
            if (request.getName() != null) agency.setName(request.getName());
            if (request.getRepresentativeName() != null) agency.setRepresentativeName(request.getRepresentativeName());
            if (request.getTaxCode() != null) agency.setTaxCode(request.getTaxCode());
            if (request.getBillingAddress() != null) agency.setBillingAddress(request.getBillingAddress());
            if (request.getShippingAddress() != null) agency.setShippingAddress(request.getShippingAddress());
            if (request.getReceiverName() != null) agency.setReceiverName(request.getReceiverName());
            if (request.getReceiverPhone() != null) agency.setReceiverPhone(request.getReceiverPhone());
            if (request.getNickname() != null) agency.setNickname(request.getNickname());
            if (request.getPhone() != null) agency.setPhone(request.getPhone());
            if (request.getAvatarUrl() != null) agency.setAvatarUrl(request.getAvatarUrl());
            if (request.getPassword() != null && !request.getPassword().isBlank()) {
                agency.setPassword(passwordEncoder.encode(request.getPassword()));
            }
            if (request.getActive() != null) {
                agency.setActive(request.getActive());
            }
            if (request.getType() != null) {
                try {
                    agency.setType(AgencyType.valueOf(request.getType().toUpperCase()));
                } catch (IllegalArgumentException e) {
                    throw new RuntimeException("Loại đại lý không hợp lệ");
                }
            }
        }

        return new AgencyDTO(agencyRepository.save(agency));
    }

    @Transactional
    public AgencyDTO updateStatus(Long id, String action) {
        Agency agency = agencyRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Agency not found"));

        switch (action.toLowerCase()) {
            case "suspend":
                if (agency.getStatus() != AgencyStatus.APPROVED) {
                    throw new RuntimeException("Chỉ có thể tạm ngưng đại lý đã được duyệt");
                }
                agency.setActive(false);
                break;
            case "activate":
                if (agency.getStatus() == AgencyStatus.REJECTED) {
                    agency.setStatus(AgencyStatus.APPROVED);
                }
                agency.setActive(true);
                break;
            case "reject":
                if (agency.getStatus() == AgencyStatus.REJECTED) {
                    throw new RuntimeException("Đại lý đã bị từ chối trước đó");
                }
                if (agency.getStatus() == AgencyStatus.APPROVED && agency.isActive()) {
                    throw new RuntimeException("Không thể từ chối đại lý đang hoạt động. Hãy tạm ngưng trước.");
                }
                agency.setStatus(AgencyStatus.REJECTED);
                agency.setActive(false);
                break;
            default:
                throw new RuntimeException("Hành động không hợp lệ: " + action);
        }

        return new AgencyDTO(agencyRepository.save(agency));
    }

    public List<Map<String, Object>> getCategoryStats() {
        List<AgencyCategorySelection> allSelections = categorySelectionRepository.findAll();
        Map<Long, Long> countByCategory = allSelections.stream()
                .collect(Collectors.groupingBy(AgencyCategorySelection::getCategoryId, Collectors.counting()));

        List<Map<String, Object>> result = new ArrayList<>();
        for (Map.Entry<Long, Long> entry : countByCategory.entrySet()) {
            Category category = categoryRepository.findById(entry.getKey()).orElse(null);
            Map<String, Object> item = new HashMap<>();
            item.put("categoryId", entry.getKey());
            item.put("categoryName", category != null ? category.getName() : "Unknown");
            item.put("count", entry.getValue());
            result.add(item);
        }
        result.sort((a, b) -> Long.compare((Long) b.get("count"), (Long) a.get("count")));
        return result;
    }

    public List<CategoryDTO> getAgencyCategories(Long agencyId) {
        return categorySelectionRepository.findByAgencyId(agencyId).stream()
                .map(sel -> categoryRepository.findById(sel.getCategoryId()).orElse(null))
                .filter(c -> c != null)
                .map(CategoryDTO::new)
                .collect(Collectors.toList());
    }

    public List<Long> getOpenedCategoryIds(Long agencyId) {
        List<AgencyOpenedCategory> opened = openedCategoryRepository.findByAgencyId(agencyId);
        if (!opened.isEmpty()) {
            return opened.stream()
                    .map(AgencyOpenedCategory::getCategoryId)
                    .collect(Collectors.toList());
        }
        return categorySelectionRepository.findByAgencyId(agencyId).stream()
                .map(AgencyCategorySelection::getCategoryId)
                .collect(Collectors.toList());
    }

    @Transactional
    public void saveOpenedCategories(Long agencyId, List<Long> categoryIds) {
        openedCategoryRepository.deleteByAgencyId(agencyId);
        for (Long catId : categoryIds) {
            AgencyOpenedCategory oc = new AgencyOpenedCategory();
            oc.setAgencyId(agencyId);
            oc.setCategoryId(catId);
            openedCategoryRepository.save(oc);
        }
    }

    public AgencyDTO getAgencyByPhone(String phone) {
        return agencyRepository.findByPhone(phone)
                .map(AgencyDTO::new)
                .orElseThrow(() -> new RuntimeException("Agency not found"));
    }

    public List<AgencyCustomerDTO> getAgencyCustomers(Long agencyId) {
        List<AgencyCustomerDTO> result = new ArrayList<>();
        Set<Long> addedIds = new HashSet<>();

        agencyCustomerAssignmentRepository.findByAgencyId(agencyId).forEach(a -> {
            result.add(new AgencyCustomerDTO(a, a.getCustomer()));
            addedIds.add(a.getCustomer().getId());
        });

        customerRepository.findByAgencyId(agencyId).forEach(c -> {
            if (!addedIds.contains(c.getId())) {
                result.add(new AgencyCustomerDTO(null, c));
            }
        });

        return result;
    }

    @Transactional
    public void requestUpgrade(Long agencyId) {
        Agency agency = agencyRepository.findById(agencyId)
                .orElseThrow(() -> new RuntimeException("Agency not found"));

        if (agency.getType() == AgencyType.WHOLESALE) {
            throw new RuntimeException("Agency already WHOLESALE");
        }

        AgencyTypeChangeHistory existingPending = typeChangeHistoryRepository
                .findByAgencyIdOrderByCreatedAtDesc(agencyId)
                .stream().findFirst().orElse(null);
        if (existingPending != null && "PENDING".equals(existingPending.getReason())) {
            throw new RuntimeException("Already has a pending upgrade request");
        }

        AgencyTypeChangeHistory history = new AgencyTypeChangeHistory();
        history.setAgencyId(agencyId);
        history.setOldType(AgencyType.RETAIL.name());
        history.setNewType(AgencyType.WHOLESALE.name());
        history.setReason("PENDING");
        history.setCreatedAt(java.time.LocalDateTime.now());
        typeChangeHistoryRepository.save(history);
    }

    public List<Map<String, Object>> getUpgradeRequests() {
        List<AgencyTypeChangeHistory> histories = typeChangeHistoryRepository.findAll();
        return histories.stream()
                .filter(h -> "PENDING".equals(h.getReason()) || "APPROVED".equals(h.getReason()) || "REJECTED".equals(h.getReason()))
                .map(h -> {
                    Map<String, Object> m = new HashMap<>();
                    m.put("id", h.getId());
                    m.put("agencyId", h.getAgencyId());
                    m.put("oldType", h.getOldType());
                    m.put("newType", h.getNewType());
                    m.put("status", h.getReason());
                    m.put("rejectReason", null);
                    m.put("changedByName", h.getChangedByName());
                    m.put("createdAt", h.getCreatedAt());
                    try {
                        Agency a = agencyRepository.findById(h.getAgencyId()).orElse(null);
                        m.put("agencyName", a != null ? a.getName() : "Unknown");
                        m.put("agencyPhone", a != null ? a.getPhone() : "");
                    } catch (Exception ignored) {}
                    return m;
                })
                .collect(Collectors.toList());
    }

    @Transactional
    public void approveUpgrade(Long historyId, ApproveUpgradeRequest request, Long adminId, String adminName) {
        AgencyTypeChangeHistory history = typeChangeHistoryRepository.findById(historyId)
                .orElseThrow(() -> new RuntimeException("History not found"));

        if (!"PENDING".equals(history.getReason())) {
            throw new RuntimeException("Request is not pending");
        }

        if (request.isApproved()) {
            Agency agency = agencyRepository.findById(history.getAgencyId())
                    .orElseThrow(() -> new RuntimeException("Agency not found"));

            history.setOldType(agency.getType().name());
            agency.setType(AgencyType.WHOLESALE);
            history.setNewType(AgencyType.WHOLESALE.name());
            history.setReason("APPROVED");
            history.setChangedBy(adminId);
            history.setChangedByName(adminName);
            agencyRepository.save(agency);
        } else {
            history.setReason("REJECTED");
            history.setChangedBy(adminId);
            history.setChangedByName(adminName);
        }
        typeChangeHistoryRepository.save(history);
    }

    public List<AgencyTypeChangeHistoryDTO> getTypeHistory(Long agencyId) {
        return typeChangeHistoryRepository.findByAgencyIdOrderByCreatedAtDesc(agencyId)
                .stream()
                .map(h -> new AgencyTypeChangeHistoryDTO(
                        h.getId(), h.getAgencyId(), h.getOldType(), h.getNewType(),
                        h.getChangedByName(), "PENDING".equals(h.getReason()) ? null : h.getReason(),
                        h.getCreatedAt()))
                .collect(Collectors.toList());
    }

    public List<AgencyDTO> getRetailAgencies() {
        return agencyRepository.findByType(AgencyType.RETAIL).stream()
                .filter(agency -> agency.getStatus() == com.anhtin.tmdt.backend.modules.agency.entity.AgencyStatus.APPROVED)
                .map(AgencyDTO::new)
                .collect(Collectors.toList());
    }

    @Transactional
    public void directUpgrade(Long agencyId, Long adminId, String adminName) {
        Agency agency = agencyRepository.findById(agencyId)
                .orElseThrow(() -> new RuntimeException("Agency not found"));

        if (agency.getType() == AgencyType.WHOLESALE) {
            throw new RuntimeException("Agency is already WHOLESALE");
        }

        AgencyTypeChangeHistory history = new AgencyTypeChangeHistory();
        history.setAgencyId(agencyId);
        history.setOldType(agency.getType().name());
        history.setNewType(AgencyType.WHOLESALE.name());
        history.setChangedBy(adminId);
        history.setChangedByName(adminName);
        history.setReason("APPROVED");
        history.setCreatedAt(java.time.LocalDateTime.now());
        typeChangeHistoryRepository.save(history);

        agency.setType(AgencyType.WHOLESALE);
        agencyRepository.save(agency);
    }
}
