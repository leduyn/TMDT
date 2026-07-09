package com.anhtin.tmdt.backend.modules.guide.service;

import com.anhtin.tmdt.backend.modules.guide.dto.CreateGuideTargetRequest;
import com.anhtin.tmdt.backend.modules.guide.dto.GuideTargetDTO;
import com.anhtin.tmdt.backend.modules.guide.entity.GuideTarget;
import com.anhtin.tmdt.backend.modules.guide.repository.GuideTargetRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class GuideTargetService {

    @Autowired
    private GuideTargetRepository guideTargetRepository;

    public List<GuideTargetDTO> getAll() {
        return guideTargetRepository.findAll().stream()
                .map(GuideTargetDTO::new)
                .collect(Collectors.toList());
    }

    public GuideTargetDTO getById(Long id) {
        GuideTarget target = guideTargetRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Guide target not found"));
        return new GuideTargetDTO(target);
    }

    public GuideTargetDTO create(CreateGuideTargetRequest request) {
        if (guideTargetRepository.existsByKey(request.getKey())) {
            throw new RuntimeException("Target key already exists: " + request.getKey());
        }
        GuideTarget target = new GuideTarget();
        target.setKey(request.getKey());
        target.setName(request.getName());
        target.setDescription(request.getDescription());
        target.setScreenName(request.getScreenName());
        GuideTarget saved = guideTargetRepository.save(target);
        return new GuideTargetDTO(saved);
    }

    public GuideTargetDTO update(Long id, CreateGuideTargetRequest request) {
        GuideTarget target = guideTargetRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Guide target not found"));
        if (!target.getKey().equals(request.getKey()) && guideTargetRepository.existsByKey(request.getKey())) {
            throw new RuntimeException("Target key already exists: " + request.getKey());
        }
        target.setKey(request.getKey());
        target.setName(request.getName());
        target.setDescription(request.getDescription());
        target.setScreenName(request.getScreenName());
        GuideTarget saved = guideTargetRepository.save(target);
        return new GuideTargetDTO(saved);
    }

    public void delete(Long id) {
        if (!guideTargetRepository.existsById(id)) {
            throw new RuntimeException("Guide target not found");
        }
        guideTargetRepository.deleteById(id);
    }
}
