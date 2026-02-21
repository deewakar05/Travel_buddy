package com.groupdrive.dto;

public class GroupResponse {
    private String groupId;
    private String groupName;
    private String adminId;
    private String adminName;
    private String memberToken;

    public GroupResponse() {
    }

    public GroupResponse(String groupId, String groupName, String adminId, String adminName, String memberToken) {
        this.groupId = groupId;
        this.groupName = groupName;
        this.adminId = adminId;
        this.adminName = adminName;
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

    public String getAdminId() {
        return adminId;
    }

    public void setAdminId(String adminId) {
        this.adminId = adminId;
    }

    public String getAdminName() {
        return adminName;
    }

    public void setAdminName(String adminName) {
        this.adminName = adminName;
    }

    public String getMemberToken() {
        return memberToken;
    }

    public void setMemberToken(String memberToken) {
        this.memberToken = memberToken;
    }
}
