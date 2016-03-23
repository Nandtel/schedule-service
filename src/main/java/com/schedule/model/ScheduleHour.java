package com.schedule.model;

import javax.persistence.*;
import javax.validation.constraints.NotNull;
import java.io.Serializable;
import java.util.Date;

@Entity
@Table(name = "shedule_hour")
@IdClass(ScheduleHour.class)
public class ScheduleHour implements Serializable {
    @Id
    private Integer peopleId;
    @Id
    @Temporal(TemporalType.TIMESTAMP)
    private Date dateHourStart;
    @NotNull
    private Integer hours;
    @NotNull
    private Byte place;

    public ScheduleHour(Integer peopleId, Byte place, Date dateHourStart, Integer hours) {
        this.peopleId = peopleId;
        this.dateHourStart = dateHourStart;
        this.hours = hours;
        this.place = place;
    }

    public ScheduleHour() {}

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof ScheduleHour)) return false;

        ScheduleHour that = (ScheduleHour) o;

        if (!getPeopleId().equals(that.getPeopleId())) return false;
        if (!getDateHourStart().equals(that.getDateHourStart())) return false;
        if (!getHours().equals(that.getHours())) return false;
        return getPlace().equals(that.getPlace());

    }

    @Override
    public int hashCode() {
        int result = getPeopleId().hashCode();
        result = 31 * result + getDateHourStart().hashCode();
        result = 31 * result + getHours().hashCode();
        result = 31 * result + getPlace().hashCode();
        return result;
    }

    public Integer getPeopleId() {return peopleId;}
    public void setPeopleId(Integer peopleId) {this.peopleId = peopleId;}
    public Date getDateHourStart() {return dateHourStart;}
    public void setDateHourStart(Date dateHourStart) {this.dateHourStart = dateHourStart;}
    public Integer getHours() {return hours;}
    public void setHours(Integer hours) {this.hours = hours;}
    public Byte getPlace() {return place;}
    public void setPlace(Byte place) {this.place = place;}
}
