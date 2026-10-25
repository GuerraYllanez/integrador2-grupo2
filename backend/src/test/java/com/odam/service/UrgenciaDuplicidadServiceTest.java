package com.odam.service;

import com.odam.entity.HistoriaClinica;
import com.odam.entity.Paciente;
import com.odam.entity.UrgenciaDental;
import com.odam.entity.UrgenciaDuplicidad;
import com.odam.repository.UrgenciaDentalRepository;
import com.odam.repository.UrgenciaDuplicidadRepository;

import java.lang.reflect.Field;
import java.util.Optional;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;

import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class UrgenciaDuplicidadServiceTest {

    @Mock
    private UrgenciaDentalRepository urgenciaRepository;

    @Mock
    private UrgenciaDuplicidadRepository duplicidadRepository;

    @InjectMocks
    private UrgenciaDuplicidadService service;

    @Test
    void registrarRevisionConIdsInvalidosDebeLanzarBadRequest() {
        ResponseStatusException excepcion = assertThrows(
                ResponseStatusException.class,
                () -> service.registrarRevision(0, 2)
        );

        assertEquals(HttpStatus.BAD_REQUEST, excepcion.getStatusCode());
        verifyNoInteractions(urgenciaRepository, duplicidadRepository);
    }

    @Test
    void registrarRevisionConMismoIdDebeLanzarBadRequest() {
        ResponseStatusException excepcion = assertThrows(
                ResponseStatusException.class,
                () -> service.registrarRevision(1, 1)
        );

        assertEquals(HttpStatus.BAD_REQUEST, excepcion.getStatusCode());
        verifyNoInteractions(urgenciaRepository, duplicidadRepository);
    }

    @Test
    void registrarRevisionSinUrgenciaOriginalDebeLanzarNotFound() {
        when(urgenciaRepository.findById(1)).thenReturn(Optional.empty());

        ResponseStatusException excepcion = assertThrows(
                ResponseStatusException.class,
                () -> service.registrarRevision(1, 2)
        );

        assertEquals(HttpStatus.NOT_FOUND, excepcion.getStatusCode());
        verify(urgenciaRepository).findById(1);
        verifyNoInteractions(duplicidadRepository);
    }

    @Test
    void registrarRevisionConUrgenciasDePacientesDistintosDebeLanzarBadRequest() {
        UrgenciaDental original = crearUrgencia(1, 10, 100);
        UrgenciaDental duplicada = crearUrgencia(2, 20, 100);

        when(urgenciaRepository.findById(1)).thenReturn(Optional.of(original));
        when(urgenciaRepository.findById(2)).thenReturn(Optional.of(duplicada));

        ResponseStatusException excepcion = assertThrows(
                ResponseStatusException.class,
                () -> service.registrarRevision(1, 2)
        );

        assertEquals(HttpStatus.BAD_REQUEST, excepcion.getStatusCode());
        verifyNoInteractions(duplicidadRepository);
    }

    @Test
    void registrarRevisionYaExistenteDebeLanzarConflict() {
        UrgenciaDental original = crearUrgencia(1, 10, 100);
        UrgenciaDental duplicada = crearUrgencia(2, 10, 100);

        when(urgenciaRepository.findById(1)).thenReturn(Optional.of(original));
        when(urgenciaRepository.findById(2)).thenReturn(Optional.of(duplicada));

        when(duplicidadRepository
                .existsByUrgenciaOriginal_IdUrgenciaAndUrgenciaDuplicada_IdUrgencia(1, 2))
                .thenReturn(true);

        ResponseStatusException excepcion = assertThrows(
                ResponseStatusException.class,
                () -> service.registrarRevision(1, 2)
        );

        assertEquals(HttpStatus.CONFLICT, excepcion.getStatusCode());
    }

    @Test
    void registrarRevisionValidaDebeGuardarLaRevision() {
        UrgenciaDental original = crearUrgencia(1, 10, 100);
        UrgenciaDental duplicada = crearUrgencia(2, 10, 100);

        when(urgenciaRepository.findById(1)).thenReturn(Optional.of(original));
        when(urgenciaRepository.findById(2)).thenReturn(Optional.of(duplicada));

        when(duplicidadRepository
                .existsByUrgenciaOriginal_IdUrgenciaAndUrgenciaDuplicada_IdUrgencia(1, 2))
                .thenReturn(false);

        when(duplicidadRepository
                .existsByUrgenciaOriginal_IdUrgenciaAndUrgenciaDuplicada_IdUrgencia(2, 1))
                .thenReturn(false);

        when(duplicidadRepository.save(any(UrgenciaDuplicidad.class)))
                .thenAnswer(invocacion -> invocacion.getArgument(0));

        UrgenciaDuplicidad resultado = service.registrarRevision(1, 2);

        assertNotNull(resultado);
        assertEquals(original, resultado.getUrgenciaOriginal());
        assertEquals(duplicada, resultado.getUrgenciaDuplicada());
        assertEquals("CONFIRMADO_DUPLICADO", resultado.getEstadoRevision());

        verify(duplicidadRepository).save(any(UrgenciaDuplicidad.class));
    }

    private UrgenciaDental crearUrgencia(
            Integer idUrgencia,
            Integer idPaciente,
            Integer idHistoria) {

        Paciente paciente = new Paciente();
        asignarCampo(paciente, "idPaciente", idPaciente);

        HistoriaClinica historia = new HistoriaClinica();
        historia.setIdHistoria(idHistoria);

        UrgenciaDental urgencia = new UrgenciaDental();
        asignarCampo(urgencia, "idUrgencia", idUrgencia);
        urgencia.setPaciente(paciente);
        urgencia.setHistoriaClinica(historia);

        return urgencia;
    }

    private void asignarCampo(Object objeto, String nombreCampo, Integer valor) {
        try {
            Field campo = objeto.getClass().getDeclaredField(nombreCampo);
            campo.setAccessible(true);
            campo.set(objeto, valor);
        } catch (ReflectiveOperationException e) {
            throw new IllegalStateException(
                    "No se pudo asignar el campo " + nombreCampo + " para la prueba",
                    e
            );
        }
    }
}