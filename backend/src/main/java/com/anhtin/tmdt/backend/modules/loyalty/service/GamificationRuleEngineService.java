package com.anhtin.tmdt.backend.modules.loyalty.service;

import com.anhtin.tmdt.backend.modules.agency.entity.Agency;
import com.anhtin.tmdt.backend.modules.agency.repository.AgencyCustomerAssignmentRepository;
import com.anhtin.tmdt.backend.modules.agency.repository.AgencyRepository;
import com.anhtin.tmdt.backend.modules.common.service.SystemConfigService;
import com.anhtin.tmdt.backend.modules.loyalty.dto.CertificateDTO;
import com.anhtin.tmdt.backend.modules.loyalty.entity.*;
import com.anhtin.tmdt.backend.modules.loyalty.repository.*;
import com.anhtin.tmdt.backend.modules.order.repository.OrderRepository;
import com.anhtin.tmdt.backend.modules.user.entity.User;
import com.anhtin.tmdt.backend.modules.user.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.expression.ExpressionParser;
import org.springframework.expression.spel.standard.SpelExpressionParser;
import org.springframework.expression.spel.support.StandardEvaluationContext;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;

/**
 * Bộ đánh giá luật Gamification (Rule Engine).
 * Đánh giá các quy tắc hoạt động khi có sự kiện từ Đơn hàng hoặc thay đổi Cấp bậc.
 * Hỗ trợ hai loại sự kiện kích hoạt:
 *   - PAID: khi đơn hàng được xác nhận thanh toán
 *   - COMPLETED: khi đơn hàng hoàn thành
 */
@Service
public class GamificationRuleEngineService {

    // Config keys
    public static final String POINTS_FORMULA_KEY = "gamification.points.formula";
    public static final String DEFAULT_POINTS_FORMULA = "#amount * 0.001"; // 1000đ = 1 điểm (mặc định)

    @Autowired
    private GamificationRuleRepository ruleRepository;

    @Autowired
    private BadgeRepository badgeRepository;

    @Autowired
    private CustomerBadgeRepository customerBadgeRepository;

    @Autowired
    private CustomerTitleRepository customerTitleRepository;

    @Autowired
    private CustomerCertificateRepository customerCertificateRepository;

    @Autowired
    private MembershipLevelRepository membershipLevelRepository;

    @Autowired
    private LoyaltyPointRepository loyaltyPointRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private SystemConfigService systemConfigService;

    @Autowired
    private AgencyRepository agencyRepository;

    @Autowired
    private AgencyCustomerAssignmentRepository assignmentRepository;

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private SpelVariableService spelVariableService;

    private final ExpressionParser spelParser = new SpelExpressionParser();

    /**
     * Tính số điểm thưởng từ giá trị đơn hàng theo công thức lưu trong SystemConfig.
     * Công thức mặc định: #amount * 0.001 (1000đ = 1 điểm)
     * Admin có thể thay đổi công thức ví dụ: #amount * 0.1 / 1000
     */
    public int calculatePoints(double amount) {
        String formula = systemConfigService.getConfigValue(POINTS_FORMULA_KEY);
        if (formula == null || formula.isBlank()) {
            formula = DEFAULT_POINTS_FORMULA;
        }
        try {
            StandardEvaluationContext ctx = new StandardEvaluationContext();
            ctx.setVariable("amount", amount);
            Double result = spelParser.parseExpression(formula).getValue(ctx, Double.class);
            return result != null ? Math.max(0, result.intValue()) : 0;
        } catch (Exception e) {
            // Fallback nếu công thức lỗi: 1000đ = 1 điểm
            return (int) (amount * 0.001);
        }
    }

