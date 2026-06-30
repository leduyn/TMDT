package com.anhtin.tmdt.backend.modules.credit.service;

import com.anhtin.tmdt.backend.modules.credit.entity.AgencyDebt;
import com.anhtin.tmdt.backend.modules.credit.entity.AgentCredit;
import com.anhtin.tmdt.backend.modules.credit.entity.CreditLedger;
import com.anhtin.tmdt.backend.modules.credit.repository.AgencyDebtRepository;
import com.anhtin.tmdt.backend.modules.credit.repository.AgentCreditRepository;
import com.anhtin.tmdt.backend.modules.customer.entity.Customer;
import com.anhtin.tmdt.backend.modules.order.entity.Order;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.HashMap;
import com.anhtin.tmdt.backend.modules.credit.repository.CreditLedgerRepository;
import com.anhtin.tmdt.backend.modules.order.repository.OrderRepository;
import com.anhtin.tmdt.backend.modules.agency.repository.AgencyRepository;
import com.anhtin.tmdt.backend.modules.agency.entity.Agency;

@Service
public class AgencyDebtService {

    @Autowired
    private AgencyDebtRepository agencyDebtRepository;

    @Autowired
    private AgentCreditRepository agentCreditRepository;

    @Autowired
    private CreditLedgerRepository creditLedgerRepository;

    @Autowired
    private AgencyRepository agencyRepository;

    @Transactional
    public void createDebtsForOrder(Order order) {
        if (order.getAgency() == null) return;

        AgentCredit credit = agentCreditRepository.findByAgencyId(order.getAgency().getId())
                .orElse(null);
        
        int termDays = 30;
        if (order.getDebtTermDays() != null) {
            termDays = order.getDebtTermDays();
        } else if (credit != null && credit.getDebtTermDays() != null) {
            termDays = credit.getDebtTermDays();
        }
        
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime dueDate = now.plusDays(termDays);

        Customer customer = order.getCustomer();
        String cusCode = customer != null ? customer.getOrganizationName() : "";
        String cusName = customer != null ? 
            (customer.getOrganizationName() != null ? customer.getOrganizationName() : "") : "";
        String cusLevel = "";
        
        String agencyCode = "AGENCY_" + order.getAgency().getId();
        String agencyName = order.getAgency().getName();

        // 1. Debt for product value
        double productValue = order.getTotalAmount() - (order.getDeliveryFee() != null ? order.getDeliveryFee() : 0.0);
        if (productValue > 0) {
            AgencyDebt prodDebt = new AgencyDebt();
            prodDebt.setAgency(order.getAgency());
            prodDebt.setOrder(order);
            prodDebt.setAgencyCode(agencyCode);
            prodDebt.setAgencyName(agencyName);
            prodDebt.setCustomerCode(cusCode);
            prodDebt.setCustomerName(cusName);
            prodDebt.setCustomerLevel(cusLevel);
            prodDebt.setDebtCode("CN-" + order.getId() + "-PROD");
            prodDebt.setDebtType(AgencyDebt.DebtType.ORDER_VALUE);
            prodDebt.setJobCategory("Tiền hàng - Đơn hàng " + order.getId());
            prodDebt.setDebtTermDays(termDays);
            prodDebt.setValue(productValue);
            prodDebt.setPaidValue(0.0);
            prodDebt.setRecordingDate(now);
            prodDebt.setDueDate(dueDate);
            prodDebt.setRemainingToCollect(productValue);
            prodDebt.setaCoin(0);
            agencyDebtRepository.save(prodDebt);

            // Tự động cấn trừ nếu đại lý đang có dư có (totalDebt < 0) - CHỈ ÁP DỤNG CHO ĐƠN ĐẠI LÝ
            if (credit != null && !"CUSTOMER".equals(order.getReceiverType()) && credit.getTotalDebt() < (productValue + (order.getDeliveryFee() != null ? order.getDeliveryFee() : 0.0))) {
                double covered = Math.max(0, productValue - Math.max(0, credit.getTotalDebt()));
                if (covered > 0) {
                    prodDebt.setPaidValue(covered);
                    prodDebt.setRemainingToCollect(productValue - covered);
                    prodDebt.setPaymentDate(now);
                    agencyDebtRepository.save(prodDebt);
                }
            }
        }

        // 2. Debt for delivery fee
        double deliveryFee = order.getDeliveryFee() != null ? order.getDeliveryFee() : 0.0;
        if (deliveryFee > 0) {
            AgencyDebt feeDebt = new AgencyDebt();
            feeDebt.setAgency(order.getAgency());
            feeDebt.setOrder(order);
            feeDebt.setAgencyCode(agencyCode);
            feeDebt.setAgencyName(agencyName);
            feeDebt.setCustomerCode(cusCode);
            feeDebt.setCustomerName(cusName);
            feeDebt.setCustomerLevel(cusLevel);
            feeDebt.setDebtCode("CN-" + order.getId() + "-FEE");
            feeDebt.setDebtType(AgencyDebt.DebtType.DELIVERY_FEE);
            feeDebt.setJobCategory("Phí giao hàng - Đơn hàng " + order.getId());
            feeDebt.setDebtTermDays(termDays);
            feeDebt.setValue(deliveryFee);
            feeDebt.setPaidValue(0.0);
            feeDebt.setRecordingDate(now);
            feeDebt.setDueDate(dueDate);
            feeDebt.setRemainingToCollect(deliveryFee);
            feeDebt.setaCoin(0);
            agencyDebtRepository.save(feeDebt);

            // Tự động cấn trừ phí giao hàng nếu vẫn còn dư có - CHỈ ÁP DỤNG CHO ĐƠN ĐẠI LÝ
            if (credit != null && !"CUSTOMER".equals(order.getReceiverType()) && credit.getTotalDebt() < deliveryFee) {
                double covered = Math.max(0, deliveryFee - Math.max(0, credit.getTotalDebt()));
                if (covered > 0) {
                    feeDebt.setPaidValue(covered);
                    feeDebt.setRemainingToCollect(deliveryFee - covered);
                    feeDebt.setPaymentDate(now);
                    agencyDebtRepository.save(feeDebt);
                }
            }
        }
    }

