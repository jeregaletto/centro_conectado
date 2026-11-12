package com.centroconectado.api;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.util.List;
import java.util.Map;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import com.centroconectado.api.seed.DataSeeder;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

/**
 * Prueba de punta a punta sobre H2 + datos de demo. Correla con: mvn verify
 * Si esto pasa, el backend está listo para el frontend (frontend-next).
 */
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class CentroConectadoApiTest {

    @Autowired
    private MockMvc mvc;

    @Autowired
    private ObjectMapper json;

    @Test
    void loginDevuelveTokenYVistaSegunRol() throws Exception {
        mvc.perform(post("/api/auth/login").contentType(MediaType.APPLICATION_JSON)
                        .content(json.writeValueAsString(Map.of("usuario", "maestranza", "password", DataSeeder.PASSWORD_DEMO))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").isNotEmpty())
                .andExpect(jsonPath("$.usuario.rol").value("MAESTRANZA"))
                .andExpect(jsonPath("$.usuario.vista").value("SIMPLE"));

        mvc.perform(post("/api/auth/login").contentType(MediaType.APPLICATION_JSON)
                        .content(json.writeValueAsString(Map.of("usuario", "direccion", "password", DataSeeder.PASSWORD_DEMO))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.usuario.vista").value("COMPLETA"))
                .andExpect(jsonPath("$.usuario.permisos").isArray());
    }

    @Test
    void credencialesInvalidasYSinTokenDan401() throws Exception {
        mvc.perform(post("/api/auth/login").contentType(MediaType.APPLICATION_JSON)
                        .content(json.writeValueAsString(Map.of("usuario", "enfermero", "password", "mala"))))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.mensaje").value("Usuario o contraseña incorrectos"));

        mvc.perform(get("/api/inicio")).andExpect(status().isUnauthorized());
    }

    @Test
    void inicioTraeAvisosFijadosYAgenda() throws Exception {
        String token = login("enfermero");
        mvc.perform(get("/api/inicio").header(HttpHeaders.AUTHORIZATION, bearer(token)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.nombre").value("Diego"))
                .andExpect(jsonPath("$.fijados").isNotEmpty())
                .andExpect(jsonPath("$.agendaHoy").isArray());
    }

    @Test
    void marcarAvisoComoLeido() throws Exception {
        String token = login("kinesio");
        JsonNode avisos = getJson("/api/avisos?soloNoLeidos=true", token);
        assertThat(avisos.size()).isPositive();
        long id = avisos.get(0).get("id").asLong();

        mvc.perform(post("/api/avisos/" + id + "/leido").header(HttpHeaders.AUTHORIZATION, bearer(token)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.leido").value(true));
    }

    @Test
    void maestranzaTildaTareasPeroNoPuedePublicar() throws Exception {
        String token = login("maestranza");
        JsonNode miPuesto = getJson("/api/mi-puesto", token);
        assertThat(miPuesto.get("tareas").size()).isEqualTo(7);
        assertThat(miPuesto.get("referente").get("nombre").asText()).isEqualTo("Jorge Díaz");
        long tareaId = miPuesto.get("tareas").get(0).get("id").asLong();

        mvc.perform(post("/api/mi-puesto/tareas/" + tareaId + "/completar")
                        .header(HttpHeaders.AUTHORIZATION, bearer(token)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.avance.hechas").value(1))
                .andExpect(jsonPath("$.tareas[0].completada").value(true));

        mvc.perform(post("/api/avisos").header(HttpHeaders.AUTHORIZATION, bearer(token))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json.writeValueAsString(Map.of("titulo", "x", "cuerpo", "y", "tipo", "NOVEDAD"))))
                .andExpect(status().isForbidden());
    }

    @Test
    void referenteSoloPublicaParaSuSector() throws Exception {
        String token = login("referente.enf");
        long enfermeria = sectorId(token, "ENFERMERIA");
        long kinesiologia = sectorId(token, "KINESIOLOGIA");

        mvc.perform(post("/api/avisos").header(HttpHeaders.AUTHORIZATION, bearer(token))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json.writeValueAsString(Map.of("titulo", "Aviso ajeno", "cuerpo", "No debería",
                                "tipo", "NOVEDAD", "sectorIds", List.of(kinesiologia)))))
                // Es un dato mal elegido, no un rol sin permiso: 400 con el error en el campo.
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.campos.sectorIds").value("Como referente solo podés publicar para tu sector"));

        String body = mvc.perform(post("/api/avisos").header(HttpHeaders.AUTHORIZATION, bearer(token))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json.writeValueAsString(Map.of("titulo", "Simulacro de evacuación",
                                "cuerpo", "Jueves 10 h", "tipo", "URGENTE", "sectorIds", List.of(enfermeria)))))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.sectores[0]").value("Enfermería"))
                .andExpect(jsonPath("$.autorId").isNumber())
                .andReturn().getResponse().getContentAsString();
        long avisoId = json.readTree(body).get("id").asLong();

        // Aparece en lo que el referente administra
        assertThat(getJson("/api/avisos/publicados", token).findValuesAsText("titulo")).contains("Simulacro de evacuación");

        // El enfermero recibió la notificación del urgente, con link a la ruta del frontend
        String tokenEnfermero = login("enfermero");
        long antes = getJson("/api/notificaciones/contador", tokenEnfermero).get("noLeidas").asLong();
        JsonNode notifs = getJson("/api/notificaciones?soloNoLeidas=true", tokenEnfermero);
        assertThat(notifs.findValuesAsText("tipo")).contains("AVISO_URGENTE");
        assertThat(notifs.findValuesAsText("link")).contains("/inicio?aviso=" + avisoId);

        // Al leer el aviso, su notificación se baja sola
        mvc.perform(post("/api/avisos/" + avisoId + "/leido").header(HttpHeaders.AUTHORIZATION, bearer(tokenEnfermero)))
                .andExpect(status().isOk());
        assertThat(getJson("/api/notificaciones/contador", tokenEnfermero).get("noLeidas").asLong()).isEqualTo(antes - 1);
        assertThat(getJson("/api/notificaciones?soloNoLeidas=true", tokenEnfermero).findValuesAsText("link"))
                .doesNotContain("/inicio?aviso=" + avisoId);
    }

    @Test
    void logoutInvalidaElToken() throws Exception {
        String token = login("administracion");
        mvc.perform(get("/api/auth/me").header(HttpHeaders.AUTHORIZATION, bearer(token))).andExpect(status().isOk());

        mvc.perform(post("/api/auth/logout").header(HttpHeaders.AUTHORIZATION, bearer(token)))
                .andExpect(status().isNoContent());

        // El mismo token ya no sirve aunque no haya vencido
        mvc.perform(get("/api/auth/me").header(HttpHeaders.AUTHORIZATION, bearer(token)))
                .andExpect(status().isUnauthorized());
        // Un login nuevo funciona
        mvc.perform(get("/api/auth/me").header(HttpHeaders.AUTHORIZATION, bearer(login("administracion"))))
                .andExpect(status().isOk());
    }

    @Test
    void pedidoEntreAreasConEstados() throws Exception {
        String tokenEnf = login("enfermero");
        long kinesiologia = sectorId(tokenEnf, "KINESIOLOGIA");

        String body = mvc.perform(post("/api/pedidos").header(HttpHeaders.AUTHORIZATION, bearer(tokenEnf))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json.writeValueAsString(Map.of("tipo", "INTERCONSULTA", "asunto", "Evaluación hab. 8",
                                "detalle", "Sin datos del paciente", "sectorDestinoId", kinesiologia, "prioridad", "ALTA"))))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.pedido.estado").value("PENDIENTE"))
                .andExpect(jsonPath("$.pedido.codigo").value(org.hamcrest.Matchers.startsWith("INT-")))
                .andReturn().getResponse().getContentAsString();
        long id = json.readTree(body).get("pedido").get("id").asLong();

        // Quien pidió no puede marcarlo en curso
        mvc.perform(patch("/api/pedidos/" + id + "/estado").header(HttpHeaders.AUTHORIZATION, bearer(tokenEnf))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json.writeValueAsString(Map.of("estado", "EN_CURSO"))))
                .andExpect(status().isForbidden());

        String tokenKin = login("kinesio");
        mvc.perform(patch("/api/pedidos/" + id + "/estado").header(HttpHeaders.AUTHORIZATION, bearer(tokenKin))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json.writeValueAsString(Map.of("estado", "EN_CURSO", "comentario", "Paso a las 15 h"))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.pedido.estado").value("EN_CURSO"))
                .andExpect(jsonPath("$.pedido.asignadoA").value("Ana Torres"))
                .andExpect(jsonPath("$.historial.length()").value(2));

        JsonNode recibidos = getJson("/api/pedidos/recibidos", tokenKin);
        assertThat(recibidos.findValuesAsText("asunto")).contains("Evaluación hab. 8");

        // Quien pidió recibe la actualización con link a la ruta del detalle
        assertThat(getJson("/api/notificaciones?soloNoLeidas=true", tokenEnf).findValuesAsText("link"))
                .contains("/pedidos/" + id);
    }

    @Test
    void buzonAnonimoNoGuardaAutor() throws Exception {
        String token = login("enfermero");
        String body = mvc.perform(post("/api/buzon").header(HttpHeaders.AUTHORIZATION, bearer(token))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json.writeValueAsString(Map.of("tipo", "RECLAMO", "asunto", "Ruido en office",
                                "cuerpo", "De noche no se puede descansar", "anonimo", true))))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.anonimo").value(true))
                .andExpect(jsonPath("$.codigoSeguimiento").isNotEmpty())
                .andReturn().getResponse().getContentAsString();
        String codigo = json.readTree(body).get("codigoSeguimiento").asText();

        // No aparece en "mis mensajes" (no está vinculado a la persona)
        assertThat(getJson("/api/buzon/mios", token).findValuesAsText("codigoSeguimiento")).doesNotContain(codigo);
        // Pero se puede seguir con el código
        mvc.perform(get("/api/buzon/seguimiento/" + codigo).header(HttpHeaders.AUTHORIZATION, bearer(token)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.estado").value("RECIBIDO"));

        // Gestión lo ve sin autor
        String tokenCom = login("comunicacion");
        JsonNode gestion = getJson("/api/buzon/gestion", tokenCom);
        for (JsonNode m : gestion) {
            if (m.get("codigoSeguimiento").asText().equals(codigo)) {
                assertThat(m.get("autor").isNull()).isTrue();
            }
        }
        // Y el enfermero no puede entrar a gestión
        mvc.perform(get("/api/buzon/gestion").header(HttpHeaders.AUTHORIZATION, bearer(token)))
                .andExpect(status().isForbidden());
    }

    // ---------- helpers ----------

    private String login(String usuario) throws Exception {
        String body = mvc.perform(post("/api/auth/login").contentType(MediaType.APPLICATION_JSON)
                        .content(json.writeValueAsString(Map.of("usuario", usuario, "password", DataSeeder.PASSWORD_DEMO))))
                .andExpect(status().isOk())
                .andReturn().getResponse().getContentAsString();
        return json.readTree(body).get("token").asText();
    }

    private JsonNode getJson(String url, String token) throws Exception {
        String body = mvc.perform(get(url).header(HttpHeaders.AUTHORIZATION, bearer(token)))
                .andExpect(status().isOk())
                .andReturn().getResponse().getContentAsString();
        return json.readTree(body);
    }

    private long sectorId(String token, String codigo) throws Exception {
        for (JsonNode s : getJson("/api/sectores", token)) {
            if (s.get("codigo").asText().equals(codigo)) {
                return s.get("id").asLong();
            }
        }
        throw new IllegalStateException("Sector no encontrado: " + codigo);
    }

    private static String bearer(String token) {
        return "Bearer " + token;
    }
}
