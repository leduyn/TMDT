package com.anhtin.tmdt.backend.modules.credit.controller;

import com.anhtin.tmdt.backend.modules.credit.dto.CreditDetailResponse;
import com.anhtin.tmdt.backend.modules.credit.dto.CreditOrderRequest;
import com.anhtin.tmdt.backend.modules.credit.dto.PaymentRequest;
import com.anhtin.tmdt.backend.modules.credit.entity.AgentCredit;
import com.anhtin.tmdt.backend.modules.credit.entity.CreditLedger;
import com.anhtin.tmdt.backend.modules.credit.entity.OverdueDebt;
import com.anhtin.tmdt.backend.modules.credit.entity.DepositContract;
import com.anhtin.tmdt.backend.modules.credit.repository.AgentCreditRepository;
import com.anhtin.tmdt.backend.modules.credit.repository.CreditLedgerRepository;
import com.anhtin.tmdt.backend.modules.credit.repository.OverdueDebtRepository;
import com.anhtin.tmdt.backend.modules.credit.repository.DepositContractRepository;
import com.anhtin.tmdt.backend.modules.credit.repository.DepositPaymentRepository;
import com.anhtin.tmdt.backend.modules.credit.service.CreditService;
import com.anhtin.tmdt.backend.modules.credit.service.InterestScheduler;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.HashMap;
import com.anhtin.tmdt.backend.modules.credit.scheduler.DebtOverdueScheduler;
import com.anhtin.tmdt.backend.modules.agency.repository.AgencyCustomerAssignmentRepository;
import com.anhtin.tmdt.backend.modules.credit.dto.CreditTermsRequest;
import com.anhtin.tmdt.backend.modules.agency.entity.AgencyCustomerAssignment;
import com.anhtin.tmdt.backend.modules.credit.service.AgencyDebtService;
import com.anhtin.tmdt.backend.modules.credit.dto.AgencyCreditSummaryDTO;
import com.anhtin.tmdt.backend.modules.order.repository.OrderRepository;

@RestController
@RequestMapping("/api/credit")
@RequiredArgsConstructor
public class CreditController {

    private final CreditService           creditService;
    private final AgentCreditRepository   agentCreditRepository;
    private final OverdueDebtRepository   overdueDebtRepository;
    private final CreditLedgerRepository  creditLedgerRepository;
    private final InterestScheduler       interestScheduler;
    private final DebtOverdueScheduler debtOverdueScheduler;

    // ── Lấy danh sách tổng quan tín dụng tất cả đại lý (ADMIN/COMPANY) ─────
    @GetMapping("/admin/summaries")
    @PreAuthorize("hasRole('COMPANY')")
    public ResponseEntity<List<AgencyCreditSummaryDTO>> getAllSummaries() {
        return ResponseEntity.ok(creditService.getAllAgencyCreditSummaries());
    }

    // ── Cập nhật/Tạo hạn mức & Kỳ hạn nợ (COMPANY) ─────────────────────────
    @PutMapping("/agents/{agencyId}/terms")
    @PreAuthorize("hasRole('COMPANY')")
    public ResponseEntity<?> updateTerms(
            @PathVariable Long agencyId,
            @RequestBody CreditTermsRequest request) {
        creditService.updateCreditTerms(agencyId, request);
        return ResponseEntity.ok(Map.of("message", "Đã cập nhật cấu hình công nợ"));
    }

    // ── Lấy HMKD (số đơn giản) ─────────────────────────────────────────────
    @GetMapping("/agents/{agencyId}/hmkd")
    @PreAuthorize("hasRole('COMPANY') or hasRole('AGENCY')")
    public ResponseEntity<?> getHMKD(@PathVariable Long agencyId) {
        double hmkd = creditService.calculateHMKD(agencyId);
        return ResponseEntity.ok(Map.of("agencyId", agencyId, "hmkd", hmkd));
    }

    private final OrderRepository orderRepository;

    private final AgencyCustomerAssignmentRepository agencyCustomerAssignmentRepository;

