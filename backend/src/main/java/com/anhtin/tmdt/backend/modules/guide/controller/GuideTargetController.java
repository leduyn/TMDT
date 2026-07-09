package com.anhtin.tmdt.backend.modules.guide.controller;

import com.anhtin.tmdt.backend.modules.guide.dto.CreateGuideTargetRequest;
import com.anhtin.tmdt.backend.modules.guide.dto.GuideTargetDTO;
import com.anhtin.tmdt.backend.modules.guide.service.GuideTargetService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/guide-targets")
@CrossOrigin(origins = "*")
public class GuideTargetController {

    @Autowired
    private GuideTargetService guideTargetService;

    @GetMapping
    @PreAuthorize("hasAnyRole('COMPANY', 'AGENCY')")
    public List<GuideTargetDTO> getAll() {
        return guideTargetService.getAll();
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('COMPANY', 'AGENCY')")
    public GuideTargetDTO getById(@PathVariable Long id) {
        return guideTargetService.getById(id);
    }

    @PostMapping
    @PreAuthorize("hasRole('COMPANY')")
    public ResponseEntity<?> create(@Valid @RequestBody CreateGuideTargetRequest request) {
        try {
            return ResponseEntity.ok(guideTargetService.create(request));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(new com.anhtin.tmdt.backend.modules.common.dto.MessageResponse(e.getMessage()));
        }
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('COMPANY')")
    public ResponseEntity<?> update(@PathVariable Long id, @Valid @RequestBody CreateGuideTargetRequest request) {
        try {
            return ResponseEntity.ok(guideTargetService.update(id, request));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(new com.anhtin.tmdt.backend.modules.common.dto.MessageResponse(e.getMessage()));
        }
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('COMPANY')")
    public ResponseEntity<?> delete(@PathVariable Long id) {
        try {
            guideTargetService.delete(id);
            return ResponseEntity.ok(new com.anhtin.tmdt.backend.modules.common.dto.MessageResponse("Deleted"));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(new com.anhtin.tmdt.backend.modules.common.dto.MessageResponse(e.getMessage()));
        }
    }
}
