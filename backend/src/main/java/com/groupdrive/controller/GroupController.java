package com.groupdrive.controller;

import com.groupdrive.dto.CreateGroupRequest;
import com.groupdrive.dto.GroupResponse;
import com.groupdrive.dto.JoinGroupRequest;
import com.groupdrive.dto.JoinResponse;
import com.groupdrive.service.GroupService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/groups")
public class GroupController {

    @Autowired
    private GroupService groupService;

    @PostMapping("/create")
    public ResponseEntity<GroupResponse> createGroup(@RequestBody CreateGroupRequest request) {
        if (request.getGroupName() == null || request.getAdminName() == null) {
            return ResponseEntity.badRequest().build();
        }
        GroupResponse response = groupService.createGroup(request);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/join")
    public ResponseEntity<?> joinGroup(@RequestBody JoinGroupRequest request) {
        if (request.getGroupId() == null || request.getMemberName() == null) {
            return ResponseEntity.badRequest().body("Group ID and Member Name are required");
        }
        try {
            JoinResponse response = groupService.joinGroup(request);
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}