    // ── Lấy toàn bộ chi tiết tài khoản tín dụng ───────────────────────────
    @GetMapping("/agents/{agencyId}/detail")
    @PreAuthorize("hasRole('COMPANY') or hasRole('AGENCY')")
    public ResponseEntity<CreditDetailResponse> getCreditDetail(@PathVariable Long agencyId) {
        AgentCredit credit = agentCreditRepository.findByAgencyId(agencyId).orElse(null);

        if (credit == null) {
            agencyDebtService.recalculateDebts(agencyId);
            credit = agentCreditRepository.findByAgencyId(agencyId).orElse(null);
            if (credit == null) {
                return ResponseEntity.ok(CreditDetailResponse.empty(agencyId));
            }
        }

        List<OverdueDebt> debts = overdueDebtRepository
                .findByAgencyIdAndStatus(agencyId, OverdueDebt.OverdueStatus.ACTIVE);

        // Lấy 50 bản ghi ledger gần nhất
        List<CreditLedger> ledger = creditLedgerRepository
                .findTop50ByAgencyIdOrderByCreatedAtDesc(agencyId);

        // Lấy thông tin loại đối tượng của các đơn hàng trong ledger
        Map<Long, String> orderReceiverTypes = new HashMap<>();
        ledger.stream()
            .map(CreditLedger::getReferenceId)
            .filter(ref -> ref != null && ref.matches("\\d+"))
            .map(Long::parseLong)
            .distinct()
            .forEach(id -> {
                orderRepository.findById(id).ifPresent(o -> orderReceiverTypes.put(id, o.getReceiverType()));
            });

        // Lấy danh sách nợ của từng khách hàng
        List<AgencyCustomerAssignment> assignments = 
            agencyCustomerAssignmentRepository.findByAgencyId(agencyId);

        // Lấy hợp đồng đặt cọc active gần nhất
        DepositContract depositContract = depositContractRepository
                .findTopByAgencyIdAndStatusOrderByCreatedAtDesc(agencyId, DepositContract.DepositContractStatus.ACTIVE)
                .orElse(null);

        return ResponseEntity.ok(CreditDetailResponse.from(credit, debts, ledger, orderReceiverTypes, assignments, depositContract));
    }

    // ── Cập nhật hạn mức tín dụng (chỉ COMPANY) ────────────────────────────
    @PutMapping("/agents/{agencyId}/limit")
    @PreAuthorize("hasRole('COMPANY')")
    public ResponseEntity<?> updateCreditLimit(
            @PathVariable Long agencyId,
            @RequestBody Map<String, Double> body) {

        Double newLimit = body.get("creditLimit");
        if (newLimit == null || newLimit < 0) {
            return ResponseEntity.badRequest().body(Map.of("message", "creditLimit không hợp lệ"));
        }
        creditService.updateCreditLimit(agencyId, newLimit);
        return ResponseEntity.ok(Map.of("message", "Đã cập nhật hạn mức", "creditLimit", newLimit));
    }

    // ── Nạp tiền vào ví ký quỹ VTC (generic, không gắn hợp đồng) ────────────
    @PostMapping("/agents/{agencyId}/deposit")
    @PreAuthorize("hasRole('COMPANY')")
    public ResponseEntity<?> depositVtc(
            @PathVariable Long agencyId,
            @RequestBody Map<String, Object> body) {

        Double amount = body.get("amount") != null ? ((Number) body.get("amount")).doubleValue() : null;
        if (amount == null || amount <= 0) {
            return ResponseEntity.badRequest().body(Map.of("message", "amount không hợp lệ"));
        }

        Number contractIdNum = (Number) body.get("contractId");
        if (contractIdNum != null) {
            // Record against a DepositContract
            Long contractId = contractIdNum.longValue();
            String notes = (String) body.get("notes");
            DepositContract contract = creditService.recordDepositContractPayment(contractId, amount, notes);
            return ResponseEntity.ok(Map.of(
                "message", "Nạp ký quỹ thành công",
                "amount", amount,
                "contractId", contract.getId(),
                "paidAmount", contract.getPaidAmount(),
                "depositAmount", contract.getDepositAmount()
            ));
        } else {
            // Generic VTC deposit (backward compat)
            creditService.depositVtc(agencyId, amount);
            return ResponseEntity.ok(Map.of("message", "Nạp ký quỹ thành công", "amount", amount));
        }
    }

    // ── Lấy hợp đồng đặt cọc của đại lý ──────────────────────────────────────
    private final DepositContractRepository depositContractRepository;
    private final DepositPaymentRepository depositPaymentRepository;

    @GetMapping("/deposit-contracts/agency/{agencyId}")
    @PreAuthorize("hasRole('COMPANY') or hasRole('AGENCY')")
    public ResponseEntity<List<Map<String, Object>>> getDepositContracts(@PathVariable Long agencyId) {
        List<DepositContract> contracts = depositContractRepository.findByAgencyId(agencyId);
        List<Map<String, Object>> result = contracts.stream().map(c -> {
            Map<String, Object> m = new HashMap<>();
            m.put("id", c.getId());
            m.put("contractNumber", c.getContractNumber());
            m.put("depositAmount", c.getDepositAmount());
            m.put("paidAmount", c.getPaidAmount());
            m.put("remainingAmount", Math.max(0, c.getDepositAmount() - c.getPaidAmount()));
            m.put("status", c.getStatus().name());
            m.put("contractDate", c.getContractDate() != null ? c.getContractDate().toString() : null);
            m.put("terms", c.getTerms());
            return m;
        }).toList();
        return ResponseEntity.ok(result);
    }

