package com.centroconectado.api.usuarios;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.centroconectado.api.usuarios.dto.AQuienAcudirDto;
import com.centroconectado.api.usuarios.dto.ContactoDto;
import com.centroconectado.api.usuarios.dto.SectorDto;

@Service
@Transactional(readOnly = true)
public class DirectorioService {

    private final UsuarioRepository usuarioRepository;
    private final SectorRepository sectorRepository;
    private final AQuienAcudirRepository aQuienAcudirRepository;

    public DirectorioService(UsuarioRepository usuarioRepository, SectorRepository sectorRepository,
                             AQuienAcudirRepository aQuienAcudirRepository) {
        this.usuarioRepository = usuarioRepository;
        this.sectorRepository = sectorRepository;
        this.aQuienAcudirRepository = aQuienAcudirRepository;
    }

    public List<ContactoDto> buscar(String q, Long sectorId) {
        String patron = (q == null || q.isBlank()) ? "%" : "%" + q.trim().toLowerCase() + "%";
        return usuarioRepository.buscarDirectorio(patron).stream()
                .filter(u -> sectorId == null || u.getSector().getId().equals(sectorId))
                .map(ContactoDto::de)
                .toList();
    }

    /** Organigrama: sectores con su referente y cantidad de integrantes. */
    public List<SectorDto> sectores() {
        return sectorRepository.findAllByOrderByNombreAsc().stream()
                .map(s -> new SectorDto(s.getId(), s.getCodigo(), s.getNombre(), s.getDescripcion(),
                        ContactoDto.de(s.getReferente()), usuarioRepository.countByActivoTrueAndSectorId(s.getId())))
                .toList();
    }

    public List<AQuienAcudirDto> aQuienAcudir() {
        return aQuienAcudirRepository.findAllByOrderByOrdenAsc().stream().map(AQuienAcudirDto::de).toList();
    }
}
