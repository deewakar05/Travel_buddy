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
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;
import com.groupdrive.dto.MemberResponse;

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
        String memberToken = UUID.randomUUID().toString();
        adminMember.setMemberToken(memberToken);

        memberRepository.save(adminMember);

        return new GroupResponse(groupId, group.getGroupName(), adminId, adminMember.getName(), memberToken);
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
        // Smart Role Assignment: Second participant becomes ROUTE_PLANNER
        List<Member> existingMembers = memberRepository.findByGroupId(group.getGroupId());
        if (existingMembers.size() == 1) {
            member.setRole("ROUTE_PLANNER");
        } else {
            member.setRole("MEMBER");
        }
        member.setSharing(false);
        String memberToken = UUID.randomUUID().toString();
        member.setMemberToken(memberToken);

        memberRepository.save(member);

        return new JoinResponse(
                group.getGroupId(),
                group.getGroupName(),
                memberId,
                member.getName(),
                member.getRole(),
                memberToken);
    }

    @Transactional(readOnly = true)
    public List<MemberResponse> getGroupMembers(String groupId) {
        return memberRepository.findByGroupId(groupId).stream()
                .map(m -> new MemberResponse(
                        m.getMemberId(),
                        m.getName(),
                        m.getRole(),
                        m.getLatitude(),
                        m.getLongitude(),
                        m.isSharing()))
                .collect(Collectors.toList());
    }
}
