package com.groupdrive.repository;

import com.groupdrive.model.Member;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface MemberRepository extends JpaRepository<Member, String> {
    Optional<Member> findByMemberId(String memberId);
    List<Member> findByGroupId(String groupId);
    void deleteByGroupId(String groupId);
}
