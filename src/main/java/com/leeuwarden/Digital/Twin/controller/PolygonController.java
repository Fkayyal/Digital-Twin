package com.leeuwarden.Digital.Twin.controller;

import com.leeuwarden.Digital.Twin.PolygonRequest;
import com.leeuwarden.Digital.Twin.entity.Polygon;
import com.leeuwarden.Digital.Twin.repository.PolygonRepository;
import org.springframework.web.bind.annotation.*;


@RestController
@RequestMapping("/api/polygons")
@CrossOrigin(origins = "http://localhost:63342")
public class PolygonController {
    private final PolygonRepository polygonRepository;

    public PolygonController(PolygonRepository polygonRepository) {
        this.polygonRepository = polygonRepository;
    }

    @PostMapping
    public Polygon createPolygon(@RequestBody PolygonRequest polygonRequest) {
        Polygon polygon = new Polygon();
        polygon.setHeight(polygonRequest.getHeight());
        polygon.setPointsJson(polygonRequest.getPointsJson()); // direct overnemen

        return polygonRepository.save(polygon);
    }

}
