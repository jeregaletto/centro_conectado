package com.centroconectado.api.biblioteca;

import java.time.Clock;
import java.time.LocalDateTime;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.centroconectado.api.biblioteca.dto.DocumentoDto;
import com.centroconectado.api.biblioteca.dto.GuardarDocumentoRequest;
import com.centroconectado.api.common.VigenciaPolicy;
import com.centroconectado.api.common.exception.RecursoNoEncontradoException;
import com.centroconectado.api.security.UsuarioAutenticado;
import com.centroconectado.api.usuarios.Sector;
import com.centroconectado.api.usuarios.SectorRepository;
import com.centroconectado.api.usuarios.UsuarioRepository;
import com.centroconectado.api.usuarios.dto.SectorResumenDto;

@Service
public class BibliotecaService {

    private final DocumentoRepository repository;
    private final SectorRepository sectorRepository;
    private final UsuarioRepository usuarioRepository;
    private final VigenciaPolicy vigencia;
    private final Clock clock;

    public BibliotecaService(DocumentoRepository repository, SectorRepository sectorRepository,
                             UsuarioRepository usuarioRepository, VigenciaPolicy vigencia, Clock clock) {
        this.repository = repository;
        this.sectorRepository = sectorRepository;
        this.usuarioRepository = usuarioRepository;
        this.vigencia = vigencia;
        this.clock = clock;
    }

    @Transactional(readOnly = true)
    public List<DocumentoDto> listar(CategoriaDocumento categoria, Long sectorId, String q) {
        String texto = q == null ? null : q.trim().toLowerCase();
        return repository.findVigentes(LocalDateTime.now(clock)).stream()
                .filter(d -> categoria == null || d.getCategoria() == categoria)
                .filter(d -> sectorId == null || d.getSector() == null || d.getSector().getId().equals(sectorId))
                .filter(d -> texto == null || texto.isEmpty()
                        || d.getTitulo().toLowerCase().contains(texto)
                        || (d.getDescripcion() != null && d.getDescripcion().toLowerCase().contains(texto)))
                .map(this::toDto)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<DocumentoDto> protocolosDeSector(Long sectorId, int limite) {
        return repository.findVigentesPorCategoriaYSector(CategoriaDocumento.PROTOCOLO, sectorId,
                LocalDateTime.now(clock)).stream().limit(limite).map(this::toDto).toList();
    }

    @Transactional
    public DocumentoDto crear(GuardarDocumentoRequest req, UsuarioAutenticado u) {
        Documento d = new Documento(req.titulo().trim(), req.descripcion(), req.categoria(), req.url().trim(),
                sector(req.sectorId()), req.version(), usuarioRepository.getReferenceById(u.id()),
                LocalDateTime.now(clock), vigencia.resolver(req.vigenteHasta()));
        return toDto(repository.save(d));
    }

    @Transactional
    public DocumentoDto actualizar(Long id, GuardarDocumentoRequest req) {
        Documento d = buscar(id);
        d.setTitulo(req.titulo().trim());
        d.setDescripcion(req.descripcion());
        d.setCategoria(req.categoria());
        d.setUrl(req.url().trim());
        d.setSector(sector(req.sectorId()));
        d.setVersion(req.version());
        d.setVigenteHasta(vigencia.resolver(req.vigenteHasta()));
        d.setPublicadoEn(LocalDateTime.now(clock));
        return toDto(d);
    }

    @Transactional
    public DocumentoDto renovar(Long id, LocalDateTime nuevaVigencia) {
        Documento d = buscar(id);
        d.setVigenteHasta(vigencia.resolver(nuevaVigencia));
        d.setActivo(true);
        return toDto(d);
    }

    @Transactional
    public void eliminar(Long id) {
        buscar(id).setActivo(false);
    }

    @Transactional(readOnly = true)
    public List<DocumentoDto> porVencer() {
        LocalDateTime ahora = LocalDateTime.now(clock);
        return repository.findByActivoTrueAndVigenteHastaBetweenOrderByVigenteHastaAsc(ahora,
                ahora.plusDays(vigencia.getAvisoVencimientoDias())).stream().map(this::toDto).toList();
    }

    DocumentoDto toDto(Documento d) {
        return new DocumentoDto(d.getId(), d.getTitulo(), d.getDescripcion(), d.getCategoria(), d.getUrl(),
                SectorResumenDto.de(d.getSector()), d.getVersion(), d.getPublicadoPor().getNombreCompleto(),
                d.getPublicadoEn(), d.getVigenteHasta(), vigencia.porVencer(d.getVigenteHasta()));
    }

    private Sector sector(Long sectorId) {
        if (sectorId == null) {
            return null;
        }
        return sectorRepository.findById(sectorId)
                .orElseThrow(() -> new RecursoNoEncontradoException("Sector", sectorId));
    }

    private Documento buscar(Long id) {
        return repository.findById(id).orElseThrow(() -> new RecursoNoEncontradoException("Documento", id));
    }
}