    public List<AgencyDebt> getDebtsByAgency(Long agencyId) {
        return agencyDebtRepository.findByAgencyIdOrderByRecordingDateDesc(agencyId);
    }

    public List<AgencyDebt> getDebtsByOrder(Long orderId) {
        return agencyDebtRepository.findByOrderId(orderId);
    }

    @Autowired
    private com.anhtin.tmdt.backend.modules.agency.repository.AgencyCustomerAssignmentRepository agencyCustomerAssignmentRepository;

    @Transactional
    public AgencyDebt payDebt(Long debtId, Double amount) {
        AgencyDebt debt = agencyDebtRepository.findById(debtId)
                .orElseThrow(() -> new RuntimeException("Debt not found"));

        if (amount <= 0) {
            throw new RuntimeException("Payment amount must be greater than 0");
        }

        LocalDateTime now = LocalDateTime.now();
        double actualPay = Math.min(amount, debt.getRemainingToCollect());
        debt.setPaidValue(debt.getPaidValue() + actualPay);
        debt.setPaymentDate(now);
        debt.setRemainingToCollect(Math.max(0, debt.getRemainingToCollect() - actualPay));

        Order order = debt.getOrder();
        if (order != null && order.getAgency() != null) {
            AgentCredit credit = agentCreditRepository.findByAgencyId(order.getAgency().getId()).orElse(null);

            // 1. Tăng ví ký quỹ khả dụng
            if (credit != null) {
                credit.setVtcAvailable(credit.getVtcAvailable() + actualPay);
                agentCreditRepository.save(credit);
            }

            // 2. Cập nhật dư nợ khách hàng
            if ("CUSTOMER".equals(order.getReceiverType()) && order.getCustomer() != null) {
                agencyCustomerAssignmentRepository.findByAgencyIdAndCustomerId(
                        order.getAgency().getId(), order.getCustomer().getId())
                    .ifPresent(assignment -> {
                        assignment.setTotalDebt(Math.max(0, assignment.getTotalDebt() - actualPay));
                        agencyCustomerAssignmentRepository.save(assignment);
                    });
            }

            // 3. Save ledger entry
            CreditLedger ledger = new CreditLedger();
            ledger.setAgencyId(order.getAgency().getId());
            ledger.setType(CreditLedger.LedgerType.PAYMENT);
            ledger.setAmount(actualPay);
            ledger.setReferenceId(order.getId().toString());
            creditLedgerRepository.save(ledger);
        }

        // 3. Cập nhật a-coin: Nếu thanh toán trước hạn thì cộng a-coin
        if (now.isBefore(debt.getDueDate()) || now.isEqual(debt.getDueDate())) {
            int newCoin = (int) Math.floor(actualPay / 100000);
            debt.setaCoin((debt.getaCoin() != null ? debt.getaCoin() : 0) + newCoin);
        }

        recalculateDebts(debt.getAgency().getId());
        return agencyDebtRepository.save(debt);
    }
    @Transactional
    public void recalculateDebts(Long agencyId) {
        List<AgencyDebt> allDebts = agencyDebtRepository.findByAgencyIdOrderByRecordingDateDesc(agencyId);
        
        double calculatedAgencyDebt = 0.0;
        double calculatedGuaranteeDebt = 0.0; // Công nợ của người mua chưa quá hạn
        double calculatedVtcHold = 0.0;       // Công nợ của người mua đã quá hạn
        Map<Long, Double> customerDebtMap = new HashMap<>();
        LocalDateTime now = LocalDateTime.now();

        for (AgencyDebt debt : allDebts) {
            double remaining = debt.getRemainingToCollect();
            if (remaining <= 0) continue;

            Order order = debt.getOrder();

            if (order != null && "CUSTOMER".equals(order.getReceiverType())) {
                // Khoản nợ của người mua — phân loại theo trạng thái quá hạn
                boolean isOverdue = debt.getDueDate() != null && debt.getDueDate().isBefore(now);
                if (isOverdue) {
                    calculatedVtcHold += remaining;
                } else {
                    calculatedGuaranteeDebt += remaining;
                }

                if (order.getCustomer() != null) {
                    Long cId = order.getCustomer().getId();
                    customerDebtMap.merge(cId, remaining, Double::sum);
                }
            } else {
                // Nợ của chính đại lý
                calculatedAgencyDebt += remaining;
            }
        }

        AgentCredit credit = agentCreditRepository.findByAgencyId(agencyId)
                .orElseGet(() -> {
                    Agency agency = agencyRepository.findById(agencyId)
                            .orElseThrow(() -> new RuntimeException("Agency not found"));
                    AgentCredit newCredit = new AgentCredit();
                    newCredit.setAgency(agency);
                    newCredit.setCreditLimit(0.0);
                    newCredit.setTotalDebt(0.0);
                    newCredit.setGuaranteeDebt(0.0);
                    newCredit.setVtcAvailable(0.0);
                    newCredit.setVtcHold(0.0);
                    newCredit.setDebtTermDays(30);
                    return agentCreditRepository.save(newCredit);
                });

        credit.setTotalDebt(Math.max(0, calculatedAgencyDebt));
        credit.setGuaranteeDebt(Math.max(0, calculatedGuaranteeDebt));
        credit.setVtcHold(Math.max(0, calculatedVtcHold));

        agentCreditRepository.save(credit);

        // Cập nhật nợ của từng khách hàng được gán
        List<com.anhtin.tmdt.backend.modules.agency.entity.AgencyCustomerAssignment> assignments = 
            agencyCustomerAssignmentRepository.findByAgencyId(agencyId);
        for (var assignment : assignments) {
            Double cusDebt = customerDebtMap.getOrDefault(assignment.getCustomer().getId(), 0.0);
            assignment.setTotalDebt(Math.max(0, cusDebt));
            agencyCustomerAssignmentRepository.save(assignment);
        }
    }
    @Transactional
    public void recordTransaction(com.anhtin.tmdt.backend.modules.agency.entity.Agency agency, Order order, String code, AgencyDebt.DebtType type, String category, Double value, Integer termDays) {
        LocalDateTime now = LocalDateTime.now();
        AgencyDebt debt = new AgencyDebt();
        debt.setAgency(agency);
        debt.setOrder(order);
        debt.setAgencyCode("AGENCY_" + agency.getId());
        debt.setAgencyName(agency.getName());
        
        if (order != null && order.getCustomer() != null) {
            Customer customer = order.getCustomer();
            debt.setCustomerCode(customer.getOrganizationName() != null ? customer.getOrganizationName() : "");
            debt.setCustomerName(customer.getOrganizationName() != null ? customer.getOrganizationName() : "");
            debt.setCustomerLevel("");
        }

        debt.setDebtCode(code);
        debt.setDebtType(type);
        debt.setJobCategory(category);
        debt.setDebtTermDays(termDays != null ? termDays : 0);
        debt.setValue(value);
        debt.setPaidValue(0.0); // For transactions like payment, the whole value is the 'transaction amount'
        debt.setRecordingDate(now);
        debt.setDueDate(now.plusDays(debt.getDebtTermDays()));
        debt.setRemainingToCollect(value);
        debt.setaCoin(0);
        
        agencyDebtRepository.save(debt);
    }

    public List<AgencyDebt> getAllDebts() {
        return agencyDebtRepository.findAllByOrderByRecordingDateDesc();
    }
}
