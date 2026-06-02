package com.anhtin.tmdt.backend.modules.accumulation.controller;

import com.anhtin.tmdt.backend.modules.accumulation.dto.AccumulationProgramDTO;
import com.anhtin.tmdt.backend.modules.accumulation.dto.AccumulationProgramRequest;
import com.anhtin.tmdt.backend.modules.accumulation.dto.AccumulationSummaryDTO;
import com.anhtin.tmdt.backend.modules.accumulation.dto.AccumulationDebtDetailDTO;
import com.anhtin.tmdt.backend.modules.accumulation.entity.AccumulationPayment;
import com.anhtin.tmdt.backend.modules.accumulation.service.AccumulationProgramService;
import com.anhtin.tmdt.backend.modules.common.dto.MessageResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/accumulation-programs")
public class AccumulationController {

    @Autowired
    private AccumulationProgramService accumulationProgramService;

    @GetMapping
    @PreAuthorize("hasAnyRole('COMPANY', 'ADMIN')")
    public ResponseEntity<List<AccumulationProgramDTO>> getAllPrograms() {
        return ResponseEntity.ok(accumulationProgramService.getAllPrograms());
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('COMPANY', 'ADMIN', 'AGENCY')")
    public ResponseEntity<AccumulationProgramDTO> getProgramById(@PathVariable Long id) {
        return ResponseEntity.ok(accumulationProgramService.getProgramById(id));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('COMPANY', 'ADMIN')")
    public ResponseEntity<?> createProgram(@RequestBody AccumulationProgramRequest request) {
        try {
            return ResponseEntity.ok(accumulationProgramService.createProgram(request));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new MessageResponse(e.getMessage()));
        }
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('COMPANY', 'ADMIN')")
    public ResponseEntity<?> updateProgram(@PathVariable Long id, @RequestBody AccumulationProgramRequest request) {
        try {
            return ResponseEntity.ok(accumulationProgramService.updateProgram(id, request));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new MessageResponse(e.getMessage()));
        }
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('COMPANY', 'ADMIN')")
    public ResponseEntity<?> deleteProgram(@PathVariable Long id) {
        try {
            accumulationProgramService.deleteProgram(id);
            return ResponseEntity.ok(new MessageResponse("Program deleted"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new MessageResponse(e.getMessage()));
        }
    }

    @GetMapping("/{programId}/summaries")
    @PreAuthorize("hasAnyRole('COMPANY', 'ADMIN')")
    public ResponseEntity<List<AccumulationSummaryDTO>> getAllSummaries(@PathVariable Long programId) {
        return ResponseEntity.ok(accumulationProgramService.getAllAgencySummaries(programId));
    }

    @GetMapping("/{programId}/agencies/{agencyId}/summary")
    @PreAuthorize("hasAnyRole('COMPANY', 'ADMIN', 'AGENCY')")
    public ResponseEntity<AccumulationSummaryDTO> getAgencySummary(
            @PathVariable Long programId, @PathVariable Long agencyId) {
        return ResponseEntity.ok(accumulationProgramService.getAgencySummary(programId, agencyId));
    }

    @PostMapping("/{programId}/stage1/calculate")
    @PreAuthorize("hasAnyRole('COMPANY', 'ADMIN')")
    public ResponseEntity<?> calculateStage1(@PathVariable Long programId) {
        try {
            return ResponseEntity.ok(accumulationProgramService.calculateStage1(programId));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new MessageResponse(e.getMessage()));
        }
    }

    @PostMapping("/{programId}/stage1/approve-all")
    @PreAuthorize("hasAnyRole('COMPANY', 'ADMIN')")
    public ResponseEntity<?> approveAllStage1(@PathVariable Long programId) {
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            String username = auth.getName();
            return ResponseEntity.ok(accumulationProgramService.approveAllStage1(programId, username));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new MessageResponse(e.getMessage()));
        }
    }

    @PostMapping("/{programId}/agencies/{agencyId}/stage1/approve")
    @PreAuthorize("hasAnyRole('COMPANY', 'ADMIN')")
    public ResponseEntity<?> approveStage1(@PathVariable Long programId, @PathVariable Long agencyId) {
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            String username = auth.getName();
            return ResponseEntity.ok(accumulationProgramService.approveStage1Payment(programId, agencyId, username));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new MessageResponse(e.getMessage()));
        }
    }

    @PostMapping("/{programId}/agencies/{agencyId}/stage1/reject")
    @PreAuthorize("hasAnyRole('COMPANY', 'ADMIN')")
    public ResponseEntity<?> rejectStage1(@PathVariable Long programId, @PathVariable Long agencyId,
                                           @RequestParam(required = false) String notes) {
        try {
            return ResponseEntity.ok(accumulationProgramService.rejectStage1Payment(programId, agencyId, notes));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new MessageResponse(e.getMessage()));
        }
    }

    @PostMapping("/{programId}/agencies/{agencyId}/stage2/calculate")
    @PreAuthorize("hasAnyRole('COMPANY', 'ADMIN')")
    public ResponseEntity<?> calculateStage2(@PathVariable Long programId, @PathVariable Long agencyId) {
        try {
            return ResponseEntity.ok(accumulationProgramService.calculateStage2(programId, agencyId));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new MessageResponse(e.getMessage()));
        }
    }

    @PostMapping("/{id}/activate")
    @PreAuthorize("hasAnyRole('COMPANY', 'ADMIN')")
    public ResponseEntity<?> activateProgram(@PathVariable Long id) {
        try {
            return ResponseEntity.ok(accumulationProgramService.activateProgram(id));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new MessageResponse(e.getMessage()));
        }
    }

    @GetMapping("/{programId}/debts")
    @PreAuthorize("hasAnyRole('COMPANY', 'ADMIN')")
    public ResponseEntity<List<AccumulationDebtDetailDTO>> getProgramDebts(@PathVariable Long programId) {
        return ResponseEntity.ok(accumulationProgramService.getProgramDebts(programId));
    }

    @GetMapping("/{programId}/debts/stats")
    @PreAuthorize("hasAnyRole('COMPANY', 'ADMIN')")
    public ResponseEntity<?> getProgramDebtStats(@PathVariable Long programId) {
        return ResponseEntity.ok(accumulationProgramService.getProgramDebtStats(programId));
    }

    @GetMapping("/{programId}/agencies/{agencyId}/debts")
    @PreAuthorize("hasAnyRole('COMPANY', 'ADMIN', 'AGENCY')")
    public ResponseEntity<List<AccumulationDebtDetailDTO>> getProgramDebtsByAgency(
            @PathVariable Long programId, @PathVariable Long agencyId) {
        return ResponseEntity.ok(accumulationProgramService.getProgramDebtsByAgency(programId, agencyId));
    }
}
