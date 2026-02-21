package com.groupdrive.service;

import com.groupdrive.dto.CreateGroupRequest;
import com.groupdrive.dto.GroupResponse;
import com.groupdrive.dto.JoinGroupRequest;
import com.groupdrive.dto.JoinResponse;
import com.groupdrive.model.Group;
import com.groupdrive.model.Member;
import com.groupdrive.repository.GroupRepository;
import com.groupdrive.repository.MemberRepository;
import com.groupdrive.util.IdGenerator;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
public class GroupService {

    @Autowired
    private GroupRepository groupRepository;

    @Autowired
    private MemberRepository memberRepository;

    @Transactional
    public GroupResponse createGroup(CreateGroupRequest request) {
        String groupId = IdGenerator.generateGroupId();
        String adminId = IdGenerator.generateMemberId();

        // Create the Group
        Group group = new Group();
        group.setGroupId(groupId);
        group.setGroupName(request.getGroupName());
        group.setAdminId(adminId);
        group.setActive(true);
        group.setCreatedAt(LocalDateTime.now());

        groupRepository.save(group);

        // Create the Admin Member
        Member adminMember = new Member();
        adminMember.setMemberId(adminId);
        adminMember.setGroupId(groupId);
        adminMember.setName(request.getAdminName());
        adminMember.setRole("ADMIN");
        adminMember.setSharing(false);

        memberRepository.save(adminMember);

        return new GroupResponse(groupId, group.getGroupName(), adminId, adminMember.getName());
    }

    @Transactional
    public JoinResponse joinGroup(JoinGroupRequest request) {
        // Validate group exists and is active
        Group group = groupRepository.findByGroupId(request.getGroupId())
                .orElseThrow(() -> new IllegalArgumentException("Group not found"));

        if (!group.isActive()) {
            throw new IllegalArgumentException("This group is no longer active");
        }

        String memberId = IdGenerator.generateMemberId();

        // Create the Member
        Member member = new Member();
        member.setMemberId(memberId);
        member.setGroupId(group.getGroupId());
        member.setName(request.getMemberName());
        member.setRole("MEMBER");
        member.setSharing(false);

        memberRepository.save(member);

        return new JoinResponse(
                group.getGroupId(),
                group.getGroupName(),
                memberId,
                member.getName(),
                member.getRole());
    }
}
