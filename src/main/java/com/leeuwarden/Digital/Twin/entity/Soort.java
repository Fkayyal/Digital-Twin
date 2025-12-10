package com.leeuwarden.Digital.Twin.entity;

import jakarta.persistence.*;

import java.util.List;

@Entity
public class Soort {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long soortId;

    @Column(nullable = false)
    private String naam;

    @Column(nullable = false)
    private double kostenPerMeter;

    @Column(nullable = false)
    private double opbrengst;

    @Column(nullable = false)
    private String eenheidstype;

    @Column(nullable = false)
    private int leefbaarheidsScore;

    private Integer aantalMensen; // mag null zijn

    @OneToMany(mappedBy = "soort", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Gebiedsdeel> gebiedsdeelen;

    public Soort() {
    }

    public Soort(Long soortId, String naam, double kostenPerMeter, double opbrengst, String eenheidstype, int leefbaarheidsScore, Integer aantalMensen, List<Gebiedsdeel> gebiedsdeelen) {
        this.soortId = soortId;
        this.naam = naam;
        this.kostenPerMeter = kostenPerMeter;
        this.opbrengst = opbrengst;
        this.eenheidstype = eenheidstype;
        this.leefbaarheidsScore = leefbaarheidsScore;
        this.aantalMensen = aantalMensen;
        this.gebiedsdeelen = gebiedsdeelen;
    }

    public Long getSoortId() {
        return soortId;
    }

    public void setSoortId(Long soortId) {
        this.soortId = soortId;
    }

    public String getNaam() {
        return naam;
    }

    public void setNaam(String naam) {
        this.naam = naam;
    }

    public double getKostenPerMeter() {
        return kostenPerMeter;
    }

    public void setKostenPerMeter(double kostenPerMeter) {
        this.kostenPerMeter = kostenPerMeter;
    }

    public double getOpbrengst() {
        return opbrengst;
    }

    public void setOpbrengst(double opbrengst) {
        this.opbrengst = opbrengst;
    }

    public String getEenheidstype() {
        return eenheidstype;
    }

    public void setEenheidstype(String eenheidstype) {
        this.eenheidstype = eenheidstype;
    }

    public int getLeefbaarheidsScore() {
        return leefbaarheidsScore;
    }

    public void setLeefbaarheidsScore(int leefbaarheidsScore) {
        this.leefbaarheidsScore = leefbaarheidsScore;
    }

    public Integer getAantalMensen() {
        return aantalMensen;
    }

    public void setAantalMensen(Integer aantalMensen) {
        this.aantalMensen = aantalMensen;
    }

    public List<Gebiedsdeel> getGebiedsdeelen() {
        return gebiedsdeelen;
    }

    public void setGebiedsdeelen(List<Gebiedsdeel> gebiedsdeelen) {
        this.gebiedsdeelen = gebiedsdeelen;
    }
}
