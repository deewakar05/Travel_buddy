package com.groupdrive.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "members")
public class Member {

    @Id
    @Column(nullable = false, unique = true)
    private String memberId;

    @Column(nullable = false)
    private String groupId;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private String role; // ADMIN, ROUTE_PLANNER, MEMBER

    // Using Double for precise GPS coordinates
    private Double latitude;
    private Double longitude;

    @Column(nullable = false)
    private boolean isSharing = false;

    private LocalDateTime lastUpdated;

    public Member() {
    }

    public Member(String memberId, String groupId, String name, String role, Double latitude, Double longitude,
            boolean isSharing, LocalDateTime lastUpdated) {
        this.memberId = memberId;
        this.groupId = groupId;
        this.name = name;
        this.role = role;
        this.latitude = latitude;
        this.longitude = longitude;
        this.isSharing = isSharing;
        this.lastUpdated = lastUpdated;
    }

    public String getMemberId() {
        return memberId;
    }

    public void setMemberId(String memberId) {
        this.memberId = memberId;
    }

    public String getGroupId() {
        return groupId;
    }

    public void setGroupId(String groupId) {
        this.groupId = groupId;
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

    public LocalDateTime getLastUpdated() {
        return lastUpdated;
    }

    public void setLastUpdated(LocalDateTime lastUpdated) {
        this.lastUpdated = lastUpdated;
    }
}
