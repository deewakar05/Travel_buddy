package com.groupdrive.controller;

import com.groupdrive.dto.LocationUpdate;
import com.groupdrive.dto.BroadcastUpdate;
import com.groupdrive.repository.MemberRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Controller
public class LocationController {

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    @Autowired
    private MemberRepository memberRepository;

    @MessageMapping("/location.update")
    @Transactional
    public void receiveLocationUpdate(@Payload LocationUpdate update) {

        // Update the member's location in the database
        memberRepository.findByMemberId(update.getMemberId()).ifPresent(member -> {

            // --- AUTHENTICATION CHECK ---
            // If the incoming DTO has no token, or the token doesn't match the DB, reject
            // it.
            if (update.getMemberToken() == null || !update.getMemberToken().equals(member.getMemberToken())) {
                System.out.println(
                        "Unauthorized location spoofing attempt blocked for memberId: " + member.getMemberId());
                return; // Silently drop unauthorized updates
            }
            // ----------------------------

            if ("SHARING".equals(update.getStatus())) {
                member.setLatitude(update.getLatitude());
                member.setLongitude(update.getLongitude());
                member.setSharing(true);
            } else if ("STOPPED".equals(update.getStatus())) {
                member.setSharing(false);
            }
            member.setLastUpdated(LocalDateTime.now());
            memberRepository.save(member);

            // Construct safe broadcast DTO (no token)
            BroadcastUpdate broadcast = new BroadcastUpdate(
                    update.getGroupId(),
                    member.getMemberId(),
                    member.getName(),
                    member.getRole(),
                    member.getLatitude(),
                    member.getLongitude(),
                    update.getStatus());

            String destination = "/topic/group/" + update.getGroupId();
            messagingTemplate.convertAndSend(destination, broadcast);
        });

        // Broadcast logic moved inside the ifPresent block to ensure it only happens
        // for valid tokens.
    }
}
