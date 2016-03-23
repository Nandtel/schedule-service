package com.schedule.model;

import javax.persistence.Entity;
import javax.persistence.Id;
import javax.persistence.Table;

@Entity
@Table(name="\"User\"")
public class User {

    @Id
    private Integer peopleId;

    private String name;

    public User() {}

    public User(Integer peopleId, String name) {
        this.peopleId = peopleId;
        this.name = name;
    }

    public Integer getPeopleId() {return peopleId;}
    public void setPeopleId(Integer peopleId) {this.peopleId = peopleId;}
    public String getName() {return name;}
    public void setName(String name) {this.name = name;}
}
