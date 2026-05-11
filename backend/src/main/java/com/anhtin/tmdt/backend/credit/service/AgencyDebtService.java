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

@Service
public class AgencyDebtService {

    @Autowired
    private AgencyDebtRepository agencyDebtRepository;

    @Autowired
    private AgentCreditRepository agentCreditRepository;

    @Transactional
    public void createDebtsForOrder(Order order) {
        if (order.getAgency() == null) return;

        AgentCredit credit = agentCreditRepository.findByAgencyId(order.getAgency().getId())
                .orElse(null);
        
        int termDays = (credit != null && credit.getDebtTermDays() != null) ? credit.getDebtTermDays() : 30;
        
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
        }
    }

    public List<AgencyDebt> getDebtsByAgency(Long agencyId) {
        return agencyDebtRepository.findByAgencyIdOrderByRecordingDateDesc(agencyId);
    }

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
        
        // Cập nhật a-coin: Nếu thanh toán trước hạn thì cộng a-coin
        if (now.isBefore(debt.getDueDate()) || now.isEqual(debt.getDueDate())) {
            // Tính số lượng A-coin cho lần thanh toán này
            int newCoin = (int) Math.floor(amount / 100000);
            debt.setaCoin((debt.getaCoin() != null ? debt.getaCoin() : 0) + newCoin);
        }
        
        return agencyDebtRepository.save(debt);
    }
}
