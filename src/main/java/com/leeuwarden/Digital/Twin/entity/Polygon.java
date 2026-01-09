package com.leeuwarden.Digital.Twin.entity;

import jakarta.persistence.*;

@Entity
public class Polygon {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Lob
    @Column(name = "points_json", columnDefinition = "TEXT")
    private String pointsJson;

    @Column(name = "oppervlakte", columnDefinition = "TEXT")
    private String oppervlakte;

    @Column(name = "hoogte", columnDefinition = "DOUBLE PRECISION")
    private double hoogte;

    @ManyToOne
    @JoinColumn(name = "soort_id" , nullable = true)
    private Soort soort;

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

    public String getOppervlakte() {
        return oppervlakte;
    }

    public void setOppervlakte(String oppervlakte) {
        this.oppervlakte = oppervlakte;
    }

    public double getHoogte() { return hoogte; }
    public void setHoogte(double hoogte) { this.hoogte = hoogte; }

    public Soort getSoort() {
        return soort;
    }

    public void setSoort(Soort soort) {
        this.soort = soort;
    }
}
