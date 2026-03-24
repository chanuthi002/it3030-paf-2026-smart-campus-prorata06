package com.paf.faculty.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;
import com.paf.faculty.model.Resource;
import com.paf.faculty.repository.ResourceRepository;;

@Service
public class ResourceService {

    @Autowired
    private ResourceRepository repository;

    public Resource save(Resource resource) {
        return repository.save(resource);
    }

    public List<Resource> getAll() {
        return repository.findAll();
    }
}