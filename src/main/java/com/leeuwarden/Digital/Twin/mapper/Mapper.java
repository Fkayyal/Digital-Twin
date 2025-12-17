package com.leeuwarden.Digital.Twin.mapper;

// Die <DTO, Entity> zijn generics. dit zijn plaats-houders voor types.
// die generics betekenen: "Ik weet nog niet welke DTO en welke Entity, dat komt later."
// wanneer deze interface wordt geimplementeerd, dan wordt er gekozen welke DTO en Entity.
public interface Mapper <DTO, Entity>{

    Entity toEntity(DTO dto);
    DTO toDTO(Entity entity);

}
