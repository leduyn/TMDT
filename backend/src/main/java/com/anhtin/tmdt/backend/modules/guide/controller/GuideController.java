package com.anhtin.tmdt.backend.modules.guide.controller;

import com.anhtin.tmdt.backend.modules.guide.dto.*;
import com.anhtin.tmdt.backend.modules.guide.service.GuideService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/guides")
@CrossOrigin(origins = "*")
public class GuideController {

    @Autowired
    private GuideService guideService;

    @GetMapping
    @PreAuthorize("hasAnyRole('COMPANY', 'AGENCY')")
    public List<GuideDTO> getAll() {
        return guideService.getAll();
    }

    @GetMapping("/active")
    public List<GuideDTO> getActive() {
        return guideService.getActiveGuides();
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('COMPANY', 'AGENCY')")
    public GuideDTO getById(@PathVariable Long id) {
        return guideService.getById(id);
    }

    @PostMapping
    @PreAuthorize("hasRole('COMPANY')")
    public ResponseEntity<?> create(@Valid @RequestBody CreateGuideRequest request) {
        try {
            return ResponseEntity.ok(guideService.create(request));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(new com.anhtin.tmdt.backend.modules.common.dto.MessageResponse(e.getMessage()));
        }
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('COMPANY')")
    public ResponseEntity<?> update(@PathVariable Long id, @Valid @RequestBody CreateGuideRequest request) {
        try {
            return ResponseEntity.ok(guideService.update(id, request));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(new com.anhtin.tmdt.backend.modules.common.dto.MessageResponse(e.getMessage()));
        }
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('COMPANY')")
    public ResponseEntity<?> delete(@PathVariable Long id) {
        try {
            guideService.delete(id);
            return ResponseEntity.ok(new com.anhtin.tmdt.backend.modules.common.dto.MessageResponse("Deleted"));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(new com.anhtin.tmdt.backend.modules.common.dto.MessageResponse(e.getMessage()));
        }
    }

    @PutMapping("/{id}/toggle-active")
    @PreAuthorize("hasRole('COMPANY')")
    public ResponseEntity<?> toggleActive(@PathVariable Long id) {
        try {
            guideService.toggleActive(id);
            return ResponseEntity.ok(new com.anhtin.tmdt.backend.modules.common.dto.MessageResponse("Toggled"));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(new com.anhtin.tmdt.backend.modules.common.dto.MessageResponse(e.getMessage()));
        }
    }

    @PostMapping("/{guideId}/steps")
    @PreAuthorize("hasRole('COMPANY')")
    public ResponseEntity<?> addStep(@PathVariable Long guideId, @Valid @RequestBody CreateGuideStepRequest request) {
        try {
            return ResponseEntity.ok(guideService.addStep(guideId, request));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(new com.anhtin.tmdt.backend.modules.common.dto.MessageResponse(e.getMessage()));
        }
    }

    @PutMapping("/{guideId}/steps/{stepId}")
    @PreAuthorize("hasRole('COMPANY')")
    public ResponseEntity<?> updateStep(@PathVariable Long guideId, @PathVariable Long stepId,
                                         @Valid @RequestBody UpdateGuideStepRequest request) {
        try {
            return ResponseEntity.ok(guideService.updateStep(guideId, stepId, request));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(new com.anhtin.tmdt.backend.modules.common.dto.MessageResponse(e.getMessage()));
        }
    }

    @DeleteMapping("/{guideId}/steps/{stepId}")
    @PreAuthorize("hasRole('COMPANY')")
    public ResponseEntity<?> deleteStep(@PathVariable Long guideId, @PathVariable Long stepId) {
        try {
            guideService.deleteStep(guideId, stepId);
            return ResponseEntity.ok(new com.anhtin.tmdt.backend.modules.common.dto.MessageResponse("Deleted"));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(new com.anhtin.tmdt.backend.modules.common.dto.MessageResponse(e.getMessage()));
        }
    }
}
