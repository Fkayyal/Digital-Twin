package com.leeuwarden.Digital.Twin.entity;

import jakarta.persistence.*;

@Entity
public class Gebiedsdeel {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long gebiedsdeelId;

    @ManyToOne
    @JoinColumn(name = "gebied_id", nullable = false)
    private Gebied gebied;

    @ManyToOne
    @JoinColumn(name = "soort_id" , nullable = false)
    private Soort soort;

    @Column(nullable = false)
    private int oppervlakteInMeters;

    public Gebiedsdeel() {
    }

    public Long getId() {
        return gebiedsdeelId;
    }

    public void setId(Long id) {
        this.gebiedsdeelId = id;
    }

    public Gebied getGebied() {
        return gebied;
    }

    public void setGebied(Gebied gebied) {
        this.gebied = gebied;
    }

    public Soort getSoort() {
        return soort;
    }

    public void setSoort(Soort soort) {
        this.soort = soort;
    }

    public int getOppervlakteInMeters() {
        return oppervlakteInMeters;
    }

    public void setOppervlakteInMeters(int oppervlakteInMeters) {
        this.oppervlakteInMeters = oppervlakteInMeters;
    }
}
