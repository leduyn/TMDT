package com.anhtin.tmdt.backend.modules.customer.controller;

import com.anhtin.tmdt.backend.modules.customer.dto.CustomerGroupRequest;
import com.anhtin.tmdt.backend.modules.common.dto.CustomerGroupDTO;
import com.anhtin.tmdt.backend.modules.common.dto.MessageResponse;
import com.anhtin.tmdt.backend.modules.customer.service.CustomerGroupService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import com.anhtin.tmdt.backend.modules.user.entity.User;

@RestController
@RequestMapping("/api/customer-groups")
public class CustomerGroupController {

    @Autowired
    private CustomerGroupService customerGroupService;

    @GetMapping
    public List<CustomerGroupDTO> getAllGroups() {
        return customerGroupService.getAllGroups();
    }

    @GetMapping("/{id}")
    public CustomerGroupDTO getGroupById(@PathVariable Long id) {
        return customerGroupService.getGroupById(id);
    }

    @PostMapping
    @PreAuthorize("hasRole('COMPANY')")
    public CustomerGroupDTO createGroup(@RequestBody CustomerGroupRequest request) {
        return customerGroupService.createGroup(request);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('COMPANY')")
    public CustomerGroupDTO updateGroup(@PathVariable Long id, @RequestBody CustomerGroupRequest request) {
        return customerGroupService.updateGroup(id, request);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('COMPANY')")
    public ResponseEntity<?> deleteGroup(@PathVariable Long id) {
        customerGroupService.deleteGroup(id);
        return ResponseEntity.ok(new MessageResponse("Deleted customer group successfully"));
    }

    @PostMapping("/{id}/assign/{userId}")
    @PreAuthorize("hasRole('COMPANY')")
    public ResponseEntity<?> assignUser(@PathVariable Long id, @PathVariable Long userId) {
        customerGroupService.assignUserToGroup(userId, id);
        return ResponseEntity.ok(new MessageResponse("Assigned user to group successfully"));
    }

    @PostMapping("/remove-user/{userId}")
    @PreAuthorize("hasRole('COMPANY')")
    public ResponseEntity<?> removeUser(@PathVariable Long userId) {
        customerGroupService.removeUserFromGroup(userId);
        return ResponseEntity.ok(new MessageResponse("Removed user from group successfully"));
    }
}
