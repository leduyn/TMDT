package com.anhtin.tmdt.backend.scheduler;

import com.anhtin.tmdt.backend.entity.Agency;
import com.anhtin.tmdt.backend.entity.AgencyRanking;
import com.anhtin.tmdt.backend.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

/**
 * CronJob chạy hàng tháng (ngày 1, lúc 2:00 AM) để tính toán xếp hạng Đại lý.
 * Tiêu chí: Tổng doanh thu, Tổng đơn hàng, Điểm đánh giá trung bình.
 */
@Component
public class RankingScheduler {

    @Autowired
    private AgencyRepository agencyRepository;

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private AgencyReviewRepository agencyReviewRepository;

    @Autowired
    private AgencyRankingRepository agencyRankingRepository;

    @Autowired
    private TransactionRepository transactionRepository;

    /**
     * Chạy vào ngày 1 mỗi tháng, lúc 2:00 AM.
     * Tính xếp hạng tháng trước.
     */
    @Scheduled(cron = "0 0 2 1 * ?")
    @Transactional
    public void calculateMonthlyRankings() {
        LocalDate lastMonth = LocalDate.now().minusMonths(1);
        int month = lastMonth.getMonthValue();
        int year = lastMonth.getYear();

        List<Agency> agencies = agencyRepository.findAll();

        for (Agency agency : agencies) {
            if (!agency.isActive()) continue;

            // Tính tổng doanh thu từ transactions
            Double totalRevenue = transactionRepository.sumAgencyNetIncomeByAgencyId(agency.getId());

            // Tính tổng đơn hàng
            int totalOrders = orderRepository.findByAgencyId(agency.getId()).size();

            // Tính điểm đánh giá trung bình
            Double avgRating = agencyReviewRepository.getAverageRatingByAgencyId(agency.getId());

            // Xác định hạng (dựa trên doanh thu)
            String rankLevel = determineRankLevel(totalRevenue);

            // Tạo hoặc cập nhật ranking
            AgencyRanking ranking = agencyRankingRepository
                    .findByAgencyIdAndMonthAndYear(agency.getId(), month, year)
                    .orElse(new AgencyRanking());

            ranking.setAgency(agency);
            ranking.setTotalRevenue(totalRevenue != null ? totalRevenue : 0.0);
            ranking.setTotalOrders(totalOrders);
            ranking.setAverageRating(avgRating != null ? avgRating : 0.0);
            ranking.setRankLevel(rankLevel);
            ranking.setMonth(month);
            ranking.setYear(year);

            agencyRankingRepository.save(ranking);
        }

        System.out.println("✅ Đã tính xếp hạng Đại lý tháng " + month + "/" + year);
    }

    private String determineRankLevel(Double revenue) {
        if (revenue == null || revenue <= 0) return "BRONZE";
        if (revenue >= 500_000_000) return "DIAMOND";   // >= 500 triệu
        if (revenue >= 200_000_000) return "PLATINUM";   // >= 200 triệu
        if (revenue >= 50_000_000) return "GOLD";        // >= 50 triệu
        if (revenue >= 10_000_000) return "SILVER";      // >= 10 triệu
        return "BRONZE";
    }
}
