package com.leeuwarden.Digital.Twin.entity;

import jakarta.persistence.*;

@Entity
public class Polygon {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private double height;
    @Lob
    @Column(name = "points_json", columnDefinition = "TEXT")
    private String pointsJson;

    public Polygon() {}


    public String getPointsJson() {
        return pointsJson;
    }

    public void setPointsJson(String pointsJson) {
        this.pointsJson = pointsJson;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public double getHeight() {
        return height;
    }

    public void setHeight(double height) {
        this.height = height;
    }
}
