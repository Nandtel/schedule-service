package com.schedule.service;

import com.schedule.model.ScheduleHour;
import com.schedule.model.ScheduleHourRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.Date;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class ScheduleService {

    @Autowired
    ScheduleHourRepository scheduleHourRepository;

    public void saveScheduleHour(ScheduleHour scheduleHour) {
        scheduleHourRepository.save(scheduleHour);
    }

    public void saveScheduleHour(List<ScheduleHour> scheduleHours) {
        scheduleHourRepository.save(scheduleHours);
    }

    public void removeScheduleHour(ScheduleHour scheduleHour) {
        scheduleHourRepository.delete(scheduleHour);
    }

    public void removeScheduleHour(List<ScheduleHour> scheduleHours) {
        scheduleHourRepository.delete(scheduleHours);
    }

    public List<ScheduleHour> getScheduleHour(Date from, Date to) {
        return scheduleHourRepository.findByDateHourStartBetween(from, to);
    }

}
