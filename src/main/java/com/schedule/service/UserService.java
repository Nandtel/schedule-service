package com.schedule.service;

import com.schedule.model.User;
import com.schedule.model.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class UserService {

    @Autowired UserRepository userRepository;

    public Map<Integer, String> getUsers() {

        return userRepository.findAll()
                .stream()
                .collect(Collectors.toMap(User::getPeopleId, User::getName));
    }
}
