package com.paf.faculty.model;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDate;
import java.time.LocalTime;

@Document(collection = "availability")
@Data
public class Availability {

    @Id
    private String id;

    private String resourceId; // link to Resource

    private LocalDate date;

    private LocalTime startTime;
    private LocalTime endTime;
}