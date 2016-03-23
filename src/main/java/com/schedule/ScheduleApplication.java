package com.schedule;

import com.schedule.model.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.Arrays;
import java.util.Date;
import java.util.List;
import java.util.stream.Collectors;
import java.util.stream.IntStream;

@SpringBootApplication
@RestController
public class ScheduleApplication implements CommandLineRunner {

    @Autowired
    ScheduleHourRepository scheduleHourRepository;

    @Autowired
    UserRepository userRepository;

    public static void main(String[] args) {SpringApplication.run(ScheduleApplication.class, args);}


    @Override
    public void run(String... args) throws Exception {
//        Date now = Date.from(LocalDateTime.now().withMinute(0).withSecond(0).atZone(ZoneId.systemDefault()).toInstant());
//        Date minus2hours = Date.from(LocalDateTime.now().minusHours(5).withMinute(0).withSecond(0).atZone(ZoneId.systemDefault()).toInstant());
//
//        List<ScheduleHour> schHours = IntStream.range(0, 7)
//                .mapToObj(i -> new ScheduleHour(100 + i, (byte) (1 + i), now, 8))
//                .collect(Collectors.toList());
//
//        schHours.add(new ScheduleHour(0, (byte) 0, minus2hours, 5));
//        schHours.add(new ScheduleHour(0, (byte) 8, now, 8));
//
//        scheduleHourRepository.save(schHours);

        List<User> workers = IntStream.range(0, 10)
                .mapToObj(i -> new User(100 + i, Names.values()[i].toString()))
                .collect(Collectors.toList());

        userRepository.save(workers);
    }
}
