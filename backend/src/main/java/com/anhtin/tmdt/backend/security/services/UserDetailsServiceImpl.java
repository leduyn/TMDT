package com.anhtin.tmdt.backend.security.services;

import com.anhtin.tmdt.backend.entity.User;
import com.anhtin.tmdt.backend.entity.Agency;
import com.anhtin.tmdt.backend.repository.UserRepository;
import com.anhtin.tmdt.backend.repository.AgencyRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class UserDetailsServiceImpl implements UserDetailsService {
    
    @Autowired
    UserRepository userRepository;

    @Autowired
    AgencyRepository agencyRepository;

    @Override
    @Transactional
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("User Not Found with username: " + username));

        Long agencyId = agencyRepository.findByUserId(user.getId())
                .map(Agency::getId)
                .orElse(null);

        return UserDetailsImpl.build(user, agencyId);
    }
}
