package com.groupdrive.dto;

public class BroadcastUpdate {
    private String groupId;
    private String memberId;
    private String memberName;
    private String role;
    private Double latitude;
    private Double longitude;
    private String status;

    public BroadcastUpdate() {
    }

    public BroadcastUpdate(String groupId, String memberId, String memberName, String role, Double latitude,
            Double longitude, String status) {
        this.groupId = groupId;
        this.memberId = memberId;
        this.memberName = memberName;
        this.role = role;
        this.latitude = latitude;
        this.longitude = longitude;
        this.status = status;
    }

    // Getters and Setters
    public String getGroupId() {
        return groupId;
    }

    public void setGroupId(String groupId) {
        this.groupId = groupId;
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

    public Double getLatitude() {
        return latitude;
    }

    public void setLatitude(Double latitude) {
        this.latitude = latitude;
    }

    public Double getLongitude() {
        return longitude;
    }

    public void setLongitude(Double longitude) {
        this.longitude = longitude;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }
}
