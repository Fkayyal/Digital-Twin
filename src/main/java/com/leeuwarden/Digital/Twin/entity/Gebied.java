package com.leeuwarden.Digital.Twin.entity;

import jakarta.persistence.*;

import java.util.ArrayList;
import java.util.List;

@Entity
public class Gebied {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long gebiedId;

    @Column(nullable = false)
    private int oppervlakteInMeters;

    @Column(nullable = false)
    private String beschrijving;

    @Column(nullable = false)
    private int kwaliteitScore;

    private int hoogte;

    @OneToMany(mappedBy = "gebied", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Gebiedsdeel> gebiedsdelen =  new ArrayList<>();

    @OneToMany(mappedBy = "gebied", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Coordinaat> coordinaten = new ArrayList<>();

    public Gebied() {
    }

    public Long getGebiedId() {
        return gebiedId;
    }

    public void setGebiedId(Long gebiedId) {
        this.gebiedId = gebiedId;
    }

    public int getOppervlakteInMeters() {
        return oppervlakteInMeters;
    }

    public void setOppervlakteInMeters(int oppervlakteInMeters) {
        this.oppervlakteInMeters = oppervlakteInMeters;
    }

    public String getBeschrijving() {
        return beschrijving;
    }

    public void setBeschrijving(String beschrijving) {
        this.beschrijving = beschrijving;
    }

    public int getKwaliteitScore() {
        return kwaliteitScore;
    }

    public void setKwaliteitScore(int kwaliteitScore) {
        this.kwaliteitScore = kwaliteitScore;
    }

    public int getHoogte() {
        return hoogte;
    }

    public void setHoogte(int hoogte) {
        this.hoogte = hoogte;
    }

    public List<Gebiedsdeel> getGebiedsdelen() {
        return gebiedsdelen;
    }

    public void setGebiedsdelen(List<Gebiedsdeel> gebiedsdelen) {
        this.gebiedsdelen = gebiedsdelen;
    }

    public List<Coordinaat> getCoordinaten() {
        return coordinaten;
    }

    public void setCoordinaten(List<Coordinaat> coordinaten) {
        this.coordinaten = coordinaten;
    }
}
