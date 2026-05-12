package com.anhtin.tmdt.backend.credit.controller;

import com.anhtin.tmdt.backend.credit.dto.CreditDetailResponse;
import com.anhtin.tmdt.backend.credit.dto.CreditOrderRequest;
import com.anhtin.tmdt.backend.credit.dto.PaymentRequest;
import com.anhtin.tmdt.backend.credit.entity.AgentCredit;
import com.anhtin.tmdt.backend.credit.entity.CreditLedger;
import com.anhtin.tmdt.backend.credit.entity.OverdueDebt;
import com.anhtin.tmdt.backend.credit.repository.AgentCreditRepository;
import com.anhtin.tmdt.backend.credit.repository.CreditLedgerRepository;
import com.anhtin.tmdt.backend.credit.repository.OverdueDebtRepository;
import com.anhtin.tmdt.backend.credit.service.CreditService;
import com.anhtin.tmdt.backend.credit.service.InterestScheduler;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.HashMap;

@RestController
@RequestMapping("/api/credit")
@RequiredArgsConstructor
public class CreditController {

    private final CreditService           creditService;
    private final AgentCreditRepository   agentCreditRepository;
    private final OverdueDebtRepository   overdueDebtRepository;
    private final CreditLedgerRepository  creditLedgerRepository;
    private final InterestScheduler       interestScheduler;
    private final com.anhtin.tmdt.backend.credit.scheduler.DebtOverdueScheduler debtOverdueScheduler;

    // ── Lấy danh sách tổng quan tín dụng tất cả đại lý (ADMIN/COMPANY) ─────
    @GetMapping("/admin/summaries")
    @PreAuthorize("hasRole('COMPANY')")
    public ResponseEntity<List<com.anhtin.tmdt.backend.credit.dto.AgencyCreditSummaryDTO>> getAllSummaries() {
        return ResponseEntity.ok(creditService.getAllAgencyCreditSummaries());
    }

    // ── Cập nhật/Tạo hạn mức & Kỳ hạn nợ (COMPANY) ─────────────────────────
    @PutMapping("/agents/{agencyId}/terms")
    @PreAuthorize("hasRole('COMPANY')")
    public ResponseEntity<?> updateTerms(
            @PathVariable Long agencyId,
            @RequestBody com.anhtin.tmdt.backend.credit.dto.CreditTermsRequest request) {
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

    private final com.anhtin.tmdt.backend.repository.OrderRepository orderRepository;

    private final com.anhtin.tmdt.backend.repository.AgencyCustomerAssignmentRepository agencyCustomerAssignmentRepository;

    // ── Lấy toàn bộ chi tiết tài khoản tín dụng ───────────────────────────
    @GetMapping("/agents/{agencyId}/detail")
    @PreAuthorize("hasRole('COMPANY') or hasRole('AGENCY')")
    public ResponseEntity<CreditDetailResponse> getCreditDetail(@PathVariable Long agencyId) {
        AgentCredit credit = agentCreditRepository.findByAgencyId(agencyId).orElse(null);

        if (credit == null) {
            return ResponseEntity.ok(CreditDetailResponse.empty(agencyId));
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
        List<com.anhtin.tmdt.backend.entity.AgencyCustomerAssignment> assignments = 
            agencyCustomerAssignmentRepository.findByAgencyId(agencyId);

        return ResponseEntity.ok(CreditDetailResponse.from(credit, debts, ledger, orderReceiverTypes, assignments));
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

    // ── Nạp tiền vào ví ký quỹ VTC ──────────────────────────────────────────
    @PostMapping("/agents/{agencyId}/deposit")
    @PreAuthorize("hasRole('COMPANY')")
    public ResponseEntity<?> depositVtc(
            @PathVariable Long agencyId,
            @RequestBody Map<String, Double> body) {

        Double amount = body.get("amount");
        if (amount == null || amount <= 0) {
            return ResponseEntity.badRequest().body(Map.of("message", "amount không hợp lệ"));
        }
        creditService.depositVtc(agencyId, amount);
        return ResponseEntity.ok(Map.of("message", "Nạp ký quỹ thành công", "amount", amount));
    }

    // ── Tạo đơn hàng dùng tín dụng ──────────────────────────────────────────
    @PostMapping("/orders")
    @PreAuthorize("hasRole('COMPANY') or hasRole('AGENCY')")
    public ResponseEntity<?> createOrder(@RequestBody CreditOrderRequest request) {
        creditService.createCreditOrder(request.getAgentId(), request.getOrderId(), request.getAmount());
        return ResponseEntity.ok(Map.of("message", "Đơn hàng đã tạo bằng tín dụng", "orderId", request.getOrderId()));
    }

    // ── Thanh toán nợ ────────────────────────────────────────────────────────
    @PostMapping("/payments")
    @PreAuthorize("hasRole('COMPANY') or hasRole('AGENCY')")
    public ResponseEntity<?> payDebt(@RequestBody PaymentRequest request) {
        creditService.processPayment(request.getAgentId(), request.getAmount(), request.getOrderId());
        return ResponseEntity.ok(Map.of("message", "Thanh toán thành công"));
    }

    private final com.anhtin.tmdt.backend.credit.service.AgencyDebtService agencyDebtService;

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
