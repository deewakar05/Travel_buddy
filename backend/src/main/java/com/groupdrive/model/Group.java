package com.groupdrive.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "groups_table")
public class Group {

    @Id
    @Column(nullable = false, unique = true)
    private String groupId;

    @Column(nullable = false)
    private String groupName;

    @Column(nullable = false)
    private String adminId;

    @Column(nullable = false)
    private LocalDateTime createdAt;

    @Column(nullable = false)
    private boolean isActive;

    public Group() {
    }

    public Group(String groupId, String groupName, String adminId, LocalDateTime createdAt, boolean isActive) {
        this.groupId = groupId;
        this.groupName = groupName;
        this.adminId = adminId;
        this.createdAt = createdAt;
        this.isActive = isActive;
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

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public boolean isActive() {
        return isActive;
    }

    public void setActive(boolean active) {
        isActive = active;
    }

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        isActive = true;
    }
}
