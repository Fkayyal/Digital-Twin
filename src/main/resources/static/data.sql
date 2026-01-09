-- Met deze sql script wordt de database gevuld met de doorgegeven data

-- 1. Bestaande data verwijderen, niet veilig maar voor de demo
# DELETE
# FROM Doel;
# DELETE
# FROM Soort;

-- 2. Nieuwe SOORT‑records invoegen
INSERT INTO Soort (code, naam, kosten_per_meter, opbrengst, eenheidstype, leefbaarheids_score, aantal_mensen)
VALUES ('VRIJSTAANDE_WONING', 'Vrijstaande woning', 500, 12, 'm3', 4, 5),
       ('RIJTJESWONING', 'Rijtjeswoning', 400, 8, 'm3', 6, 10),
       ('APPARTEMENT', 'Appartement', 300, 12, 'm3', 5, 6),
       ('BEDRIJFSGEBOUW', 'Bedrijfsgebouw', 200, 15, 'm3', 2, 18),
       ('PARK_GROEN', 'Park / groen', 150, 0, 'm2', 10, NULL),
       ('WEGEN', 'Wegen', 100, 5, 'm2', 8, NULL),
       ('PARKEERPLAATSEN', 'Parkeerplaatsen', 100, 10, 'm2', 6, NULL),
       ('OVERDEKTE_PARKEERPLAATSEN', 'Overdekte parkeerplaatsen', 1500, 15, 'm2', 10, NULL);


-- 3. Nieuwe DOEL‑records invoegen
INSERT INTO Doel (Omschrijving, Aantal)
VALUES ('Aantal inwoners dat binnen het gebied moet kunnen wonen', 3000),
       ('Aantal werkenden dat binnen het gebied moet kunnen werken', 500),
       ('Minimumpercentage van de oppervlakte dat uit natuur en groen moet bestaan', 20),
       ('Maximumpercentage van de bebouwing dat uit bedrijfsgebouwen mag bestaan', 20),
       ('Totaal aantal parkeerplaatsen dat in het gebied beschikbaar moet zijn', 4500);