    @GetMapping("/deposit-contracts/{id}")
    @PreAuthorize("hasRole('COMPANY') or hasRole('AGENCY')")
    public ResponseEntity<?> getDepositContractDetail(@PathVariable Long id) {
        DepositContract c = depositContractRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy hợp đồng đặt cọc"));
        Map<String, Object> m = new HashMap<>();
        m.put("id", c.getId());
        m.put("contractNumber", c.getContractNumber());
        m.put("agencyId", c.getAgencyId());
        m.put("depositAmount", c.getDepositAmount());
        m.put("paidAmount", c.getPaidAmount());
        m.put("remainingAmount", Math.max(0, c.getDepositAmount() - c.getPaidAmount()));
        m.put("status", c.getStatus().name());
        m.put("contractDate", c.getContractDate() != null ? c.getContractDate().toString() : null);
        m.put("terms", c.getTerms());
        m.put("notes", c.getNotes());

        List<Map<String, Object>> payments = depositPaymentRepository
                .findByDepositContractIdOrderByCreatedAtDesc(id).stream().map(p -> {
                    Map<String, Object> pm = new HashMap<>();
                    pm.put("id", p.getId());
                    pm.put("amount", p.getAmount());
                    pm.put("paymentDate", p.getPaymentDate() != null ? p.getPaymentDate().toString() : null);
                    pm.put("notes", p.getNotes());
                    return pm;
                }).toList();
        m.put("payments", payments);
        return ResponseEntity.ok(m);
    }

    // ── Tạo đơn hàng dùng tín dụng ──────────────────────────────────────────
    @PostMapping("/orders")
    @PreAuthorize("hasRole('COMPANY') or hasRole('AGENCY')")
    public ResponseEntity<?> createCreditOrder(@RequestBody CreditOrderRequest request) {
        boolean consumed = creditService.tryConsumeCredit(request.getAgentId(), request.getOrderId(), request.getAmount());
        if (!consumed) {
            return ResponseEntity.badRequest().body(Map.of("message", "Hạn mức tín dụng không đủ"));
        }
        return ResponseEntity.ok(Map.of("message", "Đơn hàng đã tạo bằng tín dụng", "orderId", request.getOrderId()));
    }

    // ── Thanh toán nợ ────────────────────────────────────────────────────────
    @PostMapping("/payments")
    @PreAuthorize("hasRole('COMPANY') or hasRole('AGENCY')")
    public ResponseEntity<?> payDebt(@RequestBody PaymentRequest request) {
        creditService.processPayment(request.getAgentId(), request.getAmount(), request.getOrderId());
        return ResponseEntity.ok(Map.of("message", "Thanh toán thành công"));
    }

    private final AgencyDebtService agencyDebtService;

    // ── Tính lại toàn bộ công nợ dựa trên bản ghi chi tiết ──────────────────
    @PostMapping("/admin/recalculate/{agencyId}")
    @PreAuthorize("hasRole('COMPANY')")
    public ResponseEntity<?> recalculate(@PathVariable Long agencyId) {
        agencyDebtService.recalculateDebts(agencyId);
        return ResponseEntity.ok(Map.of("message", "Đã tính toán lại toàn bộ công nợ"));
    }

    // ── Kích hoạt tính lãi thủ công (dùng để test) ──────────────────────────
    @PostMapping("/admin/trigger-interest")
    @PreAuthorize("hasRole('COMPANY')")
    public ResponseEntity<?> triggerInterest() {
        interestScheduler.calculateDailyInterest();
        return ResponseEntity.ok(Map.of("message", "Đã kích hoạt tính lãi thủ công"));
    }

    // ── Kích hoạt kiểm tra quá hạn thủ công (dùng để test) ─────────────────
    @PostMapping("/admin/trigger-overdue")
    @PreAuthorize("hasRole('COMPANY')")
    public ResponseEntity<?> triggerOverdue() {
        debtOverdueScheduler.checkAndProcessOverdueDebts();
        return ResponseEntity.ok(Map.of("message", "Đã kích hoạt kiểm tra nợ quá hạn"));
    }
}
