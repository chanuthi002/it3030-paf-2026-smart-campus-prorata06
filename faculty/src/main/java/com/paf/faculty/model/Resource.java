package com.paf.faculty.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import lombok.Data;

@Document(collection = "resources")
@Data
public class Resource {

    @Id
    private String id; // Custom ID (F0001, F0002)

    private String name;
    private String type;
    private int capacity;
    private String location;
    private String status;
}