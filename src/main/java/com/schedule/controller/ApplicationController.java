package com.schedule.controller;

import com.schedule.model.ScheduleHour;
import com.schedule.service.ScheduleService;
import com.schedule.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.repository.query.Param;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.Date;
import java.util.List;
import java.util.Map;

@RestController
public class ApplicationController {

    @Autowired ScheduleService scheduleService;
    @Autowired UserService userService;

    @RequestMapping(value = "/api/schedule/save", method = RequestMethod.POST)
    @ResponseStatus(HttpStatus.OK)
    public void saveScheduleHour(@RequestBody ScheduleHour scheduleHour) {
        scheduleService.saveScheduleHour(scheduleHour);
    }

    @RequestMapping(value = "/api/schedule/save/all", method = RequestMethod.POST)
    @ResponseStatus(HttpStatus.OK)
    public void saveScheduleHours(@RequestBody List<ScheduleHour> scheduleHours) {
        scheduleService.saveScheduleHour(scheduleHours);
    }

    @RequestMapping(value = "/api/schedule/remove", method = RequestMethod.POST)
    @ResponseStatus(HttpStatus.OK)
    public void removeScheduleHour(@RequestBody ScheduleHour scheduleHour) {
        scheduleService.removeScheduleHour(scheduleHour);
    }

    @RequestMapping(value = "/api/schedule/remove/all", method = RequestMethod.POST)
    @ResponseStatus(HttpStatus.OK)
    public void removeScheduleHour(@RequestBody List<ScheduleHour> scheduleHours) {
        scheduleService.removeScheduleHour(scheduleHours);
    }

    @RequestMapping(value = "/api/schedule", method = RequestMethod.GET)
    public List<ScheduleHour> getScheduleHour(
            @DateTimeFormat(pattern = "yyyy-MM-dd HH:mm:ss")@Param("dt")Date from,
            @DateTimeFormat(pattern = "yyyy-MM-dd HH:mm:ss")@Param("dt")Date to) {
        return scheduleService.getScheduleHour(from, to);
    }

    @RequestMapping(value = "/api/users", method = RequestMethod.GET)
    public Map<Integer, String> getUsers() {return userService.getUsers();}

}
