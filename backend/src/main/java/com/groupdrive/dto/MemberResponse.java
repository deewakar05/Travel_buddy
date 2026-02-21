package com.groupdrive.dto;

public class MemberResponse {
    private String memberId;
    private String name;
    private String role;
    private Double latitude;
    private Double longitude;
    private boolean isSharing;

    public MemberResponse() {
    }

    public MemberResponse(String memberId, String name, String role, Double latitude, Double longitude,
            boolean isSharing) {
        this.memberId = memberId;
        this.name = name;
        this.role = role;
        this.latitude = latitude;
        this.longitude = longitude;
        this.isSharing = isSharing;
    }

    // Getters and Setters
    public String getMemberId() {
        return memberId;
    }

    public void setMemberId(String memberId) {
        this.memberId = memberId;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
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

    public boolean isSharing() {
        return isSharing;
    }

    public void setSharing(boolean sharing) {
        isSharing = sharing;
    }
}
