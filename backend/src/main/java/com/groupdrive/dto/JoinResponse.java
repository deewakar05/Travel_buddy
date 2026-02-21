package com.groupdrive.dto;

public class JoinResponse {
    private String groupId;
    private String groupName;
    private String memberId;
    private String memberName;
    private String role;
    private String memberToken;

    public JoinResponse() {
    }

    public JoinResponse(String groupId, String groupName, String memberId, String memberName, String role,
            String memberToken) {
        this.groupId = groupId;
        this.groupName = groupName;
        this.memberId = memberId;
        this.memberName = memberName;
        this.role = role;
        this.memberToken = memberToken;
    }

    public String getGroupId() {
        return groupId;
    }

    public void setGroupId(String groupId) {
        this.groupId = groupId;
    }

    public String getGroupName() {
        return groupName;
    }

    public void setGroupName(String groupName) {
        this.groupName = groupName;
    }

    public String getMemberId() {
        return memberId;
    }

    public void setMemberId(String memberId) {
        this.memberId = memberId;
    }

    public String getMemberName() {
        return memberName;
    }

    public void setMemberName(String memberName) {
        this.memberName = memberName;
    }

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }

    public String getMemberToken() {
        return memberToken;
    }

    public void setMemberToken(String memberToken) {
        this.memberToken = memberToken;
    }
}
