package com.groupdrive.controller;

import com.groupdrive.dto.LocationUpdate;
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
            if ("SHARING".equals(update.getStatus())) {
                member.setLatitude(update.getLatitude());
                member.setLongitude(update.getLongitude());
                member.setSharing(true);
            } else if ("STOPPED".equals(update.getStatus())) {
                member.setSharing(false);
            }
            member.setLastUpdated(LocalDateTime.now());
            memberRepository.save(member);
        });

        // Broadcast the update to all subscribers of this specific group
        String destination = "/topic/group/" + update.getGroupId();
        messagingTemplate.convertAndSend(destination, update);
    }
}
