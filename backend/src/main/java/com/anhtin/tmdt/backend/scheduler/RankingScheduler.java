package com.anhtin.tmdt.backend.scheduler;

import com.anhtin.tmdt.backend.modules.agency.entity.Agency;
import com.anhtin.tmdt.backend.modules.agency.entity.AgencyRanking;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import com.anhtin.tmdt.backend.modules.agency.repository.AgencyRankingRepository;
import com.anhtin.tmdt.backend.modules.agency.repository.AgencyRepository;
import com.anhtin.tmdt.backend.modules.agency.repository.AgencyReviewRepository;
import com.anhtin.tmdt.backend.modules.order.repository.TransactionRepository;
import com.anhtin.tmdt.backend.modules.order.repository.OrderRepository;
import com.anhtin.tmdt.backend.modules.order.entity.Transaction;

/**
 * CronJob cháº¡y hÃ ng thÃ¡ng (ngÃ y 1, lÃºc 2:00 AM) Ä‘á»ƒ tÃ­nh toÃ¡n xáº¿p háº¡ng Äáº¡i lÃ½.
 * TiÃªu chÃ­: Tá»•ng doanh thu, Tá»•ng Ä‘Æ¡n hÃ ng, Äiá»ƒm Ä‘Ã¡nh giÃ¡ trung bÃ¬nh.
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
     * Cháº¡y vÃ o ngÃ y 1 má»—i thÃ¡ng, lÃºc 2:00 AM.
     * TÃ­nh xáº¿p háº¡ng thÃ¡ng trÆ°á»›c.
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

            // TÃ­nh tá»•ng doanh thu tá»« transactions
            Double totalRevenue = transactionRepository.sumAgencyNetIncomeByAgencyId(agency.getId());

            // TÃ­nh tá»•ng Ä‘Æ¡n hÃ ng
            int totalOrders = orderRepository.findByAgencyId(agency.getId()).size();

            // TÃ­nh Ä‘iá»ƒm Ä‘Ã¡nh giÃ¡ trung bÃ¬nh
            Double avgRating = agencyReviewRepository.getAverageRatingByAgencyId(agency.getId());

            // XÃ¡c Ä‘á»‹nh háº¡ng (dá»±a trÃªn doanh thu)
            String rankLevel = determineRankLevel(totalRevenue);

            // Táº¡o hoáº·c cáº­p nháº­t ranking
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

        System.out.println("âœ… ÄÃ£ tÃ­nh xáº¿p háº¡ng Äáº¡i lÃ½ thÃ¡ng " + month + "/" + year);
    }

    private String determineRankLevel(Double revenue) {
        if (revenue == null || revenue <= 0) return "BRONZE";
        if (revenue >= 500_000_000) return "DIAMOND";   // >= 500 triá»‡u
        if (revenue >= 200_000_000) return "PLATINUM";   // >= 200 triá»‡u
        if (revenue >= 50_000_000) return "GOLD";        // >= 50 triá»‡u
        if (revenue >= 10_000_000) return "SILVER";      // >= 10 triá»‡u
        return "BRONZE";
    }
}
