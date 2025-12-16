package com.leeuwarden.Digital.Twin.repository;


import com.leeuwarden.Digital.Twin.entity.Polygon;
import org.springframework.data.jpa.repository.JpaRepository;
//Dit is de database‑laag.
//Het zegt: “geef me standaard methodes om Polygon in de database op te slaan en op te vragen”
// → o.a. save, findAll, findById.
public interface PolygonRepository extends JpaRepository<Polygon, Long> {


}
