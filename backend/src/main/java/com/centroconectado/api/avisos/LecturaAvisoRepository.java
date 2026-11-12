package com.centroconectado.api.avisos;

import java.util.Collection;
import java.util.Set;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface LecturaAvisoRepository extends JpaRepository<LecturaAviso, Long> {

    boolean existsByAvisoIdAndUsuarioId(Long avisoId, Long usuarioId);

    @Query("select l.aviso.id from LecturaAviso l where l.usuario.id = :usuarioId and l.aviso.id in :avisoIds")
    Set<Long> findAvisoIdsLeidos(@Param("usuarioId") Long usuarioId, @Param("avisoIds") Collection<Long> avisoIds);

    @Query("select l.usuario.id from LecturaAviso l where l.aviso.id = :avisoId")
    Set<Long> findUsuarioIdsByAvisoId(@Param("avisoId") Long avisoId);
}
