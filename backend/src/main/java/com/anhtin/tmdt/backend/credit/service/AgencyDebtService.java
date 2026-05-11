package com.anhtin.tmdt.backend.credit.service;

import com.anhtin.tmdt.backend.credit.entity.AgencyDebt;
import com.anhtin.tmdt.backend.credit.entity.AgentCredit;
import com.anhtin.tmdt.backend.credit.repository.AgencyDebtRepository;
import com.anhtin.tmdt.backend.credit.repository.AgentCreditRepository;
import com.anhtin.tmdt.backend.entity.Order;
import com.anhtin.tmdt.backend.entity.User;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.HashMap;

@Service
public class AgencyDebtService {

    @Autowired
    private AgencyDebtRepository agencyDebtRepository;

    @Autowired
    private AgentCreditRepository agentCreditRepository;

    @Autowired
    private com.anhtin.tmdt.backend.credit.repository.CreditLedgerRepository creditLedgerRepository;

    @Autowired
    private com.anhtin.tmdt.backend.repository.OrderRepository orderRepository;

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

        User customer = order.getCustomer();
        String cusCode = customer != null ? customer.getUsername() : "";
        String cusName = customer != null ? 
            (customer.getOrganizationName() != null ? customer.getOrganizationName() : customer.getUsername()) : "";
        String cusLevel = (customer != null && customer.getCustomerGroup() != null) ? customer.getCustomerGroup().getName() : "";
        
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
    private com.anhtin.tmdt.backend.repository.AgencyCustomerAssignmentRepository agencyCustomerAssignmentRepository;

