package com.mis.mapper;

import com.mis.dto.RegisterRequest;
import com.mis.dto.UserResponse;
import com.mis.model.User;

public class UserMapper {
    public static User toUser(RegisterRequest req) {
        User user = new User();
        user.setId(req.getId());
        user.setName(req.getName());
        user.setEmail(req.getEmail());
        user.setRole(req.getRole());
        user.setAuthMethod(req.getAuthMethod());
        user.setStatus(req.getStatus());
        return user;
    }
    public static UserResponse toUserResponse(User user) {
        UserResponse dto = new UserResponse();
        dto.setId(user.getId());
        dto.setName(user.getName());
        dto.setEmail(user.getEmail());
        dto.setRole(user.getRole());
        dto.setAuthMethod(user.getAuthMethod());
        return dto;
    }
}

