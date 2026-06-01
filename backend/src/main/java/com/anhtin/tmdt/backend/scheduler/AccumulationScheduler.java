package com.anhtin.tmdt.backend.scheduler;

import com.anhtin.tmdt.backend.modules.accumulation.entity.AccumulationProgram;
import com.anhtin.tmdt.backend.modules.accumulation.repository.AccumulationProgramRepository;
import com.anhtin.tmdt.backend.modules.accumulation.service.AccumulationProgramService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Component
public class AccumulationScheduler {

    @Autowired
    private AccumulationProgramRepository programRepository;

    @Autowired
    private AccumulationProgramService accumulationProgramService;

    @Scheduled(cron = "0 0 3 * * ?")
    @Transactional
    public void processEndedPrograms() {
        LocalDateTime now = LocalDateTime.now();
        List<AccumulationProgram> endedPrograms = programRepository.findEndedProgramsPendingStage1(now);

        for (AccumulationProgram program : endedPrograms) {
            try {
                accumulationProgramService.calculateStage1(program.getId());
                System.out.println("Auto-calculated stage 1 for accumulation program: " + program.getName());
            } catch (Exception e) {
                System.err.println("Failed to auto-calculate stage 1 for program " + program.getName() + ": " + e.getMessage());
            }
        }
    }
}
