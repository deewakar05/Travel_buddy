package com.groupdrive.util;

import java.util.Random;

public class IdGenerator {

    private static final String CHARACTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    private static final int GROUP_ID_LENGTH = 6;
    private static final int MEMBER_ID_LENGTH = 8;
    private static final Random random = new Random();

    public static String generateGroupId() {
        return generateString(GROUP_ID_LENGTH);
    }

    public static String generateMemberId() {
        return generateString(MEMBER_ID_LENGTH);
    }

    private static String generateString(int length) {
        StringBuilder sb = new StringBuilder(length);
        for (int i = 0; i < length; i++) {
            sb.append(CHARACTERS.charAt(random.nextInt(CHARACTERS.length())));
        }
        return sb.toString();
    }
}