    /**
     * Đánh giá các luật gamification ứng với sự kiện (PAID hoặc COMPLETED).
     * Cộng điểm, gán huy hiệu, danh hiệu, bằng khen nếu điều kiện SpEL khớp.
     *
     * @param customerId ID khách hàng
     * @param eventTrigger Sự kiện: "PAID" hoặc "COMPLETED"
     */
    @Transactional
    public void evaluate(Long customerId, String eventTrigger) {
        User customer = userRepository.findById(customerId).orElse(null);
        if (customer == null) return;

        LoyaltyPoint lp = loyaltyPointRepository.findByCustomerId(customerId).orElse(null);
        if (lp == null) return;

        List<GamificationRule> activeRules = ruleRepository.findByEventTriggerAndActiveTrue(eventTrigger);

        for (GamificationRule rule : activeRules) {
            if (matchesCondition(lp, rule.getConditionExpression(), customer)) {
                applyReward(customer, lp, rule);
            }
        }

        // Sau khi áp dụng phần thưởng, kiểm tra và cập nhật cấp độ thành viên
        updateMembershipLevel(lp);
        lp.setUpdatedAt(java.time.LocalDateTime.now());
        loyaltyPointRepository.save(lp);
    }

    /**
     * Đánh giá tất cả các rule active cho customer, trả về danh sách rule + conditionMet.
     * Dùng cho frontend hiển thị rule cards.
     */
    public List<Map<String, Object>> evaluateRulesForCustomer(Long customerId) {
        User customer = userRepository.findById(customerId).orElse(null);
        if (customer == null) return List.of();

        LoyaltyPoint lp = loyaltyPointRepository.findByCustomerId(customerId).orElse(null);
        if (lp == null) return List.of();

        List<GamificationRule> allActive = ruleRepository.findByActiveTrue();
        List<Map<String, Object>> results = new ArrayList<>();
        Set<String> alreadyAwardedBadges = customerBadgeRepository.findByCustomerId(customerId).stream()
                .map(cb -> cb.getBadge().getId()).collect(java.util.stream.Collectors.toSet());
        Set<String> alreadyAwardedTitles = customerTitleRepository.findByCustomerId(customerId).stream()
                .map(ct -> ct.getTitleName()).collect(java.util.stream.Collectors.toSet());

        for (GamificationRule rule : allActive) {
            boolean met = matchesCondition(lp, rule.getConditionExpression(), customer);
            boolean alreadyRewarded = false;
            if (rule.getRewardBadgeId() != null && alreadyAwardedBadges.contains(rule.getRewardBadgeId())) {
                alreadyRewarded = true;
            }
            if (rule.getRewardTitle() != null && alreadyAwardedTitles.contains(rule.getRewardTitle())) {
                alreadyRewarded = true;
            }

            Map<String, Object> item = new LinkedHashMap<>();
            item.put("id", rule.getId());
            item.put("name", rule.getName());
            item.put("eventTrigger", rule.getEventTrigger());
            item.put("conditionExpression", rule.getConditionExpression());
            item.put("rewardPoints", rule.getRewardPoints());
            item.put("rewardBadgeId", rule.getRewardBadgeId());
            item.put("rewardTitle", rule.getRewardTitle());
            item.put("conditionMet", met);
            item.put("alreadyRewarded", alreadyRewarded);
            results.add(item);
        }
        return results;
    }

