package com.groupdrive.dto;

public class GroupResponse {
    private String groupId;
    private String groupName;
    private String adminId;
    private String adminName;

    public GroupResponse() {
    }

    public GroupResponse(String groupId, String groupName, String adminId, String adminName) {
        this.groupId = groupId;
        this.groupName = groupName;
        this.adminId = adminId;
        this.adminName = adminName;
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
}
