package com.anhtin.tmdt.backend.modules.guide.service;

import com.anhtin.tmdt.backend.modules.guide.dto.*;
import com.anhtin.tmdt.backend.modules.guide.entity.Guide;
import com.anhtin.tmdt.backend.modules.guide.entity.GuideStep;
import com.anhtin.tmdt.backend.modules.guide.entity.GuideTarget;
import com.anhtin.tmdt.backend.modules.guide.repository.GuideRepository;
import com.anhtin.tmdt.backend.modules.guide.repository.GuideStepRepository;
import com.anhtin.tmdt.backend.modules.guide.repository.GuideTargetRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class GuideService {

    @Autowired
    private GuideRepository guideRepository;

    @Autowired
    private GuideStepRepository guideStepRepository;

    @Autowired
    private GuideTargetRepository guideTargetRepository;

    public List<GuideDTO> getAll() {
        return guideRepository.findAll().stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    public List<GuideDTO> getActiveGuides() {
        List<Guide> guides = guideRepository.findByIsActiveTrueOrderByCreatedAtAsc();
        return guides.stream()
                .map(this::toDTOWithSteps)
                .collect(Collectors.toList());
    }

    public GuideDTO getById(Long id) {
        Guide guide = guideRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Guide not found"));
        return toDTOWithSteps(guide);
    }

    @Transactional
    public GuideDTO create(CreateGuideRequest request) {
        Guide guide = new Guide();
        guide.setName(request.getName());
        guide.setDescription(request.getDescription());
        guide.setVersion(request.getVersion() != null ? request.getVersion() : 1);
        guide.setIsActive(request.getIsActive() != null ? request.getIsActive() : true);
        guide.setConditions(request.getConditions());
        Guide saved = guideRepository.save(guide);
        return toDTO(saved);
    }

    @Transactional
    public GuideDTO update(Long id, CreateGuideRequest request) {
        Guide guide = guideRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Guide not found"));
        guide.setName(request.getName());
        guide.setDescription(request.getDescription());
        guide.setVersion(request.getVersion() != null ? request.getVersion() : guide.getVersion());
        guide.setIsActive(request.getIsActive() != null ? request.getIsActive() : guide.getIsActive());
        guide.setConditions(request.getConditions());
        Guide saved = guideRepository.save(guide);
        return toDTOWithSteps(saved);
    }

    @Transactional
    public void delete(Long id) {
        if (!guideRepository.existsById(id)) {
            throw new RuntimeException("Guide not found");
        }
        guideStepRepository.deleteByGuideId(id);
        guideRepository.deleteById(id);
    }

    @Transactional
    public void toggleActive(Long id) {
        Guide guide = guideRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Guide not found"));
        guide.setIsActive(!guide.getIsActive());
        guideRepository.save(guide);
    }

    @Transactional
    public GuideStepDTO addStep(Long guideId, CreateGuideStepRequest request) {
        if (!guideRepository.existsById(guideId)) {
            throw new RuntimeException("Guide not found");
        }
        if (!guideTargetRepository.existsById(request.getTargetId())) {
            throw new RuntimeException("Target not found");
        }
        GuideStep step = new GuideStep();
        step.setGuideId(guideId);
        step.setTargetId(request.getTargetId());
        step.setTitle(request.getTitle());
        step.setDescription(request.getDescription());
        step.setPlacement(request.getPlacement());
        step.setStepOrder(request.getStepOrder());
        step.setNavigateToScreen(request.getNavigateToScreen());
        step.setNavigateToParams(request.getNavigateToParams());
        GuideStep saved = guideStepRepository.save(step);

        GuideStepDTO dto = new GuideStepDTO(saved);
        enrichStepWithTarget(dto);
        return dto;
    }

    @Transactional
    public GuideStepDTO updateStep(Long guideId, Long stepId, UpdateGuideStepRequest request) {
        GuideStep step = guideStepRepository.findById(stepId)
                .orElseThrow(() -> new RuntimeException("Step not found"));
        if (!step.getGuideId().equals(guideId)) {
            throw new RuntimeException("Step does not belong to this guide");
        }
        if (!guideTargetRepository.existsById(request.getTargetId())) {
            throw new RuntimeException("Target not found");
        }
        step.setTargetId(request.getTargetId());
        step.setTitle(request.getTitle());
        step.setDescription(request.getDescription());
        step.setPlacement(request.getPlacement());
        step.setStepOrder(request.getStepOrder());
        step.setNavigateToScreen(request.getNavigateToScreen());
        step.setNavigateToParams(request.getNavigateToParams());
        GuideStep saved = guideStepRepository.save(step);

        GuideStepDTO dto = new GuideStepDTO(saved);
        enrichStepWithTarget(dto);
        return dto;
    }

    @Transactional
    public void deleteStep(Long guideId, Long stepId) {
        GuideStep step = guideStepRepository.findById(stepId)
                .orElseThrow(() -> new RuntimeException("Step not found"));
        if (!step.getGuideId().equals(guideId)) {
            throw new RuntimeException("Step does not belong to this guide");
        }
        guideStepRepository.deleteById(stepId);
    }

    private GuideDTO toDTO(Guide guide) {
        return new GuideDTO(guide);
    }

    private GuideDTO toDTOWithSteps(Guide guide) {
        GuideDTO dto = new GuideDTO(guide);
        List<GuideStep> steps = guideStepRepository.findByGuideIdOrderByStepOrderAsc(guide.getId());
        List<GuideStepDTO> stepDTOs = steps.stream().map(step -> {
            GuideStepDTO sdto = new GuideStepDTO(step);
            enrichStepWithTarget(sdto);
            return sdto;
        }).collect(Collectors.toList());
        dto.setSteps(stepDTOs);
        return dto;
    }

    private void enrichStepWithTarget(GuideStepDTO dto) {
        try {
            GuideTarget target = guideTargetRepository.findById(dto.getTargetId()).orElse(null);
            if (target != null) {
                dto.setTargetKey(target.getKey());
                dto.setTargetName(target.getName());
            }
        } catch (Exception ignored) {
        }
    }
}