    /**
     * Đánh giá biểu thức điều kiện SpEL.
     * Các biến có thể dùng:
     *   - #totalOrders, #totalRevenue, #pointsBalance, #totalEarned, #levelNumber (từ LoyaltyPoint)
     *   - #referralBuyers, #activeReferralBuyers, #proxyOrders (từ Agency, nếu khách là đại lý)
     *   - Biến tùy chỉnh từ SpelVariable (SQL query do admin tạo)
     * Nếu để trống (null hoặc rỗng) -> luôn đúng (unconditional).
     */
    private boolean matchesCondition(LoyaltyPoint lp, String conditionExpression, User customer) {
        if (conditionExpression == null || conditionExpression.isBlank()) return true;
        try {
            StandardEvaluationContext ctx = new StandardEvaluationContext();
            ctx.setVariable("totalOrders", lp.getTotalOrders());
            ctx.setVariable("totalRevenue", lp.getTotalRevenue());
            ctx.setVariable("pointsBalance", lp.getPointsBalance());
            ctx.setVariable("totalEarned", lp.getTotalEarned());
            ctx.setVariable("levelNumber", lp.getLevelNumber());

            Agency agency = null;
            if (agency != null) {
                ctx.setVariable("referralBuyers", assignmentRepository.countByAgencyId(agency.getId()));
                ctx.setVariable("activeReferralBuyers", assignmentRepository.countActiveBuyersByAgencyId(agency.getId()));
                ctx.setVariable("proxyOrders", orderRepository.countByAgencyId(agency.getId()));
            } else {
                ctx.setVariable("referralBuyers", 0L);
                ctx.setVariable("activeReferralBuyers", 0L);
                ctx.setVariable("proxyOrders", 0L);
            }

            // Inject custom SpEL variables from spel_variables table
            try {
                List<com.anhtin.tmdt.backend.modules.loyalty.entity.SpelVariable> customVars = spelVariableService.findActive();
                for (com.anhtin.tmdt.backend.modules.loyalty.entity.SpelVariable sv : customVars) {
                    String varName = sv.getName().startsWith("#") ? sv.getName().substring(1) : sv.getName();
                    Long agencyIdVal = agency != null ? agency.getId() : null;
                    Object result = spelVariableService.executeSql(sv.getGeneratedSql(), customer.getId(), agencyIdVal);
                    ctx.setVariable(varName, result);
                }
            } catch (Exception ignored) {}

            Boolean result = spelParser.parseExpression(conditionExpression).getValue(ctx, Boolean.class);
            return Boolean.TRUE.equals(result);
        } catch (Exception e) {
            return false;
        }
    }

    /**
     * Áp dụng phần thưởng: điểm, huy hiệu, danh hiệu, bằng khen.
     */
    private void applyReward(User customer, LoyaltyPoint lp, GamificationRule rule) {
        // Cộng điểm thưởng
        if (rule.getRewardPoints() != null && rule.getRewardPoints() > 0) {
            lp.setPointsBalance(lp.getPointsBalance() + rule.getRewardPoints());
            lp.setTotalEarned(lp.getTotalEarned() + rule.getRewardPoints());
        }

        // Gán huy hiệu nếu chưa có
        if (rule.getRewardBadgeId() != null && !rule.getRewardBadgeId().isBlank()) {
            if (!customerBadgeRepository.existsByCustomerIdAndBadgeId(customer.getId(), rule.getRewardBadgeId())) {
                badgeRepository.findById(rule.getRewardBadgeId()).ifPresent(badge -> {
                    CustomerBadge cb = new CustomerBadge(customer, badge);
                    customerBadgeRepository.save(cb);

                    // Nếu badge có thông tin bằng khen, tạo Certificate kèm theo
                    if (badge.getDescription() != null) {
                        CustomerCertificate cert = new CustomerCertificate(
                            customer,
                            badge.getName(),
                            badge.getDescription()
                        );
                        customerCertificateRepository.save(cert);
                    }
                });
            }
        }

        // Gán danh hiệu nếu chưa có
        if (rule.getRewardTitle() != null && !rule.getRewardTitle().isBlank()) {
            if (!customerTitleRepository.existsByCustomerIdAndTitleName(customer.getId(), rule.getRewardTitle())) {
                CustomerTitle ct = new CustomerTitle(customer, rule.getRewardTitle());
                customerTitleRepository.save(ct);
            }
        }
    }

    /**
     * Cập nhật cấp độ thành viên dựa trên các chỉ số hiện tại và bảng cấu hình MembershipLevel.
     * Hệ thống sẽ tự động nâng hoặc hạ cấp dựa trên điều kiện điểm/đơn hàng/doanh thu.
     */
    private void updateMembershipLevel(LoyaltyPoint lp) {
        List<MembershipLevel> levels = membershipLevelRepository.findByActiveTrueOrderByLevelNumberAsc();
        int currentLevel = 1;
        for (MembershipLevel level : levels) {
            boolean meetsPoints   = lp.getTotalEarned()  >= level.getMinPoints();
            boolean meetsOrders   = lp.getTotalOrders()  >= level.getMinOrders();
            boolean meetsRevenue  = lp.getTotalRevenue() >= level.getMinRevenue();
            if (meetsPoints && meetsOrders && meetsRevenue) {
                currentLevel = level.getLevelNumber();
            }
        }
        lp.setLevelNumber(currentLevel);
    }
}
