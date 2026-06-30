package com.anhtin.tmdt.backend.modules.loyalty.service;

import com.anhtin.tmdt.backend.modules.common.dto.LoyaltyPointDTO;
import com.anhtin.tmdt.backend.modules.loyalty.dto.*;
import com.anhtin.tmdt.backend.modules.loyalty.entity.*;
import com.anhtin.tmdt.backend.modules.loyalty.repository.*;
import com.anhtin.tmdt.backend.modules.user.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.anhtin.tmdt.backend.modules.order.entity.Order;
import com.anhtin.tmdt.backend.modules.user.entity.User;
import com.anhtin.tmdt.backend.modules.loyalty.entity.PointTransactionType;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class LoyaltyService {

    @Autowired
    private LoyaltyPointRepository loyaltyPointRepository;

    @Autowired
    private PointTransactionRepository pointTransactionRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private GamificationRuleEngineService ruleEngineService;

    @Autowired
    private CustomerBadgeRepository customerBadgeRepository;

    @Autowired
    private CustomerTitleRepository customerTitleRepository;

    @Autowired
    private CustomerCertificateRepository customerCertificateRepository;

    @Autowired
    private MembershipLevelRepository membershipLevelRepository;

    // Tỷ lệ quy đổi khi REDEEM (1 điểm = 1000đ) - giữ nguyên
    private static final double POINT_VALUE = 1000.0;

    public LoyaltyPointDTO getBalance(Long customerId) {
        LoyaltyPoint lp = getOrCreateLoyaltyPoint(customerId);
        return new LoyaltyPointDTO(customerId, lp.getPointsBalance(), lp.getTotalEarned());
    }

    public Page<PointTransaction> getHistory(Long customerId, Pageable pageable) {
        return pointTransactionRepository.findByCustomerIdOrderByCreatedAtDesc(customerId, pageable);
    }

    /**
     * Tích điểm khi thanh toán đơn hàng thành công (PAID).
     * Công thức tích điểm được lấy động từ SystemConfig (gamification.points.formula).
     * Sau khi cộng điểm, kích hoạt Rule Engine với sự kiện "PAID".
     */
    @Transactional
    public void earnPoints(Long customerId, Order order) {
        int pointsEarned = ruleEngineService.calculatePoints(order.getTotalAmount());
        if (pointsEarned <= 0) return;

        LoyaltyPoint lp = getOrCreateLoyaltyPoint(customerId);
        lp.setPointsBalance(lp.getPointsBalance() + pointsEarned);
        lp.setTotalEarned(lp.getTotalEarned() + pointsEarned);
        lp.setTotalRevenue(lp.getTotalRevenue() + order.getTotalAmount());
        lp.setUpdatedAt(java.time.LocalDateTime.now());
        loyaltyPointRepository.save(lp);

        // Ghi log giao dịch điểm
        PointTransaction pt = new PointTransaction();
        pt.setCustomer(null); // TODO: restore when Customer-User link is re-established
        pt.setPoints(pointsEarned);
        pt.setTransactionType(PointTransactionType.EARN);
        pt.setOrder(order);
        pt.setDescription("Tích điểm đơn hàng #" + order.getId()
                + " (Công thức: " + ruleEngineService.calculatePoints(1000) + "đ/1000đ)");
        pointTransactionRepository.save(pt);

        // Kích hoạt Rule Engine sự kiện PAID
        ruleEngineService.evaluate(customerId, "PAID");
    }

    /**
     * Kích hoạt Rule Engine với sự kiện "COMPLETED" khi đơn hàng hoàn thành.
     * Không cộng thêm điểm tích lũy ở giai đoạn này nhưng đánh giá các luật thi đua
     * yêu cầu đơn hàng phải ở trạng thái hoàn thành.
     */
    @Transactional
    public void onOrderCompleted(Long customerId) {
        ruleEngineService.evaluate(customerId, "COMPLETED");
    }

    /**
     * Kích hoạt Rule Engine với sự kiện "ORDER_CREATED" khi đơn hàng được tạo thành công.
     * Tăng totalOrders trước khi evaluate để các luật có điều kiện #totalOrders >= 1 hoạt động đúng.
     */
    @Transactional
    public void onOrderCreated(Long customerId) {
        LoyaltyPoint lp = getOrCreateLoyaltyPoint(customerId);
        lp.setTotalOrders(lp.getTotalOrders() + 1);
        lp.setUpdatedAt(java.time.LocalDateTime.now());
        loyaltyPointRepository.save(lp);
        ruleEngineService.evaluate(customerId, "ORDER_CREATED");
    }

    /**
     * Đổi trừ điểm khi đặt hàng.
     * @return Số tiền được giảm từ điểm
     */
    @Transactional
    public double redeemPoints(Long customerId, int pointsToRedeem, Order order) {
        LoyaltyPoint lp = getOrCreateLoyaltyPoint(customerId);

        if (lp.getPointsBalance() < pointsToRedeem) {
            throw new RuntimeException("Không đủ điểm. Số dư: " + lp.getPointsBalance());
        }

        lp.setPointsBalance(lp.getPointsBalance() - pointsToRedeem);
        lp.setUpdatedAt(java.time.LocalDateTime.now());
        loyaltyPointRepository.save(lp);

        // Ghi log giao dịch
        PointTransaction pt = new PointTransaction();
        pt.setCustomer(null); // TODO: restore when Customer-User link is re-established
        pt.setPoints(-pointsToRedeem);
        pt.setTransactionType(PointTransactionType.REDEEM);
        pt.setOrder(order);
        pt.setDescription("Đổi trừ điểm đơn hàng #" + order.getId());
        pointTransactionRepository.save(pt);

        return pointsToRedeem * POINT_VALUE;
    }

    /**
     * Lấy hồ sơ Gamification đầy đủ của một khách hàng.
     */
    public GamificationProfileDTO getProfile(Long customerId) {
        User customer = userRepository.findById(customerId)
                .orElseThrow(() -> new RuntimeException("Khách hàng không tồn tại"));
        LoyaltyPoint lp = getOrCreateLoyaltyPoint(customerId);

        GamificationProfileDTO dto = new GamificationProfileDTO();
        dto.setCustomerId(customerId);
        dto.setCustomerName(customer.getUsername());
        dto.setPointsBalance(lp.getPointsBalance());
        dto.setTotalEarned(lp.getTotalEarned());
        dto.setLevelNumber(lp.getLevelNumber());
        dto.setTotalOrders(lp.getTotalOrders());
        dto.setTotalRevenue(lp.getTotalRevenue());

        // Tên cấp bậc hiện tại
        membershipLevelRepository.findByLevelNumber(lp.getLevelNumber())
                .ifPresent(level -> dto.setLevelName(level.getName()));

        // Cấp bậc tiếp theo
        List<MembershipLevel> allLevels = membershipLevelRepository.findByActiveTrueOrderByLevelNumberAsc();
        allLevels.stream()
                .filter(l -> l.getLevelNumber() > lp.getLevelNumber())
                .findFirst()
                .ifPresent(next -> {
                    dto.setNextLevelName(next.getName());
                    dto.setNextLevelMinPoints(next.getMinPoints());
                    dto.setNextLevelMinOrders(next.getMinOrders());
                    dto.setNextLevelMinRevenue(next.getMinRevenue());
                });

        // Huy hiệu đã đạt được
        List<BadgeDTO> earnedBadges = customerBadgeRepository.findByCustomerId(customerId).stream()
                .map(cb -> new BadgeDTO(
                        cb.getBadge().getId(),
                        cb.getBadge().getName(),
                        cb.getBadge().getDescription(),
                        cb.getBadge().getIcon(),
                        cb.getBadge().getColorGradient(),
                        cb.getBadge().isActive(),
                        true,
                        cb.getEarnedAt()
                ))
                .collect(Collectors.toList());
        dto.setEarnedBadges(earnedBadges);

        // Danh hiệu
        List<String> titles = customerTitleRepository.findByCustomerId(customerId).stream()
                .map(CustomerTitle::getTitleName)
                .collect(Collectors.toList());
        dto.setTitles(titles);

        // Bằng khen
        List<CertificateDTO> certs = customerCertificateRepository.findByCustomerIdOrderByEarnedAtDesc(customerId).stream()
                .map(cc -> new CertificateDTO(
                        cc.getId(),
                        cc.getTitle(),
                        cc.getReason(),
                        cc.getEarnedAt(),
                        customer.getUsername()
                ))
                .collect(Collectors.toList());
        dto.setCertificates(certs);

        return dto;
    }

    /**
     * Lấy bảng xếp hạng top tích điểm.
     */
    public List<LeaderboardEntryDTO> getLeaderboard(int limit) {
        List<LoyaltyPoint> top = loyaltyPointRepository.findAll(
                org.springframework.data.domain.PageRequest.of(0, limit,
                        org.springframework.data.domain.Sort.by(
                                org.springframework.data.domain.Sort.Direction.DESC, "totalEarned"
                        ))
        ).getContent();

        // Tạo map levelNumber -> levelName
        java.util.Map<Integer, String> levelNames = membershipLevelRepository.findByActiveTrueOrderByLevelNumberAsc()
                .stream().collect(Collectors.toMap(MembershipLevel::getLevelNumber, MembershipLevel::getName));

        return top.stream().map(lp -> {
            Long cid = lp.getCustomer().getId();
            List<String> badges = customerBadgeRepository.findByCustomerId(cid).stream()
                    .map(cb -> cb.getBadge().getIcon() + " " + cb.getBadge().getName())
                    .collect(Collectors.toList());
            List<String> titles = customerTitleRepository.findByCustomerId(cid).stream()
                    .map(CustomerTitle::getTitleName).collect(Collectors.toList());
            String levelName = levelNames.getOrDefault(lp.getLevelNumber(), "Cấp " + lp.getLevelNumber());
            return new LeaderboardEntryDTO(
                    cid,
                    lp.getCustomer().getUsername(),
                    lp.getPointsBalance(),
                    lp.getTotalEarned(),
                    lp.getLevelNumber(),
                    levelName,
                    badges,
                    titles
            );
        }).collect(Collectors.toList());
    }

    private LoyaltyPoint getOrCreateLoyaltyPoint(Long customerId) {
        return loyaltyPointRepository.findByCustomerId(customerId)
                .orElseGet(() -> {
                    if (customerId == null) throw new RuntimeException("Customer ID is required");
                    User customer = userRepository.findById(customerId)
                            .orElseThrow(() -> new RuntimeException("Khách hàng không tồn tại"));
                    LoyaltyPoint lp = new LoyaltyPoint();
                    lp.setCustomer(customer);
                    return loyaltyPointRepository.save(lp);
                });
    }
}
