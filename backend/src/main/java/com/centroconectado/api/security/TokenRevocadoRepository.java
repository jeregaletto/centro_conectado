package com.centroconectado.api.security;

import java.time.Instant;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface TokenRevocadoRepository extends JpaRepository<TokenRevocado, String> {

    @Modifying
    @Query("delete from TokenRevocado t where t.expiraEn < :ahora")
    int borrarVencidos(@Param("ahora") Instant ahora);
}