    @Transactional
    public AgencyDebt payDebt(Long debtId, Double amount) {
        AgencyDebt debt = agencyDebtRepository.findById(debtId)
                .orElseThrow(() -> new RuntimeException("Debt not found"));
        
        if (amount <= 0) {
            throw new RuntimeException("Payment amount must be greater than 0");
        }
        
        LocalDateTime now = LocalDateTime.now();
        debt.setPaidValue(debt.getPaidValue() + amount);
        debt.setPaymentDate(now);
        debt.setRemainingToCollect(Math.max(0, debt.getRemainingToCollect() - amount));
        
        // 1. Cập nhật AgentCredit (Dư nợ / Nợ bảo lãnh)
        Order order = debt.getOrder();
        if (order != null && order.getAgency() != null) {
            if ("CUSTOMER".equals(order.getReceiverType())) {
                agentCreditRepository.decreaseGuaranteeDebt(order.getAgency().getId(), amount);
                
                // 2. Cập nhật AgencyCustomerAssignment.totalDebt
                if (order.getCustomer() != null) {
                    agencyCustomerAssignmentRepository.findByAgencyIdAndCustomerId(
                            order.getAgency().getId(), order.getCustomer().getId())
                        .ifPresent(assignment -> {
                            assignment.setTotalDebt(Math.max(0, assignment.getTotalDebt() - amount));
                            agencyCustomerAssignmentRepository.save(assignment);
                        });
                }
            } else {
                agentCreditRepository.decreaseAgencyDebt(order.getAgency().getId(), amount);
            }

            // Save ledger entry
            com.anhtin.tmdt.backend.credit.entity.CreditLedger ledger = new com.anhtin.tmdt.backend.credit.entity.CreditLedger();
            ledger.setAgencyId(order.getAgency().getId());
            ledger.setType(com.anhtin.tmdt.backend.credit.entity.CreditLedger.LedgerType.PAYMENT);
            ledger.setAmount(amount);
            ledger.setReferenceId(order.getId().toString());
            creditLedgerRepository.save(ledger);
        }

        // 3. Cập nhật a-coin: Nếu thanh toán trước hạn thì cộng a-coin
        if (now.isBefore(debt.getDueDate()) || now.isEqual(debt.getDueDate())) {
            int newCoin = (int) Math.floor(amount / 100000);
            debt.setaCoin((debt.getaCoin() != null ? debt.getaCoin() : 0) + newCoin);
        }
        
        return agencyDebtRepository.save(debt);
    }
    @Transactional
    public void recalculateDebts(Long agencyId) {
        // 1. Lấy nợ từ các bản ghi chi tiết (AgencyDebt) - Đây là nguồn chính xác nhất cho từng đơn hàng
        List<AgencyDebt> allDebts = agencyDebtRepository.findByAgencyIdOrderByRecordingDateDesc(agencyId);
        
        double orderAgencyDebt = 0.0;
        double orderCustomerDebt = 0.0;
        Map<Long, Double> customerDebtMap = new HashMap<>();

        for (AgencyDebt debt : allDebts) {
            double remaining = debt.getRemainingToCollect();
            if (remaining <= 0) continue;

            Order order = debt.getOrder();
            if (order != null) {
                if ("CUSTOMER".equals(order.getReceiverType())) {
                    orderCustomerDebt += remaining;
                    if (order.getCustomer() != null) {
                        Long cId = order.getCustomer().getId();
                        customerDebtMap.put(cId, customerDebtMap.getOrDefault(cId, 0.0) + remaining);
                    }
                } else {
                    orderAgencyDebt += remaining;
                }
            }
        }

        // 2. Tính toán các khoản điều chỉnh từ Sổ cái (Ledger) mà không gắn với đơn hàng cụ thể
        // Hoặc các khoản Lãi (INTEREST) vì hiện tại Interest chưa được tạo bản ghi AgencyDebt
        List<com.anhtin.tmdt.backend.credit.entity.CreditLedger> allLedgers = creditLedgerRepository.findByAgencyId(agencyId);
        double adjustments = 0.0;
        
        for (var ledger : allLedgers) {
            String ref = ledger.getReferenceId();
            boolean isOrderRelated = (ref != null && ref.matches("\\d+"));
            
            // Nếu là giao dịch chung (GENERAL) hoặc Lãi (INTEREST) hoặc Hoàn tiền (REFUND) không gắn đơn
            if (!isOrderRelated || ledger.getType() == com.anhtin.tmdt.backend.credit.entity.CreditLedger.LedgerType.INTEREST) {
                double amount = ledger.getAmount();
                boolean isPlus = (ledger.getType() == com.anhtin.tmdt.backend.credit.entity.CreditLedger.LedgerType.DEBT || 
                                 ledger.getType() == com.anhtin.tmdt.backend.credit.entity.CreditLedger.LedgerType.INTEREST);
                boolean isMinus = (ledger.getType() == com.anhtin.tmdt.backend.credit.entity.CreditLedger.LedgerType.PAYMENT || 
                                  ledger.getType() == com.anhtin.tmdt.backend.credit.entity.CreditLedger.LedgerType.REFUND);
                
                if (isPlus) adjustments += amount;
                else if (isMinus) adjustments -= amount;
            }
        }

        AgentCredit credit = agentCreditRepository.findByAgencyId(agencyId)
                .orElseThrow(() -> new RuntimeException("Credit account not found"));
        
        // Nợ đại lý = Nợ đơn hàng đại lý + Các khoản điều chỉnh/Lãi/Thanh toán chung
        credit.setTotalDebt(Math.max(-credit.getCreditLimit(), orderAgencyDebt + adjustments)); 
        // Nợ bảo lãnh = Nợ từ các đơn hàng khách hàng (thường được thanh toán chỉ định nên khớp với AgencyDebt)
        credit.setGuaranteeDebt(Math.max(0, orderCustomerDebt));
        
        agentCreditRepository.save(credit);
        
        // 3. Cập nhật nợ của từng khách hàng được gán
        List<com.anhtin.tmdt.backend.entity.AgencyCustomerAssignment> assignments = agencyCustomerAssignmentRepository.findByAgencyId(agencyId);
        for (var assignment : assignments) {
            Double cusDebt = customerDebtMap.getOrDefault(assignment.getCustomer().getId(), 0.0);
            assignment.setTotalDebt(cusDebt);
            agencyCustomerAssignmentRepository.save(assignment);
        }
    }
    public List<AgencyDebt> getAllDebts() {
        return agencyDebtRepository.findAllByOrderByRecordingDateDesc();
    }
}
