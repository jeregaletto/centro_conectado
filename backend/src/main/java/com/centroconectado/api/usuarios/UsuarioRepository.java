package com.centroconectado.api.usuarios;

import java.util.Collection;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface UsuarioRepository extends JpaRepository<Usuario, Long> {

    Optional<Usuario> findByUsuarioIgnoreCase(String usuario);

    boolean existsByUsuarioIgnoreCase(String usuario);

    List<Usuario> findByActivoTrue();

    List<Usuario> findByActivoTrueAndSectorIdIn(Collection<Long> sectorIds);

    List<Usuario> findByActivoTrueAndSectorId(Long sectorId);

    List<Usuario> findByActivoTrueAndRolIn(Collection<Rol> roles);

    long countByActivoTrueAndSectorId(Long sectorId);

    @Query("""
            select u from Usuario u join fetch u.sector s
            where u.activo = true
              and lower(concat(u.nombre, ' ', u.apellido, ' ', u.puesto, ' ', s.nombre)) like :patron
            order by u.apellido, u.nombre
            """)
    List<Usuario> buscarDirectorio(@Param("patron") String patron);

    @Query("select u from Usuario u join fetch u.sector order by u.apellido, u.nombre")
    List<Usuario> findAllConSector();
}
