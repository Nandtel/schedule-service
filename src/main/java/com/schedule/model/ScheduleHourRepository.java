package com.schedule.model;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Date;
import java.util.List;

public interface ScheduleHourRepository extends JpaRepository<ScheduleHour, Integer>  {

    @Query(value = "SELECT * FROM shedule_hour " +
            "WHERE place = :place " +
            "  AND date_hour_start <= :workStart + INTERVAL :workDuration HOUR " +
            "  AND date_hour_start + INTERVAL hours HOUR >= :workStart", nativeQuery = true)
    List<ScheduleHour> whoTookWorkplace(
            @Param("place") Byte place,
            @Param("workStart") Date workStart,
            @Param("workDuration") Integer workDuration
    );

    List<ScheduleHour> findByDateHourStartBetween(Date from, Date to);

}
