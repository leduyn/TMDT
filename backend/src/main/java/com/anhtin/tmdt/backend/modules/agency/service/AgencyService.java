package com.anhtin.tmdt.backend.modules.agency.service;

import com.anhtin.tmdt.backend.modules.agency.dto.AgencyCustomerDTO;
import com.anhtin.tmdt.backend.modules.agency.dto.AgencyRequest;
import com.anhtin.tmdt.backend.modules.agency.dto.AgencyDTO;
import com.anhtin.tmdt.backend.modules.agency.dto.AgencyRegisterRequest;
import com.anhtin.tmdt.backend.modules.agency.dto.AgencyApproveRequest;
import com.anhtin.tmdt.backend.modules.agency.entity.Agency;
import com.anhtin.tmdt.backend.modules.agency.entity.AgencyType;
import com.anhtin.tmdt.backend.modules.agency.repository.AgencyRepository;
import com.anhtin.tmdt.backend.modules.customer.entity.Customer;
import com.anhtin.tmdt.backend.modules.customer.repository.CustomerRepository;
import com.anhtin.tmdt.backend.modules.agency.entity.AgencyCustomerAssignment;
import com.anhtin.tmdt.backend.modules.agency.repository.AgencyCustomerAssignmentRepository;
import com.anhtin.tmdt.backend.modules.credit.service.CreditService;
import com.anhtin.tmdt.backend.modules.credit.entity.DepositContract;
import com.anhtin.tmdt.backend.modules.credit.repository.DepositContractRepository;
import com.anhtin.tmdt.backend.modules.credit.dto.CreditTermsRequest;
import com.anhtin.tmdt.backend.security.services.AgencyUserDetails;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
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
}
