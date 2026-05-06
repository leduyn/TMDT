package com.anhtin.tmdt.backend.service;

import com.anhtin.tmdt.backend.dto.request.AgencyRequest;
import com.anhtin.tmdt.backend.dto.response.AgencyDTO;
import com.anhtin.tmdt.backend.dto.response.UserDTO;
import com.anhtin.tmdt.backend.entity.Agency;
import com.anhtin.tmdt.backend.entity.User;
import com.anhtin.tmdt.backend.repository.AgencyRepository;
import com.anhtin.tmdt.backend.repository.UserRepository;
import com.anhtin.tmdt.backend.repository.OrderRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class AgencyService {

    @Autowired
    private AgencyRepository agencyRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private OrderRepository orderRepository;

    public List<AgencyDTO> getAllAgencies() {
        return agencyRepository.findAll().stream()
                .map(AgencyDTO::new)
                .collect(Collectors.toList());
    }

    @SuppressWarnings("null")
    public AgencyDTO getAgencyById(Long id) {
        Agency agency = agencyRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Agency not found"));
        return new AgencyDTO(agency);
    }

    @SuppressWarnings("null")
    @Transactional
    public AgencyDTO createAgency(AgencyRequest request) {
        User user = userRepository.findById(request.getUserId())
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        Agency agency = new Agency();
        agency.setUser(user);
        agency.setName(request.getName());
        agency.setPhone(request.getPhone());
        agency.setAddress(request.getAddress());
        agency.setLatitude(request.getLatitude() != null ? request.getLatitude() : 0.0);
        agency.setLongitude(request.getLongitude() != null ? request.getLongitude() : 0.0);
        agency.setActive(true);
        
        return new AgencyDTO(agencyRepository.save(agency));
    }

    @SuppressWarnings("null")
    @Transactional
    public AgencyDTO updateAgency(Long id, AgencyRequest request) {
        Agency agency = agencyRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Agency not found"));
        
        if (request.getName() != null) agency.setName(request.getName());
        if (request.getPhone() != null) agency.setPhone(request.getPhone());
        if (request.getAddress() != null) agency.setAddress(request.getAddress());
        if (request.getLatitude() != null) agency.setLatitude(request.getLatitude());
        if (request.getLongitude() != null) agency.setLongitude(request.getLongitude());
        if (request.getActive() != null) agency.setActive(request.getActive());
        
        return new AgencyDTO(agencyRepository.save(agency));
    }

    public List<UserDTO> getCustomersByAgency(Long agencyId) {
        return orderRepository.findByAgencyId(agencyId).stream()
                .map(o -> o.getCustomer())
                .distinct()
                .map(UserDTO::new)
                .collect(Collectors.toList());
    }

    public AgencyDTO getAgencyByUserId(Long userId) {
        return agencyRepository.findByUserId(userId)
                .map(AgencyDTO::new)
                .orElseThrow(() -> new RuntimeException("User is not an agency or agency not found"));
    }
}
